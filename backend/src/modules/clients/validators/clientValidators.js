const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware for creating a client
 */
const validateCreateClient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),
  
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Phone must be less than 50 characters'),
  
  body('company')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Company name must be less than 255 characters'),
  
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  handleValidationErrors
];

/**
 * Validation middleware for updating a client
 */
const validateUpdateClient = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),
  
  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Phone must be less than 50 characters'),
  
  body('company')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Company name must be less than 255 characters'),
  
  body('notes')
    .optional({ nullable: true })
    .trim(),

  handleValidationErrors
];

/**
 * Validation middleware for client ID parameter
 */
const validateClientId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid client ID'),

  handleValidationErrors
];

/**
 * Validation middleware for query parameters
 */
const validateQueryParams = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search term must be less than 255 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  handleValidationErrors
];

/**
 * Handle validation errors
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        name: 'ValidationError',
        message: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg
        }))
      }
    });
  }
  
  next();
}

module.exports = {
  validateCreateClient,
  validateUpdateClient,
  validateClientId,
  validateQueryParams
};
