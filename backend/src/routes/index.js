import { Router } from 'express';
import { healthRouter } from './health.routes.js';

export const rootRouter = Router();

// Health checks
rootRouter.use(healthRouter);
rootRouter.use('/api', healthRouter);
rootRouter.use('/api/v1', healthRouter);

// Base root endpoint
rootRouter.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'ParkEase Smart Parking System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
    },
  });
});
