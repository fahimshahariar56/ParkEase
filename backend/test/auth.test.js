import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { validateRegister, validateLogin } from '../src/modules/auth/auth.validation.js';
import { generateToken, sanitizeUser } from '../src/modules/auth/auth.service.js';
import { authenticate } from '../src/middleware/authenticate.js';
import { app } from '../src/app.js';

describe('Day 7: Authentication API & Security Tests', () => {

  it('1. Bcrypt password hashing correctly hashes and verifies', async () => {
    const password = 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    assert.notEqual(hash, password, 'Password must not be stored in plaintext');
    assert.equal(await bcrypt.compare(password, hash), true, 'Bcrypt compare must verify matching password');
    assert.equal(await bcrypt.compare('WrongPassword', hash), false, 'Bcrypt compare must reject invalid password');
  });

  it('2. sanitizeUser strips password and password_hash completely', () => {
    const rawUser = {
      id: 42,
      full_name: 'John Customer',
      email: 'john@example.com',
      password_hash: '$2a$10$hashedstringhere1234567890',
      password: 'PlaintextPassword',
      role: 'CUSTOMER',
      phone: '+123456789',
      created_at: new Date().toISOString(),
    };

    const safe = sanitizeUser(rawUser);

    assert.equal(safe.id, 42);
    assert.equal(safe.email, 'john@example.com');
    assert.equal(safe.fullName, 'John Customer');
    assert.equal(safe.role, 'CUSTOMER');
    assert.equal(safe.password_hash, undefined, 'password_hash must be stripped');
    assert.equal(safe.password, undefined, 'password must be stripped');
  });

  it('3. validateRegister rejects public ADMIN registration attempt with 403', () => {
    let statusCode = null;
    let jsonPayload = null;

    const req = {
      body: {
        fullName: 'Attacker Admin',
        email: 'attacker@example.com',
        password: 'Password@123',
        role: 'ADMIN',
      },
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => { jsonPayload = data; },
        };
      },
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    validateRegister(req, res, next);

    assert.equal(statusCode, 403, 'Must return 403 Forbidden for admin registration attempt');
    assert.equal(jsonPayload.success, false);
    assert.equal(nextCalled, false, 'Next middleware must not be called on rejection');
  });

  it('4. validateRegister rejects short password (< 8 chars)', () => {
    let statusCode = null;
    let jsonPayload = null;

    const req = {
      body: {
        fullName: 'Short Pass',
        email: 'short@example.com',
        password: '123',
      },
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => { jsonPayload = data; },
        };
      },
    };

    validateRegister(req, res, () => {});

    assert.equal(statusCode, 400);
    assert.match(jsonPayload.message, /at least 8 characters/i);
  });

  it('5. validateRegister rejects invalid email format', () => {
    let statusCode = null;

    const req = {
      body: {
        fullName: 'Invalid Email',
        email: 'not-an-email',
        password: 'Password@123',
      },
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      },
    };

    validateRegister(req, res, () => {});

    assert.equal(statusCode, 400);
  });

  it('6. validateRegister forces role to CUSTOMER and lowercases email', () => {
    const req = {
      body: {
        fullName: 'Valid Customer',
        email: 'Customer.One@EXAMPLE.com',
        password: 'Password@123',
      },
    };
    let nextCalled = false;

    validateRegister(req, {}, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(req.body.role, 'CUSTOMER');
    assert.equal(req.body.email, 'customer.one@example.com');
  });

  it('7. generateToken and authenticate middleware verify JWT Bearer tokens', () => {
    const userPayload = { id: 101, email: 'user@parkease.io', role: 'CUSTOMER' };
    const token = generateToken(userPayload);

    // Valid Bearer token
    const req = {
      headers: { authorization: `Bearer ${token}` },
    };
    let nextCalled = false;

    authenticate(req, {}, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, 101);
    assert.equal(req.user.email, 'user@parkease.io');
    assert.equal(req.user.role, 'CUSTOMER');
  });

  it('8. authenticate middleware rejects missing or invalid token with 401', () => {
    let statusCode = null;
    const req = { headers: {} };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      },
    };

    authenticate(req, res, () => {});
    assert.equal(statusCode, 401, 'Missing token must yield 401');

    // Malformed token
    const reqBad = { headers: { authorization: 'Bearer bad_token_123' } };
    let badCode = null;
    const resBad = {
      status: (code) => {
        badCode = code;
        return { json: () => {} };
      },
    };
    authenticate(reqBad, resBad, () => {});
    assert.equal(badCode, 401, 'Bad token must yield 401');
  });
});
