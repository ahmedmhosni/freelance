# Design Document

## Overview

This design document outlines the architectural transformation of the freelancer management application from a monolithic route-based structure to a scalable, modular architecture. The refactoring will introduce industry-standard patterns including Repository, Service Layer, and Dependency Injection while maintaining 100% backward compatibility with the existing UI and functionality.

**What Stays the Same:**
- ✅ All existing UI/UX design (Notion-inspired, dark/light themes)
- ✅ All current features and functionality
- ✅ PostgreSQL database (local for dev, AWS RDS for production)
- ✅ React frontend structure
- ✅ Express.js backend framework
- ✅ Authentication and security mechanisms
- ✅ WebSocket real-time features
- ✅ Email system (can use AWS SES or keep current provider)
- ✅ All existing routes continue working during migration

**What Changes:**
- 🔄 Backend code organization (routes → modules)
- 🔄 Separation of concerns (controllers, services, repositories)
- 🔄 Dependency injection for better testability
- 🔄 Consistent error handling
- 🔄 Improved code maintainability and scalability

The transformation will be incremental, allowing the old and new architectures to coexist during migration. This approach minimizes risk and allows for continuous deployment throughout the refactoring process. You can test locally at every step before deploying to production.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                    Hosted on AWS (S3 + CloudFront)          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Feature    │  │   Feature    │  │    Shared    │      │
│  │   Modules    │  │   Modules    │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express on AWS EC2/ECS)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Layer (Controllers)                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ Clients  │  │ Projects │  │ Invoices │  ...      │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Service Layer (Business Logic)             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ Client   │  │ Project  │  │ Invoice  │  ...      │   │
│  │  │ Service  │  │ Service  │  │ Service  │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Repository Layer (Data Access)                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ Client   │  │ Project  │  │ Invoice  │  ...      │   │
│  │  │   Repo   │  │   Repo   │  │   Repo   │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database Layer                    │   │
│  │  ┌────────────────────────────────────────┐          │   │
│  │  │  Connection Pool (pg)                  │          │   │
│  │  │  - Local: PostgreSQL                   │          │   │
│  │  │  - Production: AWS RDS PostgreSQL      │          │   │
│  │  └────────────────────────────────────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

**Backend Structure:**
```
backend/
├── src/
│   ├── core/                      # Core framework code
│   │   ├── container/             # Dependency injection
│   │   ├── database/              # Database abstraction
│   │   ├── errors/                # Custom error classes
│   │   ├── logger/                # Logging utilities
│   │   └── config/                # Configuration management
│   ├── modules/                   # Feature modules
│   │   ├── clients/
│   │   │   ├── controllers/       # HTTP handlers
│   │   │   ├── services/          # Business logic
│   │   │   ├── repositories/      # Data access
│   │   │   ├── models/            # Domain models
│   │   │   ├── validators/        # Input validation
│   │   │   ├── dto/               # Data transfer objects
│   │   │   └── index.js           # Module registration
│   │   ├── projects/
│   │   ├── invoices/
│   │   └── ...
│   ├── shared/                    # Shared utilities
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
│   ├── app.js                     # Express app setup
│   └── server.js                  # Server entry point
```

**Frontend Structure:**
```
frontend/
├── src/
│   ├── features/                  # Feature modules
│   │   ├── clients/
│   │   │   ├── components/        # Feature components
│   │   │   ├── hooks/             # Feature hooks
│   │   │   ├── services/          # API calls
│   │   │   ├── types/             # TypeScript types
│   │   │   └── pages/             # Route pages
│   │   ├── projects/
│   │   ├── invoices/
│   │   └── ...
│   ├── shared/                    # Shared code
│   │   ├── components/            # Reusable components
│   │   ├── hooks/                 # Reusable hooks
│   │   ├── context/               # Global context
│   │   ├── utils/                 # Utilities
│   │   └── types/                 # Shared types
│   ├── App.jsx
│   └── main.jsx
```

## Components and Interfaces

### 1. Dependency Injection Container

The DI container manages service instantiation and dependency resolution.

**Interface:**
```javascript
class Container {
  register(name, factory, options = {})
  resolve(name)
  registerSingleton(name, factory)
  registerTransient(name, factory)
  has(name)
}
```

**Usage Example:**
```javascript
// Registration
container.registerSingleton('database', () => new DatabaseAdapter());
container.registerSingleton('clientRepository', (c) => 
  new ClientRepository(c.resolve('database'))
);
container.registerTransient('clientService', (c) => 
  new ClientService(c.resolve('clientRepository'))
);

// Resolution
const clientService = container.resolve('clientService');
```

### 2. PostgreSQL Database Layer

Provides a clean interface for PostgreSQL database operations with connection pooling.

**Interface:**
```javascript
class Database {
  constructor(config)
  async query(sql, params)
  async queryOne(sql, params)
  async queryMany(sql, params)
  async execute(sql, params)
  async transaction(callback)
  async getClient()
  async releaseClient(client)
  async close()
}
```

**Features:**
- Connection pooling with configurable pool size
- Automatic connection retry with exponential backoff
- Transaction management with automatic rollback
- Query logging in development mode
- Prepared statement support
- Works with both local PostgreSQL and AWS RDS PostgreSQL

### 3. Base Repository

Abstract base class for all repositories.

**Interface:**
```javascript
class BaseRepository {
  constructor(database, tableName)
  async findById(id)
  async findAll(filters = {}, options = {})
  async create(data)
  async update(id, data)
  async delete(id)
  async count(filters = {})
  async exists(id)
}
```

### 4. Base Service

Abstract base class for all services.

**Interface:**
```javascript
class BaseService {
  constructor(repository)
  async getById(id)
  async getAll(filters, options)
  async create(data)
  async update(id, data)
  async delete(id)
}
```

### 5. Base Controller

Abstract base class for all controllers.

**Interface:**
```javascript
class BaseController {
  constructor(service)
  async handleRequest(req, res, next, handler)
  async getAll(req, res, next)
  async getById(req, res, next)
  async create(req, res, next)
  async update(req, res, next)
  async delete(req, res, next)
}
```

### 6. Error Classes

Custom error hierarchy for consistent error handling.

**Classes:**
```javascript
class ApplicationError extends Error
class ValidationError extends ApplicationError
class NotFoundError extends ApplicationError
class UnauthorizedError extends ApplicationError
class ForbiddenError extends ApplicationError
class ConflictError extends ApplicationError
class DatabaseError extends ApplicationError
```

## Migration Strategy

### Incremental Refactoring Approach

The migration will follow a **strangler fig pattern**, where new architecture gradually replaces old code without breaking existing functionality.

**Phase 1: Foundation (Core Infrastructure)**
1. Create new directory structure (`backend/src/core/`, `backend/src/modules/`)
2. Implement DI container
3. Implement PostgreSQL database layer with connection pooling
4. Create base classes (BaseRepository, BaseService, BaseController)
5. Setup error handling infrastructure
6. Configure logging system

**Phase 2: First Module Migration (Clients)**
1. Create `modules/clients/` with full structure
2. Implement ClientRepository using new patterns
3. Implement ClientService with business logic
4. Create ClientController
5. Add validators
6. Keep old `/api/clients` route working
7. Add new route `/api/v2/clients` using new architecture
8. Run both in parallel for testing
9. Switch frontend to new endpoint
10. Remove old route after validation

**Phase 3: Subsequent Modules**
- Repeat Phase 2 for: Projects → Tasks → Invoices → Time Tracking → etc.
- Each module is independent and can be migrated separately
- Old and new routes coexist during migration

**Phase 4: Cleanup**
- Remove old route files
- Remove old database connection code
- Update all frontend API calls
- Remove `/api/v2/` prefix, make it default

### Coexistence Strategy

**During Migration:**
```javascript
// Old route (backend/src/routes/clients.js) - Still works
app.use('/api/clients', oldClientRoutes);

// New route (backend/src/modules/clients/index.js) - New architecture
app.use('/api/v2/clients', container.resolve('clientController').router);
```

**Database Connection:**
- New modules use `container.resolve('database')`
- Old routes continue using existing `db` connection
- Both share same PostgreSQL database
- No data migration needed

### Testing Strategy

**For Each Migrated Module:**
1. Unit tests for repositories (isolated data access)
2. Unit tests for services (business logic)
3. Integration tests comparing old vs new endpoints
4. Load testing to ensure performance
5. Gradual rollout with feature flags

### AWS Deployment Architecture

**Recommended AWS Services:**

1. **Compute:**
   - AWS EC2 (simple, cost-effective) or AWS ECS (containerized)
   - Application Load Balancer for traffic distribution
   - Auto Scaling for handling traffic spikes

2. **Database:**
   - AWS RDS PostgreSQL (managed database)
   - Automated backups and point-in-time recovery
   - Multi-AZ deployment for high availability (optional)

3. **Frontend:**
   - AWS S3 for static file hosting
   - AWS CloudFront CDN for fast global delivery
   - Route 53 for DNS management

4. **Additional Services:**
   - AWS SES for email (or keep current provider)
   - AWS CloudWatch for monitoring and logging
   - AWS Secrets Manager for environment variables
   - AWS S3 for file uploads (invoices, attachments)

**Environment Configuration:**
```javascript
// Local Development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=freelancer_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

// AWS Production
DATABASE_HOST=your-db.xxxxx.us-east-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=freelancer_prod
DATABASE_USER=admin
DATABASE_PASSWORD=secure_password
DATABASE_SSL=true
```

## Data Models

### Domain Models

Domain models represent business entities with behavior.

**Example: Client Model**
```javascript
class Client {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.company = data.company;
    this.notes = data.notes;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  isValid() {
    return this.name && this.name.length > 0;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
```

### Data Transfer Objects (DTOs)

DTOs define the shape of data transferred between layers.

**Example: CreateClientDTO**
```javascript
class CreateClientDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email || null;
    this.phone = data.phone || null;
    this.company = data.company || null;
    this.notes = data.notes || null;
  }
}
```

