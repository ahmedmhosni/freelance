const ApplicationError = require('./ApplicationError');
const ValidationError = require('./ValidationError');
const NotFoundError = require('./NotFoundError');
const UnauthorizedError = require('./UnauthorizedError');
const ForbiddenError = require('./ForbiddenError');
const ConflictError = require('./ConflictError');
const DatabaseError = require('./DatabaseError');

module.exports = {
  ApplicationError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError
};
