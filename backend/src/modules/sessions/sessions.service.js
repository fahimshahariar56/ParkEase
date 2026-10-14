import { pool } from '../../config/database.js';

/**
 * Format raw database row to clean Parking Session object
 */
export function formatSession(row) {
  if (!row) return null;

  const entry = row.entry_time ? new Date(row.entry_time) : null;
  const exit = row.exit_time ? new Date(row.exit_time) : null;
  let durationMinutes = 0;
  let billableHours = 0;

  if (entry) {
    const endMs = exit ? exit.getTime() : Date.now();
    const durationMs = Math.max(0, endMs - entry.getTime());
    durationMinutes = Math.floor(durationMs / (1000 * 60));
    billableHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
  }

  return {
    id: row.id,
    reservationId: row.reservation_id || null,
    vehicleId: row.vehicle_id,
    slotId: row.slot_id,
    entryTime: row.entry_time,
    exitTime: row.exit_time || null,
    hourlyRateSnapshot: Number(row.hourly_rate_snapshot) || 0,
    totalFee: row.total_fee !== null && row.total_fee !== undefined ? Number(row.total_fee) : null,
    status: row.status,
    durationMinutes,
    billableHours,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Contextual joined entity details
    vehicle: row.plate_number ? {
      id: row.vehicle_id,
      plateNumber: row.plate_number,
      vehicleType: row.vehicle_type,
      makeModel: row.make_model,
      userId: row.user_id,
    } : undefined,
    user: row.user_name ? {
      id: row.user_id,
      fullName: row.user_name,
      email: row.user_email,
      phone: row.user_phone,
    } : undefined,
    slot: row.slot_number ? {
      id: row.slot_id,
      slotNumber: row.slot_number,
      slotType: row.slot_type,
      lotId: row.lot_id,
      lotName: row.lot_name,
      lotAddress: row.lot_address,
    } : undefined,
  };
}

/**
 * Base SELECT query with JOINs for rich session payloads
 */
const BASE_SESSION_SELECT = `
  SELECT 
    ps.id,
    ps.reservation_id,
    ps.vehicle_id,
    ps.slot_id,
    ps.entry_time,
    ps.exit_time,
    ps.hourly_rate_snapshot,
    ps.total_fee,
    ps.status,
    ps.created_at,
    ps.updated_at,
    v.plate_number,
    v.vehicle_type,
    v.make_model,
    v.user_id,
    u.full_name AS user_name,
    u.email AS user_email,
    u.phone AS user_phone,
    s.slot_number,
    s.slot_type,
    l.id AS lot_id,
    l.name AS lot_name,
    l.address AS lot_address
  FROM parking_sessions ps
  JOIN vehicles v ON ps.vehicle_id = v.id
  JOIN users u ON v.user_id = u.id
  JOIN parking_slots s ON ps.slot_id = s.id
  JOIN parking_lots l ON s.lot_id = l.id
`;

function appendSessionAccessFilter(user, whereClauses, params) {
  if (!user) {
    const err = new Error('Authentication required to access parking sessions.');
    err.status = 401;
    throw err;
  }

  const role = String(user.role || '').toUpperCase();
  if (role === 'ADMIN') return;

  if (role !== 'CUSTOMER' || user.id === undefined || user.id === null) {
    const err = new Error('Access denied. Parking sessions are available only to their owner or an administrator.');
    err.status = 403;
    throw err;
  }

  whereClauses.push('v.user_id = ?');
  params.push(user.id);
}

/**
 * Calculate session fee based on entry, exit, and hourly rate snapshot.
 * Minimum billable duration is 1 hour.
 */
export function calculateSessionFee(entryTime, exitTime, hourlyRate) {
  const entryMs = new Date(entryTime).getTime();
  const exitMs = new Date(exitTime).getTime();
  const durationMs = Math.max(0, exitMs - entryMs);
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  const billableHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
  const totalFee = Number((hourlyRate * billableHours).toFixed(2));

  return { durationMinutes, billableHours, totalFee };
}

/**
 * List all sessions with optional filtering and search.
 */
export async function getSessions(filters = {}, user) {
  const { status, lotId, slotId, vehicleId, search } = filters;
  const whereClauses = [];
  const params = [];

  appendSessionAccessFilter(user, whereClauses, params);

  if (status && status !== 'ALL') {
    whereClauses.push('ps.status = ?');
    params.push(status.toUpperCase());
  }

  if (lotId && lotId !== 'ALL') {
    whereClauses.push('s.lot_id = ?');
    params.push(lotId);
  }

  if (slotId) {
    whereClauses.push('ps.slot_id = ?');
    params.push(slotId);
  }

  if (vehicleId) {
    whereClauses.push('ps.vehicle_id = ?');
    params.push(vehicleId);
  }

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    whereClauses.push('(v.plate_number LIKE ? OR u.full_name LIKE ? OR s.slot_number LIKE ? OR l.name LIKE ?)');
    params.push(q, q, q, q);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sql = `${BASE_SESSION_SELECT} ${whereSql} ORDER BY ps.entry_time DESC`;

  const [rows] = await pool.execute(sql, params);
  return rows.map(formatSession);
}

/**
 * Retrieve a specific session by ID.
 */
export async function getSessionById(sessionId, user) {
  const whereClauses = ['ps.id = ?'];
  const params = [sessionId];
  appendSessionAccessFilter(user, whereClauses, params);
  const sql = `${BASE_SESSION_SELECT} WHERE ${whereClauses.join(' AND ')} LIMIT 1`;
  const [rows] = await pool.execute(sql, params);

  if (!rows || rows.length === 0) {
    const err = new Error(`Parking session #${sessionId} not found.`);
    err.status = 404;
    throw err;
  }

  return formatSession(rows[0]);
}

/**
 * Record Vehicle Entry / Start Session
 */
export async function recordEntry({ slotId, vehicleId, reservationId, entryTime }) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Verify Slot exists and is operational
    const [slotRows] = await conn.execute(
      'SELECT id, lot_id, slot_number, slot_type, status FROM parking_slots WHERE id = ? LIMIT 1 FOR UPDATE',
      [slotId]
    );
    if (!slotRows || slotRows.length === 0) {
      const err = new Error(`Parking slot #${slotId} does not exist.`);
      err.status = 404;
      throw err;
    }
    const slot = slotRows[0];

    if (slot.status === 'INACTIVE' || slot.status === 'MAINTENANCE') {
      const err = new Error(`Cannot start session: Slot #${slot.slot_number} is currently marked as ${slot.status}.`);
      err.status = 409;
      throw err;
    }

    // 2. Check for conflicting ACTIVE session on this slot
    const [activeSlotSessions] = await conn.execute(
      "SELECT id FROM parking_sessions WHERE slot_id = ? AND status = 'ACTIVE' LIMIT 1 FOR UPDATE",
      [slotId]
    );
    if (activeSlotSessions && activeSlotSessions.length > 0) {
      const err = new Error(`Cannot start session: Slot #${slot.slot_number} already has an ongoing active session (#${activeSlotSessions[0].id}).`);
      err.status = 409;
      throw err;
    }

    // 3. Verify Vehicle exists
    const [vehicleRows] = await conn.execute(
      'SELECT id, plate_number, vehicle_type, user_id FROM vehicles WHERE id = ? LIMIT 1',
      [vehicleId]
    );
    if (!vehicleRows || vehicleRows.length === 0) {
      const err = new Error(`Vehicle #${vehicleId} does not exist.`);
      err.status = 404;
      throw err;
    }
    const vehicle = vehicleRows[0];

    // 4. Duplicate prevention: Check if this vehicle is already parked in an ACTIVE session
    const [activeVehicleSessions] = await conn.execute(
      "SELECT id, slot_id FROM parking_sessions WHERE vehicle_id = ? AND status = 'ACTIVE' LIMIT 1 FOR UPDATE",
      [vehicleId]
    );
    if (activeVehicleSessions && activeVehicleSessions.length > 0) {
      const err = new Error(`Duplicate entry blocked: Vehicle ${vehicle.plate_number} already has an active session (#${activeVehicleSessions[0].id}).`);
      err.status = 409;
      throw err;
    }

    // 5. If reservation provided, verify & lock it
    let hourlyRate = 5.00;
    if (reservationId) {
      const [resRows] = await conn.execute(
        'SELECT id, status, hourly_rate_snapshot, slot_id, vehicle_id FROM reservations WHERE id = ? LIMIT 1 FOR UPDATE',
        [reservationId]
      );
      if (!resRows || resRows.length === 0) {
        const err = new Error(`Linked reservation #${reservationId} does not exist.`);
        err.status = 404;
        throw err;
      }
      const reservation = resRows[0];

      if (reservation.status === 'CANCELLED' || reservation.status === 'COMPLETED') {
        const err = new Error(`Cannot start session with a ${reservation.status} reservation.`);
        err.status = 400;
        throw err;
      }

      if (reservation.hourly_rate_snapshot) {
        hourlyRate = Number(reservation.hourly_rate_snapshot);
      }

      // Transition reservation to ACTIVE
      await conn.execute(
        "UPDATE reservations SET status = 'ACTIVE', updated_at = NOW() WHERE id = ?",
        [reservationId]
      );
    } else {
      // Look up current rate from pricing_rules
      try {
        const [rateRows] = await conn.execute(
          `SELECT hourly_rate FROM pricing_rules
           WHERE vehicle_type = ? AND is_active = TRUE
           ORDER BY effective_from DESC LIMIT 1`,
          [vehicle.vehicle_type]
        );
        if (rateRows && rateRows.length > 0) {
          hourlyRate = Number(rateRows[0].hourly_rate);
        }
      } catch (err) {
        if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') throw err;
      }
    }

    // 6. Insert new active parking session
    const finalEntryTime = entryTime || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [insertResult] = await conn.execute(
      `INSERT INTO parking_sessions 
         (reservation_id, vehicle_id, slot_id, entry_time, hourly_rate_snapshot, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [reservationId || null, vehicleId, slotId, finalEntryTime, hourlyRate]
    );

    await conn.commit();
    return insertResult.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Record Vehicle Exit / Complete Session with server-side fee calculation
 */
export async function recordExit(sessionId, { exitTime }, user) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Fetch & lock session
    const [rows] = await conn.execute(
      'SELECT id, reservation_id, vehicle_id, slot_id, entry_time, exit_time, hourly_rate_snapshot, total_fee, status FROM parking_sessions WHERE id = ? LIMIT 1 FOR UPDATE',
      [sessionId]
    );

    if (!rows || rows.length === 0) {
      const err = new Error(`Parking session #${sessionId} not found.`);
      err.status = 404;
      throw err;
    }

    const session = rows[0];

    // Duplicate action prevention: If already COMPLETED, reject
    if (session.status === 'COMPLETED') {
      const err = new Error(`Session #${sessionId} is already completed. Exit cannot be recorded twice.`);
      err.status = 400;
      throw err;
    }

    const finalExitTime = exitTime || new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Validate exit is not before entry
    const entryMs = new Date(session.entry_time).getTime();
    const exitMs = new Date(finalExitTime).getTime();
    if (exitMs < entryMs) {
      const err = new Error('Exit timestamp cannot be prior to entry timestamp.');
      err.status = 400;
      throw err;
    }

    // Calculate duration & fee on server
    const rate = Number(session.hourly_rate_snapshot) || 5.00;
    const { totalFee } = calculateSessionFee(session.entry_time, finalExitTime, rate);

    // 2. Update session to COMPLETED
    await conn.execute(
      `UPDATE parking_sessions 
       SET exit_time = ?, total_fee = ?, status = 'COMPLETED', updated_at = NOW() 
       WHERE id = ?`,
      [finalExitTime, totalFee, sessionId]
    );

    // 3. If tied to a reservation, update reservation status to COMPLETED
    if (session.reservation_id) {
      await conn.execute(
        "UPDATE reservations SET status = 'COMPLETED', updated_at = NOW() WHERE id = ?",
        [session.reservation_id]
      );
    }

    await conn.commit();
    return getSessionById(sessionId, user);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
