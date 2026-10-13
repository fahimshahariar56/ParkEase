import { Router } from 'express';
import * as sessionsController from './sessions.controller.js';
import {
  validateSessionEntry,
  validateSessionExit,
} from './sessions.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorizeRole.js';

export const sessionsRouter = Router();

// All session endpoints require authentication
sessionsRouter.use(authenticate);

// List sessions (Customer/Admin)
sessionsRouter.get('/', sessionsController.getSessions);
sessionsRouter.get('/:id', sessionsController.getSessionById);

// Admin-only session write actions
sessionsRouter.post(
  '/entry',
  authorizeRoles('ADMIN'),
  validateSessionEntry,
  sessionsController.recordEntry
);

sessionsRouter.post(
  '/',
  authorizeRoles('ADMIN'),
  validateSessionEntry,
  sessionsController.recordEntry
);

sessionsRouter.patch(
  '/:id/exit',
  authorizeRoles('ADMIN'),
  validateSessionExit,
  sessionsController.recordExit
);

sessionsRouter.post(
  '/:id/exit',
  authorizeRoles('ADMIN'),
  validateSessionExit,
  sessionsController.recordExit
);
