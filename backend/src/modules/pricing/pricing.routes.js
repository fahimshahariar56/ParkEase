import { Router } from 'express';
import * as pricingController from './pricing.controller.js';
import { validateCreatePricingRule } from './pricing.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorizeRole.js';

export const pricingRouter = Router();

// ─── Public read routes ───────────────────────────────────────────────────────
// Customers and guests can view rates to preview costs before reserving.

// Get effective rate per vehicle type (summary view)
pricingRouter.get('/effective', pricingController.getEffectiveRates);

// List all pricing rules (full history)
pricingRouter.get('/', pricingController.getPricingRules);

// Get single pricing rule by ID
pricingRouter.get('/:id(\\d+)', pricingController.getPricingRuleById);

// ─── Admin-only write routes ──────────────────────────────────────────────────

// Create a new pricing rule (deactivates previous active rule for same type)
pricingRouter.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN'),
  validateCreatePricingRule,
  pricingController.createPricingRule
);

// Deactivate a specific pricing rule
pricingRouter.patch(
  '/:id(\\d+)/deactivate',
  authenticate,
  authorizeRoles('ADMIN'),
  pricingController.deactivatePricingRule
);
