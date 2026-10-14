import { pool } from '../../config/database.js';
import { toMySqlDateTime } from '../../utils/dateTime.js';

/**
 * Format database row to clean Parking Lot object
 */
export function formatLot(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    totalCapacity: Number(row.total_capacity) || 0,
    status: row.status,
    slotCount: row.slot_count !== undefined ? Number(row.slot_count) : undefined,
    availableSlots: row.available_slots !== undefined ? Number(row.available_slots) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Format database row to clean Parking Slot object
 */
export function formatSlot(row) {
  if (!row) return null;
  return {
    id: row.id,
    lotId: row.lot_id,
    lotName: row.lot_name || undefined,
    slotNumber: row.slot_number,
    slotType: row.slot_type,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Parking Lots Operations ──────────────────────────────────────────────────

/**
 * Fetch all parking lots with optional filtering and capacity metrics.
 */
export async function getAllLots(filters = {}) {
  const { status, search } = filters;
  const whereClauses = [];
  const params = [];

  if (status) {
    whereClauses.push('l.status = ?');
    params.push(status.toUpperCase());
  }

  if (search) {
    whereClauses.push('(l.name LIKE ? OR l.address LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT 
      l.id, 
      l.name, 
      l.address, 
      l.total_capacity, 
      l.status, 
      l.created_at, 
      l.updated_at,
      COUNT(s.id) AS slot_count,
      SUM(CASE WHEN s.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_slots
    FROM parking_lots l
    LEFT JOIN parking_slots s ON l.id = s.lot_id
    ${whereSql}
    GROUP BY l.id
    ORDER BY l.id ASC
  `;

  const [rows] = await pool.execute(sql, params);
  return rows.map(formatLot);
}

/**
 * Fetch a single parking lot by ID.
 */
export async function getLotById(lotId) {
  const sql = `
    SELECT 
      l.id, 
      l.name, 
      l.address, 
      l.total_capacity, 
      l.status, 
      l.created_at, 
      l.updated_at,
      COUNT(s.id) AS slot_count,
      SUM(CASE WHEN s.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_slots
    FROM parking_lots l
    LEFT JOIN parking_slots s ON l.id = s.lot_id
    WHERE l.id = ?
    GROUP BY l.id
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [lotId]);
  if (!rows || rows.length === 0) {
    const err = new Error(`Parking lot with ID ${lotId} not found.`);
    err.status = 404;
    throw err;
  }

  return formatLot(rows[0]);
}

/**
 * Create a new parking lot.
 */
export async function createLot({ name, address, totalCapacity = 0, status = 'ACTIVE' }) {
  // Check for duplicate lot name
  const [existing] = await pool.execute(
    'SELECT id FROM parking_lots WHERE name = ? LIMIT 1',
    [name]
  );
  if (existing && existing.length > 0) {
    const err = new Error(`Parking lot with name "${name}" already exists.`);
    err.status = 409;
    throw err;
  }

  const [result] = await pool.execute(
    'INSERT INTO parking_lots (name, address, total_capacity, status) VALUES (?, ?, ?, ?)',
    [name, address, totalCapacity, status]
  );

  return getLotById(result.insertId);
}

/**
 * Update an existing parking lot.
 */
export async function updateLot(lotId, { name, address, totalCapacity, status }) {
  const [existing] = await pool.execute(
    'SELECT id, name, address, total_capacity, status FROM parking_lots WHERE id = ? LIMIT 1',
    [lotId]
  );
  if (!existing || existing.length === 0) {
    const err = new Error(`Parking lot with ID ${lotId} not found.`);
    err.status = 404;
    throw err;
  }

  const lot = existing[0];

  // If name changed, verify uniqueness
  if (name !== undefined && name !== lot.name) {
    const [conflict] = await pool.execute(
      'SELECT id FROM parking_lots WHERE name = ? AND id != ? LIMIT 1',
      [name, lotId]
    );
    if (conflict && conflict.length > 0) {
      const err = new Error(`Parking lot with name "${name}" already exists.`);
      err.status = 409;
      throw err;
    }
  }

  const targetName = name !== undefined ? name : lot.name;
  const targetAddress = address !== undefined ? address : lot.address;
  const targetCapacity = totalCapacity !== undefined ? totalCapacity : lot.total_capacity;
  const targetStatus = status !== undefined ? status : lot.status;

  await pool.execute(
    'UPDATE parking_lots SET name = ?, address = ?, total_capacity = ?, status = ?, updated_at = NOW() WHERE id = ?',
    [targetName, targetAddress, targetCapacity, targetStatus, lotId]
  );

  return getLotById(lotId);
}

/**
 * Delete a parking lot with safety checks against active bookings.
 */
export async function deleteLot(lotId) {
  const [existing] = await pool.execute(
    'SELECT id, name FROM parking_lots WHERE id = ? LIMIT 1',
    [lotId]
  );
  if (!existing || existing.length === 0) {
    const err = new Error(`Parking lot with ID ${lotId} not found.`);
    err.status = 404;
    throw err;
  }

  const lot = existing[0];

  // Safety check 1: Active reservations on any slot in this lot
  try {
    const [resRows] = await pool.execute(
      `SELECT r.id FROM reservations r
       JOIN parking_slots s ON r.slot_id = s.id
       WHERE s.lot_id = ? AND r.status IN ('PENDING', 'CONFIRMED', 'ACTIVE')
       LIMIT 1`,
      [lotId]
    );
    if (resRows && resRows.length > 0) {
      const err = new Error('Cannot delete parking lot: One or more slots have active or pending reservations.');
      err.status = 409;
      throw err;
    }
  } catch (err) {
    if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  // Safety check 2: Ongoing parking sessions
  try {
    const [sessRows] = await pool.execute(
      `SELECT ps.id FROM parking_sessions ps
       JOIN parking_slots s ON ps.slot_id = s.id
       WHERE s.lot_id = ? AND ps.status = 'ACTIVE'
       LIMIT 1`,
      [lotId]
    );
    if (sessRows && sessRows.length > 0) {
      const err = new Error('Cannot delete parking lot: One or more slots have ongoing parking sessions.');
      err.status = 409;
      throw err;
    }
  } catch (err) {
    if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  await pool.execute('DELETE FROM parking_lots WHERE id = ?', [lotId]);

  return {
    id: lotId,
    name: lot.name,
    deleted: true,
  };
}

// ─── Parking Slots Operations ─────────────────────────────────────────────────

/**
 * Fetch all parking slots with optional filtering.
 */
export async function getAllSlots(filters = {}) {
  const { lotId, slotType, status } = filters;
  const whereClauses = [];
  const params = [];

  if (lotId) {
    whereClauses.push('s.lot_id = ?');
    params.push(lotId);
  }

  if (slotType) {
    whereClauses.push('s.slot_type = ?');
    params.push(slotType.toUpperCase());
  }

  if (status) {
    whereClauses.push('s.status = ?');
    params.push(status.toUpperCase());
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT 
      s.id, 
      s.lot_id, 
      s.slot_number, 
      s.slot_type, 
      s.status, 
      s.created_at, 
      s.updated_at,
      l.name AS lot_name
    FROM parking_slots s
    JOIN parking_lots l ON s.lot_id = l.id
    ${whereSql}
    ORDER BY s.lot_id ASC, s.slot_number ASC
  `;

  const [rows] = await pool.execute(sql, params);
  return rows.map(formatSlot);
}

/**
 * Fetch a single parking slot by ID.
 */
export async function getSlotById(slotId) {
  const sql = `
    SELECT 
      s.id, 
      s.lot_id, 
      s.slot_number, 
      s.slot_type, 
      s.status, 
      s.created_at, 
      s.updated_at,
      l.name AS lot_name
    FROM parking_slots s
    JOIN parking_lots l ON s.lot_id = l.id
    WHERE s.id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [slotId]);
  if (!rows || rows.length === 0) {
    const err = new Error(`Parking slot with ID ${slotId} not found.`);
    err.status = 404;
    throw err;
  }

  return formatSlot(rows[0]);
}

/**
 * Create a new parking slot in a lot.
 */
export async function createSlot({ lotId, slotNumber, slotType, status = 'AVAILABLE' }) {
  // Validate that the lot exists
  const [lotRows] = await pool.execute(
    'SELECT id, name FROM parking_lots WHERE id = ? LIMIT 1',
    [lotId]
  );
  if (!lotRows || lotRows.length === 0) {
    const err = new Error(`Parking lot with ID ${lotId} does not exist.`);
    err.status = 404;
    throw err;
  }

  // Check unique slot_number per lot
  const [conflict] = await pool.execute(
    'SELECT id FROM parking_slots WHERE lot_id = ? AND slot_number = ? LIMIT 1',
    [lotId, slotNumber]
  );
  if (conflict && conflict.length > 0) {
    const err = new Error(`Slot '${slotNumber}' already exists in lot ID ${lotId}.`);
    err.status = 409;
    throw err;
  }

  const [result] = await pool.execute(
    'INSERT INTO parking_slots (lot_id, slot_number, slot_type, status) VALUES (?, ?, ?, ?)',
    [lotId, slotNumber, slotType, status]
  );

  // Sync lot's total_capacity count
  await pool.execute(
    'UPDATE parking_lots SET total_capacity = (SELECT COUNT(*) FROM parking_slots WHERE lot_id = ?) WHERE id = ?',
    [lotId, lotId]
  );

  return getSlotById(result.insertId);
}

/**
 * Update an existing parking slot.
 */
export async function updateSlot(slotId, { lotId, slotNumber, slotType, status }) {
  const [existing] = await pool.execute(
    'SELECT id, lot_id, slot_number, slot_type, status FROM parking_slots WHERE id = ? LIMIT 1',
    [slotId]
  );
  if (!existing || existing.length === 0) {
    const err = new Error(`Parking slot with ID ${slotId} not found.`);
    err.status = 404;
    throw err;
  }

  const slot = existing[0];
  const targetLotId = lotId !== undefined ? lotId : slot.lot_id;
  const targetSlotNumber = slotNumber !== undefined ? slotNumber : slot.slot_number;
  const targetSlotType = slotType !== undefined ? slotType : slot.slot_type;
  const targetStatus = status !== undefined ? status : slot.status;

  // If lotId changed, ensure new lot exists
  if (lotId !== undefined && lotId !== slot.lot_id) {
    const [lotCheck] = await pool.execute(
      'SELECT id FROM parking_lots WHERE id = ? LIMIT 1',
      [targetLotId]
    );
    if (!lotCheck || lotCheck.length === 0) {
      const err = new Error(`Target parking lot with ID ${targetLotId} does not exist.`);
      err.status = 404;
      throw err;
    }
  }

  // If slot_number or lot_id changed, check for conflict
  if (targetSlotNumber !== slot.slot_number || targetLotId !== slot.lot_id) {
    const [conflict] = await pool.execute(
      'SELECT id FROM parking_slots WHERE lot_id = ? AND slot_number = ? AND id != ? LIMIT 1',
      [targetLotId, targetSlotNumber, slotId]
    );
    if (conflict && conflict.length > 0) {
      const err = new Error(`Slot '${targetSlotNumber}' already exists in lot ID ${targetLotId}.`);
      err.status = 409;
      throw err;
    }
  }

  await pool.execute(
    'UPDATE parking_slots SET lot_id = ?, slot_number = ?, slot_type = ?, status = ?, updated_at = NOW() WHERE id = ?',
    [targetLotId, targetSlotNumber, targetSlotType, targetStatus, slotId]
  );

  // If lotId changed, update capacities of both lots
  if (lotId !== undefined && lotId !== slot.lot_id) {
    await pool.execute(
      'UPDATE parking_lots SET total_capacity = (SELECT COUNT(*) FROM parking_slots WHERE lot_id = ?) WHERE id = ?',
      [slot.lot_id, slot.lot_id]
    );
    await pool.execute(
      'UPDATE parking_lots SET total_capacity = (SELECT COUNT(*) FROM parking_slots WHERE lot_id = ?) WHERE id = ?',
      [targetLotId, targetLotId]
    );
  }

  return getSlotById(slotId);
}

/**
 * Delete a parking slot with safety checks.
 */
export async function deleteSlot(slotId) {
  const [existing] = await pool.execute(
    'SELECT id, lot_id, slot_number FROM parking_slots WHERE id = ? LIMIT 1',
    [slotId]
  );
  if (!existing || existing.length === 0) {
    const err = new Error(`Parking slot with ID ${slotId} not found.`);
    err.status = 404;
    throw err;
  }

  const slot = existing[0];

  // Safety check 1: Active reservations
  try {
    const [reservationRows] = await pool.execute(
      "SELECT id FROM reservations WHERE slot_id = ? AND status IN ('PENDING', 'CONFIRMED', 'ACTIVE') LIMIT 1",
      [slotId]
    );
    if (reservationRows && reservationRows.length > 0) {
      const err = new Error('Cannot delete parking slot: It is associated with an active or pending reservation.');
      err.status = 409;
      throw err;
    }
  } catch (err) {
    if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  // Safety check 2: Ongoing parking sessions
  try {
    const [sessionRows] = await pool.execute(
      "SELECT id FROM parking_sessions WHERE slot_id = ? AND status = 'ACTIVE' LIMIT 1",
      [slotId]
    );
    if (sessionRows && sessionRows.length > 0) {
      const err = new Error('Cannot delete parking slot: A vehicle is currently parked in an ongoing session.');
      err.status = 409;
      throw err;
    }
  } catch (err) {
    if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  await pool.execute('DELETE FROM parking_slots WHERE id = ?', [slotId]);

  // Sync lot's total_capacity count
  await pool.execute(
    'UPDATE parking_lots SET total_capacity = (SELECT COUNT(*) FROM parking_slots WHERE lot_id = ?) WHERE id = ?',
    [slot.lot_id, slot.lot_id]
  );

  return {
    id: slotId,
    lotId: slot.lot_id,
    slotNumber: slot.slot_number,
    deleted: true,
  };
}

// ─── Day 12: Availability Logic & Compatibility ──────────────────────────────

/**
 * Slot to Vehicle Compatibility Hierarchy
 * A slot can accommodate a vehicle if the slot's physical dimensions >= vehicle class.
 */
export const COMPATIBILITY_MAP = {
  MOTORCYCLE: ['MOTORCYCLE', 'STANDARD_CAR', 'SUV', 'VAN', 'TRUCK'],
  STANDARD_CAR: ['STANDARD_CAR', 'SUV', 'VAN', 'TRUCK'],
  SUV: ['SUV', 'VAN', 'TRUCK'],
  VAN: ['VAN', 'TRUCK'],
  TRUCK: ['TRUCK'],
};

/**
 * Returns slot types capable of accommodating a given vehicle type.
 */
export function getCompatibleSlotTypes(vehicleType) {
  if (!vehicleType) return null;
  const normalized = String(vehicleType).toUpperCase().trim();
  return COMPATIBILITY_MAP[normalized] || [normalized];
}

/**
 * Returns true if a slot type can accommodate a vehicle type.
 */
export function isSlotCompatible(slotType, vehicleType) {
  if (!slotType || !vehicleType) return false;
  const compatible = getCompatibleSlotTypes(vehicleType);
  return compatible ? compatible.includes(slotType.toUpperCase().trim()) : false;
}

/**
 * Pure helper to verify if two half-open intervals [startA, endA) and [startB, endB) overlap.
 * Formula: startA < endB AND endA > startB
 */
export function isIntervalOverlapping(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Filter slots by availability for a requested time range [startTime, endTime).
 * Accounts for:
 * 1. Lot operational status (must be ACTIVE).
 * 2. Slot operational status (must be AVAILABLE).
 * 3. Vehicle compatibility hierarchy (if vehicleType provided) or exact slotType.
 * 4. Existing overlapping reservations (status in PENDING, CONFIRMED, ACTIVE).
 * 5. Active ongoing parking sessions.
 */
export async function getAvailableSlots(filters = {}) {
  const { lotId, startTime, endTime, vehicleType, slotType } = filters;
  const mysqlStartTime = startTime ? toMySqlDateTime(startTime) : null;
  const mysqlEndTime = endTime ? toMySqlDateTime(endTime) : null;

  const whereClauses = [
    "l.status = 'ACTIVE'",
    "s.status = 'AVAILABLE'",
  ];
  const params = [];

  if (lotId) {
    whereClauses.push('s.lot_id = ?');
    params.push(lotId);
  }

  // Compatibility filtering
  if (vehicleType) {
    const compatibleSlotTypes = getCompatibleSlotTypes(vehicleType);
    if (compatibleSlotTypes && compatibleSlotTypes.length > 0) {
      const placeholders = compatibleSlotTypes.map(() => '?').join(', ');
      whereClauses.push(`s.slot_type IN (${placeholders})`);
      params.push(...compatibleSlotTypes);
    }
  } else if (slotType) {
    whereClauses.push('s.slot_type = ?');
    params.push(slotType.toUpperCase());
  }

  // Reservation overlap exclusion subquery (interval: existing.start < reqEnd AND existing.end > reqStart)
  let checkReservations = true;
  let checkSessions = true;

  // Pre-test if reservations table exists
  try {
    await pool.execute('SELECT 1 FROM reservations LIMIT 0');
  } catch (err) {
    if (err.errno === 1146 || err.code === 'ER_NO_SUCH_TABLE') {
      checkReservations = false;
    }
  }

  // Pre-test if parking_sessions table exists
  try {
    await pool.execute('SELECT 1 FROM parking_sessions LIMIT 0');
  } catch (err) {
    if (err.errno === 1146 || err.code === 'ER_NO_SUCH_TABLE') {
      checkSessions = false;
    }
  }

  if (checkReservations && mysqlStartTime && mysqlEndTime) {
    whereClauses.push(`
      s.id NOT IN (
        SELECT r.slot_id FROM reservations r
        WHERE r.status IN ('PENDING', 'CONFIRMED', 'ACTIVE')
          AND r.start_time < ?
          AND r.end_time > ?
      )
    `);
    params.push(mysqlEndTime, mysqlStartTime);
  }

  if (checkSessions && mysqlStartTime && mysqlEndTime) {
    whereClauses.push(`
      s.id NOT IN (
        SELECT ps.slot_id FROM parking_sessions ps
        WHERE ps.status = 'ACTIVE'
          AND (
            ps.exit_time IS NULL 
            OR (ps.entry_time < ? AND ps.exit_time > ?)
          )
      )
    `);
    params.push(mysqlEndTime, mysqlStartTime);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT 
      s.id, 
      s.lot_id, 
      s.slot_number, 
      s.slot_type, 
      s.status, 
      s.created_at, 
      s.updated_at,
      l.name AS lot_name,
      l.address AS lot_address,
      l.status AS lot_status
    FROM parking_slots s
    JOIN parking_lots l ON s.lot_id = l.id
    ${whereSql}
    ORDER BY s.lot_id ASC, s.slot_number ASC
  `;

  const [rows] = await pool.execute(sql, params);
  return rows.map((row) => ({
    ...formatSlot(row),
    lotName: row.lot_name,
    lotAddress: row.lot_address,
    lotStatus: row.lot_status,
  }));
}

/**
 * Check if a single specific slot is available for an interval [startTime, endTime).
 * Returns detailed availability status with conflict details if blocked.
 */
export async function checkSlotAvailability(slotId, { startTime, endTime, vehicleType }) {
  const mysqlStartTime = startTime ? toMySqlDateTime(startTime) : null;
  const mysqlEndTime = endTime ? toMySqlDateTime(endTime) : null;
  // 1. Fetch slot with parent lot info
  const sql = `
    SELECT 
      s.id, 
      s.lot_id, 
      s.slot_number, 
      s.slot_type, 
      s.status AS slot_status, 
      l.name AS lot_name,
      l.status AS lot_status
    FROM parking_slots s
    JOIN parking_lots l ON s.lot_id = l.id
    WHERE s.id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [slotId]);

  if (!rows || rows.length === 0) {
    const err = new Error(`Parking slot with ID ${slotId} not found.`);
    err.status = 404;
    throw err;
  }

  const slot = rows[0];

  // 2. Check operational states
  if (slot.slot_status !== 'AVAILABLE') {
    return {
      available: false,
      code: 'SLOT_NOT_OPERATIONAL',
      reason: `Slot ${slot.slot_number} is currently marked as ${slot.slot_status}.`,
      slot: {
        id: slot.id,
        slotNumber: slot.slot_number,
        slotType: slot.slot_type,
        status: slot.slot_status,
        lotId: slot.lot_id,
        lotName: slot.lot_name,
      },
    };
  }

  if (slot.lot_status !== 'ACTIVE') {
    return {
      available: false,
      code: 'LOT_NOT_ACTIVE',
      reason: `Parking lot '${slot.lot_name}' is currently ${slot.lot_status}.`,
      slot: {
        id: slot.id,
        slotNumber: slot.slot_number,
        slotType: slot.slot_type,
        lotId: slot.lot_id,
        lotName: slot.lot_name,
      },
    };
  }

  // 3. Check vehicle compatibility
  if (vehicleType && !isSlotCompatible(slot.slot_type, vehicleType)) {
    return {
      available: false,
      code: 'INCOMPATIBLE_VEHICLE_TYPE',
      reason: `Slot type '${slot.slot_type}' cannot accommodate vehicle type '${vehicleType}'.`,
      slot: {
        id: slot.id,
        slotNumber: slot.slot_number,
        slotType: slot.slot_type,
      },
    };
  }

  // 4. Check for overlapping reservations
  try {
    const [conflictRows] = await pool.execute(
      `SELECT id, start_time, end_time, status 
       FROM reservations 
       WHERE slot_id = ? 
         AND status IN ('PENDING', 'CONFIRMED', 'ACTIVE')
         AND start_time < ? 
         AND end_time > ?
       LIMIT 1`,
      [slotId, mysqlEndTime, mysqlStartTime]
    );

    if (conflictRows && conflictRows.length > 0) {
      const conflict = conflictRows[0];
      return {
        available: false,
        code: 'RESERVATION_CONFLICT',
        reason: 'Slot is already booked for an overlapping time window.',
        conflictingReservation: {
          id: conflict.id,
          startTime: conflict.start_time,
          endTime: conflict.end_time,
          status: conflict.status,
        },
        slot: {
          id: slot.id,
          slotNumber: slot.slot_number,
          slotType: slot.slot_type,
        },
      };
    }
  } catch (err) {
    if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  // 5. Check for active ongoing parking sessions
  try {
    const [sessionRows] = await pool.execute(
      `SELECT id, entry_time, exit_time, status 
       FROM parking_sessions 
       WHERE slot_id = ? 
         AND status = 'ACTIVE'
       LIMIT 1`,
      [slotId]
    );

    if (sessionRows && sessionRows.length > 0) {
      const session = sessionRows[0];
      // If ongoing without exit time or overlapping requested start
      const reqStartMs = new Date(startTime).getTime();
      const nowMs = Date.now();
      if (!session.exit_time || reqStartMs <= nowMs) {
        return {
          available: false,
          code: 'ACTIVE_SESSION_OCCUPIED',
          reason: 'A vehicle is currently occupying this slot in an ongoing parking session.',
          conflictingSession: {
            id: session.id,
            entryTime: session.entry_time,
            status: session.status,
          },
          slot: {
            id: slot.id,
            slotNumber: slot.slot_number,
            slotType: slot.slot_type,
          },
        };
      }
    }
  } catch (err) {
    if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  return {
    available: true,
    message: 'Slot is available for the requested time window.',
    slot: {
      id: slot.id,
      lotId: slot.lot_id,
      lotName: slot.lot_name,
      slotNumber: slot.slot_number,
      slotType: slot.slot_type,
      status: slot.slot_status,
    },
    requestedInterval: {
      startTime,
      endTime,
    },
  };
}
