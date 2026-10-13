/**
 * Parking Sessions Input Validation
 */

/**
 * Validate Session Entry Record
 */
export function validateSessionEntry(req, res, next) {
  const { slotId, vehicleId, reservationId, entryTime } = req.body;

  const parsedSlotId = Number(slotId);
  if (!slotId || !Number.isInteger(parsedSlotId) || parsedSlotId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid slotId is required (positive integer).',
    });
  }

  const parsedVehicleId = Number(vehicleId);
  if (!vehicleId || !Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid vehicleId is required (positive integer).',
    });
  }

  if (reservationId !== undefined && reservationId !== null) {
    const parsedResId = Number(reservationId);
    if (!Number.isInteger(parsedResId) || parsedResId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'reservationId, if provided, must be a positive integer.',
      });
    }
    req.body.reservationId = parsedResId;
  }

  if (entryTime !== undefined && entryTime !== null) {
    const parsedDate = new Date(entryTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entryTime format. Provide a valid ISO timestamp.',
      });
    }
    req.body.entryTime = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  req.body.slotId = parsedSlotId;
  req.body.vehicleId = parsedVehicleId;
  next();
}

/**
 * Validate Session Exit Record
 */
export function validateSessionExit(req, res, next) {
  const { exitTime } = req.body;

  if (exitTime !== undefined && exitTime !== null) {
    const parsedDate = new Date(exitTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exitTime format. Provide a valid ISO timestamp.',
      });
    }
    req.body.exitTime = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  next();
}
