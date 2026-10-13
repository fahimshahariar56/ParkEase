import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { vehiclesRouter } from '../modules/vehicles/vehicles.routes.js';
import { parkingRouter } from '../modules/parking/parking.routes.js';
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

// Protected Verification Routes (RBAC & Ownership verification)
rootRouter.get('/api/v1/admin/protected-ping', authenticate, authorizeRoles('ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted.',
    user: req.user,
  });
});

rootRouter.get('/api/v1/customer/protected-ping', authenticate, authorizeRoles('CUSTOMER', 'ADMIN'), (req, res) => {
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
    },
  });
});
