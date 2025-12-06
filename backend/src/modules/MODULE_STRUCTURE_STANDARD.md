# Module Structure Standard

This document defines the standardized structure for all modules in the application.

## Overview

All modules follow a consistent directory structure to ensure maintainability, scalability, and ease of understanding. The modular architecture uses dependency injection and follows the Repository pattern for data access.

## Standard Module Structure

```
module-name/
├── controllers/          # HTTP request handlers
│   └── ModuleController.js
├── services/            # Business logic layer
│   └── ModuleService.js
├── repositories/        # Data access layer (optional for modules without entities)
│   └── ModuleRepository.js
├── models/              # Domain models and data structures
│   └── ModuleModel.js
├── dto/                 # Data Transfer Objects (optional)
│   └── ModuleDTO.js
├── validators/          # Input validation (optional)
│   └── moduleValidator.js
└── index.js            # Module registration with DI container
```

## Directory Descriptions

### Required Directories

#### `controllers/`
- **Purpose**: Handle HTTP requests and responses
- **Pattern**: Extend `BaseController` from `shared/base/BaseController.js`
- **Responsibilities**:
  - Route definition
  - Request validation
  - Response formatting
  - Error handling (try-catch with next())
- **Naming**: `{ModuleName}Controller.js` (e.g., `ClientController.js`)

#### `services/`
- **Purpose**: Implement business logic
- **Pattern**: Plain JavaScript classes
- **Responsibilities**:
  - Business rules enforcement
  - Data transformation
  - Orchestration of repository calls
  - Transaction management
- **Naming**: `{ModuleName}Service.js` (e.g., `ClientService.js`)

### Optional Directories

#### `repositories/`
- **Purpose**: Data access layer
- **When to use**: Modules that manage their own database entities
- **Pattern**: Extend `BaseRepository` from `shared/base/BaseRepository.js`
- **Responsibilities**:
  - Database queries
  - CRUD operations
  - Data mapping
- **Naming**: `{ModuleName}Repository.js` (e.g., `ClientRepository.js`)
- **Note**: Modules like `auth` and `reports` that don't manage their own entities may not need repositories

#### `models/`
- **Purpose**: Domain models and data structures
- **When to use**: All modules
- **Responsibilities**:
  - Data structure definitions
  - Domain logic
  - Data validation
- **Naming**: `{EntityName}.js` (e.g., `Client.js`, `UserStats.js`)

#### `dto/`
- **Purpose**: Data Transfer Objects
- **When to use**: Modules with complex data transfer requirements
- **Responsibilities**:
  - Request/response data structures
  - Data transformation
  - API contract definitions
- **Naming**: `{Purpose}DTO.js` (e.g., `CreateClientDTO.js`)

#### `validators/`
- **Purpose**: Input validation logic
- **When to use**: Modules with complex validation requirements
- **Responsibilities**:
  - Input validation rules
  - Custom validators
  - Validation error messages
- **Naming**: `{module}Validator.js` (e.g., `clientValidator.js`)

### Required Files

#### `index.js`
- **Purpose**: Module registration with DI container
- **Required exports**: Registration function
- **Pattern**:

```javascript
const ModuleRepository = require('./repositories/ModuleRepository');
const ModuleService = require('./services/ModuleService');
const ModuleController = require('./controllers/ModuleController');

/**
 * Register Module with DI Container
 * @param {Container} container - Dependency injection container
 */
function registerModuleModule(container) {
  // Register repository (if applicable)
  container.registerSingleton('moduleRepository', (c) => {
    const database = c.resolve('database');
    return new ModuleRepository(database);
  });

  // Register service
  container.registerTransient('moduleService', (c) => {
    const repository = c.resolve('moduleRepository');
    return new ModuleService(repository);
  });

  // Register controller
  container.registerSingleton('moduleController', (c) => {
    const service = c.resolve('moduleService');
    return new ModuleController(service);
  });
}

module.exports = {
  registerModuleModule,
  ModuleRepository,
  ModuleService,
  ModuleController
};
```

## Naming Conventions

### Files
- Controllers: `{ModuleName}Controller.js` (PascalCase)
- Services: `{ModuleName}Service.js` (PascalCase)
- Repositories: `{ModuleName}Repository.js` (PascalCase)
- Models: `{EntityName}.js` (PascalCase)
- DTOs: `{Purpose}DTO.js` (PascalCase)
- Validators: `{module}Validator.js` (camelCase)

### Classes
- Controllers: `class {ModuleName}Controller extends BaseController`
- Services: `class {ModuleName}Service`
- Repositories: `class {ModuleName}Repository extends BaseRepository`
- Models: `class {EntityName}`

### Functions
- Registration: `function register{ModuleName}Module(container)`
- Methods: camelCase (e.g., `getClientById`, `createClient`)

## Module Categories

### Full CRUD Modules
Modules that manage their own entities with full CRUD operations:
- **Structure**: All directories (controllers, services, repositories, models, dto, validators)
- **Examples**: clients, projects, tasks, invoices, time-tracking, admin, notifications

### Service Modules
Modules that provide services without managing entities:
- **Structure**: controllers, services, models (no repositories)
- **Examples**: auth, reports
- **Note**: These modules may use the database directly in services or call other module repositories

## Error Handling Pattern

All controllers must follow this error handling pattern:

```javascript
async methodName(req, res, next) {
  try {
    // Business logic
    const result = await this.service.doSomething();
    res.json(result);
  } catch (error) {
    next(error); // Pass to error handling middleware
  }
}
```

## Dependency Injection Pattern

### Registration Lifetimes

- **Singleton**: One instance for the entire application
  - Use for: Controllers, Repositories
  - Example: `container.registerSingleton('clientController', ...)`

- **Transient**: New instance for each resolution
  - Use for: Services
  - Example: `container.registerTransient('clientService', ...)`

### Resolution Order

1. Database connection
2. Repositories
3. Services
4. Controllers

## Module Verification

Use the audit tool to verify module structure:

```bash
cd backend/audit-tool
node check-module-structure.js
```

This will verify:
- Required directories exist
- Required files exist
- Naming conventions are followed
- Controllers extend BaseController
- Error handling patterns are correct

## Current Module Status

All modules now follow the standardized structure:

| Module | Controllers | Services | Repositories | Models | DTO | Validators |
|--------|------------|----------|--------------|--------|-----|------------|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| auth | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| clients | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| invoices | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| projects | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| reports | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| time-tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Note**: N/A indicates the directory is intentionally not present because the module doesn't require it.

## Adding a New Module

When creating a new module:

1. Create the module directory: `backend/src/modules/{module-name}/`
2. Create required directories: `controllers/`, `services/`, `models/`
3. Create optional directories as needed: `repositories/`, `dto/`, `validators/`
4. Create `index.js` with registration function
5. Implement controller extending `BaseController`
6. Implement service with business logic
7. Implement repository (if managing entities) extending `BaseRepository`
8. Register module in `backend/src/core/bootstrap.js`
9. Run verification: `node backend/audit-tool/check-module-structure.js`

## References

- Base Classes: `backend/src/shared/base/`
- DI Container: `backend/src/core/container/`
- Module Examples: `backend/src/modules/clients/` (full CRUD), `backend/src/modules/auth/` (service)
- Audit Tool: `backend/audit-tool/verifiers/ModuleStructureVerifier.js`
