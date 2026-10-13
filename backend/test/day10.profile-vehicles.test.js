import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateUpdateProfile } from '../src/modules/users/users.validation.js';
import {
  validateCreateVehicle,
  validateUpdateVehicle,
  ALLOWED_VEHICLE_TYPES,
} from '../src/modules/vehicles/vehicles.validation.js';
import { formatVehicle } from '../src/modules/vehicles/vehicles.service.js';

describe('Day 10: Customer Profile & Vehicles Validation and Logic', () => {

  describe('User Profile Update Validation', () => {
    it('1. Rejects attempt to tamper with role via profile update (403)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          fullName: 'Hacker User',
          role: 'ADMIN',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (payload) => { bodyData = payload; },
          };
        },
      };
      const next = () => { assert.fail('next() should not be called'); };

      validateUpdateProfile(req, res, next);
      assert.equal(statusCode, 403);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /role/i);
    });

    it('2. Rejects attempt to change email via profile update (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          fullName: 'Valid Name',
          email: 'newemail@example.com',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (payload) => { bodyData = payload; },
          };
        },
      };
      const next = () => { assert.fail('next() should not be called'); };

      validateUpdateProfile(req, res, next);
      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /email/i);
    });

    it('3. Rejects invalid full name length (400)', () => {
      let statusCode = null;
      const req = { body: { fullName: 'A' } };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };
      validateUpdateProfile(req, res, () => {});
      assert.equal(statusCode, 400);
    });

    it('4. Rejects invalid phone number format (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = { body: { phone: '123' } }; // too short
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };
      validateUpdateProfile(req, res, () => {});
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /phone/i);
    });

    it('5. Successfully normalizes valid profile update fields', () => {
      let nextCalled = false;
      const req = {
        body: {
          fullName: '  Shahariar Fahim  ',
          phone: '+880 1712-345678',
        },
      };
      const res = {};
      const next = () => { nextCalled = true; };

      validateUpdateProfile(req, res, next);
      assert.equal(nextCalled, true);
      assert.equal(req.body.fullName, 'Shahariar Fahim');
      assert.equal(req.body.phone, '+880 1712-345678');
    });
  });

  describe('Vehicle Creation & Update Validation', () => {
    it('6. Rejects missing or invalid license plate number (400)', () => {
      let statusCode = null;
      const req = {
        body: {
          plateNumber: '',
          vehicleType: 'STANDARD_CAR',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };
      validateCreateVehicle(req, res, () => {});
      assert.equal(statusCode, 400);
    });

    it('7. Rejects invalid vehicle type (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          plateNumber: 'DHK-METRO-GA-1122',
          vehicleType: 'AIRPLANE',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };
      validateCreateVehicle(req, res, () => {});
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /invalid vehicle type/i);
    });

    it('8. Accepts all valid vehicle types and normalizes plate to uppercase', () => {
      for (const vType of ALLOWED_VEHICLE_TYPES) {
        let nextCalled = false;
        const req = {
          body: {
            plateNumber: 'dhk-metro-ga-1122',
            vehicleType: vType.toLowerCase(),
            makeModel: '  Toyota Axio  ',
          },
        };
        validateCreateVehicle(req, {}, () => { nextCalled = true; });
        assert.equal(nextCalled, true);
        assert.equal(req.body.plateNumber, 'DHK-METRO-GA-1122');
        assert.equal(req.body.vehicleType, vType);
        assert.equal(req.body.makeModel, 'Toyota Axio');
      }
    });

    it('9. validateUpdateVehicle rejects empty payload with 400', () => {
      let statusCode = null;
      const req = { body: {} };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };
      validateUpdateVehicle(req, res, () => {});
      assert.equal(statusCode, 400);
    });

    it('10. validateUpdateVehicle normalizes provided plate to uppercase', () => {
      let nextCalled = false;
      const req = {
        body: {
          plateNumber: 'dhk-metro-ha-9988',
        },
      };
      validateUpdateVehicle(req, {}, () => { nextCalled = true; });
      assert.equal(nextCalled, true);
      assert.equal(req.body.plateNumber, 'DHK-METRO-HA-9988');
    });
  });

  describe('Vehicle Data Transformation & Utilities', () => {
    it('11. formatVehicle transforms database snake_case columns to clean camelCase', () => {
      const dbRow = {
        id: 7,
        user_id: 42,
        plate_number: 'DHK-METRO-GA-1234',
        vehicle_type: 'SUV',
        make_model: 'Honda CR-V',
        created_at: '2026-10-13T10:00:00.000Z',
        updated_at: '2026-10-13T10:00:00.000Z',
      };

      const formatted = formatVehicle(dbRow);
      assert.equal(formatted.id, 7);
      assert.equal(formatted.userId, 42);
      assert.equal(formatted.plateNumber, 'DHK-METRO-GA-1234');
      assert.equal(formatted.vehicleType, 'SUV');
      assert.equal(formatted.makeModel, 'Honda CR-V');
      assert.equal(formatted.user_id, undefined);
      assert.equal(formatted.plate_number, undefined);
      assert.equal(formatted.vehicle_type, undefined);
    });
  });
});
