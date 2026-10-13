import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSessionFee,
  formatSession,
} from '../src/modules/sessions/sessions.service.js';
import {
  validateSessionEntry,
  validateSessionExit,
} from '../src/modules/sessions/sessions.validation.js';

describe('Day 20: Parking Entry and Exit Sessions Tests', () => {

  describe('1. Server-side Fee Calculation (calculateSessionFee)', () => {
    it('1.1 Applies minimum 1-hour charge for brief parking (e.g. 15 minutes)', () => {
      const entryTime = '2026-10-14 10:00:00';
      const exitTime = '2026-10-14 10:15:00';
      const hourlyRate = 5.00;

      const result = calculateSessionFee(entryTime, exitTime, hourlyRate);
      assert.equal(result.durationMinutes, 15);
      assert.equal(result.billableHours, 1);
      assert.equal(result.totalFee, 5.00);
    });

    it('1.2 Correctly calculates fee for exact 2-hour duration', () => {
      const entryTime = '2026-10-14 10:00:00';
      const exitTime = '2026-10-14 12:00:00';
      const hourlyRate = 7.50;

      const result = calculateSessionFee(entryTime, exitTime, hourlyRate);
      assert.equal(result.durationMinutes, 120);
      assert.equal(result.billableHours, 2);
      assert.equal(result.totalFee, 15.00);
    });

    it('1.3 Rounds up partial hours correctly (e.g. 2 hours 10 minutes -> 3 billable hours)', () => {
      const entryTime = '2026-10-14 10:00:00';
      const exitTime = '2026-10-14 12:10:00';
      const hourlyRate = 10.00;

      const result = calculateSessionFee(entryTime, exitTime, hourlyRate);
      assert.equal(result.durationMinutes, 130);
      assert.equal(result.billableHours, 3);
      assert.equal(result.totalFee, 30.00);
    });

    it('1.4 Handles zero duration gracefully with minimum 1-hour floor', () => {
      const timestamp = '2026-10-14 10:00:00';
      const result = calculateSessionFee(timestamp, timestamp, 6.00);
      assert.equal(result.durationMinutes, 0);
      assert.equal(result.billableHours, 1);
      assert.equal(result.totalFee, 6.00);
    });
  });

  describe('2. Session Entry Validation (validateSessionEntry)', () => {
    it('2.1 Rejects missing or invalid slotId (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: { vehicleId: 1 },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateSessionEntry(req, res, () => {
        assert.fail('next() should not be invoked when slotId is missing');
      });

      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /slotId/i);
    });

    it('2.2 Rejects missing or invalid vehicleId (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: { slotId: 4 },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateSessionEntry(req, res, () => {
        assert.fail('next() should not be invoked when vehicleId is missing');
      });

      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /vehicleId/i);
    });

    it('2.3 Rejects malformed entry timestamp (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: { slotId: 4, vehicleId: 2, entryTime: 'invalid-time-string' },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateSessionEntry(req, res, () => {
        assert.fail('next() should not be invoked when entryTime is malformed');
      });

      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /entrytime/i);
    });

    it('2.4 Passes validation with valid slotId and vehicleId', () => {
      let nextCalled = false;
      const req = {
        body: { slotId: '5', vehicleId: '3' },
      };
      const res = {};

      validateSessionEntry(req, res, () => {
        nextCalled = true;
      });

      assert.ok(nextCalled, 'next() should be called when entry payload is valid');
      assert.equal(req.body.slotId, 5);
      assert.equal(req.body.vehicleId, 3);
    });
  });

  describe('3. Session Exit Validation (validateSessionExit)', () => {
    it('3.1 Rejects invalid exitTime format (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: { exitTime: 'not-a-valid-date' },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateSessionExit(req, res, () => {
        assert.fail('next() should not be invoked when exitTime is invalid');
      });

      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /exittime/i);
    });

    it('3.2 Passes validation when exitTime is omitted (uses server current time)', () => {
      let nextCalled = false;
      const req = { body: {} };
      const res = {};

      validateSessionExit(req, res, () => {
        nextCalled = true;
      });

      assert.ok(nextCalled, 'next() should be called when exitTime is omitted');
    });
  });

  describe('4. Session Object Formatting (formatSession)', () => {
    it('4.1 Returns null for null row input', () => {
      assert.equal(formatSession(null), null);
    });

    it('4.2 Correctly transforms database row with joined details and active status', () => {
      const mockRow = {
        id: 10,
        reservation_id: 2,
        vehicle_id: 5,
        slot_id: 12,
        entry_time: '2026-10-14 09:00:00',
        exit_time: null,
        hourly_rate_snapshot: '8.50',
        total_fee: null,
        status: 'ACTIVE',
        created_at: '2026-10-14 09:00:00',
        updated_at: '2026-10-14 09:00:00',
        plate_number: 'DHAKA-METRO-KA-1122',
        vehicle_type: 'CAR',
        make_model: 'Toyota Prius',
        user_id: 1,
        user_name: 'Fahim Shahariar',
        user_email: 'fahim@gmail.com',
        user_phone: '+8801700000000',
        slot_number: 'A-101',
        slot_type: 'STANDARD',
        lot_id: 1,
        lot_name: 'Downtown Core Hub',
        lot_address: '123 Main Street',
      };

      const formatted = formatSession(mockRow);

      assert.equal(formatted.id, 10);
      assert.equal(formatted.reservationId, 2);
      assert.equal(formatted.vehicleId, 5);
      assert.equal(formatted.slotId, 12);
      assert.equal(formatted.status, 'ACTIVE');
      assert.equal(formatted.hourlyRateSnapshot, 8.50);
      assert.equal(formatted.totalFee, null);
      assert.equal(formatted.vehicle.plateNumber, 'DHAKA-METRO-KA-1122');
      assert.equal(formatted.slot.slotNumber, 'A-101');
      assert.equal(formatted.slot.lotName, 'Downtown Core Hub');
      assert.equal(formatted.user.fullName, 'Fahim Shahariar');
      assert.ok(formatted.durationMinutes >= 0);
      assert.ok(formatted.billableHours >= 1);
    });

    it('4.3 Formats completed session with final total fee', () => {
      const mockRow = {
        id: 11,
        reservation_id: null,
        vehicle_id: 6,
        slot_id: 14,
        entry_time: '2026-10-14 08:00:00',
        exit_time: '2026-10-14 10:30:00',
        hourly_rate_snapshot: '6.00',
        total_fee: '18.00',
        status: 'COMPLETED',
        plate_number: 'DHAKA-METRO-GA-3344',
      };

      const formatted = formatSession(mockRow);
      assert.equal(formatted.status, 'COMPLETED');
      assert.equal(formatted.hourlyRateSnapshot, 6.00);
      assert.equal(formatted.totalFee, 18.00);
      assert.equal(formatted.durationMinutes, 150);
      assert.equal(formatted.billableHours, 3);
    });
  });
});
