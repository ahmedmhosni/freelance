const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// Password strength validator
const strongPassword = (value) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  if (value.length < minLength) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (!hasUpperCase) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    throw new Error('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    throw new Error('Password must contain at least one special character');
  }
  return true;
};

// Common validation rules
const validators = {
  // Auth validators
  register: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').custom(strongPassword),
    validate
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],

  // Client validators
  createClient: [
    body('name').trim().notEmpty().withMessage('Client name is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    validate
  ],

  // Project validators
  createProject: [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('client_id').optional().isInt().withMessage('Valid client ID is required'),
    body('budget').optional().isDecimal().withMessage('Budget must be a valid number'),
    body('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
    validate
  ],

  // Task validators
  createTask: [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('project_id').optional().isInt().withMessage('Valid project ID is required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
    body('due_date').optional().isISO8601().withMessage('Valid due date is required'),
    validate
  ],

  // Invoice validators
  createInvoice: [
    body('client_id').isInt().withMessage('Valid client ID is required'),
    body('invoice_number').trim().notEmpty().withMessage('Invoice number is required'),
    body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid amount is required'),
    body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
    body('due_date').optional().isISO8601().withMessage('Valid due date is required'),
    validate
  ],

  // ID parameter validator
  idParam: [
    param('id').isInt().withMessage('Valid ID is required'),
    validate
  ]
};

module.exports = validators;
