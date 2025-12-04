# Feature Modules

This directory contains self-contained feature modules following the new scalable architecture pattern.

## Module Structure

Each module should follow this structure:

```
module-name/
├── controllers/       # HTTP request handlers
├── services/          # Business logic layer
├── repositories/      # Data access layer
├── models/            # Domain models
├── validators/        # Input validation
├── dto/               # Data Transfer Objects
└── index.js           # Module registration
```

## Module Pattern

1. **Controllers** handle HTTP requests/responses and delegate to services
2. **Services** contain business logic and orchestrate operations
3. **Repositories** encapsulate all database access
4. **Models** represent domain entities with behavior
5. **Validators** validate input before reaching controllers
6. **DTOs** define data shapes for API requests/responses

## Dependency Injection

All modules use the DI container from `/core/container/` for dependency management. This enables:
- Loose coupling between components
- Easy testing with mock dependencies
- Clear dependency graphs

## Migration Strategy

Modules are migrated incrementally from the old `/routes/` structure. During migration:
- Old routes continue working at `/api/*`
- New modules are mounted at `/api/v2/*`
- Both coexist until migration is complete
