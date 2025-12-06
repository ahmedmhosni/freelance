const { body, param, validationResult } = require('express-validator');

/**
 * Validation middleware for invoice items
 */

const createInvoiceItemValidation = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('quantity')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  
  body('unit_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be 0 or greater'),
  
  body('hours_worked')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Hours worked must be greater than 0'),
  
  body('rate_per_hour')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Rate per hour must be greater than 0'),
  
  body('project_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
  
  body('task_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const updateInvoiceItemValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('quantity')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  
  body('unit_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be 0 or greater'),
  
  body('hours_worked')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Hours worked must be greater than 0'),
  
  body('rate_per_hour')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Rate per hour must be greater than 0'),
  
  body('project_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
  
  body('task_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const getInvoiceItemValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const getInvoiceItemsValidation = [
  param('invoiceId')
    .isInt({ min: 1 })
    .withMessage('Invoice ID must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  createInvoiceItemValidation,
  updateInvoiceItemValidation,
  getInvoiceItemValidation,
  getInvoiceItemsValidation
};
