import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  
  // Safe sanitized message
  let safeMessage = err.message || 'An unexpected internal server error occurred.';
  
  // Guard against exposing raw database / SQL internal errors
  if (err.sql || err.code === 'ER_PARSE_ERROR' || err.code === 'ER_BAD_FIELD_ERROR') {
    safeMessage = 'A database query error occurred while processing the request.';
  }

  const response = {
    success: false,
    message: safeMessage,
  };

  // Include error details or stack trace only in explicit development environment
  if (env.NODE_ENV === 'development' && statusCode === 500) {
    response.debug = {
      name: err.name,
      code: err.code,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(response);
}
