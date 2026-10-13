import { Router } from 'express';
import * as parkingController from './parking.controller.js';
import {
  validateCreateLot,
  validateUpdateLot,
  validateCreateSlot,
  validateUpdateSlot,
} from './parking.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorizeRole.js';

export const parkingRouter = Router();

// ─── Parking Lots Endpoints ───────────────────────────────────────────────────

// Public / Customer / Admin read endpoints
parkingRouter.get('/lots', parkingController.getAllLots);
parkingRouter.get('/lots/:id', parkingController.getLotById);

// Nested helper: get all slots in a specific lot
parkingRouter.get('/lots/:lotId/slots', (req, res, next) => {
  req.query.lotId = req.params.lotId;
  return parkingController.getAllSlots(req, res, next);
});

// Admin-only Lot management (CRUD)
parkingRouter.post(
  '/lots',
  authenticate,
  authorizeRoles('ADMIN'),
  validateCreateLot,
  parkingController.createLot
);

parkingRouter.patch(
  '/lots/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validateUpdateLot,
  parkingController.updateLot
);

parkingRouter.delete(
  '/lots/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  parkingController.deleteLot
);

// Nested helper: create slot directly under a lot
parkingRouter.post(
  '/lots/:lotId/slots',
  authenticate,
  authorizeRoles('ADMIN'),
  (req, res, next) => {
    if (!req.body.lotId) {
      req.body.lotId = parseInt(req.params.lotId, 10);
    }
    next();
  },
  validateCreateSlot,
  parkingController.createSlot
);

// ─── Parking Slots Endpoints ──────────────────────────────────────────────────

// Read endpoints
parkingRouter.get('/slots', parkingController.getAllSlots);
parkingRouter.get('/slots/:id', parkingController.getSlotById);

// Admin-only Slot management (CRUD)
parkingRouter.post(
  '/slots',
  authenticate,
  authorizeRoles('ADMIN'),
  validateCreateSlot,
  parkingController.createSlot
);

parkingRouter.patch(
  '/slots/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validateUpdateSlot,
  parkingController.updateSlot
);

parkingRouter.delete(
  '/slots/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  parkingController.deleteSlot
);
