import { pool } from '../../config/database.js';
import { isSlotCompatible } from '../parking/parking.service.js';

/**
 * Format raw database row to clean Reservation object
 */
export function formatReservation(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    vehicleId: row.vehicle_id,
    slotId: row.slot_id,
    startTime: row.start_time,
    endTime: row.end_time,
    hourlyRateSnapshot: Number(row.hourly_rate_snapshot),
    totalEstimatedFee: Number(row.total_estimated_fee),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Contextual joined entity details
    user: row.user_name ? {
      id: row.user_id,
      fullName: row.user_name,
      email: row.user_email,
      phone: row.user_phone,
    } : undefined,
    vehicle: row.plate_number ? {
      id: row.vehicle_id,
      plateNumber: row.plate_number,
      vehicleType: row.vehicle_type,
      makeModel: row.make_model,
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
 * Common SELECT query with JOINs for rich reservation payloads
 */
const BASE_RESERVATION_SELECT = `
  SELECT 
    r.id,
    r.user_id,
    r.vehicle_id,
    r.slot_id,
    r.start_time,
    r.end_time,
    r.hourly_rate_snapshot,
    r.total_estimated_fee,
    r.status,
    r.created_at,
    r.updated_at,
    u.full_name AS user_name,
    u.email AS user_email,
    u.phone AS user_phone,
    v.plate_number,
    v.vehicle_type,
    v.make_model,
    s.slot_number,
    s.slot_type,
    l.id AS lot_id,
    l.name AS lot_name,
    l.address AS lot_address
  FROM reservations r
  JOIN users u ON r.user_id = u.id
  JOIN vehicles v ON r.vehicle_id = v.id
  JOIN parking_slots s ON r.slot_id = s.id
  JOIN parking_lots l ON s.lot_id = l.id
`;

/**
 * List reservations with role-aware scoping and optional filtering.
 */
export async function getReservations(filters = {}, requestingUser) {
  const { status, slotId, lotId, vehicleId, userId } = filters;
  const whereClauses = [];
  const params = [];

  // Enforce ownership: Non-admins can only ever see their own reservations
  if (requestingUser.role !== 'ADMIN') {
    whereClauses.push('r.user_id = ?');
    params.push(requestingUser.id);
  } else if (userId) {
    whereClauses.push('r.user_id = ?');
    params.push(userId);
  }

  if (status) {
    whereClauses.push('r.status = ?');
    params.push(status.toUpperCase());
  }

  if (slotId) {
    whereClauses.push('r.slot_id = ?');
    params.push(slotId);
  }

  if (lotId) {
    whereClauses.push('s.lot_id = ?');
    params.push(lotId);
  }

  if (vehicleId) {
    whereClauses.push('r.vehicle_id = ?');
    params.push(vehicleId);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sql = `${BASE_RESERVATION_SELECT} ${whereSql} ORDER BY r.created_at DESC`;

  const [rows] = await pool.execute(sql, params);
  return rows.map(formatReservation);
}

/**
 * Retrieve a single reservation with ownership enforcement.
 */
export async function getReservationById(reservationId, requestingUser) {
  const sql = `${BASE_RESERVATION_SELECT} WHERE r.id = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [reservationId]);

  if (!rows || rows.length === 0) {
    const err = new Error(`Reservation with ID ${reservationId} not found.`);
    err.status = 404;
    throw err;
  }

  const reservation = rows[0];

  // Ownership enforcement
  if (requestingUser.role !== 'ADMIN' && reservation.user_id !== requestingUser.id) {
    const err = new Error('Access denied. You can only view your own reservations.');
    err.status = 403;
    throw err;
  }

  return formatReservation(reservation);
}

/**
 * Create a reservation with strict database transaction, concurrency locks, and conflict re-checks.
 */
export async function createReservation({ userId, vehicleId, slotId, startTime, endTime }) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Validate vehicle ownership & existence
    const [vehicleRows] = await conn.execute(
      'SELECT id, user_id, plate_number, vehicle_type FROM vehicles WHERE id = ? LIMIT 1',
      [vehicleId]
    );
    if (!vehicleRows || vehicleRows.length === 0) {
      const err = new Error('Vehicle not found.');
      err.status = 404;
      throw err;
    }
    const vehicle = vehicleRows[0];
    if (vehicle.user_id !== userId) {
      const err = new Error('Access denied. You can only make reservations for your own vehicles.');
      err.status = 403;
      throw err;
    }

    // 2. Lock & inspect target parking slot and parent lot
    const [slotRows] = await conn.execute(
      `SELECT s.id, s.lot_id, s.slot_number, s.slot_type, s.status AS slot_status,
              l.name AS lot_name, l.status AS lot_status
       FROM parking_slots s
       JOIN parking_lots l ON s.lot_id = l.id
       WHERE s.id = ?
       FOR UPDATE`,
      [slotId]
    );
    if (!slotRows || slotRows.length === 0) {
      const err = new Error('Parking slot not found.');
      err.status = 404;
      throw err;
    }
    const slot = slotRows[0];

    if (slot.slot_status !== 'AVAILABLE') {
      const err = new Error(`Slot ${slot.slot_number} is currently marked as ${slot.slot_status} and cannot be reserved.`);
      err.status = 409;
      throw err;
    }

    if (slot.lot_status !== 'ACTIVE') {
      const err = new Error(`Parking lot '${slot.lot_name}' is currently ${slot.lot_status}.`);
      err.status = 409;
      throw err;
    }

    // 3. Verify vehicle and slot type compatibility
    if (!isSlotCompatible(slot.slot_type, vehicle.vehicle_type)) {
      const err = new Error(`Incompatible slot: Slot type '${slot.slot_type}' cannot accommodate vehicle type '${vehicle.vehicle_type}'.`);
      err.status = 400;
      throw err;
    }

    // 4. Concurrency lock & overlap conflict re-check inside transaction
    // Interval overlap formula: existing.start < requested.end AND existing.end > requested.start
    const [conflictRows] = await conn.execute(
      `SELECT id, start_time, end_time FROM reservations
       WHERE slot_id = ?
         AND status IN ('PENDING', 'CONFIRMED', 'ACTIVE')
         AND start_time < ?
         AND end_time > ?
       FOR UPDATE`,
      [slotId, endTime, startTime]
    );

    if (conflictRows && conflictRows.length > 0) {
      const err = new Error('Reservation conflict: This slot was just booked by another customer for an overlapping time window.');
      err.status = 409;
      throw err;
    }

    // 5. Check active parking sessions (if ongoing on this slot)
    try {
      const [sessRows] = await conn.execute(
        `SELECT id, entry_time FROM parking_sessions
         WHERE slot_id = ? AND status = 'ACTIVE'
         FOR UPDATE`,
        [slotId]
      );
      if (sessRows && sessRows.length > 0) {
        const reqStartMs = new Date(startTime).getTime();
        if (reqStartMs <= Date.now()) {
          const err = new Error('Slot is currently occupied in an active parking session.');
          err.status = 409;
          throw err;
        }
      }
    } catch (err) {
      if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') throw err;
    }

    // 6. Look up current hourly pricing rule for the vehicle/slot type (or fallback to default $5.00)
    let hourlyRate = 5.00;
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

    // Calculate billable duration (in hours, minimum 1 hour)
    const durationHours = Math.max(
      1,
      Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60))
    );
    const totalEstimatedFee = (hourlyRate * durationHours).toFixed(2);

    // 7. Insert the confirmed reservation
    const [result] = await conn.execute(
      `INSERT INTO reservations 
         (user_id, vehicle_id, slot_id, start_time, end_time, hourly_rate_snapshot, total_estimated_fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [userId, vehicleId, slotId, startTime, endTime, hourlyRate, totalEstimatedFee]
    );

    await conn.commit();
    return result.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Cancel a reservation with ownership and business timing rules.
 */
export async function cancelReservation(reservationId, requestingUser) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, status, start_time, end_time FROM reservations WHERE id = ? LIMIT 1',
    [reservationId]
  );

  if (!rows || rows.length === 0) {
    const err = new Error(`Reservation with ID ${reservationId} not found.`);
    err.status = 404;
    throw err;
  }

  const reservation = rows[0];

  // Ownership check: Customer can only cancel their own, Admin can cancel any
  if (requestingUser.role !== 'ADMIN' && reservation.user_id !== requestingUser.id) {
    const err = new Error('Access denied. You can only cancel your own reservations.');
    err.status = 403;
    throw err;
  }

  // Status checks
  if (reservation.status === 'CANCELLED') {
    const err = new Error('This reservation is already cancelled.');
    err.status = 400;
    throw err;
  }

  if (reservation.status === 'COMPLETED') {
    const err = new Error('Cannot cancel a completed reservation.');
    err.status = 400;
    throw err;
  }

  if (reservation.status === 'ACTIVE') {
    const err = new Error('Cannot cancel an ongoing active parking reservation.');
    err.status = 400;
    throw err;
  }

  // Timing check for customer: Cannot cancel reservations that have already passed
  if (requestingUser.role !== 'ADMIN') {
    const nowMs = Date.now();
    const endMs = new Date(reservation.end_time).getTime();
    if (endMs < nowMs) {
      const err = new Error('Cannot cancel a reservation that has already expired.');
      err.status = 400;
      throw err;
    }
  }

  await pool.execute(
    "UPDATE reservations SET status = 'CANCELLED', updated_at = NOW() WHERE id = ?",
    [reservationId]
  );

  return getReservationById(reservationId, requestingUser);
}

/**
 * Admin status update (e.g. mark NO_SHOW, COMPLETED, CANCELLED)
 */
export async function updateReservationStatus(reservationId, newStatus, requestingUser) {
  // Verify existence
  await getReservationById(reservationId, requestingUser);

  await pool.execute(
    'UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?',
    [newStatus, reservationId]
  );

  return getReservationById(reservationId, requestingUser);
}
