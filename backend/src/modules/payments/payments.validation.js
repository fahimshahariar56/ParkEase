/**
 * Payments Input Validation — Day 21 Demo Payment Flow
 * All payment transactions are SIMULATED. No real money is transferred.
 */

const ALLOWED_DEMO_METHODS = ['SIMULATED_CARD', 'SIMULATED_MOBILE_WALLET', 'SIMULATED_CASH'];

/**
 * Validate POST /payments — create a simulated payment for a completed session.
 */
export function validateCreatePayment(req, res, next) {
  const { sessionId, demoMethod } = req.body;

  const parsedSessionId = Number(sessionId);
  if (!sessionId || !Number.isInteger(parsedSessionId) || parsedSessionId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid sessionId is required (positive integer).',
    });
  }

  if (!demoMethod || !ALLOWED_DEMO_METHODS.includes(demoMethod)) {
    return res.status(400).json({
      success: false,
      message: `demoMethod must be one of: ${ALLOWED_DEMO_METHODS.join(', ')}.`,
    });
  }

  req.body.sessionId = parsedSessionId;
  req.body.demoMethod = demoMethod;
  next();
}
