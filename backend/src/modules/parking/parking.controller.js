import * as parkingService from './parking.service.js';

// ─── Parking Lots Controllers ─────────────────────────────────────────────────

/**
 * GET /api/v1/parking/lots
 * Public & Customer & Admin can list lots.
 */
export async function getAllLots(req, res, next) {
  try {
    res.locals.operation = 'parking.getAllLots';
    const { status, search } = req.query;
    const lots = await parkingService.getAllLots({ status, search });
    res.status(200).json({
      success: true,
      count: lots.length,
      data: { lots },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/parking/lots/:id
 * Retrieve specific parking lot details.
 */
export async function getLotById(req, res, next) {
  try {
    const lot = await parkingService.getLotById(req.params.id);
    res.status(200).json({
      success: true,
      data: { lot },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/parking/lots
 * Admin only: Create a new parking lot.
 */
export async function createLot(req, res, next) {
  try {
    const { name, address, totalCapacity, status } = req.body;
    const lot = await parkingService.createLot({ name, address, totalCapacity, status });
    res.status(201).json({
      success: true,
      message: 'Parking lot created successfully.',
      data: { lot },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/parking/lots/:id
 * Admin only: Update parking lot details.
 */
export async function updateLot(req, res, next) {
  try {
    const { name, address, totalCapacity, status } = req.body;
    const lot = await parkingService.updateLot(req.params.id, { name, address, totalCapacity, status });
    res.status(200).json({
      success: true,
      message: 'Parking lot updated successfully.',
      data: { lot },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/parking/lots/:id
 * Admin only: Delete parking lot with safety checks against active bookings.
 */
export async function deleteLot(req, res, next) {
  try {
    const result = await parkingService.deleteLot(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Parking lot deleted successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Parking Slots Controllers ────────────────────────────────────────────────

/**
 * GET /api/v1/parking/slots
 * List slots with optional filters (?lotId, ?slotType, ?status).
 */
export async function getAllSlots(req, res, next) {
  try {
    const { lotId, slotType, status } = req.query;
    const slots = await parkingService.getAllSlots({ lotId, slotType, status });
    res.status(200).json({
      success: true,
      count: slots.length,
      data: { slots },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/parking/slots/:id
 * Retrieve specific parking slot details.
 */
export async function getSlotById(req, res, next) {
  try {
    const slot = await parkingService.getSlotById(req.params.id);
    res.status(200).json({
      success: true,
      data: { slot },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/parking/slots
 * Admin only: Create a new parking slot.
 */
export async function createSlot(req, res, next) {
  try {
    const { lotId, slotNumber, slotType, status } = req.body;
    const slot = await parkingService.createSlot({ lotId, slotNumber, slotType, status });
    res.status(201).json({
      success: true,
      message: 'Parking slot created successfully.',
      data: { slot },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/parking/slots/:id
 * Admin only: Update parking slot.
 */
export async function updateSlot(req, res, next) {
  try {
    const { lotId, slotNumber, slotType, status } = req.body;
    const slot = await parkingService.updateSlot(req.params.id, { lotId, slotNumber, slotType, status });
    res.status(200).json({
      success: true,
      message: 'Parking slot updated successfully.',
      data: { slot },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/parking/slots/:id
 * Admin only: Delete parking slot with safety checks.
 */
export async function deleteSlot(req, res, next) {
  try {
    const result = await parkingService.deleteSlot(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Parking slot deleted successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Day 12: Availability Controllers ─────────────────────────────────────────

/**
 * GET /api/v1/parking/slots/availability
 * (also aliased under /api/v1/parking/availability)
 * Search available parking slots for a given time range [startTime, endTime)
 * with lot, slot type, and vehicle compatibility filters.
 */
export async function getAvailableSlots(req, res, next) {
  try {
    const { startTime, endTime, lotId, vehicleType, slotType } = req.query;
    const slots = await parkingService.getAvailableSlots({
      startTime,
      endTime,
      lotId,
      vehicleType,
      slotType,
    });

    res.status(200).json({
      success: true,
      count: slots.length,
      interval: {
        startTime,
        endTime,
      },
      filters: {
        lotId: lotId || null,
        vehicleType: vehicleType || null,
        slotType: slotType || null,
      },
      data: { slots },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/parking/slots/:id/availability
 * Verify availability status for a single slot for [startTime, endTime).
 */
export async function checkSlotAvailability(req, res, next) {
  try {
    const { startTime, endTime, vehicleType } = req.query;
    const result = await parkingService.checkSlotAvailability(req.params.id, {
      startTime,
      endTime,
      vehicleType,
    });

    const statusCode = result.available ? 200 : 409;
    res.status(statusCode).json({
      success: result.available,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
