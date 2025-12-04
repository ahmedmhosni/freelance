# Enhanced Logging System

This module provides a comprehensive logging solution with structured logging, correlation IDs for request tracking, and log rotation.

## Features

- **Environment-specific log levels**: Different log levels for development, test, and production
- **Structured logging**: JSON-formatted logs with metadata
- **Correlation IDs**: Track requests across the application
- **Log rotation**: Automatic rotation based on file size
- **Multiple transports**: Console and file logging
- **Request/Response logging**: Automatic logging of HTTP requests and responses
- **Database query logging**: Optional query logging in development

## Usage

### Basic Logging

```javascript
const logger = require('./core/logger');

// Log at different levels
logger.debug('Debug message', { userId: 123 });
logger.info('Info message', { action: 'user_login' });
logger.warn('Warning message', { threshold: 90 });
logger.error('Error message', new Error('Something went wrong'));
```

### Logging Middleware

Add the logging middleware to your Express app:

```javascript
const express = require('express');
const { loggingMiddleware, errorLoggingMiddleware } = require('./shared/middleware/loggingMiddleware');
const { errorHandler } = require('./shared/middleware/errorHandler');

const app = express();

// Add logging middleware early in the middleware chain
app.use(loggingMiddleware);

// Your routes here
app.use('/api', routes);

// Error logging middleware (before error handler)
app.use(errorLoggingMiddleware);

// Error handler
app.use(errorHandler);
```

### Correlation IDs

Correlation IDs are automatically generated for each request and included in all logs:

```javascript
// In your route handler
app.get('/api/users', (req, res) => {
  const correlationId = req.correlationId;
  logger.info('Fetching users', { correlationId });
  // ... your logic
});
```

### Database Query Logging

The Database class automatically logs queries in development mode:

```javascript
const database = container.resolve('database');

// This query will be logged with duration
const users = await database.queryMany('SELECT * FROM users WHERE active = $1', [true]);
```

### Child Loggers

Create child loggers with additional context:

```javascript
const logger = require('./core/logger');

// Create a child logger for a specific module
const userLogger = logger.child({ module: 'users' });

userLogger.info('User created', { userId: 123 });
// Output: { "level": "info", "message": "User created", "module": "users", "userId": 123, ... }
```

### Request Body Logging (Development Only)

For debugging, you can log request bodies:

```javascript
const { requestBodyLoggingMiddleware } = require('./shared/middleware/loggingMiddleware');

// Only use in development
if (process.env.NODE_ENV === 'development') {
  app.use(requestBodyLoggingMiddleware);
}
```

**Note**: Sensitive fields (password, token, secret, etc.) are automatically redacted.

## Log Levels

- **error**: Error messages (always logged)
- **warn**: Warning messages
- **info**: Informational messages (default in production)
- **debug**: Debug messages (default in development)

## Log Files

Logs are written to the following files:

- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All log levels
- `logs/application.log`: Info and above (production only)

All log files are automatically rotated when they reach 10MB, keeping up to 10 files.

## Configuration

Configure logging through environment variables:

```env
NODE_ENV=production
LOG_LEVEL=info
```

Or through the config object:

```javascript
const config = require('./core/config/config');

config.logging = {
  level: 'debug',
  logQueries: true
};
```

## Best Practices

1. **Always include correlation IDs**: Use `req.correlationId` in your logs
2. **Use appropriate log levels**: Don't log everything at `info` level
3. **Include context**: Add relevant metadata to your logs
4. **Don't log sensitive data**: Passwords, tokens, credit cards, etc.
5. **Use structured logging**: Pass objects instead of string concatenation

### Good Example

```javascript
logger.info('User login successful', {
  correlationId: req.correlationId,
  userId: user.id,
  email: user.email,
  loginMethod: 'password'
});
```

### Bad Example

```javascript
logger.info(`User ${user.email} logged in with password ${user.password}`);
// ❌ Logs sensitive data
// ❌ Not structured
// ❌ No correlation ID
```

## Integration with Application Insights

In production, you can integrate with Azure Application Insights:

```javascript
const appInsights = require('applicationinsights');

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup()
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .start();
}
```

The correlation IDs from the logger will be compatible with Application Insights for distributed tracing.
