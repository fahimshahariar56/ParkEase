import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
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
    },
  });
});
