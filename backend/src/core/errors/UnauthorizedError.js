const ApplicationError = require('./ApplicationError');

/**
 * Unauthorized Error
 * Thrown when authentication is required but not provided or invalid
 */
class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, details);
  }
}

module.exports = UnauthorizedError;
