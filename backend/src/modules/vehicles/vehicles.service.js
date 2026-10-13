import { pool } from '../../config/database.js';

/**
 * Format raw database row to client vehicle object
 */
export function formatVehicle(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    plateNumber: row.plate_number,
    vehicleType: row.vehicle_type,
    makeModel: row.make_model || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Fetch all vehicles owned by a specific user.
 */
export async function getVehiclesByUserId(userId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, plate_number, vehicle_type, make_model, created_at, updated_at FROM vehicles WHERE user_id = ? ORDER BY id ASC',
    [userId]
  );
  return rows.map(formatVehicle);
}

/**
 * Fetch a single vehicle by ID.
 */
export async function getVehicleById(vehicleId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, plate_number, vehicle_type, make_model, created_at, updated_at FROM vehicles WHERE id = ? LIMIT 1',
    [vehicleId]
  );
  if (!rows || rows.length === 0) {
    const err = new Error('Vehicle not found.');
    err.status = 404;
    throw err;
  }
  return formatVehicle(rows[0]);
}

/**
 * Create a new vehicle for a user.
 * Enforces unique plate_number per user.
 */
export async function createVehicle(userId, { plateNumber, vehicleType, makeModel }) {
  // Check for duplicate plate in this user's garage
  const [existing] = await pool.execute(
    'SELECT id FROM vehicles WHERE user_id = ? AND plate_number = ? LIMIT 1',
    [userId, plateNumber]
  );

  if (existing && existing.length > 0) {
    const err = new Error(`Vehicle with license plate "${plateNumber}" already exists in your account.`);
    err.status = 409;
    throw err;
  }

  const [result] = await pool.execute(
    'INSERT INTO vehicles (user_id, plate_number, vehicle_type, make_model) VALUES (?, ?, ?, ?)',
    [userId, plateNumber, vehicleType, makeModel || null]
  );

  return getVehicleById(result.insertId);
}

/**
 * Update an existing vehicle with ownership enforcement.
 */
export async function updateVehicle(vehicleId, userId, userRole, { plateNumber, vehicleType, makeModel }) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, plate_number, vehicle_type, make_model FROM vehicles WHERE id = ? LIMIT 1',
    [vehicleId]
  );

  if (!rows || rows.length === 0) {
    const err = new Error('Vehicle not found.');
    err.status = 404;
    throw err;
  }

  const vehicle = rows[0];

  // Ownership enforcement: Admin can update any, customer can only update their own
  if (userRole !== 'ADMIN' && vehicle.user_id !== userId) {
    const err = new Error('Access denied. You can only update your own vehicles.');
    err.status = 403;
    throw err;
  }

  // If plate number is changing, check for collision
  const targetPlate = plateNumber !== undefined ? plateNumber : vehicle.plate_number;
  if (plateNumber !== undefined && plateNumber !== vehicle.plate_number) {
    const [conflict] = await pool.execute(
      'SELECT id FROM vehicles WHERE user_id = ? AND plate_number = ? AND id != ? LIMIT 1',
      [vehicle.user_id, plateNumber, vehicleId]
    );
    if (conflict && conflict.length > 0) {
      const err = new Error(`Vehicle with license plate "${plateNumber}" already exists in this account.`);
      err.status = 409;
      throw err;
    }
  }

  const targetType = vehicleType !== undefined ? vehicleType : vehicle.vehicle_type;
  const targetMakeModel = makeModel !== undefined ? (makeModel || null) : vehicle.make_model;

  await pool.execute(
    'UPDATE vehicles SET plate_number = ?, vehicle_type = ?, make_model = ?, updated_at = NOW() WHERE id = ?',
    [targetPlate, targetType, targetMakeModel, vehicleId]
  );

  return getVehicleById(vehicleId);
}

/**
 * Delete a vehicle with ownership enforcement and safety checks.
 * Prevents deletion if tied to active/confirmed reservations or ongoing parking sessions.
 */
export async function deleteVehicle(vehicleId, userId, userRole) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, plate_number FROM vehicles WHERE id = ? LIMIT 1',
    [vehicleId]
  );

  if (!rows || rows.length === 0) {
    const err = new Error('Vehicle not found.');
    err.status = 404;
    throw err;
  }

  const vehicle = rows[0];

  // Enforce ownership
  if (userRole !== 'ADMIN' && vehicle.user_id !== userId) {
    const err = new Error('Access denied. You can only delete your own vehicles.');
    err.status = 403;
    throw err;
  }

  // Safety check 1: Check if reservations table exists and has active reservations
  try {
    const [reservationRows] = await pool.execute(
      "SELECT id FROM reservations WHERE vehicle_id = ? AND status IN ('PENDING', 'CONFIRMED', 'ACTIVE') LIMIT 1",
      [vehicleId]
    );
    if (reservationRows && reservationRows.length > 0) {
      const err = new Error('Cannot delete vehicle: It has active or pending reservations. Cancel or complete the reservation first.');
      err.status = 409;
      throw err;
    }
  } catch (err) {
    // If table doesn't exist yet (in earlier phase), ignore table-not-found error (ER_NO_SUCH_TABLE: 1146)
    if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') {
      throw err;
    }
  }

  // Safety check 2: Check if parking_sessions table exists and has active ongoing session
  try {
    const [sessionRows] = await pool.execute(
      "SELECT id FROM parking_sessions WHERE vehicle_id = ? AND status = 'ACTIVE' LIMIT 1",
      [vehicleId]
    );
    if (sessionRows && sessionRows.length > 0) {
      const err = new Error('Cannot delete vehicle: It is currently parked in an ongoing parking session.');
      err.status = 409;
      throw err;
    }
  } catch (err) {
    if (err.errno !== 1146 && err.code !== 'ER_NO_SUCH_TABLE') {
      throw err;
    }
  }

  await pool.execute('DELETE FROM vehicles WHERE id = ?', [vehicleId]);

  return {
    id: vehicleId,
    plateNumber: vehicle.plate_number,
    deleted: true,
  };
}
