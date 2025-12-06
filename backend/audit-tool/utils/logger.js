/**
 * Audit Tool Logger
 * 
 * Provides logging functionality for audit operations with support for
 * multiple log levels, file output, and console output with colors.
 */

const fs = require('fs');
const path = require('path');
const config = require('../audit.config');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

// Log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class AuditLogger {
  constructor(options = {}) {
    this.level = options.level || config.logging.level || 'info';
    this.logToFile = options.logToFile !== undefined ? options.logToFile : config.logging.logToFile;
    this.logToConsole = options.logToConsole !== undefined ? options.logToConsole : config.logging.logToConsole;
    this.logFilePath = options.logFilePath || config.logging.logFilePath;
    this.colorize = options.colorize !== undefined ? options.colorize : config.logging.colorize;
    
    // Ensure log directory exists
    if (this.logToFile) {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Checks if a message should be logged based on current log level
   * @param {string} level - Message level
   * @returns {boolean}
   */
  shouldLog(level) {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  /**
   * Formats a log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {string}
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Colorizes a message for console output
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @returns {string}
   */
  colorizeMessage(level, message) {
    if (!this.colorize) {
      return message;
    }

    const levelColors = {
      debug: colors.cyan,
      info: colors.green,
      warn: colors.yellow,
      error: colors.red
    };

    const color = levelColors[level] || colors.white;
    return `${color}${message}${colors.reset}`;
  }

  /**
   * Writes a log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);

    // Log to console
    if (this.logToConsole) {
      const colorizedMessage = this.colorizeMessage(level, formattedMessage);
      console.log(colorizedMessage);
    }

    // Log to file
    if (this.logToFile) {
      try {
        fs.appendFileSync(this.logFilePath, formattedMessage + '\n', 'utf8');
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    }
  }

  /**
   * Logs a debug message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Logs an info message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Logs a warning message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Logs an error message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Logs the start of an operation
   * @param {string} operation - Operation name
   */
  startOperation(operation) {
    this.info(`Starting operation: ${operation}`);
  }

  /**
   * Logs the completion of an operation
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   */
  completeOperation(operation, duration) {
    this.info(`Completed operation: ${operation}`, { durationMs: duration });
  }

  /**
   * Logs the failure of an operation
   * @param {string} operation - Operation name
   * @param {Error} error - Error object
   */
  failOperation(operation, error) {
    this.error(`Failed operation: ${operation}`, {
      error: error.message,
      stack: error.stack
    });
  }

  /**
   * Clears the log file
   */
  clearLogFile() {
    if (this.logToFile && fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '', 'utf8');
      this.info('Log file cleared');
    }
  }
}

// Create and export a singleton instance
const logger = new AuditLogger();

module.exports = logger;
module.exports.AuditLogger = AuditLogger;
