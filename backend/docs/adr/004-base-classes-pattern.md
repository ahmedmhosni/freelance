# ADR 004: Base Classes Pattern

## Status

Accepted

## Context

With a modular architecture, we noticed significant code duplication across modules:
- Every repository implemented the same CRUD operations
- Every service had similar validation and error handling patterns
- Every controller had repetitive request/response handling

We needed a way to:
- Reduce code duplication
- Ensure consistency across modules
- Make it easier to add new modules
- Maintain common functionality in one place

## Decision

We will implement **abstract base classes** for Repository, Service, and Controller layers.

### Base Classes:

1. **BaseRepository**: Common data access operations
2. **BaseService**: Common business logic patterns
3. **BaseController**: Common HTTP handling

### BaseRepository Implementation:

```javascript
class BaseRepository {
  constructor(database, tableName) {
    this.database = database;
    this.tableName = tableName;
  }

  async findById(id) { /* ... */ }
  async findAll(filters, options) { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
  async count(filters) { /* ... */ }
  async exists(id) { /* ... */ }
}
```

### BaseService Implementation:

```javascript
class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async getById(id) { /* ... */ }
  async getAll(filters, options) { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
}
```

### BaseController Implementation:

```javascript
class BaseController {
  constructor(service) {
    this.service = service;
    this.router = express.Router();
    this.setupRoutes();
  }

  async handleRequest(req, res, next, handler) { /* ... */ }
  async getAll(req, res, next) { /* ... */ }
  async getById(req, res, next) { /* ... */ }
  async create(req, res, next) { /* ... */ }
  async update(req, res, next) { /* ... */ }
  async delete(req, res, next) { /* ... */ }
}
```

## Consequences

### Positive:

- **DRY Principle**: Eliminates code duplication across modules
- **Consistency**: All modules behave consistently
- **Maintainability**: Bug fixes in base classes benefit all modules
- **Rapid Development**: New modules can be created quickly
- **Testing**: Base classes can be thoroughly tested once
- **Standards**: Enforces architectural patterns

### Negative:

- **Flexibility**: Less flexibility for modules with unique requirements
- **Complexity**: Adds abstraction layer
- **Learning Curve**: Developers need to understand inheritance
- **Tight Coupling**: Modules coupled to base class implementations

### Mitigation:

- Allow modules to override base methods when needed
- Keep base classes focused and minimal
- Document base class behavior clearly
- Provide examples of extending base classes

## Usage Example

### Creating a New Repository:

```javascript
class ClientRepository extends BaseRepository {
  constructor(database) {
    super(database, 'clients');
  }

  // Override base method if needed
  mapToModel(row) {
    return new Client({
      id: row.id,
      name: row.name,
      email: row.email,
      userId: row.user_id
    });
  }

  // Add custom methods
  async findByUserId(userId, options) {
    const query = 'SELECT * FROM clients WHERE user_id = $1';
    const rows = await this.database.queryMany(query, [userId]);
    return rows.map(row => this.mapToModel(row));
  }
}
```

### Creating a New Service:

```javascript
class ClientService extends BaseService {
  constructor(clientRepository) {
    super(clientRepository);
  }

  // Add custom business logic
  async getAllForUser(userId, options) {
    const clients = await this.repository.findByUserId(userId, options);
    const total = await this.repository.countByUserId(userId);
    
    return {
      data: clients.map(client => client.toDTO()),
      meta: { total, limit: options.limit, offset: options.offset }
    };
  }
}
```

### Creating a New Controller:

```javascript
class ClientController extends BaseController {
  constructor(clientService) {
    super(clientService);
  }

  setupRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.put('/:id', this.update.bind(this));
    this.router.delete('/:id', this.delete.bind(this));
  }

  // Override if custom behavior needed
  async getAll(req, res, next) {
    try {
      const { limit = 10, offset = 0, search } = req.query;
      const userId = req.user.id;
      
      const result = await this.service.getAllForUser(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        search
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
```

## Alternatives Considered

### 1. Composition Over Inheritance

**Pros**: More flexible, avoids inheritance issues
**Cons**: More boilerplate, less consistent

### 2. Mixins

**Pros**: Can mix multiple behaviors
**Cons**: JavaScript doesn't have native mixin support, can be confusing

### 3. Utility Functions

**Pros**: Simple, no inheritance
**Cons**: Doesn't enforce structure, easy to forget to use

### 4. Code Generators

**Pros**: Generates complete code, no runtime overhead
**Cons**: Generated code can diverge, harder to update

## Extension Points

Base classes provide several extension points:

1. **Method Overriding**: Override any base method
2. **Custom Methods**: Add module-specific methods
3. **Hooks**: Pre/post operation hooks (future enhancement)
4. **Validation**: Custom validation logic
5. **Error Handling**: Custom error handling

## Testing Strategy

### Base Class Tests:

- Test all base methods thoroughly
- Test error handling
- Test edge cases

### Module Tests:

- Test custom methods
- Test overridden methods
- Mock base class dependencies

## Future Enhancements

1. **Lifecycle Hooks**: beforeCreate, afterCreate, etc.
2. **Validation Decorators**: @Validate() decorators for methods
3. **Caching Layer**: Built-in caching in base classes
4. **Audit Logging**: Automatic audit logging in base classes
5. **Soft Delete**: Built-in soft delete support

## References

- [Template Method Pattern](https://refactoring.guru/design-patterns/template-method)
- [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [Composition vs Inheritance](https://www.thoughtworks.com/insights/blog/composition-vs-inheritance-how-choose)

