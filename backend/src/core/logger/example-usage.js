/**
 * Example Usage of Enhanced Logging System
 * 
 * This file demonstrates how to integrate the logging system
 * into an Express application.
 */

const express = require('express');
const logger = require('./index');
const { 
  loggingMiddleware, 
  errorLoggingMiddleware 
} = require('../../shared/middleware/loggingMiddleware');
const { errorHandler } = require('../../shared/middleware/errorHandler');

// Create Express app
const app = express();

// Parse JSON bodies
app.use(express.json());

// ============================================
// 1. Add logging middleware EARLY in the chain
// ============================================
app.use(loggingMiddleware);

// ============================================
// 2. Your routes
// ============================================
app.get('/api/users', async (req, res, next) => {
  try {
    // Use correlation ID from request
    const correlationId = req.correlationId;
    
    logger.info('Fetching users', { 
      correlationId,
      userId: req.user?.id 
    });
    
    // Your business logic here
    const users = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];
    
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', async (req, res, next) => {
  try {
    const correlationId = req.correlationId;
    
    logger.info('Creating user', { 
      correlationId,
      name: req.body.name 
    });
    
    // Simulate user creation
    const newUser = { 
      id: 3, 
      name: req.body.name 
    };
    
    logger.info('User created successfully', { 
      correlationId,
      userId: newUser.id 
    });
    
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
});

// Route that throws an error
app.get('/api/error', (req, res, next) => {
  const error = new Error('Something went wrong!');
  error.statusCode = 500;
  next(error);
});

// ============================================
// 3. Error logging middleware (before error handler)
// ============================================
app.use(errorLoggingMiddleware);

// ============================================
// 4. Error handler (must be last)
// ============================================
app.use(errorHandler);

// ============================================
// Example: Using logger in services
// ============================================
class UserService {
  constructor(database) {
    this.database = database;
    this.logger = logger.child({ module: 'UserService' });
  }
  
  async createUser(userData, correlationId) {
    this.logger.info('Creating user in database', { 
      correlationId,
      email: userData.email 
    });
    
    try {
      const result = await this.database.queryOne(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [userData.name, userData.email]
      );
      
      this.logger.info('User created successfully', { 
        correlationId,
        userId: result.id 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to create user', {
        correlationId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

// ============================================
// Example: Logging in different scenarios
// ============================================

// Debug logging (only in development)
logger.debug('Debug information', { 
  variable: 'value',
  config: { setting: true }
});

// Info logging
logger.info('Application started', { 
  port: 5000,
  environment: 'development'
});

// Warning logging
logger.warn('High memory usage detected', { 
  usage: '85%',
  threshold: '80%'
});

// Error logging
try {
  throw new Error('Database connection failed');
} catch (error) {
  logger.error('Critical error occurred', error);
}

// Logging with correlation ID
logger.logWithCorrelation(
  'info',
  'Processing payment',
  'req-123-456',
  { amount: 100, currency: 'USD' }
);

// ============================================
// Start server
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;
