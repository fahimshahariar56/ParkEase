import * as paymentsService from './payments.service.js';

/**
 * GET /api/v1/payments
 * List all demo payments. Admin only.
 */
export async function getPayments(req, res, next) {
  try {
    const payments = await paymentsService.getPayments(req.query);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: { payments },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/payments/:id
 * Retrieve a specific demo payment by ID. Admin only.
 */
export async function getPaymentById(req, res, next) {
  try {
    const payment = await paymentsService.getPaymentById(req.params.id);
    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/payments/session/:sessionId
 * Get the demo payment for a specific session. Admin only.
 */
export async function getPaymentBySession(req, res, next) {
  try {
    const payment = await paymentsService.getPaymentBySessionId(req.params.sessionId);
    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/payments
 * Create a simulated demo payment for a completed session. Admin only.
 * IMPORTANT: This is a simulation. No real financial transaction occurs.
 */
export async function createPayment(req, res, next) {
  try {
    const { sessionId, demoMethod } = req.body;
    const paymentId = await paymentsService.createPayment({ sessionId, demoMethod });
    const payment = await paymentsService.getPaymentById(paymentId);

    res.status(201).json({
      success: true,
      message: `[DEMO] Simulated ${demoMethod} payment of $${payment.amount.toFixed(2)} recorded. No real transaction occurred.`,
      isDemoTransaction: true,
      data: { payment },
    });
  } catch (err) {
    next(err);
  }
}
