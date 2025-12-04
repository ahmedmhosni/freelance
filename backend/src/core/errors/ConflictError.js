const ApplicationError = require('./ApplicationError');

/**
 * Conflict Error
 * Thrown when there's a conflict with the current state (e.g., duplicate entry)
 */
class ConflictError extends ApplicationError {
  constructor(message = 'Conflict', details = null) {
    super(message, 409, details);
  }
}

module.exports = ConflictError;
