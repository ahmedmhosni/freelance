const ApplicationError = require('./ApplicationError');

/**
 * Not Found Error
 * Thrown when a requested resource is not found
 */
class NotFoundError extends ApplicationError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details);
  }
}

module.exports = NotFoundError;
