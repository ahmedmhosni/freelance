const { ApplicationError } = require('../../core/errors');
const logger = require('../../core/logger');

/**
 * Centralized Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 */
function errorHandler(err, req, res, next) {
  // Log error with context and correlation ID
  const correlationId = req.correlationId || 'unknown';
  
  logger.error('Error occurred', {
    correlationId,
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    statusCode: err.statusCode,
    userId: req.user?.id
  });

  // Handle ApplicationError and its subclasses
  if (err instanceof ApplicationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        name: err.name,
        message: err.message,
        details: err.details
      }
    });
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError' || err.errors) {
    return res.status(400).json({
      success: false,
      error: {
        name: 'ValidationError',
        message: err.message || 'Validation failed',
        details: err.errors || err.details
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'Invalid token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'Token expired'
      }
    });
  }

  // Handle database errors
  if (err.name === 'DatabaseError' || err.code) {
    const statusCode = getDatabaseErrorStatusCode(err.code);
    return res.status(statusCode).json({
      success: false,
      error: {
        name: 'DatabaseError',
        message: getDatabaseErrorMessage(err),
        code: err.code
      }
    });
  }

  // Handle unexpected errors
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      name: err.name || 'Error',
      message: message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
}

/**
 * Get appropriate status code for database errors
 * @param {string} code - PostgreSQL error code
 * @returns {number} HTTP status code
 */
function getDatabaseErrorStatusCode(code) {
  const errorCodeMap = {
    '23505': 409, // unique_violation
    '23503': 409, // foreign_key_violation
    '23502': 400, // not_null_violation
    '23514': 400, // check_violation
    '22P02': 400, // invalid_text_representation
    '42P01': 500, // undefined_table
    '42703': 500, // undefined_column
  };

  return errorCodeMap[code] || 500;
}

/**
 * Get user-friendly message for database errors
 * @param {Error} err - Database error
 * @returns {string} Error message
 */
function getDatabaseErrorMessage(err) {
  const code = err.code;
  
  const messageMap = {
    '23505': 'A record with this value already exists',
    '23503': 'Cannot delete or update due to related records',
    '23502': 'Required field is missing',
    '23514': 'Value does not meet constraints',
    '22P02': 'Invalid data format',
  };

  if (messageMap[code]) {
    return messageMap[code];
  }

  if (process.env.NODE_ENV === 'production') {
    return 'Database operation failed';
  }

  return err.message;
}

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      name: 'NotFoundError',
      message: `Route ${req.method} ${req.url} not found`
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
