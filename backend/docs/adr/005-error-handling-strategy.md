# ADR 005: Centralized Error Handling Strategy

## Status

Accepted

## Context

The original application had inconsistent error handling:
- Different error formats across endpoints
- Inconsistent HTTP status codes
- Poor error messages for debugging
- No centralized error logging
- Difficult to track errors in production

We needed a strategy that provides:
- Consistent error responses
- Proper HTTP status codes
- Helpful error messages
- Centralized error logging
- Easy debugging in development
- Security in production (no sensitive data exposure)

## Decision

We will implement a **centralized error handling strategy** with custom error classes and a global error handler middleware.

### Custom Error Hierarchy:

```javascript
ApplicationError (base)
├── ValidationError (400)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── NotFoundError (404)
├── ConflictError (409)
└── DatabaseError (500)
```

### Error Handler Middleware:

```javascript
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Build response
  const response = {
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Add validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
```

### Error Response Format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/v2/clients",
  "stack": "Error: ...\n    at ..." // Development only
}
```

## Consequences

### Positive:

- **Consistency**: All errors follow the same format
- **Debugging**: Easy to debug with detailed error information
- **Logging**: All errors are logged centrally
- **Security**: No sensitive data exposed in production
- **Client-Friendly**: Clear error messages for frontend
- **Monitoring**: Easy to integrate with monitoring tools
- **Type Safety**: Custom error classes provide type information

### Negative:

- **Boilerplate**: Need to create custom error classes
- **Learning Curve**: Developers need to use correct error types
- **Overhead**: Small performance overhead for error handling

### Mitigation:

- Provide comprehensive error class documentation
- Create examples for common error scenarios
- Use linting to enforce error handling patterns

## Error Classes

### ApplicationError (Base Class):

```javascript
class ApplicationError extends Error {
  constructor(message, statusCode = 500, code = 'APPLICATION_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### ValidationError:

```javascript
class ValidationError extends ApplicationError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

// Usage:
throw new ValidationError('Validation failed', [
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password too short' }
]);
```

### NotFoundError:

```javascript
class NotFoundError extends ApplicationError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// Usage:
throw new NotFoundError('Client');
```

### UnauthorizedError:

```javascript
class UnauthorizedError extends ApplicationError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Usage:
throw new UnauthorizedError('Invalid token');
```

## Error Handling Patterns

### In Controllers:

```javascript
async getById(req, res, next) {
  try {
    const { id } = req.params;
    const client = await this.service.getById(id);
    
    if (!client) {
      throw new NotFoundError('Client');
    }
    
    res.json(client);
  } catch (error) {
    next(error); // Pass to error handler
  }
}
```

### In Services:

```javascript
async create(data) {
  // Validate business rules
  if (!data.name || data.name.length < 2) {
    throw new ValidationError('Invalid client data', [
      { field: 'name', message: 'Name must be at least 2 characters' }
    ]);
  }

  // Check for conflicts
  const existing = await this.repository.findByEmail(data.email);
  if (existing) {
    throw new ConflictError('Client with this email already exists');
  }

  try {
    return await this.repository.create(data);
  } catch (error) {
    throw new DatabaseError('Failed to create client');
  }
}
```

### In Repositories:

```javascript
async findById(id) {
  try {
    const row = await this.database.queryOne(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return row ? this.mapToModel(row) : null;
  } catch (error) {
    logger.error('Database error in findById:', error);
    throw new DatabaseError(`Failed to fetch ${this.tableName}`);
  }
}
```

## Error Logging

### Log Levels:

- **error**: All errors (logged to error.log)
- **warn**: Validation errors, not found errors
- **info**: Successful operations
- **debug**: Detailed debugging information

### Log Format:

```javascript
{
  level: 'error',
  message: 'Database error',
  timestamp: '2024-01-15T10:00:00.000Z',
  error: {
    message: 'Connection timeout',
    stack: '...',
    code: 'DATABASE_ERROR'
  },
  context: {
    userId: 123,
    path: '/api/v2/clients',
    method: 'POST'
  }
}
```

## Alternatives Considered

### 1. HTTP Status Codes Only

**Pros**: Simple, standard
**Cons**: Not enough information, inconsistent messages

### 2. Error Codes in Response Body

**Pros**: More detailed than status codes
**Cons**: No type safety, easy to forget

### 3. Third-Party Error Library

**Pros**: Battle-tested, feature-rich
**Cons**: Additional dependency, may not fit our needs

### 4. Express Default Error Handler

**Pros**: Built-in, no setup
**Cons**: Inconsistent format, poor error messages

## Integration with Monitoring

### Application Insights:

```javascript
if (statusCode >= 500) {
  appInsights.defaultClient.trackException({
    exception: err,
    properties: {
      userId: req.user?.id,
      path: req.path,
      method: req.method
    }
  });
}
```

### Sentry:

```javascript
Sentry.captureException(err, {
  user: { id: req.user?.id },
  tags: {
    path: req.path,
    method: req.method
  }
});
```

## Testing Error Handling

### Unit Tests:

```javascript
describe('ClientService', () => {
  it('should throw ValidationError for invalid data', async () => {
    await expect(service.create({ name: 'A' }))
      .rejects
      .toThrow(ValidationError);
  });

  it('should throw NotFoundError when client not found', async () => {
    await expect(service.getById(999))
      .rejects
      .toThrow(NotFoundError);
  });
});
```

### Integration Tests:

```javascript
it('should return 404 for non-existent client', async () => {
  const response = await request(app)
    .get('/api/v2/clients/999')
    .set('Authorization', `Bearer ${token}`)
    .expect(404);

  expect(response.body).toHaveProperty('error');
  expect(response.body.code).toBe('NOT_FOUND');
});
```

## Future Enhancements

1. **Error Recovery**: Automatic retry for transient errors
2. **Error Aggregation**: Group similar errors for analysis
3. **User-Friendly Messages**: Localized error messages
4. **Error Tracking**: Integration with error tracking services
5. **Circuit Breaker**: Prevent cascading failures

## References

- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)

