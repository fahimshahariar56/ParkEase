import * as vehiclesService from './vehicles.service.js';

/**
 * GET /api/v1/vehicles
 * Returns vehicles belonging to the authenticated user.
 * Admins may optionally pass ?userId=X to view another user's garage.
 */
export async function getMyVehicles(req, res, next) {
  try {
    let targetUserId = req.user.id;
    if (req.user.role === 'ADMIN' && req.query.userId) {
      targetUserId = parseInt(req.query.userId, 10);
    }

    const vehicles = await vehiclesService.getVehiclesByUserId(targetUserId);
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: { vehicles },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/vehicles/:id
 * Returns a specific vehicle by ID with ownership enforcement.
 */
export async function getVehicleById(req, res, next) {
  try {
    const vehicle = await vehiclesService.getVehicleById(req.params.id);

    // Ownership check
    if (req.user.role !== 'ADMIN' && vehicle.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own vehicles.',
      });
    }

    res.status(200).json({
      success: true,
      data: { vehicle },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/vehicles
 * Creates a new vehicle for the authenticated user.
 */
export async function createVehicle(req, res, next) {
  try {
    const { plateNumber, vehicleType, makeModel } = req.body;
    const vehicle = await vehiclesService.createVehicle(req.user.id, {
      plateNumber,
      vehicleType,
      makeModel,
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully.',
      data: { vehicle },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/vehicles/:id
 * Updates an existing vehicle with ownership enforcement.
 */
export async function updateVehicle(req, res, next) {
  try {
    const { plateNumber, vehicleType, makeModel } = req.body;
    const vehicle = await vehiclesService.updateVehicle(
      req.params.id,
      req.user.id,
      req.user.role,
      { plateNumber, vehicleType, makeModel }
    );

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: { vehicle },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/vehicles/:id
 * Deletes a vehicle with ownership and safety checks against active bookings.
 */
export async function deleteVehicle(req, res, next) {
  try {
    const result = await vehiclesService.deleteVehicle(
      req.params.id,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Vehicle removed successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
