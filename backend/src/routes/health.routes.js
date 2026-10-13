import { Router } from 'express';
import { checkDatabaseConnection } from '../config/database.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/health', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();

  const isHealthy = dbStatus.isConnected;

  const payload = {
    success: true,
    status: isHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      api: {
        status: 'UP',
      },
      database: {
        type: 'MySQL (InnoDB)',
        status: dbStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED',
        details: dbStatus.message,
      },
    },
  };

  res.status(isHealthy ? 200 : 503).json(payload);
});
