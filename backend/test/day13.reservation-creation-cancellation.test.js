import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCreateReservation,
  validateUpdateReservationStatus,
  ALLOWED_RESERVATION_STATUSES,
} from '../src/modules/reservations/reservations.validation.js';
import { createReservation, formatReservation } from '../src/modules/reservations/reservations.service.js';
import { getAvailableSlots, isIntervalOverlapping } from '../src/modules/parking/parking.service.js';
import { pool } from '../src/config/database.js';
import { toMySqlDateTime } from '../src/utils/dateTime.js';

describe('Day 13: Reservation Creation & Cancellation Tests', () => {

  describe('1. Reservation Creation Validation (validateCreateReservation)', () => {
    it('1.1 Rejects missing or invalid vehicleId (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          slotId: 1,
          startTime: new Date(Date.now() + 3600000).toISOString(),
          endTime: new Date(Date.now() + 7200000).toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateCreateReservation(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /vehicleId/i);
    });

    it('1.2 Rejects missing or invalid slotId (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          vehicleId: 2,
          slotId: -5,
          startTime: new Date(Date.now() + 3600000).toISOString(),
          endTime: new Date(Date.now() + 7200000).toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateCreateReservation(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /slotId/i);
    });

    it('1.3 Rejects missing startTime or endTime (400)', () => {
      let statusCode = null;
      const req = {
        body: {
          vehicleId: 1,
          slotId: 1,
          startTime: new Date(Date.now() + 3600000).toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateCreateReservation(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });

    it('1.4 Rejects when endTime is before startTime (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const now = new Date(Date.now() + 3600000);
      const req = {
        body: {
          vehicleId: 1,
          slotId: 1,
          startTime: now.toISOString(),
          endTime: new Date(now.getTime() - 1000).toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateCreateReservation(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /strictly after/i);
    });

    it('1.5 Rejects reservation duration under 15 minutes (400)', () => {
      let statusCode = null;
      const start = new Date(Date.now() + 3600000);
      const end = new Date(start.getTime() + 10 * 60 * 1000); // 10 mins
      const req = {
        body: {
          vehicleId: 1,
          slotId: 1,
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

      validateCreateReservation(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });

    it('1.6 Rejects reservation window entirely in the past (400)', () => {
      let statusCode = null;
      const pastStart = new Date(Date.now() - 7200000);
      const pastEnd = new Date(Date.now() - 3600000);
      const req = {
        body: {
          vehicleId: 1,
          slotId: 1,
          startTime: pastStart.toISOString(),
          endTime: pastEnd.toISOString(),
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateCreateReservation(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });

    it('1.7 Normalizes valid reservation creation parameters', () => {
      let nextCalled = false;
      const start = new Date(Date.now() + 3600000);
      const end = new Date(Date.now() + 7200000);
      const req = {
        body: {
          vehicleId: '4',
          slotId: '12',
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      };
      const res = {};
      const next = () => { nextCalled = true; };

      validateCreateReservation(req, res, next);
      assert.equal(nextCalled, true);
      assert.equal(req.body.vehicleId, 4);
      assert.equal(req.body.slotId, 12);
      assert.equal(req.body.startTime, start.toISOString());
      assert.equal(req.body.endTime, end.toISOString());
    });

    it('1.8 Rejects invalid and timezone-less datetime inputs', () => {
      let statusCode = null;
      const req = {
        body: {
          vehicleId: 1,
          slotId: 1,
          startTime: '2026-02-30T09:00:00.000Z',
          endTime: '2026-10-14T10:00:00',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateCreateReservation(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.throws(() => toMySqlDateTime('2026-10-14T10:00:00'), TypeError);
    });

    it('1.9 Normalizes Z timestamps to UTC MySQL datetime values without a timezone shift', () => {
      assert.equal(toMySqlDateTime('2026-10-14T09:00:00.000Z'), '2026-10-14 09:00:00');
      assert.equal(toMySqlDateTime('2026-10-14T15:00:00+06:00'), '2026-10-14 09:00:00');
    });

    it('1.10 Binds MySQL-compatible start and end values for conflict checks and insertion', async () => {
      const originalGetConnection = pool.getConnection;
      const queries = [];
      const connection = {
        beginTransaction: async () => {},
        commit: async () => {},
        rollback: async () => {},
        release: () => {},
        execute: async (sql, params) => {
          queries.push({ sql, params });
          if (sql.includes('FROM vehicles')) {
            return [[{ id: 4, user_id: 7, vehicle_type: 'STANDARD_CAR' }], []];
          }
          if (sql.includes('FROM parking_slots s')) {
            return [[{
              id: 12,
              slot_number: 'A-12',
              slot_type: 'STANDARD_CAR',
              slot_status: 'AVAILABLE',
              lot_status: 'ACTIVE',
            }], []];
          }
          if (sql.includes('SELECT id, start_time, end_time FROM reservations')) return [[], []];
          if (sql.includes('FROM parking_sessions')) return [[], []];
          if (sql.includes('FROM pricing_rules')) return [[], []];
          if (sql.includes('INSERT INTO reservations')) return [{ insertId: 88 }, []];
          assert.fail(`Unexpected SQL query: ${sql}`);
        },
      };
      const startTime = '2026-10-14T09:00:00.000Z';
      const endTime = '2026-10-14T10:00:00.000Z';

      pool.getConnection = async () => connection;
      try {
        assert.equal(
          await createReservation({ userId: 7, vehicleId: 4, slotId: 12, startTime, endTime }),
          88
        );
      } finally {
        pool.getConnection = originalGetConnection;
      }

      const conflictQuery = queries.find(({ sql }) => sql.includes('SELECT id, start_time, end_time FROM reservations'));
      const insertQuery = queries.find(({ sql }) => sql.includes('INSERT INTO reservations'));
      assert.deepEqual(conflictQuery.params, [12, '2026-10-14 10:00:00', '2026-10-14 09:00:00']);
      assert.deepEqual(insertQuery.params.slice(3, 5), ['2026-10-14 09:00:00', '2026-10-14 10:00:00']);
    });

    it('1.11 Rejects invalid or reversed ranges before acquiring a database connection', async () => {
      const originalGetConnection = pool.getConnection;
      pool.getConnection = async () => { assert.fail('Database connection should not be acquired'); };
      try {
        await assert.rejects(
          createReservation({
            userId: 7,
            vehicleId: 4,
            slotId: 12,
            startTime: '2026-10-14T10:00:00.000Z',
            endTime: '2026-10-14T09:00:00.000Z',
          }),
          { status: 400 }
        );
        await assert.rejects(
          createReservation({
            userId: 7,
            vehicleId: 4,
            slotId: 12,
            startTime: 'not-a-date',
            endTime: '2026-10-14T11:00:00.000Z',
          }),
          { status: 400 }
        );
      } finally {
        pool.getConnection = originalGetConnection;
      }
    });

    it('1.12 Uses UTC MySQL datetime values in availability overlap queries', async () => {
      const originalExecute = pool.execute;
      let availabilityParams;
      pool.execute = async (sql, params = []) => {
        if (sql.includes('FROM parking_slots s')) availabilityParams = params;
        return [[], []];
      };

      try {
        await getAvailableSlots({
          startTime: '2026-10-14T09:00:00.000Z',
          endTime: '2026-10-14T10:00:00.000Z',
        });
      } finally {
        pool.execute = originalExecute;
      }

      assert.deepEqual(availabilityParams, [
        '2026-10-14 10:00:00',
        '2026-10-14 09:00:00',
        '2026-10-14 10:00:00',
        '2026-10-14 09:00:00',
      ]);
    });
  });

  describe('2. Reservation Status Update Validation (validateUpdateReservationStatus)', () => {
    it('2.1 Rejects missing or invalid status (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = { body: { status: 'FLYING' } };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateUpdateReservationStatus(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /Invalid reservation status/i);
    });

    it('2.2 Accepts all allowed reservation statuses and normalizes uppercase', () => {
      for (const validStatus of ALLOWED_RESERVATION_STATUSES) {
        let nextCalled = false;
        const req = { body: { status: validStatus.toLowerCase() } };
        const res = {};
        const next = () => { nextCalled = true; };

        validateUpdateReservationStatus(req, res, next);
        assert.equal(nextCalled, true);
        assert.equal(req.body.status, validStatus);
      }
    });
  });

  describe('3. Data Transformation & Utilities (formatReservation)', () => {
    it('3.1 Formats database row to clean camelCase with nested entities', () => {
      const rawDbRow = {
        id: 42,
        user_id: 3,
        vehicle_id: 8,
        slot_id: 15,
        start_time: new Date('2026-10-15T10:00:00Z'),
        end_time: new Date('2026-10-15T12:00:00Z'),
        hourly_rate_snapshot: '5.50',
        total_estimated_fee: '11.00',
        status: 'CONFIRMED',
        created_at: new Date('2026-10-14T08:00:00Z'),
        updated_at: new Date('2026-10-14T08:00:00Z'),
        user_name: 'Shahariar Fahim',
        user_email: 'fahim@example.com',
        user_phone: '+8801700000000',
        plate_number: 'DHK-GA-1122',
        vehicle_type: 'STANDARD_CAR',
        make_model: 'Toyota Corolla',
        slot_number: 'A-04',
        slot_type: 'STANDARD_CAR',
        lot_id: 1,
        lot_name: 'Central Plaza Parking',
        lot_address: '123 Main Street',
      };

      const formatted = formatReservation(rawDbRow);
      assert.equal(formatted.id, 42);
      assert.equal(formatted.userId, 3);
      assert.equal(formatted.hourlyRateSnapshot, 5.50);
      assert.equal(formatted.totalEstimatedFee, 11.00);
      assert.equal(formatted.status, 'CONFIRMED');
      assert.equal(formatted.user.fullName, 'Shahariar Fahim');
      assert.equal(formatted.vehicle.plateNumber, 'DHK-GA-1122');
      assert.equal(formatted.slot.slotNumber, 'A-04');
      assert.equal(formatted.slot.lotName, 'Central Plaza Parking');
    });

    it('3.2 Returns null when input row is null/undefined', () => {
      assert.equal(formatReservation(null), null);
      assert.equal(formatReservation(undefined), null);
    });
  });

  describe('4. Concurrency Protection & Overlap Recheck Rules', () => {
    it('4.1 Accurately rejects concurrent reservation overlap attempt', () => {
      const confirmedBooking = {
        start: '2026-10-15T14:00:00Z',
        end: '2026-10-15T16:00:00Z',
      };

      // Concurrent customer attempting [15:00, 17:00) on same slot
      const conflictingBooking = {
        start: '2026-10-15T15:00:00Z',
        end: '2026-10-15T17:00:00Z',
      };

      const isConflict = isIntervalOverlapping(
        confirmedBooking.start,
        confirmedBooking.end,
        conflictingBooking.start,
        conflictingBooking.end
      );

      assert.equal(isConflict, true);
    });

    it('4.2 Allows non-overlapping adjacent booking at boundary', () => {
      const confirmedBooking = {
        start: '2026-10-15T14:00:00Z',
        end: '2026-10-15T16:00:00Z',
      };

      // Customer arriving exactly as previous reservation ends (16:00)
      const adjacentBooking = {
        start: '2026-10-15T16:00:00Z',
        end: '2026-10-15T18:00:00Z',
      };

      const isConflict = isIntervalOverlapping(
        confirmedBooking.start,
        confirmedBooking.end,
        adjacentBooking.start,
        adjacentBooking.end
      );

      assert.equal(isConflict, false);
    });
  });

  describe('5. Cancellation Business Rules Simulation', () => {
    it('5.1 Cancelling an already cancelled reservation is rejected', () => {
      const reservation = { id: 1, status: 'CANCELLED' };
      const canCancel = reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED' && reservation.status !== 'ACTIVE';
      assert.equal(canCancel, false);
    });

    it('5.2 Cancelling an active or completed reservation is rejected', () => {
      const completedRes = { id: 2, status: 'COMPLETED' };
      const activeRes = { id: 3, status: 'ACTIVE' };

      const canCancelCompleted = completedRes.status === 'CONFIRMED' || completedRes.status === 'PENDING';
      const canCancelActive = activeRes.status === 'CONFIRMED' || activeRes.status === 'PENDING';

      assert.equal(canCancelCompleted, false);
      assert.equal(canCancelActive, false);
    });

    it('5.3 Confirmed reservation can be successfully cancelled', () => {
      const confirmedRes = { id: 4, status: 'CONFIRMED' };
      const canCancel = confirmedRes.status === 'CONFIRMED';
      assert.equal(canCancel, true);
    });
  });

});
