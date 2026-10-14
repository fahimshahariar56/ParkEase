import * as sessionsService from './sessions.service.js';

/**
 * GET /api/v1/sessions
 * List parking sessions with optional status and lot filters.
 */
export async function getSessions(req, res, next) {
  try {
    const sessions = await sessionsService.getSessions(req.query, req.user);
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: { sessions },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/sessions/:id
 * Retrieve a specific parking session by ID.
 */
export async function getSessionById(req, res, next) {
  try {
    const session = await sessionsService.getSessionById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { session },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/sessions/entry
 * Admin-only: Record vehicle entry / start session.
 */
export async function recordEntry(req, res, next) {
  try {
    const { slotId, vehicleId, reservationId, entryTime } = req.body;
    const sessionId = await sessionsService.recordEntry({
      slotId,
      vehicleId,
      reservationId,
      entryTime,
    });

    const session = await sessionsService.getSessionById(sessionId, req.user);
    res.status(201).json({
      success: true,
      message: 'Vehicle entry recorded and parking session started.',
      data: { session },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/sessions/:id/exit
 * Admin-only: Record vehicle exit / complete session with server-calculated fee.
 */
export async function recordExit(req, res, next) {
  try {
    const { exitTime } = req.body;
    const session = await sessionsService.recordExit(req.params.id, { exitTime }, req.user);

    res.status(200).json({
      success: true,
      message: `Vehicle exit recorded. Total billable fee: $${session.totalFee.toFixed(2)}.`,
      data: { session },
    });
  } catch (err) {
    next(err);
  }
}
