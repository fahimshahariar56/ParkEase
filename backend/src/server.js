import { app } from './app.js';
import { env } from './config/env.js';
import { pool, checkDatabaseConnection } from './config/database.js';

const server = app.listen(env.PORT, async () => {
  console.log(`[ParkEase Backend] Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`[ParkEase Backend] Health check available at: http://localhost:${env.PORT}/api/v1/health`);

  // Probe database connection
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    console.log(`[ParkEase Backend] MySQL Pool Connected: ${dbStatus.message}`);
  } else {
    console.warn(`[ParkEase Backend] MySQL Pool Notice: ${dbStatus.message} (Code: ${dbStatus.code || 'N/A'})`);
  }
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n[ParkEase Backend] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('[ParkEase Backend] MySQL connection pool closed.');
    } catch (err) {
      console.error('[ParkEase Backend] Error closing MySQL pool:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
