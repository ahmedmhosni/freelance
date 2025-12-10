const { body, param, query } = require('express-validator');

/**
 * AI Module Validators
 * Input validation rules for AI endpoints
 */

const chatValidation = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters')
    .trim(),
  
  body('conversation_id')
    .optional()
    .isUUID()
    .withMessage('Conversation ID must be a valid UUID'),
    
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object')
];

const settingsUpdateValidation = [
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean'),
    
  body('provider')
    .optional()
    .isIn(['gemini', 'openai', 'azure-openai'])
    .withMessage('Provider must be one of: gemini, openai, azure-openai'),
    
  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
    
  body('max_tokens')
    .optional()
    .isInt({ min: 100, max: 4000 })
    .withMessage('Max tokens must be between 100 and 4000'),
    
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
    
  body('system_prompt')
    .optional()
    .isString()
    .withMessage('System prompt must be a string')
    .isLength({ max: 2000 })
    .withMessage('System prompt must be less than 2000 characters'),
    
  body('rate_limit_per_user')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Rate limit per user must be between 1 and 100'),
    
  body('rate_limit_window')
    .optional()
    .isInt({ min: 60, max: 86400 })
    .withMessage('Rate limit window must be between 60 and 86400 seconds'),
    
  body('welcome_message')
    .optional()
    .isString()
    .withMessage('Welcome message must be a string')
    .isLength({ max: 500 })
    .withMessage('Welcome message must be less than 500 characters')
];

const conversationIdValidation = [
  param('conversationId')
    .isUUID()
    .withMessage('Conversation ID must be a valid UUID')
];

const usageQueryValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

module.exports = {
  chatValidation,
  settingsUpdateValidation,
  conversationIdValidation,
  usageQueryValidation
};