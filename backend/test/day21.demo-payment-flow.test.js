/**
 * Day 21: Demo Payment Flow Tests
 *
 * Tests the payment validation middleware, service formatting utility,
 * and core business logic (duplicate protection, status transition rules).
 *
 * Database-dependent operations (createPayment) are tested via
 * business-rule simulation to avoid requiring a live DB in CI.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateCreatePayment } from '../src/modules/payments/payments.validation.js';
import { formatPayment } from '../src/modules/payments/payments.service.js';

// ---------------------------------------------------------------------------
// Mock middleware helpers
// ---------------------------------------------------------------------------
function mockReq(body = {}) {
  return { body: { ...body } };
}

function mockRes() {
  const res = { _status: null, _body: null };
  res.status = (code) => { res._status = code; return res; };
  res.json = (body) => { res._body = body; return res; };
  return res;
}

function callMiddleware(fn, body) {
  const req = mockReq(body);
  const res = mockRes();
  let nextCalled = false;
  fn(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
}

// ---------------------------------------------------------------------------

describe('Day 21: Demo Payment Flow Tests', () => {

  // ─────────────────────────────────────────────────────────────────────────
  describe('1. Payment Creation Validation (validateCreatePayment)', () => {

    it('1.1 Rejects missing sessionId (400)', () => {
      const { res, nextCalled } = callMiddleware(validateCreatePayment, {
        demoMethod: 'SIMULATED_CARD',
      });
      assert.strictEqual(res._status, 400);
      assert.match(res._body.message, /sessionId/i);
      assert.strictEqual(nextCalled, false);
    });

    it('1.2 Rejects non-integer sessionId (400)', () => {
      const { res, nextCalled } = callMiddleware(validateCreatePayment, {
        sessionId: 'abc',
        demoMethod: 'SIMULATED_CARD',
      });
      assert.strictEqual(res._status, 400);
      assert.match(res._body.message, /sessionId/i);
      assert.strictEqual(nextCalled, false);
    });

    it('1.3 Rejects zero sessionId (400)', () => {
      const { res, nextCalled } = callMiddleware(validateCreatePayment, {
        sessionId: 0,
        demoMethod: 'SIMULATED_CARD',
      });
      assert.strictEqual(res._status, 400);
      assert.match(res._body.message, /sessionId/i);
      assert.strictEqual(nextCalled, false);
    });

    it('1.4 Rejects missing demoMethod (400)', () => {
      const { res, nextCalled } = callMiddleware(validateCreatePayment, {
        sessionId: 1,
      });
      assert.strictEqual(res._status, 400);
      assert.match(res._body.message, /demoMethod/i);
      assert.strictEqual(nextCalled, false);
    });

    it('1.5 Rejects invalid demoMethod value (400)', () => {
      const { res, nextCalled } = callMiddleware(validateCreatePayment, {
        sessionId: 1,
        demoMethod: 'REAL_STRIPE',  // not in allowlist
      });
      assert.strictEqual(res._status, 400);
      assert.match(res._body.message, /demoMethod/i);
      assert.strictEqual(nextCalled, false);
    });

    it('1.6 Accepts SIMULATED_CARD and passes to next()', () => {
      const { req, nextCalled } = callMiddleware(validateCreatePayment, {
        sessionId: 5,
        demoMethod: 'SIMULATED_CARD',
      });
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.body.sessionId, 5);
      assert.strictEqual(req.body.demoMethod, 'SIMULATED_CARD');
    });

    it('1.7 Accepts SIMULATED_MOBILE_WALLET and passes to next()', () => {
      const { req, nextCalled } = callMiddleware(validateCreatePayment, {
        sessionId: 3,
        demoMethod: 'SIMULATED_MOBILE_WALLET',
      });
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.body.sessionId, 3);
    });

    it('1.8 Accepts SIMULATED_CASH and passes to next()', () => {
      const { req, nextCalled } = callMiddleware(validateCreatePayment, {
        sessionId: 7,
        demoMethod: 'SIMULATED_CASH',
      });
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.body.sessionId, 7);
    });

    it('1.9 Coerces string sessionId "10" to integer 10', () => {
      const { req, nextCalled } = callMiddleware(validateCreatePayment, {
        sessionId: '10',
        demoMethod: 'SIMULATED_CASH',
      });
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.body.sessionId, 10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('2. Payment Object Formatting (formatPayment)', () => {

    it('2.1 Returns null for null input', () => {
      assert.strictEqual(formatPayment(null), null);
    });

    it('2.2 Returns null for undefined input', () => {
      assert.strictEqual(formatPayment(undefined), null);
    });

    it('2.3 Correctly formats a PAID payment row', () => {
      const row = {
        id: 1,
        session_id: 42,
        amount: '35.00',
        demo_method: 'SIMULATED_CARD',
        status: 'PAID',
        transaction_reference: 'DEMO-ABC123-DEF456',
        paid_at: '2026-10-14 12:00:00',
        created_at: '2026-10-14 12:00:00',
        // No joined session/vehicle/user fields
        entry_time: null,
        plate_number: null,
        user_name: null,
        slot_number: null,
      };

      const result = formatPayment(row);

      assert.strictEqual(result.id, 1);
      assert.strictEqual(result.sessionId, 42);
      assert.strictEqual(result.amount, 35.00);
      assert.strictEqual(result.demoMethod, 'SIMULATED_CARD');
      assert.strictEqual(result.status, 'PAID');
      assert.strictEqual(result.transactionReference, 'DEMO-ABC123-DEF456');
      assert.strictEqual(result.isDemoTransaction, true);
    });

    it('2.4 Always sets isDemoTransaction: true regardless of method', () => {
      const row = {
        id: 2, session_id: 5, amount: '10.00',
        demo_method: 'SIMULATED_CASH', status: 'PAID',
        transaction_reference: 'DEMO-XYZ', paid_at: '2026-10-14T10:00:00Z',
        created_at: '2026-10-14T10:00:00Z',
        entry_time: null, plate_number: null, user_name: null, slot_number: null,
      };
      const result = formatPayment(row);
      assert.strictEqual(result.isDemoTransaction, true);
    });

    it('2.5 Includes session context when entry_time is present', () => {
      const row = {
        id: 3, session_id: 8, amount: '20.00',
        demo_method: 'SIMULATED_MOBILE_WALLET', status: 'PAID',
        transaction_reference: 'DEMO-001', paid_at: '2026-10-14T11:00:00Z',
        created_at: '2026-10-14T11:00:00Z',
        entry_time: '2026-10-14 09:00:00',
        exit_time: '2026-10-14 11:00:00',
        total_fee: '20.00',
        session_status: 'COMPLETED',
        vehicle_id: 1,
        plate_number: null, user_name: null, slot_number: null,
      };
      const result = formatPayment(row);
      assert.ok(result.session, 'session context should be present');
      assert.strictEqual(result.session.status, 'COMPLETED');
      assert.strictEqual(result.session.totalFee, 20.00);
    });

    it('2.6 Includes vehicle context when plate_number is present', () => {
      const row = {
        id: 4, session_id: 9, amount: '15.00',
        demo_method: 'SIMULATED_CARD', status: 'PAID',
        transaction_reference: 'DEMO-002', paid_at: '2026-10-14T10:00:00Z',
        created_at: '2026-10-14T10:00:00Z',
        entry_time: null,
        plate_number: 'DHK-1234',
        vehicle_type: 'STANDARD_CAR',
        make_model: 'Toyota Corolla',
        vehicle_id: 5,
        user_name: null, slot_number: null,
      };
      const result = formatPayment(row);
      assert.ok(result.vehicle, 'vehicle context should be present');
      assert.strictEqual(result.vehicle.plateNumber, 'DHK-1234');
      assert.strictEqual(result.vehicle.vehicleType, 'STANDARD_CAR');
    });

    it('2.7 Includes user context when user_name is present', () => {
      const row = {
        id: 5, session_id: 10, amount: '25.00',
        demo_method: 'SIMULATED_CARD', status: 'PAID',
        transaction_reference: 'DEMO-003', paid_at: '2026-10-14T10:00:00Z',
        created_at: '2026-10-14T10:00:00Z',
        entry_time: null, plate_number: null,
        user_id: 2,
        user_name: 'Test Customer',
        user_email: 'test@example.com',
        slot_number: null,
      };
      const result = formatPayment(row);
      assert.ok(result.user, 'user context should be present');
      assert.strictEqual(result.user.fullName, 'Test Customer');
      assert.strictEqual(result.user.email, 'test@example.com');
    });

    it('2.8 Includes slot context when slot_number is present', () => {
      const row = {
        id: 6, session_id: 11, amount: '8.00',
        demo_method: 'SIMULATED_CASH', status: 'PAID',
        transaction_reference: 'DEMO-004', paid_at: '2026-10-14T10:00:00Z',
        created_at: '2026-10-14T10:00:00Z',
        entry_time: null, plate_number: null, user_name: null,
        slot_id: 3,
        slot_number: 'A-101',
        lot_name: 'Downtown Lot Alpha',
      };
      const result = formatPayment(row);
      assert.ok(result.slot, 'slot context should be present');
      assert.strictEqual(result.slot.slotNumber, 'A-101');
      assert.strictEqual(result.slot.lotName, 'Downtown Lot Alpha');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('3. Business Rule Simulation — Duplicate Protection & Status Validation', () => {

    // Simulate the guard logic from payments.service.js createPayment
    function simulateCreatePayment({ sessionStatus, totalFee, existingPayment }) {
      if (!sessionStatus) throw Object.assign(new Error('Session not found.'), { status: 404 });
      if (sessionStatus !== 'COMPLETED') {
        throw Object.assign(
          new Error(`Payment cannot be processed: Session is ${sessionStatus}. Only COMPLETED sessions are payable.`),
          { status: 400 }
        );
      }
      if (totalFee === null || totalFee === undefined) {
        throw Object.assign(new Error('Session has no calculated fee.'), { status: 400 });
      }
      if (existingPayment) {
        throw Object.assign(
          new Error(`Duplicate payment blocked: Session already has a ${existingPayment.status} demo payment.`),
          { status: 409 }
        );
      }
      // Success: return simulated payment id
      return { id: 99, amount: Number(totalFee), status: 'PAID' };
    }

    it('3.1 Rejects payment for non-existent session (404)', () => {
      assert.throws(
        () => simulateCreatePayment({ sessionStatus: null, totalFee: null, existingPayment: null }),
        (err) => err.status === 404 && /not found/i.test(err.message)
      );
    });

    it('3.2 Rejects payment for ACTIVE session (400)', () => {
      assert.throws(
        () => simulateCreatePayment({ sessionStatus: 'ACTIVE', totalFee: null, existingPayment: null }),
        (err) => err.status === 400 && /ACTIVE/i.test(err.message)
      );
    });

    it('3.3 Rejects payment when session has no calculated fee (400)', () => {
      assert.throws(
        () => simulateCreatePayment({ sessionStatus: 'COMPLETED', totalFee: null, existingPayment: null }),
        (err) => err.status === 400 && /fee/i.test(err.message)
      );
    });

    it('3.4 Blocks duplicate payment when a PAID payment already exists (409)', () => {
      assert.throws(
        () => simulateCreatePayment({
          sessionStatus: 'COMPLETED',
          totalFee: 20.00,
          existingPayment: { id: 7, status: 'PAID' },
        }),
        (err) => err.status === 409 && /duplicate/i.test(err.message)
      );
    });

    it('3.5 Succeeds for a COMPLETED session with fee and no existing payment', () => {
      const result = simulateCreatePayment({
        sessionStatus: 'COMPLETED',
        totalFee: '35.00',
        existingPayment: null,
      });
      assert.strictEqual(result.status, 'PAID');
      assert.strictEqual(result.amount, 35.00);
    });

    it('3.6 Blocked when a FAILED payment already exists (no retry allowed via same path)', () => {
      // Even failed payments block re-creation through the standard path
      assert.throws(
        () => simulateCreatePayment({
          sessionStatus: 'COMPLETED',
          totalFee: 20.00,
          existingPayment: { id: 9, status: 'FAILED' },
        }),
        (err) => err.status === 409
      );
    });
  });
});
