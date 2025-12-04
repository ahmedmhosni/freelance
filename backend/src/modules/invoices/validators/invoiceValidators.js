const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating an invoice
 */
const createInvoiceValidation = [
  body('clientId').notEmpty().isInt().withMessage('Valid client ID is required'),
  body('invoiceNumber').notEmpty().trim().withMessage('Invoice number is required'),
  body('amount').notEmpty().isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('tax').optional().isFloat({ min: 0 }).withMessage('Tax must be a positive number'),
  body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  body('issueDate').optional().isISO8601().withMessage('Invalid issue date'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('notes').optional().trim()
];

/**
 * Validation rules for updating an invoice
 */
const updateInvoiceValidation = [
  param('id').isInt().withMessage('Valid invoice ID is required'),
  body('clientId').optional().isInt().withMessage('Valid client ID is required'),
  body('invoiceNumber').optional().notEmpty().trim().withMessage('Invoice number cannot be empty'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('tax').optional().isFloat({ min: 0 }).withMessage('Tax must be a positive number'),
  body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  body('issueDate').optional().isISO8601().withMessage('Invalid issue date'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('sentDate').optional().isISO8601().withMessage('Invalid sent date'),
  body('paidDate').optional().isISO8601().withMessage('Invalid paid date'),
  body('notes').optional().trim()
];

/**
 * Validation rules for getting an invoice by ID
 */
const getInvoiceValidation = [
  param('id').isInt().withMessage('Valid invoice ID is required')
];

/**
 * Validation rules for deleting an invoice
 */
const deleteInvoiceValidation = [
  param('id').isInt().withMessage('Valid invoice ID is required')
];

/**
 * Validation rules for query parameters
 */
const queryValidation = [
  query('clientId').optional().isInt().withMessage('Valid client ID is required'),
  query('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
  createInvoiceValidation,
  updateInvoiceValidation,
  getInvoiceValidation,
  deleteInvoiceValidation,
  queryValidation
};
