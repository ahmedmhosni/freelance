const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware for creating a task
 */
const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 255 })
    .withMessage('Task title must be less than 255 characters'),
  
  body('project_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
    .toInt(),
  
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  
  body('status')
    .optional()
    .trim()
    .isIn(['pending', 'in-progress', 'done', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in-progress, done, completed, cancelled'),
  
  body('priority')
    .optional()
    .trim()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('due_date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid date (ISO 8601 format)')
    .toDate(),
  
  body('comments')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  handleValidationErrors
];

/**
 * Validation middleware for updating a task
 */
const validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Task title must be less than 255 characters'),
  
  body('project_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
    .toInt(),
  
  body('description')
    .optional({ nullable: true })
    .trim(),
  
  body('status')
    .optional()
    .trim()
    .isIn(['pending', 'in-progress', 'done', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in-progress, done, completed, cancelled'),
  
  body('priority')
    .optional()
    .trim()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('due_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid date (ISO 8601 format)')
    .toDate(),
  
  body('comments')
    .optional({ nullable: true })
    .trim(),

  handleValidationErrors
];

/**
 * Validation middleware for task ID parameter
 */
const validateTaskId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid task ID')
    .toInt(),

  handleValidationErrors
];

/**
 * Validation middleware for query parameters
 */
const validateQueryParams = [
  query('project_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
    .toInt(),
  
  query('client_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Client ID must be a positive integer')
    .toInt(),
  
  query('status')
    .optional()
    .trim()
    .isIn(['pending', 'in-progress', 'done', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in-progress, done, completed, cancelled'),
  
  query('priority')
    .optional()
    .trim()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
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
  
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
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
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateQueryParams
};
