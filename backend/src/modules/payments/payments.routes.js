import { Router } from 'express';
import * as paymentsController from './payments.controller.js';
import { validateCreatePayment } from './payments.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorizeRole.js';

export const paymentsRouter = Router();

// All payment routes require authentication + admin role
paymentsRouter.use(authenticate);
paymentsRouter.use(authorizeRoles('ADMIN'));

// List all demo payments
paymentsRouter.get('/', paymentsController.getPayments);

// Get payment by ID
paymentsRouter.get('/:id(\\d+)', paymentsController.getPaymentById);

// Get payment for a specific session
paymentsRouter.get('/session/:sessionId', paymentsController.getPaymentBySession);

// Create a simulated demo payment (admin initiates on behalf of customer)
paymentsRouter.post('/', validateCreatePayment, paymentsController.createPayment);
