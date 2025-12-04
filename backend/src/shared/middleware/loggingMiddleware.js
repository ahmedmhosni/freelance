const { v4: uuidv4 } = require('uuid');
const logger = require('../../core/logger');

/**
 * Generate correlation ID for request tracking
 * @returns {string} UUID v4
 */
function generateCorrelationId() {
  return uuidv4();
}

/**
 * Logging middleware for Express
 * Logs all incoming requests with correlation IDs and response times
 * 
 * Features:
 * - Assigns unique correlation ID to each request
 * - Logs request details (method, URL, IP, user agent)
 * - Logs response details (status code, duration)
 * - Attaches correlation ID to request object for use in other middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function loggingMiddleware(req, res, next) {
  // Generate or use existing correlation ID
  const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
  
  // Attach correlation ID to request for downstream use
  req.correlationId = correlationId;
  
  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Record start time
  const startTime = Date.now();
  
  // Log incoming request
  logger.logRequest(req, correlationId);
  
  // Capture the original res.end to log after response is sent
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Log response
    logger.logResponse(req, res, correlationId, duration);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

/**
 * Error logging middleware
 * Logs errors with correlation ID and stack traces
 * Should be used after error handler middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorLoggingMiddleware(err, req, res, next) {
  const correlationId = req.correlationId || 'unknown';
  
  logger.error('Request error', {
    correlationId,
    method: req.method,
    url: req.originalUrl || req.url,
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    userId: req.user?.id
  });
  
  next(err);
}

/**
 * Request body logging middleware (use with caution)
 * Logs request body for debugging purposes
 * Should only be used in development
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestBodyLoggingMiddleware(req, res, next) {
  if (req.body && Object.keys(req.body).length > 0) {
    const correlationId = req.correlationId || 'unknown';
    
    // Sanitize sensitive fields
    const sanitizedBody = sanitizeBody(req.body);
    
    logger.debug('Request body', {
      correlationId,
      method: req.method,
      url: req.originalUrl || req.url,
      body: sanitizedBody
    });
  }
  
  next();
}

/**
 * Sanitize request body to remove sensitive information
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
function sanitizeBody(body) {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
}

/**
 * Response body logging middleware (use with caution)
 * Logs response body for debugging purposes
 * Should only be used in development
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function responseBodyLoggingMiddleware(req, res, next) {
  const correlationId = req.correlationId || 'unknown';
  const originalJson = res.json;
  
  res.json = function(body) {
    logger.debug('Response body', {
      correlationId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      body: body
    });
    
    return originalJson.call(this, body);
  };
  
  next();
}

module.exports = {
  loggingMiddleware,
  errorLoggingMiddleware,
  requestBodyLoggingMiddleware,
  responseBodyLoggingMiddleware,
  generateCorrelationId
};
