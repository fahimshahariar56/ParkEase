import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';

export const rootRouter = Router();

// Health checks
rootRouter.use(healthRouter);
rootRouter.use('/api', healthRouter);
rootRouter.use('/api/v1', healthRouter);

// Authentication Module routes
rootRouter.use('/api/v1/auth', authRouter);
rootRouter.use('/auth', authRouter);

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
    },
  });
});
