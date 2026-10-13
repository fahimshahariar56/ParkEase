import { pool } from '../../config/database.js';

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
