import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { authorizeRoles, verifyOwnership, enforceUserOwnership } from '../src/middleware/authorizeRole.js';

describe('Day 8: Role-Based Access Control & Ownership Protection', () => {

  it('1. authorizeRoles grants access when user has required role', () => {
    const middleware = authorizeRoles('ADMIN');
    const req = { user: { id: 1, role: 'ADMIN' } };
    let nextCalled = false;

    middleware(req, {}, () => { nextCalled = true; });

    assert.equal(nextCalled, true, 'Next must be called when role matches');
  });

  it('2. authorizeRoles rejects when customer attempts admin route with 403', () => {
    const middleware = authorizeRoles('ADMIN');
    const req = { user: { id: 2, role: 'CUSTOMER' } };
    let statusCode = null;
    let jsonPayload = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (data) => { jsonPayload = data; } };
      },
    };
    let nextCalled = false;

    middleware(req, res, () => { nextCalled = true; });

    assert.equal(statusCode, 403, 'Must return 403 Forbidden for insufficient permissions');
    assert.equal(jsonPayload.success, false);
    assert.match(jsonPayload.message, /Access denied/i);
    assert.equal(nextCalled, false);
  });

  it('3. authorizeRoles rejects unauthenticated request with 401', () => {
    const middleware = authorizeRoles('ADMIN', 'CUSTOMER');
    const req = {}; // No req.user
    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      },
    };

    middleware(req, res, () => {});

    assert.equal(statusCode, 401, 'Must return 401 when req.user is absent');
  });

  it('4. verifyOwnership allows resource owner and admin, rejects foreign customer', () => {
    const customerUser = { id: 5, role: 'CUSTOMER' };
    const adminUser = { id: 1, role: 'ADMIN' };

    // Own resource
    assert.equal(verifyOwnership(5, customerUser), true, 'Owner customer can access their own resource');
    assert.equal(verifyOwnership('5', customerUser), true, 'Handles string/number matching');

    // Other customer's resource
    assert.equal(verifyOwnership(99, customerUser), false, 'Customer cannot access another user resource');

    // Admin accessing any resource
    assert.equal(verifyOwnership(99, adminUser), true, 'Admin can access any user resource');
  });

  it('5. enforceUserOwnership middleware protects resources by route param', () => {
    const middleware = enforceUserOwnership('userId');
    
    // Customer accessing their own id
    const reqValid = { user: { id: 12, role: 'CUSTOMER' }, params: { userId: '12' } };
    let validNext = false;
    middleware(reqValid, {}, () => { validNext = true; });
    assert.equal(validNext, true);

    // Customer trying to access another id
    const reqInvalid = { user: { id: 12, role: 'CUSTOMER' }, params: { userId: '99' } };
    let invalidCode = null;
    const resInvalid = {
      status: (code) => {
        invalidCode = code;
        return { json: () => {} };
      },
    };
    middleware(reqInvalid, resInvalid, () => {});
    assert.equal(invalidCode, 403);
  });

});
