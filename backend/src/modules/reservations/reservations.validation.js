/**
 * Reservations Input Validation & Business Rules
 */
import { parseIsoDateTime } from '../../utils/dateTime.js';

export const ALLOWED_RESERVATION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

/**
 * Validate Reservation Creation Request
 */
export function validateCreateReservation(req, res, next) {
  const { vehicleId, slotId, startTime, endTime } = req.body;

  const parsedVehicleId = Number(vehicleId);
  if (!vehicleId || !Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid vehicleId is required (positive integer).',
    });
  }

  const parsedSlotId = Number(slotId);
  if (!slotId || !Number.isInteger(parsedSlotId) || parsedSlotId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid slotId is required (positive integer).',
    });
  }

  if (!startTime) {
    return res.status(400).json({
      success: false,
      message: 'startTime is required (ISO 8601 timestamp string).',
    });
  }

  if (!endTime) {
    return res.status(400).json({
      success: false,
      message: 'endTime is required (ISO 8601 timestamp string).',
    });
  }

  const start = parseIsoDateTime(startTime);
  const end = parseIsoDateTime(endTime);

  if (!start) {
    return res.status(400).json({
      success: false,
      message: 'Invalid startTime format. Provide a valid ISO timestamp (e.g. 2026-10-15T10:00:00Z).',
    });
  }

  if (!end) {
    return res.status(400).json({
      success: false,
      message: 'Invalid endTime format. Provide a valid ISO timestamp (e.g. 2026-10-15T12:00:00Z).',
    });
  }

  if (start.getTime() >= end.getTime()) {
    return res.status(400).json({
      success: false,
      message: 'endTime must be strictly after startTime.',
    });
  }

  // Minimum duration: 15 minutes
  const durationMs = end.getTime() - start.getTime();
  if (durationMs < 15 * 60 * 1000) {
    return res.status(400).json({
      success: false,
      message: 'Reservation interval must be at least 15 minutes.',
    });
  }

  // Maximum duration: 7 days
  if (durationMs > 7 * 24 * 60 * 60 * 1000) {
    return res.status(400).json({
      success: false,
      message: 'Reservation interval cannot exceed 7 days.',
    });
  }

  // Prevent intervals completely in the past (allowing 10 min grace period for clock skew)
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  if (end.getTime() < tenMinutesAgo) {
    return res.status(400).json({
      success: false,
      message: 'Reservation time window cannot be entirely in the past.',
    });
  }

  req.body.vehicleId = parsedVehicleId;
  req.body.slotId = parsedSlotId;
  req.body.startTime = start.toISOString();
  req.body.endTime = end.toISOString();
  next();
}

/**
 * Validate Admin Reservation Status Update
 */
export function validateUpdateReservationStatus(req, res, next) {
  const { status } = req.body;

  if (!status || typeof status !== 'string') {
    return res.status(400).json({
      success: false,
      message: `Status is required. Allowed: ${ALLOWED_RESERVATION_STATUSES.join(', ')}.`,
    });
  }

  const normalizedStatus = status.trim().toUpperCase();
  if (!ALLOWED_RESERVATION_STATUSES.includes(normalizedStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid reservation status '${status}'. Allowed: ${ALLOWED_RESERVATION_STATUSES.join(', ')}.`,
    });
  }

  req.body.status = normalizedStatus;
  next();
}
