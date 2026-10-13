import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';
import { rootRouter } from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Enable CORS
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Mount routes
app.use(rootRouter);

// Handle 404
app.use(notFound);

// Central error handler
app.use(errorHandler);

// Export the Express app for Vercel
export default app;
export { app };
