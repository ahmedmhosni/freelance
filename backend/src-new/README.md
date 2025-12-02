# Backend - Modular Monolith Architecture

## Overview

This backend follows the **Modular Monolith** architecture pattern, providing clear separation of concerns while maintaining the simplicity of a monolithic deployment.

## Structure

```
src-new/
├── modules/              # Business modules (bounded contexts)
│   ├── auth/            # Authentication & Authorization
│   ├── clients/         # Client management
│   ├── projects/        # Project management
│   ├── tasks/           # Task management
│   ├── invoices/        # Invoice management
│   └── ...              # Other modules
├── shared/              # Shared infrastructure
│   ├── database/        # Database connection
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── config/          # Configuration
├── app.js               # Express app setup
└── server.js            # Server entry point
```

## Module Pattern

Each module follows the same structure:

```
modules/[module-name]/
├── controllers/         # HTTP request handlers
├── services/           # Business logic
├── repositories/       # Data access layer
├── models/             # Data models (optional)
├── validators/         # Input validation
└── index.js            # Module routes
```

### Layer Responsibilities

1. **Controller**: Handle HTTP requests/responses
   - Validate input
   - Call service methods
   - Format responses
   - Handle errors

2. **Service**: Business logic
   - Orchestrate operations
   - Apply business rules
   - Call repositories
   - Return data

3. **Repository**: Data access
   - Database queries
   - Data mapping
   - CRUD operations

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 12+

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roastify_local
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=5000
```

### Running

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Auth Module
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Clients Module
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects Module
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks Module
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Invoices Module
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

## Creating a New Module

1. Create module structure:
```bash
mkdir -p modules/[module-name]/{controllers,services,repositories}
```

2. Create controller:
```javascript
// modules/[module-name]/controllers/[module].controller.js
class ModuleController {
  async getAll(req, res, next) {
    try {
      const data = await moduleService.getAll(req.user.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}
```

3. Create service:
```javascript
// modules/[module-name]/services/[module].service.js
class ModuleService {
  async getAll(userId) {
    return await moduleRepository.findByUserId(userId);
  }
}
```

4. Create repository:
```javascript
// modules/[module-name]/repositories/[module].repository.js
class ModuleRepository {
  async findByUserId(userId) {
    const result = await db.query('SELECT * FROM table WHERE user_id = $1', [userId]);
    return result.rows;
  }
}
```

5. Register routes:
```javascript
// modules/[module-name]/index.js
const express = require('express');
const controller = require('./controllers/[module].controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.getAll);

module.exports = router;
```

6. Add to app.js:
```javascript
const moduleRouter = require('./modules/[module-name]');
app.use('/api/[module-name]', moduleRouter);
```

## Testing

```bash
npm test
```

## Best Practices

1. **Keep controllers thin** - Only HTTP handling
2. **Business logic in services** - All business rules
3. **Data access in repositories** - All database queries
4. **Use middleware** - For cross-cutting concerns
5. **Validate input** - Use Joi or similar
6. **Handle errors** - Use error middleware
7. **Log everything** - Use Winston logger

## Error Handling

All errors are handled by the error middleware:

```javascript
// Throw errors in services
throw new Error('Resource not found');

// Middleware catches and formats
app.use(errorHandler);
```

## Authentication

All protected routes use the `authenticate` middleware:

```javascript
router.use(authenticate);
```

JWT tokens are verified and user info is attached to `req.user`.

## Database

PostgreSQL with connection pooling:

```javascript
const db = require('../shared/database');
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## Logging

Winston logger is available:

```javascript
const logger = require('../shared/utils/logger');
logger.info('Something happened');
logger.error('Error occurred', error);
```

## Documentation

- See root `RESTRUCTURE_GUIDE.md` for detailed patterns
- See root `NEW_ARCHITECTURE_README.md` for complete guide
- See root `ARCHITECTURE_DIAGRAM.md` for visual guides

## License

MIT
