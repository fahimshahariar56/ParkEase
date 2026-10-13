/**
 * Pricing Rules Input Validation — Day 22
 */

import { VEHICLE_TYPES } from './pricing.service.js';

/**
 * Validate POST /pricing-rules — create a new pricing rule.
 */
export function validateCreatePricingRule(req, res, next) {
  const { vehicleType, hourlyRate } = req.body;

  if (!vehicleType || !VEHICLE_TYPES.includes(String(vehicleType).toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: `vehicleType must be one of: ${VEHICLE_TYPES.join(', ')}.`,
    });
  }

  const rate = Number(hourlyRate);
  if (hourlyRate === undefined || hourlyRate === null || hourlyRate === '' || isNaN(rate) || rate <= 0) {
    return res.status(400).json({
      success: false,
      message: 'hourlyRate must be a positive number.',
    });
  }

  if (rate > 9999.99) {
    return res.status(400).json({
      success: false,
      message: 'hourlyRate cannot exceed 9999.99.',
    });
  }

  req.body.vehicleType = vehicleType.toUpperCase();
  req.body.hourlyRate = parseFloat(rate.toFixed(2));
  next();
}
