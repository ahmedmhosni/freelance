const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware for creating a time entry (manual entry)
 */
const validateCreateTimeEntry = [
  body('task_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer')
    .toInt(),
  
  body('project_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
    .toInt(),
  
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('start_time')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid date (ISO 8601 format)')
    .toDate(),
  
  body('end_time')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('End time must be a valid date (ISO 8601 format)')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.body.start_time) {
        const startTime = new Date(req.body.start_time);
        const endTime = new Date(value);
        if (endTime <= startTime) {
          throw new Error('End time must be after start time');
        }
      }
      return true;
    }),
  
  body('is_billable')
    .optional()
    .isBoolean()
    .withMessage('is_billable must be a boolean')
    .toBoolean(),

  handleValidationErrors
];

/**
 * Validation middleware for starting a timer
 */
const validateStartTimer = [
  body('task_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer')
    .toInt(),
  
  body('project_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
    .toInt(),
  
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('is_billable')
    .optional()
    .isBoolean()
    .withMessage('is_billable must be a boolean')
    .toBoolean(),

  handleValidationErrors
];

/**
 * Validation middleware for updating a time entry
 */
const validateUpdateTimeEntry = [
  body('task_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer')
    .toInt(),
  
  body('project_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
    .toInt(),
  
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('start_time')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid date (ISO 8601 format)')
    .toDate(),
  
  body('end_time')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End time must be a valid date (ISO 8601 format)')
    .toDate(),
  
  body('is_billable')
    .optional()
    .isBoolean()
    .withMessage('is_billable must be a boolean')
    .toBoolean(),

  handleValidationErrors
];

/**
 * Validation middleware for time entry ID parameter
 */
const validateTimeEntryId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid time entry ID')
    .toInt(),

  handleValidationErrors
];

/**
 * Validation middleware for query parameters
 */
const validateQueryParams = [
  query('task_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer')
    .toInt(),
  
  query('project_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
    .toInt(),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date (ISO 8601 format)')
    .toDate(),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date (ISO 8601 format)')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.query.start_date) {
        const startDate = new Date(req.query.start_date);
        const endDate = new Date(value);
        if (endDate < startDate) {
          throw new Error('End date must be after or equal to start date');
        }
      }
      return true;
    }),
  
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
  
  query('group_by')
    .optional()
    .isIn(['task', 'project', 'client'])
    .withMessage('group_by must be one of: task, project, client'),

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
  validateCreateTimeEntry,
  validateStartTimer,
  validateUpdateTimeEntry,
  validateTimeEntryId,
  validateQueryParams
};
