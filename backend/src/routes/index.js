import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { vehiclesRouter } from '../modules/vehicles/vehicles.routes.js';
import { parkingRouter } from '../modules/parking/parking.routes.js';
import { reservationsRouter } from '../modules/reservations/reservations.routes.js';
import { sessionsRouter } from '../modules/sessions/sessions.routes.js';
import { paymentsRouter } from '../modules/payments/payments.routes.js';
import { pricingRouter } from '../modules/pricing/pricing.routes.js';
import { reportsRouter } from '../modules/reports/reports.routes.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles, enforceUserOwnership } from '../middleware/authorizeRole.js';

export const rootRouter = Router();

// Health checks
rootRouter.use(healthRouter);
rootRouter.use('/api', healthRouter);
rootRouter.use('/api/v1', healthRouter);

// Authentication Module routes
rootRouter.use('/api/v1/auth', authRouter);
rootRouter.use('/auth', authRouter);

// Users Module routes (Profile & account management)
rootRouter.use('/api/v1/users', usersRouter);
rootRouter.use('/users', usersRouter);

// Vehicles Module routes (Customer vehicle management)
rootRouter.use('/api/v1/vehicles', vehiclesRouter);
rootRouter.use('/vehicles', vehiclesRouter);

// Parking Module routes (Lots & slots management)
rootRouter.use('/api/v1/parking', parkingRouter);
rootRouter.use('/parking', parkingRouter);

// Reservations Module routes (Booking creation & cancellation)
rootRouter.use('/api/v1/reservations', reservationsRouter);
rootRouter.use('/reservations', reservationsRouter);

// Sessions Module routes (Parking Entry/Exit sessions)
rootRouter.use('/api/v1/sessions', sessionsRouter);
rootRouter.use('/sessions', sessionsRouter);

// Payments Module routes (Demo Payment Flow — Day 21)
rootRouter.use('/api/v1/payments', paymentsRouter);
rootRouter.use('/payments', paymentsRouter);

// Pricing Rules Module routes
rootRouter.use('/api/v1/pricing-rules', pricingRouter);
rootRouter.use('/pricing-rules', pricingRouter);

// Reports & Database Demonstration routes (Day 22)
rootRouter.use('/api/v1/reports', reportsRouter);
rootRouter.use('/reports', reportsRouter);


// Protected Verification Routes (RBAC & Ownership verification)
rootRouter.get('/api/v1/admin/protected-ping', authenticate, authorizeRoles('ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted.',
    user: req.user,
  });
});

rootRouter.get('/api/v1/customer/protected-ping', authenticate, authorizeRoles('CUSTOMER'), (req, res) => {
  res.json({
    success: true,
    message: 'Customer access granted.',
    user: req.user,
  });
});

rootRouter.get('/api/v1/users/:userId/protected-ownership', authenticate, enforceUserOwnership('userId'), (req, res) => {
  res.json({
    success: true,
    message: 'Resource ownership verified.',
    ownerId: req.params.userId,
  });
});

// Base root endpoint
rootRouter.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'ParkEase Smart Parking System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        customerLogin: 'POST /api/v1/auth/customer/login',
        adminLogin: 'POST /api/v1/auth/admin/login',
        me: 'GET /api/v1/auth/me',
      },
      rbac: {
        adminPing: 'GET /api/v1/admin/protected-ping',
        customerPing: 'GET /api/v1/customer/protected-ping',
        ownership: 'GET /api/v1/users/:userId/protected-ownership',
      },
      users: {
        me: 'GET /api/v1/users/me',
        updateProfile: 'PATCH /api/v1/users/me',
        getById: 'GET /api/v1/users/:id',
      },
      vehicles: {
        list: 'GET /api/v1/vehicles',
        create: 'POST /api/v1/vehicles',
        get: 'GET /api/v1/vehicles/:id',
        update: 'PATCH /api/v1/vehicles/:id',
        delete: 'DELETE /api/v1/vehicles/:id',
      },
      parking: {
        lots: {
          list: 'GET /api/v1/parking/lots',
          get: 'GET /api/v1/parking/lots/:id',
          create: 'POST /api/v1/parking/lots',
          update: 'PATCH /api/v1/parking/lots/:id',
          delete: 'DELETE /api/v1/parking/lots/:id',
          slotsInLot: 'GET /api/v1/parking/lots/:lotId/slots',
        },
        slots: {
          list: 'GET /api/v1/parking/slots',
          get: 'GET /api/v1/parking/slots/:id',
          availability: 'GET /api/v1/parking/slots/availability?startTime=&endTime=&lotId=&vehicleType=&slotType=',
          slotAvailability: 'GET /api/v1/parking/slots/:id/availability?startTime=&endTime=',
          create: 'POST /api/v1/parking/slots',
          update: 'PATCH /api/v1/parking/slots/:id',
          delete: 'DELETE /api/v1/parking/slots/:id',
        },
      },
      reservations: {
        list: 'GET /api/v1/reservations',
        get: 'GET /api/v1/reservations/:id',
        create: 'POST /api/v1/reservations',
        cancel: 'PATCH /api/v1/reservations/:id/cancel',
        updateStatus: 'PATCH /api/v1/reservations/:id/status',
      },
      sessions: {
        list: 'GET /api/v1/sessions',
        get: 'GET /api/v1/sessions/:id',
        recordEntry: 'POST /api/v1/sessions/entry',
        recordExit: 'PATCH /api/v1/sessions/:id/exit',
      },
      pricingRules: {
        list: 'GET /api/v1/pricing-rules',
        effective: 'GET /api/v1/pricing-rules/effective',
        get: 'GET /api/v1/pricing-rules/:id',
        create: 'POST /api/v1/pricing-rules',
        deactivate: 'PATCH /api/v1/pricing-rules/:id/deactivate',
      },
      reports: {
        summary: 'GET /api/v1/reports/summary',
        occupancy: 'GET /api/v1/reports/occupancy',
        reservations: 'GET /api/v1/reports/reservations',
        sessions: 'GET /api/v1/reports/sessions',
        payments: 'GET /api/v1/reports/payments',
      },
    },
  });
});
