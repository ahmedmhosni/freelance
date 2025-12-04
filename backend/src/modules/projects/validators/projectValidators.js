const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware for creating a project
 */
const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 255 })
    .withMessage('Project name must be less than 255 characters'),
  
  body('client_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Client ID must be a positive integer')
    .toInt(),
  
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  
  body('status')
    .optional()
    .trim()
    .isIn(['active', 'completed', 'on-hold', 'cancelled'])
    .withMessage('Status must be one of: active, completed, on-hold, cancelled'),
  
  body('start_date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Start date must be a valid date (ISO 8601 format)')
    .toDate(),
  
  body('end_date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('End date must be a valid date (ISO 8601 format)')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.body.start_date && endDate) {
        const startDate = new Date(req.body.start_date);
        if (startDate > endDate) {
          throw new Error('End date must be after or equal to start date');
        }
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validation middleware for updating a project
 */
const validateUpdateProject = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Project name must be less than 255 characters'),
  
  body('client_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Client ID must be a positive integer')
    .toInt(),
  
  body('description')
    .optional({ nullable: true })
    .trim(),
  
  body('status')
    .optional()
    .trim()
    .isIn(['active', 'completed', 'on-hold', 'cancelled'])
    .withMessage('Status must be one of: active, completed, on-hold, cancelled'),
  
  body('start_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid date (ISO 8601 format)')
    .toDate(),
  
  body('end_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid date (ISO 8601 format)')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.body.start_date && endDate) {
        const startDate = new Date(req.body.start_date);
        if (startDate > endDate) {
          throw new Error('End date must be after or equal to start date');
        }
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validation middleware for project ID parameter
 */
const validateProjectId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid project ID')
    .toInt(),

  handleValidationErrors
];

/**
 * Validation middleware for query parameters
 */
const validateQueryParams = [
  query('client_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Client ID must be a positive integer')
    .toInt(),
  
  query('status')
    .optional()
    .trim()
    .isIn(['active', 'completed', 'on-hold', 'cancelled'])
    .withMessage('Status must be one of: active, completed, on-hold, cancelled'),
  
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
  validateCreateProject,
  validateUpdateProject,
  validateProjectId,
  validateQueryParams
};
