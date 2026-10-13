import * as pricingService from './pricing.service.js';

/**
 * GET /api/v1/pricing-rules
 * List pricing rules. Optional filters: ?vehicleType=&isActive=
 * Public endpoint — customers and guests can see rates.
 */
export async function getPricingRules(req, res, next) {
  try {
    const rules = await pricingService.getPricingRules(req.query);
    res.status(200).json({
      success: true,
      count: rules.length,
      data: { rules },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/pricing-rules/effective
 * Get the currently-effective hourly rate for each vehicle type.
 * Public endpoint — used by the reservation flow to preview pricing.
 */
export async function getEffectiveRates(req, res, next) {
  try {
    const rates = await pricingService.getEffectiveRates();
    res.status(200).json({
      success: true,
      data: { rates },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/pricing-rules/:id
 * Get a single pricing rule by ID. Public.
 */
export async function getPricingRuleById(req, res, next) {
  try {
    const rule = await pricingService.getPricingRuleById(req.params.id);
    res.status(200).json({
      success: true,
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/pricing-rules
 * Create a new pricing rule. Admin only.
 * Automatically deactivates the previous active rule for the same vehicle type.
 */
export async function createPricingRule(req, res, next) {
  try {
    const { vehicleType, hourlyRate } = req.body;
    const newId = await pricingService.createPricingRule({ vehicleType, hourlyRate });
    const rule = await pricingService.getPricingRuleById(newId);

    res.status(201).json({
      success: true,
      message: `New pricing rule created for ${vehicleType} at $${hourlyRate.toFixed(2)}/hr. Previous active rule deactivated.`,
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/pricing-rules/:id/deactivate
 * Deactivate a specific pricing rule. Admin only.
 */
export async function deactivatePricingRule(req, res, next) {
  try {
    const rule = await pricingService.deactivatePricingRule(req.params.id);
    res.status(200).json({
      success: true,
      message: `Pricing rule #${req.params.id} deactivated.`,
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
}
