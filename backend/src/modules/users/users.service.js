import { pool } from '../../config/database.js';
import { sanitizeUser } from '../auth/auth.service.js';

/**
 * Get a user's public profile by id.
 * Returns sanitized user (no password hash).
 */
export async function getUserProfile(userId) {
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, role, phone, created_at FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  if (!rows || rows.length === 0) {
    const err = new Error('User profile not found.');
    err.status = 404;
    throw err;
  }

  return sanitizeUser(rows[0]);
}

/**
 * Update the authenticated customer's own profile.
 * Only full_name and phone may be changed; email and role are immutable here.
 */
export async function updateUserProfile(userId, { fullName, phone }) {
  // Validate that the user exists first
  const [existing] = await pool.execute(
    'SELECT id, full_name, phone FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!existing || existing.length === 0) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const newFullName = fullName !== undefined ? fullName : existing[0].full_name;
  const newPhone = phone !== undefined ? (phone || null) : existing[0].phone;

  await pool.execute(
    'UPDATE users SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
    [newFullName, newPhone, userId]
  );

  // Return updated profile
  return getUserProfile(userId);
}
