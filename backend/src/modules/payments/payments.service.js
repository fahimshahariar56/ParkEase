/**
 * Payments Service — Day 21 Demo Payment Flow
 *
 * All transactions are SIMULATED. No real payment gateway is used.
 * The `transaction_reference` is a server-generated unique demo ID.
 * The `demo_method` field is always one of the SIMULATED_* enum values.
 */

import { pool } from '../../config/database.js';

/**
 * Format raw payments row to clean payment object.
 */
export function formatPayment(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    amount: Number(row.amount),
    demoMethod: row.demo_method,
    status: row.status,
    transactionReference: row.transaction_reference,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    isDemoTransaction: true,  // Always explicitly flagged
    // Joined session / vehicle / user context (optional)
    session: row.entry_time ? {
      id: row.session_id,
      entryTime: row.entry_time,
      exitTime: row.exit_time,
      totalFee: row.total_fee !== null && row.total_fee !== undefined ? Number(row.total_fee) : null,
      status: row.session_status,
    } : undefined,
    vehicle: row.plate_number ? {
      id: row.vehicle_id,
      plateNumber: row.plate_number,
      vehicleType: row.vehicle_type,
      makeModel: row.make_model,
    } : undefined,
    user: row.user_name ? {
      id: row.user_id,
      fullName: row.user_name,
      email: row.user_email,
    } : undefined,
    slot: row.slot_number ? {
      id: row.slot_id,
      slotNumber: row.slot_number,
      lotName: row.lot_name,
    } : undefined,
  };
}

/**
 * Base SELECT with full joins for rich payment response.
 */
const BASE_PAYMENT_SELECT = `
  SELECT
    p.id,
    p.session_id,
    p.amount,
    p.demo_method,
    p.status,
    p.transaction_reference,
    p.paid_at,
    p.created_at,
    ps.entry_time,
    ps.exit_time,
    ps.total_fee,
    ps.status AS session_status,
    ps.slot_id,
    ps.vehicle_id,
    v.plate_number,
    v.vehicle_type,
    v.make_model,
    v.user_id,
    u.full_name AS user_name,
    u.email AS user_email,
    s.slot_number,
    l.name AS lot_name
  FROM payments p
  JOIN parking_sessions ps ON p.session_id = ps.id
  JOIN vehicles v ON ps.vehicle_id = v.id
  JOIN users u ON v.user_id = u.id
  JOIN parking_slots s ON ps.slot_id = s.id
  JOIN parking_lots l ON s.lot_id = l.id
`;

/**
 * Generate a unique demo transaction reference.
 * Format: DEMO-<timestamp>-<random hex>
 */
function generateDemoReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
  return `DEMO-${ts}-${rand}`;
}

/**
 * List payments with optional sessionId filter.
 */
export async function getPayments(filters = {}) {
  const { sessionId, status } = filters;
  const whereClauses = [];
  const params = [];

  if (sessionId) {
    whereClauses.push('p.session_id = ?');
    params.push(sessionId);
  }
  if (status && status !== 'ALL') {
    whereClauses.push('p.status = ?');
    params.push(status.toUpperCase());
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sql = `${BASE_PAYMENT_SELECT} ${whereSql} ORDER BY p.paid_at DESC`;

  const [rows] = await pool.execute(sql, params);
  return rows.map(formatPayment);
}

/**
 * Get a single payment by ID.
 */
export async function getPaymentById(paymentId) {
  const sql = `${BASE_PAYMENT_SELECT} WHERE p.id = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [paymentId]);
  if (!rows || rows.length === 0) {
    const err = new Error(`Payment #${paymentId} not found.`);
    err.status = 404;
    throw err;
  }
  return formatPayment(rows[0]);
}

/**
 * Get the payment for a specific session (if it exists).
 */
export async function getPaymentBySessionId(sessionId) {
  const sql = `${BASE_PAYMENT_SELECT} WHERE p.session_id = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [sessionId]);
  return rows.length > 0 ? formatPayment(rows[0]) : null;
}

/**
 * Create a simulated demo payment for a completed parking session.
 *
 * Business rules enforced:
 * - Session must exist and be COMPLETED.
 * - Session must have a calculated total_fee.
 * - Duplicate payment is blocked (one payment per session).
 * - No real gateway is invoked. A unique demo transaction reference is generated.
 */
export async function createPayment({ sessionId, demoMethod }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Fetch and lock the session
    const [sessionRows] = await conn.execute(
      'SELECT id, status, total_fee FROM parking_sessions WHERE id = ? LIMIT 1 FOR UPDATE',
      [sessionId]
    );

    if (!sessionRows || sessionRows.length === 0) {
      const err = new Error(`Parking session #${sessionId} not found.`);
      err.status = 404;
      throw err;
    }

    const session = sessionRows[0];

    // 2. Session must be COMPLETED before payment
    if (session.status !== 'COMPLETED') {
      const err = new Error(
        `Payment cannot be processed: Session #${sessionId} is currently ${session.status}. Only COMPLETED sessions are payable.`
      );
      err.status = 400;
      throw err;
    }

    // 3. Session must have a calculated fee
    if (session.total_fee === null || session.total_fee === undefined) {
      const err = new Error(
        `Payment cannot be processed: Session #${sessionId} has no calculated fee. Record the vehicle exit first.`
      );
      err.status = 400;
      throw err;
    }

    // 4. Duplicate payment prevention — one payment per session
    const [existingPayment] = await conn.execute(
      "SELECT id, status FROM payments WHERE session_id = ? LIMIT 1 FOR UPDATE",
      [sessionId]
    );
    if (existingPayment && existingPayment.length > 0) {
      const existing = existingPayment[0];
      const err = new Error(
        `Duplicate payment blocked: Session #${sessionId} already has a ${existing.status} demo payment (#${existing.id}).`
      );
      err.status = 409;
      throw err;
    }

    // 5. Generate unique demo transaction reference
    const transactionReference = generateDemoReference();
    const amount = Number(session.total_fee);

    // 6. Insert simulated payment record
    const [insertResult] = await conn.execute(
      `INSERT INTO payments (session_id, amount, demo_method, status, transaction_reference, paid_at)
       VALUES (?, ?, ?, 'PAID', ?, NOW())`,
      [sessionId, amount, demoMethod, transactionReference]
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
