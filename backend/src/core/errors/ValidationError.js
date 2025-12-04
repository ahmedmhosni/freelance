const ApplicationError = require('./ApplicationError');

/**
 * Validation Error
 * Thrown when input validation fails
 */
class ValidationError extends ApplicationError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

module.exports = ValidationError;
