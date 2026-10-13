import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateAvailabilityQuery } from '../src/modules/parking/parking.validation.js';
import {
  isIntervalOverlapping,
  isSlotCompatible,
  getCompatibleSlotTypes,
  COMPATIBILITY_MAP,
} from '../src/modules/parking/parking.service.js';

describe('Day 12: Parking Availability Logic & Compatibility Tests', () => {

  describe('1. Availability Query Validation (validateAvailabilityQuery)', () => {
    it('1.1 Rejects request when startTime is missing (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        query: {
          endTime: new Date(Date.now() + 3600000).toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateAvailabilityQuery(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /startTime/i);
    });

    it('1.2 Rejects request when endTime is missing (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        query: {
          startTime: new Date(Date.now() + 3600000).toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateAvailabilityQuery(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /endTime/i);
    });

    it('1.3 Rejects invalid date format (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        query: {
          startTime: 'not-a-valid-date',
          endTime: '2026-10-15T12:00:00Z',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateAvailabilityQuery(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /invalid startTime/i);
    });

    it('1.4 Rejects when endTime is before or equal to startTime (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const now = new Date(Date.now() + 3600000);
      const req = {
        query: {
          startTime: now.toISOString(),
          endTime: new Date(now.getTime() - 1000).toISOString(), // earlier than start
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateAvailabilityQuery(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /strictly after/i);
    });

    it('1.5 Rejects duration shorter than 15 minutes (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const start = new Date(Date.now() + 3600000);
      const end = new Date(start.getTime() + 5 * 60 * 1000); // only 5 mins
      const req = {
        query: {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateAvailabilityQuery(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /15 minutes/i);
    });

    it('1.6 Rejects duration exceeding 7 days (400)', () => {
      let statusCode = null;
      const start = new Date(Date.now() + 3600000);
      const end = new Date(start.getTime() + 8 * 24 * 3600 * 1000); // 8 days
      const req = {
        query: {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateAvailabilityQuery(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });

    it('1.7 Rejects interval entirely in the past (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const pastStart = new Date(Date.now() - 7200000); // 2 hours ago
      const pastEnd = new Date(Date.now() - 3600000);   // 1 hour ago
      const req = {
        query: {
          startTime: pastStart.toISOString(),
          endTime: pastEnd.toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateAvailabilityQuery(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /past/i);
    });

    it('1.8 Rejects invalid lotId or vehicleType (400)', () => {
      let statusCode = null;
      const req = {
        query: {
          startTime: new Date(Date.now() + 3600000).toISOString(),
          endTime: new Date(Date.now() + 7200000).toISOString(),
          lotId: '-99',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateAvailabilityQuery(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });

    it('1.9 Successfully normalizes valid availability query parameters', () => {
      let nextCalled = false;
      const start = new Date(Date.now() + 3600000);
      const end = new Date(Date.now() + 10800000);
      const req = {
        query: {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          lotId: '2',
          vehicleType: 'suv',
        },
      };
      const res = {};
      const next = () => { nextCalled = true; };

      validateAvailabilityQuery(req, res, next);
      assert.equal(nextCalled, true);
      assert.equal(req.query.lotId, 2);
      assert.equal(req.query.vehicleType, 'SUV');
      assert.equal(req.query.startTime, start.toISOString());
      assert.equal(req.query.endTime, end.toISOString());
    });
  });

  describe('2. Interval Overlap Logic (isIntervalOverlapping)', () => {
    // Formula: existing.start < requested.end AND existing.end > requested.start

    it('2.1 Detects true overlap when requested interval partially intersects existing', () => {
      const existing = { start: '2026-10-15T10:00:00Z', end: '2026-10-15T12:00:00Z' };
      const requested = { start: '2026-10-15T11:00:00Z', end: '2026-10-15T13:00:00Z' };

      const overlaps = isIntervalOverlapping(
        existing.start,
        existing.end,
        requested.start,
        requested.end
      );
      assert.equal(overlaps, true);
    });

    it('2.2 Detects true overlap when requested interval is fully inside existing interval', () => {
      const existing = { start: '2026-10-15T09:00:00Z', end: '2026-10-15T17:00:00Z' };
      const requested = { start: '2026-10-15T11:00:00Z', end: '2026-10-15T13:00:00Z' };

      const overlaps = isIntervalOverlapping(
        existing.start,
        existing.end,
        requested.start,
        requested.end
      );
      assert.equal(overlaps, true);
    });

    it('2.3 Detects true overlap when requested interval completely encloses existing interval', () => {
      const existing = { start: '2026-10-15T12:00:00Z', end: '2026-10-15T14:00:00Z' };
      const requested = { start: '2026-10-15T10:00:00Z', end: '2026-10-15T16:00:00Z' };

      const overlaps = isIntervalOverlapping(
        existing.start,
        existing.end,
        requested.start,
        requested.end
      );
      assert.equal(overlaps, true);
    });

    it('2.4 Allows adjacent intervals touching at boundary (half-open [start, end))', () => {
      const existing = { start: '2026-10-15T10:00:00Z', end: '2026-10-15T12:00:00Z' };
      // Customer B arrives exactly when Customer A departs (12:00)
      const requestedNext = { start: '2026-10-15T12:00:00Z', end: '2026-10-15T14:00:00Z' };
      // Customer C departs exactly when Customer A arrives (10:00)
      const requestedPrev = { start: '2026-10-15T08:00:00Z', end: '2026-10-15T10:00:00Z' };

      assert.equal(
        isIntervalOverlapping(existing.start, existing.end, requestedNext.start, requestedNext.end),
        false
      );
      assert.equal(
        isIntervalOverlapping(existing.start, existing.end, requestedPrev.start, requestedPrev.prevEnd),
        false
      );
    });

    it('2.5 Returns false for completely disjoint time windows', () => {
      const existing = { start: '2026-10-15T10:00:00Z', end: '2026-10-15T12:00:00Z' };
      const requested = { start: '2026-10-15T15:00:00Z', end: '2026-10-15T18:00:00Z' };

      assert.equal(
        isIntervalOverlapping(existing.start, existing.end, requested.start, requested.end),
        false
      );
    });
  });

  describe('3. Vehicle & Slot Compatibility Hierarchy (isSlotCompatible)', () => {
    it('3.1 Motorcycle can fit into any slot type (Motorcycle, Car, SUV, Van, Truck)', () => {
      assert.equal(isSlotCompatible('MOTORCYCLE', 'MOTORCYCLE'), true);
      assert.equal(isSlotCompatible('STANDARD_CAR', 'MOTORCYCLE'), true);
      assert.equal(isSlotCompatible('SUV', 'MOTORCYCLE'), true);
      assert.equal(isSlotCompatible('VAN', 'MOTORCYCLE'), true);
      assert.equal(isSlotCompatible('TRUCK', 'MOTORCYCLE'), true);
    });

    it('3.2 Standard Car cannot fit into Motorcycle slot, but fits in Car, SUV, Van, Truck', () => {
      assert.equal(isSlotCompatible('MOTORCYCLE', 'STANDARD_CAR'), false);
      assert.equal(isSlotCompatible('STANDARD_CAR', 'STANDARD_CAR'), true);
      assert.equal(isSlotCompatible('SUV', 'STANDARD_CAR'), true);
      assert.equal(isSlotCompatible('VAN', 'STANDARD_CAR'), true);
      assert.equal(isSlotCompatible('TRUCK', 'STANDARD_CAR'), true);
    });

    it('3.3 SUV cannot fit into Motorcycle or Standard Car slot', () => {
      assert.equal(isSlotCompatible('MOTORCYCLE', 'SUV'), false);
      assert.equal(isSlotCompatible('STANDARD_CAR', 'SUV'), false);
      assert.equal(isSlotCompatible('SUV', 'SUV'), true);
      assert.equal(isSlotCompatible('VAN', 'SUV'), true);
      assert.equal(isSlotCompatible('TRUCK', 'SUV'), true);
    });

    it('3.4 Truck requires Truck bay only', () => {
      assert.equal(isSlotCompatible('MOTORCYCLE', 'TRUCK'), false);
      assert.equal(isSlotCompatible('STANDARD_CAR', 'TRUCK'), false);
      assert.equal(isSlotCompatible('SUV', 'TRUCK'), false);
      assert.equal(isSlotCompatible('VAN', 'TRUCK'), false);
      assert.equal(isSlotCompatible('TRUCK', 'TRUCK'), true);
    });

    it('3.5 getCompatibleSlotTypes returns correct whitelist array', () => {
      assert.deepEqual(getCompatibleSlotTypes('SUV'), ['SUV', 'VAN', 'TRUCK']);
      assert.deepEqual(getCompatibleSlotTypes('STANDARD_CAR'), ['STANDARD_CAR', 'SUV', 'VAN', 'TRUCK']);
      assert.deepEqual(getCompatibleSlotTypes('TRUCK'), ['TRUCK']);
    });
  });

});
