import * as reservationsService from './reservations.service.js';

/**
 * GET /api/v1/reservations
 * List reservations. Customers see only their own; Admins can see all.
 */
export async function getReservations(req, res, next) {
  try {
    const reservations = await reservationsService.getReservations(req.query, req.user);
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: { reservations },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/reservations/:id
 * Retrieve a single reservation with ownership enforcement.
 */
export async function getReservationById(req, res, next) {
  try {
    const reservation = await reservationsService.getReservationById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { reservation },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/reservations
 * Create a new reservation with transactional locking & conflict recheck.
 */
export async function createReservation(req, res, next) {
  try {
    const { vehicleId, slotId, startTime, endTime } = req.body;
    const reservationId = await reservationsService.createReservation({
      userId: req.user.id,
      vehicleId,
      slotId,
      startTime,
      endTime,
    });

    const reservation = await reservationsService.getReservationById(reservationId, req.user);
    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully.',
      data: { reservation },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/reservations/:id/cancel
 * Cancel a reservation subject to ownership & timing rules.
 */
export async function cancelReservation(req, res, next) {
  try {
    const reservation = await reservationsService.cancelReservation(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully.',
      data: { reservation },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/reservations/:id/status
 * Admin-only: Update reservation operational status.
 */
export async function updateReservationStatus(req, res, next) {
  try {
    const reservation = await reservationsService.updateReservationStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({
      success: true,
      message: `Reservation status updated to '${req.body.status}'.`,
      data: { reservation },
    });
  } catch (err) {
    next(err);
  }
}
