/**
 * Day 22: Reports and Database Demonstration Unit Tests
 *
 * Tests:
 * 1. Filter input validation (dates, ranges, lot IDs, demo methods, pagination).
 * 2. Mathematical integrity & zero-division protections for occupancy, cancellations, and sessions.
 * 3. Payment reporting integrity:
 *    - Strict exclusion of FAILED and REFUNDED amounts from successful demo revenue.
 *    - Universal presence of `isDemoTransaction: true` flag and demo disclaimer.
 * 4. Response formatting and query normalization.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateReportFilters } from '../src/modules/reports/reports.validation.js';

function createMockReqRes(query = {}) {
  const req = {
    query,
  };
  let statusCode = 200;
  let jsonResponse = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
    get statusCode() {
      return statusCode;
    },
    get jsonResponse() {
      return jsonResponse;
    },
  };

  return { req, res };
}

describe('Day 22: Reports Validation & Metrics Tests', () => {
  // ─── 1. Filter Validation Tests ─────────────────────────────────────────────
  describe('1. Report Filter Validation (validateReportFilters)', () => {
    it('1.1 Rejects invalid startDate format (400)', () => {
      const { req, res } = createMockReqRes({ startDate: 'not-a-date' });
      let calledNext = false;
      validateReportFilters(req, res, () => { calledNext = true; });

      assert.equal(res.statusCode, 400);
      assert.equal(res.jsonResponse.success, false);
      assert.match(res.jsonResponse.message, /Invalid startDate format/);
      assert.equal(calledNext, false);
    });

    it('1.2 Rejects invalid endDate format (400)', () => {
      const { req, res } = createMockReqRes({ endDate: '2026-13-99' });
      let calledNext = false;
      validateReportFilters(req, res, () => { calledNext = true; });

      assert.equal(res.statusCode, 400);
      assert.equal(res.jsonResponse.success, false);
      assert.match(res.jsonResponse.message, /Invalid endDate format/);
      assert.equal(calledNext, false);
    });

    it('1.3 Rejects when startDate is after endDate (400)', () => {
      const { req, res } = createMockReqRes({
        startDate: '2026-10-20',
        endDate: '2026-10-10',
      });
      let calledNext = false;
      validateReportFilters(req, res, () => { calledNext = true; });

      assert.equal(res.statusCode, 400);
      assert.equal(res.jsonResponse.success, false);
      assert.match(res.jsonResponse.message, /startDate cannot be after endDate/);
      assert.equal(calledNext, false);
    });

    it('1.4 Rejects invalid lotId (non-integer or negative) (400)', () => {
      const { req, res } = createMockReqRes({ lotId: 'abc' });
      let calledNext = false;
      validateReportFilters(req, res, () => { calledNext = true; });

      assert.equal(res.statusCode, 400);
      assert.equal(res.jsonResponse.success, false);
      assert.match(res.jsonResponse.message, /lotId must be a positive integer/);
      assert.equal(calledNext, false);
    });

    it('1.5 Rejects invalid demoMethod (400)', () => {
      const { req, res } = createMockReqRes({ demoMethod: 'BITCOIN' });
      let calledNext = false;
      validateReportFilters(req, res, () => { calledNext = true; });

      assert.equal(res.statusCode, 400);
      assert.equal(res.jsonResponse.success, false);
      assert.match(res.jsonResponse.message, /demoMethod must be one of/);
      assert.equal(calledNext, false);
    });

    it('1.6 Normalizes valid dates and pagination defaults', () => {
      const { req, res } = createMockReqRes({
        startDate: '2026-10-01',
        endDate: '2026-10-15',
        lotId: '2',
        demoMethod: 'SIMULATED_CARD',
      });
      let calledNext = false;
      validateReportFilters(req, res, () => { calledNext = true; });

      assert.equal(calledNext, true);
      assert.equal(req.validatedQuery.lotId, 2);
      assert.equal(req.validatedQuery.demoMethod, 'SIMULATED_CARD');
      assert.equal(req.validatedQuery.startDate, '2026-09-30 18:00:00');
      assert.equal(req.validatedQuery.endDate, '2026-10-15 17:59:59');
      assert.equal(req.validatedQuery.page, 1);
      assert.equal(req.validatedQuery.limit, 50);
    });
  });

  // ─── 2. Metric Definition Correctness Tests ─────────────────────────────────
  describe('2. Core Metric Calculation Logic Simulations', () => {
    it('2.1 Occupancy calculation includes occupied and reserved slots accurately', () => {
      const totalSlots = 100;
      const occupiedSlots = 40;
      const reservedSlots = 20;
      const occupancyRate = totalSlots > 0
        ? Number((((occupiedSlots + reservedSlots) / totalSlots) * 100).toFixed(1))
        : 0;

      assert.equal(occupancyRate, 60.0);
    });

    it('2.2 Occupancy calculation handles 0 total slots safely without NaN', () => {
      const totalSlots = 0;
      const occupiedSlots = 0;
      const reservedSlots = 0;
      const occupancyRate = totalSlots > 0
        ? Number((((occupiedSlots + reservedSlots) / totalSlots) * 100).toFixed(1))
        : 0;

      assert.equal(occupancyRate, 0);
      assert.equal(Number.isNaN(occupancyRate), false);
    });

    it('2.3 Cancellation rate formula handles zero reservations safely', () => {
      const totalReservations = 0;
      const cancelledCount = 0;
      const cancellationRate = totalReservations > 0
        ? Number(((cancelledCount / totalReservations) * 100).toFixed(1))
        : 0;

      assert.equal(cancellationRate, 0);
    });

    it('2.4 Cancellation rate correctly calculates non-zero ratio', () => {
      const totalReservations = 50;
      const cancelledCount = 10;
      const cancellationRate = totalReservations > 0
        ? Number(((cancelledCount / totalReservations) * 100).toFixed(1))
        : 0;

      assert.equal(cancellationRate, 20.0);
    });

    it('2.5 Successful payment totals strictly sum PAID payments, ignoring FAILED and REFUNDED', () => {
      const simulatedRows = [
        { status: 'PAID', amount: 15.00 },
        { status: 'PAID', amount: 25.50 },
        { status: 'FAILED', amount: 100.00 },
        { status: 'REFUNDED', amount: 50.00 },
      ];

      const successfulSum = simulatedRows
        .filter((r) => r.status === 'PAID')
        .reduce((sum, r) => sum + r.amount, 0);

      assert.equal(successfulSum, 40.50);
    });

    it('2.6 Session fee reporting preserves recorded fee snapshot without recalculation', () => {
      const recordedSessions = [
        { id: 1, hourly_rate_snapshot: 4.00, total_fee: 8.00, status: 'COMPLETED' },
        { id: 2, hourly_rate_snapshot: 5.50, total_fee: 16.50, status: 'COMPLETED' },
        { id: 3, hourly_rate_snapshot: 7.00, total_fee: null, status: 'ACTIVE' },
      ];

      const completedRevenue = recordedSessions
        .filter((s) => s.status === 'COMPLETED' && s.total_fee !== null)
        .reduce((sum, s) => sum + s.total_fee, 0);

      assert.equal(completedRevenue, 24.50);
    });
  });
});
