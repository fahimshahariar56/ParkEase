import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  loginCustomer,
  loginAdmin,
  authenticateWithRole,
} from '../src/modules/auth/auth.service.js';
import { pool } from '../src/config/database.js';

describe('Admin & Customer Authentication Separation Tests', () => {
  after(async () => {
    await pool.end();
  });

  it('1. Admin login rejects user when role is CUSTOMER in database', async () => {
    let thrownError = null;
    try {
      // fahim@gmail.com is role 'CUSTOMER' in the database
      await loginAdmin({ email: 'fahim@gmail.com', password: 'AnyPassword' });
    } catch (err) {
      thrownError = err;
    }

    assert.ok(thrownError, 'Must throw error when non-admin attempts admin login');
    assert.equal(thrownError.status, 401);
    assert.equal(thrownError.message, 'Invalid admin credentials.');
  });

  it('2. Customer login rejects user when role is ADMIN in database', async () => {
    let thrownError = null;
    try {
      // parkease@gmail.com is role 'ADMIN' in the database
      const adminPass = process.env.ADMIN_PASSWORD;
      await loginCustomer({ email: 'parkease@gmail.com', password: adminPass });
    } catch (err) {
      thrownError = err;
    }

    assert.ok(thrownError, 'Must throw error when admin attempts customer login');
    assert.equal(thrownError.status, 401);
    assert.equal(thrownError.message, 'Invalid email or password.');
  });

  it('3. Admin login succeeds when valid ADMIN credentials are provided', async () => {
    const adminPass = process.env.ADMIN_PASSWORD;
    const result = await loginAdmin({
      email: 'parkease@gmail.com',
      password: adminPass,
    });

    assert.ok(result.token, 'Must return JWT token');
    assert.equal(result.user.email, 'parkease@gmail.com');
    assert.equal(result.user.role, 'ADMIN');
    assert.equal(result.user.password_hash, undefined, 'Must not leak password_hash');
  });

  it('4. Admin login rejects non-existent email with generic error', async () => {
    let thrownError = null;
    try {
      await loginAdmin({
        email: 'ghost_admin_404@parkease.com',
        password: 'Password@123',
      });
    } catch (err) {
      thrownError = err;
    }

    assert.ok(thrownError);
    assert.equal(thrownError.status, 401);
    assert.equal(thrownError.message, 'Invalid admin credentials.');
  });

  it('5. Customer login rejects non-existent email with generic error', async () => {
    let thrownError = null;
    try {
      await loginCustomer({
        email: 'ghost_customer_404@parkease.com',
        password: 'Password@123',
      });
    } catch (err) {
      thrownError = err;
    }

    assert.ok(thrownError);
    assert.equal(thrownError.status, 401);
    assert.equal(thrownError.message, 'Invalid email or password.');
  });
});
