import mysql from 'mysql2/promise';
import { env } from './env.js';

// Create MySQL connection pool using mysql2/promise
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: false, // Prevents multi-statement SQL injection
  timezone: '+00:00',
});

pool.on('connection', (connection) => {
  connection.query("SET SESSION time_zone = '+00:00'", (err) => {
    if (err) {
      console.error('Failed to set MySQL session time zone to UTC:', err);
      connection.destroy();
    }
  });
});

/**
 * Checks MySQL connection health cleanly.
 * Returns { isConnected: boolean, message: string, code?: string }
 */
export async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query('SELECT 1 AS health_check');
      return {
        isConnected: true,
        message: 'MySQL connection pool active and responsive',
      };
    } finally {
      connection.release();
    }
  } catch (err) {
    return {
      isConnected: false,
      message: err.message,
      code: err.code || 'DB_CONNECTION_ERROR',
    };
  }
}
