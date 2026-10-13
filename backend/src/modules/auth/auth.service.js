import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database.js';
import { env } from '../../config/env.js';

/**
 * Generate secure JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
}

/**
 * Sanitize user object to never leak password hash
 */
export function sanitizeUser(user) {
  const { password_hash, password, ...safeUser } = user;
  return {
    id: safeUser.id,
    fullName: safeUser.full_name || safeUser.fullName,
    email: safeUser.email,
    role: safeUser.role,
    phone: safeUser.phone || null,
    createdAt: safeUser.created_at || safeUser.createdAt,
  };
}

/**
 * Customer Registration Service
 */
export async function registerCustomer({ fullName, email, password, phone }) {
  // 1. Check if user already exists
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existing && existing.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.status = 409;
    throw error;
  }

  // 2. Hash password with bcrypt
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Insert customer with strictly enforced CUSTOMER role
  const [result] = await pool.execute(
    'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    [fullName, email, passwordHash, 'CUSTOMER', phone || null]
  );

  const newUserId = result.insertId;

  // 4. Fetch created user
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, role, phone, created_at FROM users WHERE id = ? LIMIT 1',
    [newUserId]
  );

  const user = rows[0];
  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

/**
 * Authentication / Login Service
 */
export async function loginUser({ email, password }) {
  // 1. Find user by email
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, password_hash, role, phone, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (!rows || rows.length === 0) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  const user = rows[0];

  // 2. Compare password hash using bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  // 3. Issue token
  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

/**
 * Current User Profile Service
 */
export async function getCurrentUser(userId) {
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, role, phone, created_at FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  if (!rows || rows.length === 0) {
    const error = new Error('User account not found.');
    error.status = 404;
    throw error;
  }

  return sanitizeUser(rows[0]);
}
