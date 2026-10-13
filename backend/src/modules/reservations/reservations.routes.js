import { Router } from 'express';
import * as reservationsController from './reservations.controller.js';
import {
  validateCreateReservation,
  validateUpdateReservationStatus,
} from './reservations.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorizeRole.js';

export const reservationsRouter = Router();

// All reservation endpoints require valid authentication
reservationsRouter.use(authenticate);

// List reservations (Customer sees own; Admin sees all)
reservationsRouter.get('/', reservationsController.getReservations);
reservationsRouter.get('/my', reservationsController.getReservations);

// Create reservation
reservationsRouter.post('/', validateCreateReservation, reservationsController.createReservation);

// Specific reservation details
reservationsRouter.get('/:id', reservationsController.getReservationById);

// Cancel reservation (Customer owner or Admin)
reservationsRouter.patch('/:id/cancel', reservationsController.cancelReservation);

// Admin status modification (Confirm, Cancel, Mark No-Show, Complete)
reservationsRouter.patch(
  '/:id/status',
  authorizeRoles('ADMIN'),
  validateUpdateReservationStatus,
  reservationsController.updateReservationStatus
);
