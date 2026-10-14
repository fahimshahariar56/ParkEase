import { env } from '../config/env.js';

function redactSensitive(value) {
  return (value || '')
    .replace(/mysql(?:s)?:\/\/[^\s"'`]+/gi, 'mysql://[REDACTED]')
    .replace(/\b(password|passwd|pwd|secret|token|authorization)(\s*[:=]\s*)[^\s,;]+/gi, '$1$2[REDACTED]');
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;

  if (statusCode >= 500) {
    console.error('[ParkEase API] Request failed', JSON.stringify({
      method: req.method,
      route: req.originalUrl?.split('?')[0],
      operation: res.locals?.operation || 'unidentified',
      errorName: err.name,
      errorMessage: redactSensitive(err.message),
      sqlCode: err.code,
      sqlState: err.sqlState,
      stack: redactSensitive(err.stack),
    }));
  }

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
