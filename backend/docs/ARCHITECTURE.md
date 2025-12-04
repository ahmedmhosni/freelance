# Architecture Documentation

## Overview

The Freelance Management application follows a **modular, layered architecture** with **dependency injection** for loose coupling and high testability. The architecture is designed for scalability, maintainability, and ease of testing.

## Architecture Principles

1. **Separation of Concerns** - Each layer has a single, well-defined responsibility
2. **Dependency Injection** - Dependencies are injected rather than hard-coded
3. **Modularity** - Features are organized into self-contained modules
4. **Testability** - All components can be tested in isolation
5. **Scalability** - Architecture supports horizontal and vertical scaling
6. **Security** - Security is built into every layer

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                    (React Frontend)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                    API Gateway Layer                         │
│              (Express.js + Middleware)                       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Auth    │  CORS    │  Helmet  │  Rate    │  Error   │  │
│  │  Middleware│        │          │  Limit   │  Handler │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Controller Layer                           │
│         (HTTP Request/Response Handling)                     │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Clients  │ Projects │  Tasks   │ Invoices │   Time   │  │
│  │Controller│Controller│Controller│Controller│Controller│  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Service Layer                             │
│              (Business Logic)                                │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Client   │ Project  │  Task    │ Invoice  │   Time   │  │
│  │ Service  │ Service  │ Service  │ Service  │ Service  │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Repository Layer                            │
│              (Data Access Logic)                             │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Client   │ Project  │  Task    │ Invoice  │   Time   │  │
│  │Repository│Repository│Repository│Repository│Repository│  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Database Layer                            │
│              (PostgreSQL Connection Pool)                    │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
backend/
├── src/
│   ├── core/                    # Core infrastructure
│   │   ├── container/           # Dependency injection container
│   │   ├── database/            # Database connection and pooling
│   │   ├── config/              # Configuration management
│   │   ├── logger/              # Logging infrastructure
│   │   ├── errors/              # Custom error classes
│   │   └── bootstrap.js         # Application initialization
│   │
│   ├── modules/                 # Feature modules
│   │   ├── clients/
│   │   │   ├── controllers/     # HTTP request handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── repositories/    # Data access
│   │   │   ├── models/          # Domain models
│   │   │   ├── dto/             # Data transfer objects
│   │   │   ├── validators/      # Input validation
│   │   │   └── index.js         # Module registration
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── invoices/
│   │   ├── time-tracking/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── auth/
│   │   └── admin/
│   │
│   ├── shared/                  # Shared utilities
│   │   ├── base/                # Base classes
│   │   │   ├── BaseController.js
│   │   │   ├── BaseService.js
│   │   │   └── BaseRepository.js
│   │   ├── middleware/          # Shared middleware
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   ├── loggingMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   └── utils/               # Utility functions
│   │
│   ├── docs/                    # API documentation
│   │   ├── auth.yaml
│   │   ├── clients.yaml
│   │   └── ...
│   │
│   └── __tests__/               # Test files
│       ├── e2e/                 # End-to-end tests
│       ├── performance/         # Performance tests
│       └── unit/                # Unit tests
│
├── docs/                        # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPER_GUIDE.md
│
└── package.json
```

## Layer Responsibilities

### 1. Controller Layer

**Responsibility**: Handle HTTP requests and responses

**Key Functions**:
- Parse and validate request data
- Call appropriate service methods
- Format responses
- Handle HTTP-specific concerns (status codes, headers)

**Example**:
```javascript
class ClientController extends BaseController {
  async getAll(req, res, next) {
    try {
      const { search, limit = 10, offset = 0 } = req.query;
      const userId = req.user.id;
      
      const result = await this.service.getAllForUser(userId, {
        search,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
```

### 2. Service Layer

**Responsibility**: Implement business logic

**Key Functions**:
- Validate business rules
- Coordinate between repositories
- Handle transactions
- Implement complex business workflows

**Example**:
```javascript
class ClientService extends BaseService {
  async getAllForUser(userId, options) {
    // Business logic: ensure user can only see their own clients
    const clients = await this.repository.findByUserId(userId, options);
    const total = await this.repository.countByUserId(userId);
    
    return {
      data: clients.map(client => client.toDTO()),
      meta: { total, limit: options.limit, offset: options.offset }
    };
  }
}
```

### 3. Repository Layer

**Responsibility**: Data access and persistence

**Key Functions**:
- Execute database queries
- Map database rows to domain models
- Handle database-specific concerns
- Implement data access patterns

**Example**:
```javascript
class ClientRepository extends BaseRepository {
  async findByUserId(userId, options = {}) {
    const { search, limit = 10, offset = 0 } = options;
    
    let query = 'SELECT * FROM clients WHERE user_id = $1';
    const params = [userId];
    
    if (search) {
      query += ' AND (name ILIKE $2 OR email ILIKE $2)';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}';
    params.push(limit, offset);
    
    const rows = await this.database.queryMany(query, params);
    return rows.map(row => this.mapToModel(row));
  }
}
```

### 4. Model Layer

**Responsibility**: Represent domain entities

**Key Functions**:
- Encapsulate domain data
- Implement domain-specific methods
- Provide serialization/deserialization

**Example**:
```javascript
class Client {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.userId = data.userId;
  }
  
  isValid() {
    return this.name && this.email && this.userId;
  }
  
  toDTO() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt
    };
  }
}
```

## Dependency Injection

The application uses a custom DI container for managing dependencies:

```javascript
// Registration
container.registerSingleton('database', () => new Database(config.database));
container.registerSingleton('clientRepository', (c) => 
  new ClientRepository(c.resolve('database'))
);
container.registerTransient('clientService', (c) => 
  new ClientService(c.resolve('clientRepository'))
);

// Resolution
const clientService = container.resolve('clientService');
```

**Benefits**:
- Loose coupling between components
- Easy to test with mocks
- Centralized dependency management
- Support for different lifecycles (singleton, transient)

## Module Structure

Each feature module follows a consistent structure:

```javascript
// modules/clients/index.js
function registerClientsModule(container) {
  // Register repository
  container.registerSingleton('clientRepository', (c) =>
    new ClientRepository(c.resolve('database'))
  );
  
  // Register service
  container.registerTransient('clientService', (c) =>
    new ClientService(c.resolve('clientRepository'))
  );
  
  // Register controller
  container.registerSingleton('clientController', (c) =>
    new ClientController(c.resolve('clientService'))
  );
}

module.exports = { registerClientsModule };
```

## Database Layer

### Connection Pooling

```javascript
class Database {
  constructor(config) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: 20,                    // Maximum pool size
      idleTimeoutMillis: 30000,   // Close idle clients after 30s
      connectionTimeoutMillis: 2000
    });
  }
}
```

### Transaction Support

```javascript
async transaction(callback) {
  const client = await this.pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## Error Handling

### Custom Error Classes

```javascript
class ApplicationError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class ValidationError extends ApplicationError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}
```

### Centralized Error Handler

```javascript
function errorHandler(err, req, res, next) {
  logger.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal server error'
  };
  
  if (err.errors) {
    response.errors = err.errors;
  }
  
  res.status(statusCode).json(response);
}
```

## Security

### Authentication

- JWT-based authentication
- Tokens expire after 24 hours
- Refresh token support
- Email verification (production)

### Authorization

- Role-based access control (RBAC)
- User can only access their own resources
- Admin role for system-wide access

### Data Protection

- Passwords hashed with bcrypt (10 rounds)
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- CORS configuration
- Helmet.js security headers

## Performance Optimization

### Database

- Connection pooling (max 20 connections)
- Indexed columns for frequent queries
- Query optimization
- Pagination for large datasets

### Caching

- In-memory caching for frequently accessed data
- Cache invalidation on updates
- Redis support (future enhancement)

### API

- Response compression
- Rate limiting
- Efficient JSON serialization

## Testing Strategy

### Unit Tests

- Test individual components in isolation
- Mock dependencies
- Focus on business logic
- Coverage target: 80%+

### Integration Tests

- Test module integration
- Use test database
- Test API endpoints
- Verify data flow

### E2E Tests

- Test complete user workflows
- Test authentication flows
- Test data consistency
- Test error scenarios

### Performance Tests

- Load testing
- Stress testing
- Query optimization
- Response time monitoring

## Deployment Architecture

### Development

```
┌─────────────┐
│   Local     │
│  PostgreSQL │
└──────┬──────┘
       │
┌──────▼──────┐
│   Node.js   │
│   Backend   │
└──────┬──────┘
       │
┌──────▼──────┐
│    React    │
│   Frontend  │
└─────────────┘
```

### Production (AWS)

```
┌─────────────────────────────────────────┐
│           CloudFront CDN                 │
│         (Frontend Assets)                │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│              S3 Bucket                   │
│         (Static Frontend)                │
└──────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Application Load Balancer        │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│          ECS/EC2 Instances               │
│         (Node.js Backend)                │
│  ┌──────────┐  ┌──────────┐             │
│  │Instance 1│  │Instance 2│  ...        │
│  └────┬─────┘  └────┬─────┘             │
└───────┼─────────────┼───────────────────┘
        │             │
┌───────▼─────────────▼───────────────────┐
│           AWS RDS PostgreSQL             │
│         (Primary + Read Replica)         │
└──────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

- Stateless application design
- Load balancer distribution
- Multiple backend instances
- Database read replicas

### Vertical Scaling

- Increase instance size
- Optimize database queries
- Increase connection pool size
- Add caching layer

### Future Enhancements

- Microservices architecture
- Event-driven architecture
- Message queue (RabbitMQ/SQS)
- Redis caching
- ElasticSearch for search
- WebSocket for real-time features

## Monitoring and Logging

### Logging

- Structured logging with Winston
- Log levels: error, warn, info, debug
- Correlation IDs for request tracking
- Log aggregation (CloudWatch/ELK)

### Monitoring

- Application metrics
- Database performance
- API response times
- Error rates
- Resource utilization

### Alerting

- Error rate thresholds
- Response time degradation
- Database connection issues
- High resource usage

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable, and testable application. The modular design allows for easy extension and modification, while the layered approach ensures clear separation of concerns and high code quality.
