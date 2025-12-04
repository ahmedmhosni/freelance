const ApplicationError = require('./ApplicationError');

/**
 * Forbidden Error
 * Thrown when user is authenticated but doesn't have permission
 */
class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden', details = null) {
    super(message, 403, details);
  }
}

module.exports = ForbiddenError;
