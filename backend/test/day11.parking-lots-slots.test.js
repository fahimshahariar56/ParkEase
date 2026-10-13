import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCreateLot,
  validateUpdateLot,
  validateCreateSlot,
  validateUpdateSlot,
  ALLOWED_LOT_STATUSES,
  ALLOWED_SLOT_TYPES,
  ALLOWED_SLOT_STATUSES,
} from '../src/modules/parking/parking.validation.js';
import { formatLot, formatSlot } from '../src/modules/parking/parking.service.js';
import { authorizeRoles } from '../src/middleware/authorizeRole.js';

describe('Day 11: Parking Lots and Slots Inventory API Tests', () => {

  describe('Parking Lot Input Validation', () => {
    it('1. Rejects lot creation with missing or too short name (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          name: 'A',
          address: '123 Main Street',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateCreateLot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /name/i);
    });

    it('2. Rejects lot creation with missing or too short address (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          name: 'Central Plaza Garage',
          address: 'No',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateCreateLot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /address/i);
    });

    it('3. Rejects invalid lot status (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          name: 'Central Plaza Garage',
          address: '123 Main Street, Sector 4',
          status: 'DESTROYED',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateCreateLot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /status/i);
    });

    it('4. Rejects negative total capacity (400)', () => {
      let statusCode = null;
      const req = {
        body: {
          name: 'Central Plaza Garage',
          address: '123 Main Street',
          totalCapacity: -5,
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateCreateLot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });

    it('5. Successfully normalizes valid lot creation fields', () => {
      let nextCalled = false;
      const req = {
        body: {
          name: '  Downtown Tech Hub Garage  ',
          address: '  Plot 14, Gulshan Avenue, Dhaka  ',
          status: 'active',
          totalCapacity: 50,
        },
      };
      const res = {};
      const next = () => { nextCalled = true; };

      validateCreateLot(req, res, next);
      assert.equal(nextCalled, true);
      assert.equal(req.body.name, 'Downtown Tech Hub Garage');
      assert.equal(req.body.address, 'Plot 14, Gulshan Avenue, Dhaka');
      assert.equal(req.body.status, 'ACTIVE');
      assert.equal(req.body.totalCapacity, 50);
    });

    it('6. validateUpdateLot rejects empty body with 400', () => {
      let statusCode = null;
      const req = { body: {} };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateUpdateLot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });
  });

  describe('Parking Slot Input Validation', () => {
    it('7. Rejects slot creation with invalid or missing lotId (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          lotId: 'invalid-id',
          slotNumber: 'A-01',
          slotType: 'STANDARD_CAR',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateCreateSlot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /lotId/i);
    });

    it('8. Rejects slot creation with missing slotNumber (400)', () => {
      let statusCode = null;
      const req = {
        body: {
          lotId: 1,
          slotNumber: '',
          slotType: 'STANDARD_CAR',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateCreateSlot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });

    it('9. Rejects invalid slotType (400)', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        body: {
          lotId: 1,
          slotNumber: 'A-01',
          slotType: 'HELICOPTER',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      validateCreateSlot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
      assert.match(bodyData.message, /slot type/i);
    });

    it('10. Accepts valid slot creation and normalizes slotNumber uppercase', () => {
      let nextCalled = false;
      const req = {
        body: {
          lotId: 2,
          slotNumber: '  b-04  ',
          slotType: 'suv',
          status: 'available',
        },
      };
      const res = {};
      const next = () => { nextCalled = true; };

      validateCreateSlot(req, res, next);
      assert.equal(nextCalled, true);
      assert.equal(req.body.lotId, 2);
      assert.equal(req.body.slotNumber, 'B-04');
      assert.equal(req.body.slotType, 'SUV');
      assert.equal(req.body.status, 'AVAILABLE');
    });

    it('11. validateUpdateSlot rejects empty payload with 400', () => {
      let statusCode = null;
      const req = { body: {} };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        },
      };

      validateUpdateSlot(req, res, () => { assert.fail('next() should not be called'); });
      assert.equal(statusCode, 400);
    });
  });

  describe('Parking Data Transformation & Utilities', () => {
    it('12. formatLot correctly transforms snake_case columns and calculates counts', () => {
      const rawDbRow = {
        id: 1,
        name: 'Airport Terminal 3 Parking',
        address: 'Airport Road, Kurmitola',
        total_capacity: '120',
        status: 'ACTIVE',
        slot_count: '85',
        available_slots: '42',
        created_at: new Date('2026-01-01T00:00:00Z'),
        updated_at: new Date('2026-01-02T00:00:00Z'),
      };

      const formatted = formatLot(rawDbRow);
      assert.equal(formatted.id, 1);
      assert.equal(formatted.name, 'Airport Terminal 3 Parking');
      assert.equal(formatted.address, 'Airport Road, Kurmitola');
      assert.equal(formatted.totalCapacity, 120);
      assert.equal(formatted.status, 'ACTIVE');
      assert.equal(formatted.slotCount, 85);
      assert.equal(formatted.availableSlots, 42);
      assert.equal(formatted.total_capacity, undefined);
    });

    it('13. formatSlot transforms raw database slot and includes lotName', () => {
      const rawDbSlot = {
        id: 101,
        lot_id: 1,
        lot_name: 'Airport Terminal 3 Parking',
        slot_number: 'VIP-01',
        slot_type: 'SUV',
        status: 'AVAILABLE',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const formatted = formatSlot(rawDbSlot);
      assert.equal(formatted.id, 101);
      assert.equal(formatted.lotId, 1);
      assert.equal(formatted.lotName, 'Airport Terminal 3 Parking');
      assert.equal(formatted.slotNumber, 'VIP-01');
      assert.equal(formatted.slotType, 'SUV');
      assert.equal(formatted.status, 'AVAILABLE');
    });
  });

  describe('Role-Based Access Control for Parking Inventory Management', () => {
    it('14. Admin role is required for lot and slot modifications; rejects Customer with 403', () => {
      let statusCode = null;
      let bodyData = null;
      const req = {
        user: { id: 5, role: 'CUSTOMER', email: 'customer@parkease.com' },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (p) => { bodyData = p; } };
        },
      };

      const adminGuard = authorizeRoles('ADMIN');
      adminGuard(req, res, () => { assert.fail('next() should not be called'); });

      assert.equal(statusCode, 403);
      assert.equal(bodyData.success, false);
      assert.match(bodyData.message, /ADMIN/i);
    });

    it('15. Admin guard permits authenticated admin user', () => {
      let nextCalled = false;
      const req = {
        user: { id: 1, role: 'ADMIN', email: 'admin@parkease.com' },
      };
      const res = {};
      const next = () => { nextCalled = true; };

      const adminGuard = authorizeRoles('ADMIN');
      adminGuard(req, res, next);

      assert.equal(nextCalled, true);
    });
  });

});
