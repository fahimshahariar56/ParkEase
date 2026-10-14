/**
 * Parking Lots & Slots Input Validation
 */
import { parseIsoDateTime } from '../../utils/dateTime.js';

export const ALLOWED_LOT_STATUSES = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export const ALLOWED_SLOT_TYPES = [
  'MOTORCYCLE',
  'STANDARD_CAR',
  'SUV',
  'VAN',
  'TRUCK',
];

export const ALLOWED_SLOT_STATUSES = ['AVAILABLE', 'MAINTENANCE', 'INACTIVE'];

const SLOT_NUMBER_REGEX = /^[A-Za-z0-9\s-]{1,20}$/;

/**
 * Validate Parking Lot Creation
 */
export function validateCreateLot(req, res, next) {
  const { name, address, status, totalCapacity } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Lot name is required (minimum 2 characters).',
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Lot name cannot exceed 100 characters.',
    });
  }

  if (!address || typeof address !== 'string' || address.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Lot address/location is required (minimum 3 characters).',
    });
  }

  if (address.trim().length > 255) {
    return res.status(400).json({
      success: false,
      message: 'Lot address cannot exceed 255 characters.',
    });
  }

  let normalizedStatus = 'ACTIVE';
  if (status !== undefined) {
    if (typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Status must be a string. Allowed: ${ALLOWED_LOT_STATUSES.join(', ')}.`,
      });
    }
    normalizedStatus = status.trim().toUpperCase();
    if (!ALLOWED_LOT_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid lot status '${status}'. Allowed: ${ALLOWED_LOT_STATUSES.join(', ')}.`,
      });
    }
  }

  let parsedCapacity = 0;
  if (totalCapacity !== undefined) {
    const cap = Number(totalCapacity);
    if (!Number.isInteger(cap) || cap < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total capacity must be a non-negative integer.',
      });
    }
    parsedCapacity = cap;
  }

  req.body.name = name.trim();
  req.body.address = address.trim();
  req.body.status = normalizedStatus;
  req.body.totalCapacity = parsedCapacity;
  next();
}

/**
 * Validate Parking Lot Update
 */
export function validateUpdateLot(req, res, next) {
  const { name, address, status, totalCapacity } = req.body;

  if (name === undefined && address === undefined && status === undefined && totalCapacity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (name, address, status, or totalCapacity) must be provided to update lot.',
    });
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Lot name must be at least 2 characters.',
      });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Lot name cannot exceed 100 characters.',
      });
    }
    req.body.name = name.trim();
  }

  if (address !== undefined) {
    if (typeof address !== 'string' || address.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Lot address must be at least 3 characters.',
      });
    }
    if (address.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Lot address cannot exceed 255 characters.',
      });
    }
    req.body.address = address.trim();
  }

  if (status !== undefined) {
    if (typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Status must be a string. Allowed: ${ALLOWED_LOT_STATUSES.join(', ')}.`,
      });
    }
    const normalized = status.trim().toUpperCase();
    if (!ALLOWED_LOT_STATUSES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: `Invalid lot status '${status}'. Allowed: ${ALLOWED_LOT_STATUSES.join(', ')}.`,
      });
    }
    req.body.status = normalized;
  }

  if (totalCapacity !== undefined) {
    const cap = Number(totalCapacity);
    if (!Number.isInteger(cap) || cap < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total capacity must be a non-negative integer.',
      });
    }
    req.body.totalCapacity = cap;
  }

  next();
}

/**
 * Validate Parking Slot Creation
 */
export function validateCreateSlot(req, res, next) {
  const { lotId, slotNumber, slotType, status } = req.body;

  const parsedLotId = Number(lotId);
  if (!lotId || !Number.isInteger(parsedLotId) || parsedLotId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid lotId is required (positive integer).',
    });
  }

  if (!slotNumber || typeof slotNumber !== 'string' || slotNumber.trim().length < 1) {
    return res.status(400).json({
      success: false,
      message: 'Slot number is required.',
    });
  }

  const normalizedSlotNumber = slotNumber.trim().toUpperCase();
  if (!SLOT_NUMBER_REGEX.test(normalizedSlotNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Slot number must contain alphanumeric characters, spaces, or hyphens (max 20 characters).',
    });
  }

  if (!slotType || typeof slotType !== 'string') {
    return res.status(400).json({
      success: false,
      message: `Slot type is required. Allowed types: ${ALLOWED_SLOT_TYPES.join(', ')}.`,
    });
  }

  const normalizedSlotType = slotType.trim().toUpperCase();
  if (!ALLOWED_SLOT_TYPES.includes(normalizedSlotType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid slot type '${slotType}'. Allowed: ${ALLOWED_SLOT_TYPES.join(', ')}.`,
    });
  }

  let normalizedStatus = 'AVAILABLE';
  if (status !== undefined) {
    if (typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Status must be a string. Allowed: ${ALLOWED_SLOT_STATUSES.join(', ')}.`,
      });
    }
    normalizedStatus = status.trim().toUpperCase();
    if (!ALLOWED_SLOT_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid slot status '${status}'. Allowed: ${ALLOWED_SLOT_STATUSES.join(', ')}.`,
      });
    }
  }

  req.body.lotId = parsedLotId;
  req.body.slotNumber = normalizedSlotNumber;
  req.body.slotType = normalizedSlotType;
  req.body.status = normalizedStatus;
  next();
}

/**
 * Validate Parking Slot Update
 */
export function validateUpdateSlot(req, res, next) {
  const { lotId, slotNumber, slotType, status } = req.body;

  if (lotId === undefined && slotNumber === undefined && slotType === undefined && status === undefined) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (lotId, slotNumber, slotType, or status) must be provided to update slot.',
    });
  }

  if (lotId !== undefined) {
    const parsedLotId = Number(lotId);
    if (!Number.isInteger(parsedLotId) || parsedLotId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid lotId is required (positive integer).',
      });
    }
    req.body.lotId = parsedLotId;
  }

  if (slotNumber !== undefined) {
    if (typeof slotNumber !== 'string' || slotNumber.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Slot number cannot be empty.',
      });
    }
    const normalized = slotNumber.trim().toUpperCase();
    if (!SLOT_NUMBER_REGEX.test(normalized)) {
      return res.status(400).json({
        success: false,
        message: 'Slot number must contain alphanumeric characters, spaces, or hyphens (max 20 characters).',
      });
    }
    req.body.slotNumber = normalized;
  }

  if (slotType !== undefined) {
    if (typeof slotType !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Allowed slot types: ${ALLOWED_SLOT_TYPES.join(', ')}.`,
      });
    }
    const normalized = slotType.trim().toUpperCase();
    if (!ALLOWED_SLOT_TYPES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: `Invalid slot type '${slotType}'. Allowed: ${ALLOWED_SLOT_TYPES.join(', ')}.`,
      });
    }
    req.body.slotType = normalized;
  }

  if (status !== undefined) {
    if (typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Allowed slot statuses: ${ALLOWED_SLOT_STATUSES.join(', ')}.`,
      });
    }
    const normalized = status.trim().toUpperCase();
    if (!ALLOWED_SLOT_STATUSES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: `Invalid slot status '${status}'. Allowed: ${ALLOWED_SLOT_STATUSES.join(', ')}.`,
      });
    }
    req.body.status = normalized;
  }

  next();
}

/**
 * Validate Parking Availability Query Parameters
 * Supports GET /slots/availability?lotId=&startTime=&endTime=&vehicleType=&slotType=
 */
export function validateAvailabilityQuery(req, res, next) {
  const { startTime, endTime, lotId, slotType, vehicleType } = req.query;

  if (!startTime) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter startTime is required (ISO 8601 string).',
    });
  }

  if (!endTime) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter endTime is required (ISO 8601 string).',
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
      message: 'Requested reservation interval must be at least 15 minutes.',
    });
  }

  // Maximum duration: 7 days
  if (durationMs > 7 * 24 * 60 * 60 * 1000) {
    return res.status(400).json({
      success: false,
      message: 'Requested reservation interval cannot exceed 7 days.',
    });
  }

  // Prevent intervals completely in the past (allowing 10 min grace period for clock skew)
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  if (end.getTime() < tenMinutesAgo) {
    return res.status(400).json({
      success: false,
      message: 'Requested reservation interval cannot be entirely in the past.',
    });
  }

  if (lotId !== undefined && lotId !== '') {
    const parsedLotId = Number(lotId);
    if (!Number.isInteger(parsedLotId) || parsedLotId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lotId filter. Must be a positive integer.',
      });
    }
    req.query.lotId = parsedLotId;
  }

  if (slotType !== undefined && slotType !== '') {
    const normalizedSlotType = String(slotType).trim().toUpperCase();
    if (!ALLOWED_SLOT_TYPES.includes(normalizedSlotType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid slotType '${slotType}'. Allowed: ${ALLOWED_SLOT_TYPES.join(', ')}.`,
      });
    }
    req.query.slotType = normalizedSlotType;
  }

  if (vehicleType !== undefined && vehicleType !== '') {
    const normalizedVehicleType = String(vehicleType).trim().toUpperCase();
    if (!ALLOWED_SLOT_TYPES.includes(normalizedVehicleType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid vehicleType '${vehicleType}'. Allowed: ${ALLOWED_SLOT_TYPES.join(', ')}.`,
      });
    }
    req.query.vehicleType = normalizedVehicleType;
  }

  req.query.startTime = start.toISOString();
  req.query.endTime = end.toISOString();
  next();
}
