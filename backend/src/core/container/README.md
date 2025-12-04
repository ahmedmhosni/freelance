# Dependency Injection Container

A lightweight dependency injection container for managing service lifecycles and dependencies.

## Features

- **Singleton Lifecycle**: Single instance shared across all resolutions
- **Transient Lifecycle**: New instance created for each resolution
- **Circular Dependency Detection**: Automatically detects and reports circular dependencies
- **Type Safety**: Validates service names and factory functions
- **Error Handling**: Provides clear error messages with context

## Usage

### Basic Registration and Resolution

```javascript
const { Container } = require('./core/container');

const container = new Container();

// Register a service
container.register('database', () => {
  return new Database();
});

// Resolve a service
const db = container.resolve('database');
```

### Singleton Services

Singleton services are instantiated once and the same instance is returned for all resolutions:

```javascript
// Register as singleton
container.registerSingleton('database', () => {
  return new Database();
});

const db1 = container.resolve('database');
const db2 = container.resolve('database');

console.log(db1 === db2); // true - same instance
```

### Transient Services

Transient services create a new instance for each resolution:

```javascript
// Register as transient
container.registerTransient('userService', (c) => {
  const db = c.resolve('database');
  return new UserService(db);
});

const service1 = container.resolve('userService');
const service2 = container.resolve('userService');

console.log(service1 === service2); // false - different instances
```

### Dependency Injection

Services can depend on other services by resolving them in the factory function:

```javascript
// Register dependencies
container.registerSingleton('database', () => new Database());

container.registerSingleton('userRepository', (c) => {
  const db = c.resolve('database');
  return new UserRepository(db);
});

container.registerTransient('userService', (c) => {
  const repo = c.resolve('userRepository');
  return new UserService(repo);
});

// Resolve with automatic dependency injection
const userService = container.resolve('userService');
```

### Complex Dependency Chains

```javascript
container.registerSingleton('config', () => ({
  dbUrl: 'localhost:5432'
}));

container.registerSingleton('database', (c) => {
  const config = c.resolve('config');
  return new Database(config.dbUrl);
});

container.registerSingleton('userRepository', (c) => {
  const db = c.resolve('database');
  return new UserRepository(db);
});

container.registerSingleton('postRepository', (c) => {
  const db = c.resolve('database');
  return new PostRepository(db);
});

container.registerTransient('userService', (c) => {
  const userRepo = c.resolve('userRepository');
  const postRepo = c.resolve('postRepository');
  return new UserService(userRepo, postRepo);
});
```

### Circular Dependency Detection

The container automatically detects circular dependencies:

```javascript
container.register('serviceA', (c) => {
  return { b: c.resolve('serviceB') };
});

container.register('serviceB', (c) => {
  return { a: c.resolve('serviceA') };
});

// This will throw: "Circular dependency detected: serviceA -> serviceB -> serviceA"
container.resolve('serviceA');
```

### Utility Methods

```javascript
// Check if service is registered
if (container.has('database')) {
  const db = container.resolve('database');
}

// Get all registered service names
const services = container.getRegisteredServices();
console.log(services); // ['database', 'userRepository', 'userService']

// Clear all registrations (useful for testing)
container.clear();
```

## Best Practices

1. **Use Singletons for Stateful Services**: Database connections, configuration, loggers
2. **Use Transients for Stateless Services**: Controllers, services with request-specific data
3. **Register Dependencies First**: Register lower-level dependencies before higher-level ones
4. **Avoid Circular Dependencies**: Design services to have clear dependency hierarchies
5. **Use Descriptive Names**: Use clear, consistent naming for services

## Example: Complete Application Setup

```javascript
const { Container } = require('./core/container');
const Database = require('./core/database/Database');
const ClientRepository = require('./modules/clients/repositories/ClientRepository');
const ClientService = require('./modules/clients/services/ClientService');
const ClientController = require('./modules/clients/controllers/ClientController');

// Create container
const container = new Container();

// Register core services
container.registerSingleton('database', () => {
  return new Database({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
});

// Register repositories
container.registerSingleton('clientRepository', (c) => {
  const db = c.resolve('database');
  return new ClientRepository(db);
});

// Register services
container.registerTransient('clientService', (c) => {
  const repo = c.resolve('clientRepository');
  return new ClientService(repo);
});

// Register controllers
container.registerSingleton('clientController', (c) => {
  const service = c.resolve('clientService');
  return new ClientController(service);
});

// Use in Express
const app = express();
const clientController = container.resolve('clientController');
app.use('/api/clients', clientController.router);
```

## Testing

The container is fully tested with Jest. Run tests with:

```bash
npm test -- Container.test.js
```

Tests cover:
- Service registration and resolution
- Singleton vs transient lifecycles
- Dependency injection
- Circular dependency detection
- Error handling
- Utility methods
