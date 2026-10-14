  import dotenv from 'dotenv';
  import path from 'path';
  import { fileURLToPath } from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Load .env from backend directory or root
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

  export const env = {
    PORT: parseInt(process.env.PORT, 10) || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/+$/, ''),
    
    // Database settings
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'parkease_db',
    DB_CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,

    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_parkease_fallback_key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  };
