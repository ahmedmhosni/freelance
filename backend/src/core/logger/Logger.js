const winston = require('winston');
const path = require('path');
const config = require('../config/config');

/**
 * Enhanced Logger with structured logging, correlation IDs, and log rotation
 * 
 * Features:
 * - Environment-specific log levels
 * - Structured logging with metadata
 * - Correlation ID support for request tracking
 * - Log rotation with size and time-based policies
 * - Console and file transports
 */
class Logger {
  constructor() {
    this.logger = this.createLogger();
  }

  /**
   * Create Winston logger instance with enhanced configuration
   * @returns {winston.Logger}
   */
  createLogger() {
    const logLevel = this.getLogLevel();
    const logFormat = this.createLogFormat();
    const transports = this.createTransports();

    return winston.createLogger({
      level: logLevel,
      format: logFormat,
      defaultMeta: { 
        service: config.app.name || 'freelancer-api',
        environment: config.env
      },
      transports,
      exitOnError: false
    });
  }

  /**
   * Get log level based on environment
   * @returns {string}
   */
  getLogLevel() {
    if (config.isTest()) {
      return 'error'; // Minimal logging in tests
    }
    if (config.isDevelopment()) {
      return 'debug'; // Verbose logging in development
    }
    return config.logging.level || 'info'; // Configurable in production
  }

  /**
   * Create log format with structured data
   * @returns {winston.Logform.Format}
   */
  createLogFormat() {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      winston.format.json()
    );
  }

  /**
   * Create transports for different environments
   * @returns {Array}
   */
  createTransports() {
    const transports = [];

    // Console transport for non-production or development
    if (!config.isProduction() || config.isDevelopment()) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, correlationId, ...metadata }) => {
              let msg = `${timestamp} [${level}]`;
              
              if (correlationId) {
                msg += ` [${correlationId}]`;
              }
              
              msg += `: ${message}`;
              
              // Add metadata if present
              const metaKeys = Object.keys(metadata);
              if (metaKeys.length > 0) {
                msg += ` ${JSON.stringify(metadata)}`;
              }
              
              return msg;
            })
          )
        })
      );
    }

    // File transports with rotation
    const logsDir = path.join(__dirname, '../../../logs');

    // Error log - only errors
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        tailable: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );

    // Combined log - all levels
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        tailable: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );

    // Application log - info and above (excluding debug)
    if (config.isProduction()) {
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'application.log'),
          level: 'info',
          maxsize: 10485760, // 10MB
          maxFiles: 5,
          tailable: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }

    return transports;
  }

  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Error|Object} error - Error object or metadata
   */
  error(message, error = {}) {
    const meta = error instanceof Error
      ? { error: error.message, stack: error.stack, ...error }
      : error;
    
    this.logger.error(message, meta);
  }

  /**
   * Create child logger with additional context
   * @param {Object} meta - Additional metadata for child logger
   * @returns {winston.Logger}
   */
  child(meta) {
    return this.logger.child(meta);
  }

  /**
   * Log with correlation ID for request tracking
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {string} correlationId - Correlation ID
   * @param {Object} meta - Additional metadata
   */
  logWithCorrelation(level, message, correlationId, meta = {}) {
    this.logger.log(level, message, { correlationId, ...meta });
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {string} correlationId - Correlation ID
   */
  logRequest(req, correlationId) {
    this.info('Incoming request', {
      correlationId,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.id
    });
  }

  /**
   * Log HTTP response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string} correlationId - Correlation ID
   * @param {number} duration - Request duration in ms
   */
  logResponse(req, res, correlationId, duration) {
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    this.logger.log(level, 'Request completed', {
      correlationId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id
    });
  }

  /**
   * Log database query (only in development)
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {number} duration - Query duration in ms
   */
  logQuery(query, params, duration) {
    if (config.logging.logQueries) {
      this.debug('Database query', {
        query: query.substring(0, 200), // Truncate long queries
        params: params ? params.slice(0, 10) : [], // Limit params
        duration: `${duration}ms`
      });
    }
  }

  /**
   * Log database error
   * @param {string} query - SQL query
   * @param {Error} error - Database error
   * @param {string} correlationId - Correlation ID
   */
  logDatabaseError(query, error, correlationId) {
    this.error('Database error', {
      correlationId,
      query: query.substring(0, 200),
      error: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
