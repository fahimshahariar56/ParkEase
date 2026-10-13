/**
 * Vehicles input validation and business rules
 */

export const ALLOWED_VEHICLE_TYPES = [
  'MOTORCYCLE',
  'STANDARD_CAR',
  'SUV',
  'VAN',
  'TRUCK',
];

const PLATE_REGEX = /^[A-Za-z0-9\s-]{2,50}$/;

export function validateCreateVehicle(req, res, next) {
  const { plateNumber, vehicleType, makeModel } = req.body;

  if (!plateNumber || typeof plateNumber !== 'string' || plateNumber.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'License plate number is required (min 2 characters).',
    });
  }

  const normalizedPlate = plateNumber.trim().toUpperCase();
  if (!PLATE_REGEX.test(normalizedPlate)) {
    return res.status(400).json({
      success: false,
      message: 'License plate must contain alphanumeric characters, spaces, or hyphens.',
    });
  }

  if (!vehicleType || typeof vehicleType !== 'string') {
    return res.status(400).json({
      success: false,
      message: `Vehicle type is required. Allowed types: ${ALLOWED_VEHICLE_TYPES.join(', ')}.`,
    });
  }

  const normalizedType = vehicleType.trim().toUpperCase();
  if (!ALLOWED_VEHICLE_TYPES.includes(normalizedType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid vehicle type '${vehicleType}'. Allowed types: ${ALLOWED_VEHICLE_TYPES.join(', ')}.`,
    });
  }

  if (makeModel !== undefined && makeModel !== null) {
    if (typeof makeModel !== 'string' || makeModel.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Make/Model must be a string up to 100 characters.',
      });
    }
    req.body.makeModel = makeModel.trim();
  } else {
    req.body.makeModel = null;
  }

  req.body.plateNumber = normalizedPlate;
  req.body.vehicleType = normalizedType;
  next();
}

export function validateUpdateVehicle(req, res, next) {
  const { plateNumber, vehicleType, makeModel } = req.body;

  if (plateNumber === undefined && vehicleType === undefined && makeModel === undefined) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (plateNumber, vehicleType, or makeModel) must be provided.',
    });
  }

  if (plateNumber !== undefined) {
    if (typeof plateNumber !== 'string' || plateNumber.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'License plate number must be at least 2 characters.',
      });
    }
    const normalizedPlate = plateNumber.trim().toUpperCase();
    if (!PLATE_REGEX.test(normalizedPlate)) {
      return res.status(400).json({
        success: false,
        message: 'License plate must contain alphanumeric characters, spaces, or hyphens.',
      });
    }
    req.body.plateNumber = normalizedPlate;
  }

  if (vehicleType !== undefined) {
    if (typeof vehicleType !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Allowed types: ${ALLOWED_VEHICLE_TYPES.join(', ')}.`,
      });
    }
    const normalizedType = vehicleType.trim().toUpperCase();
    if (!ALLOWED_VEHICLE_TYPES.includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid vehicle type '${vehicleType}'. Allowed types: ${ALLOWED_VEHICLE_TYPES.join(', ')}.`,
      });
    }
    req.body.vehicleType = normalizedType;
  }

  if (makeModel !== undefined && makeModel !== null) {
    if (typeof makeModel !== 'string' || makeModel.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Make/Model must be a string up to 100 characters.',
      });
    }
    req.body.makeModel = makeModel.trim();
  } else if (makeModel === null) {
    req.body.makeModel = null;
  }

  next();
}
