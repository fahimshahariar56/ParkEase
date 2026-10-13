import { Router } from 'express';
import * as usersController from './users.controller.js';
import { validateUpdateProfile } from './users.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { enforceUserOwnership } from '../../middleware/authorizeRole.js';

export const usersRouter = Router();

// All user routes require authentication
usersRouter.use(authenticate);

// Current user profile
usersRouter.get('/me', usersController.getMyProfile);
usersRouter.patch('/me', validateUpdateProfile, usersController.updateMyProfile);

// Specific user profile (accessible by owner or admin)
usersRouter.get('/:id', enforceUserOwnership('id'), usersController.getUserById);
