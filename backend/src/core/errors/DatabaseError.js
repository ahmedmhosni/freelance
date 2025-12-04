const ApplicationError = require('./ApplicationError');

/**
 * Database Error
 * Thrown when database operations fail
 */
class DatabaseError extends ApplicationError {
  constructor(message, details = null) {
    super(message, 500, details);
  }
}

module.exports = DatabaseError;
