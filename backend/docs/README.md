# Documentation Index

Welcome to the Freelance Management API documentation! This directory contains comprehensive documentation for developers, architects, and API consumers.

## 📚 Documentation Overview

### For API Consumers

- **[API Documentation](./API.md)** - Complete REST API reference with examples
  - Authentication
  - Endpoints
  - Request/Response formats
  - Error handling
  - Rate limiting

### For Developers

- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Onboarding guide for new developers
  - Getting started
  - Project structure
  - Development workflow
  - Creating new features
  - Testing
  - Troubleshooting

- **[JSDoc Style Guide](./JSDOC_STYLE_GUIDE.md)** - Code documentation standards
  - JSDoc syntax
  - Examples
  - Best practices
  - IDE integration

### For Architects

- **[Architecture Documentation](./ARCHITECTURE.md)** - System architecture overview
  - High-level architecture
  - Layer responsibilities
  - Module structure
  - Database design
  - Security
  - Scalability

- **[Architecture Decision Records (ADRs)](./adr/)** - Important architectural decisions
  - [ADR 001: Modular Architecture](./adr/001-modular-architecture.md)
  - [ADR 002: PostgreSQL Over SQLite](./adr/002-postgresql-over-sqlite.md)
  - [ADR 003: JWT Authentication](./adr/003-jwt-authentication.md)

## 🚀 Quick Start

### For API Users

1. Read the [API Documentation](./API.md)
2. Get your API key by registering
3. Start making requests!

### For Developers

1. Read the [Developer Guide](./DEVELOPER_GUIDE.md)
2. Set up your development environment
3. Explore the codebase
4. Pick a task and start coding!

### For Architects

1. Review the [Architecture Documentation](./ARCHITECTURE.md)
2. Read the [ADRs](./adr/) to understand key decisions
3. Understand the system design and patterns

## 📖 Interactive Documentation

Visit `/api-docs` when running the application locally to access the interactive Swagger UI documentation where you can:

- Browse all API endpoints
- See request/response schemas
- Test endpoints directly from the browser
- View authentication requirements

```bash
# Start the server
npm run dev

# Open browser
http://localhost:3000/api-docs
```

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                    (React Frontend)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                    API Gateway Layer                         │
│              (Express.js + Middleware)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Controller Layer                           │
│         (HTTP Request/Response Handling)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Service Layer                             │
│              (Business Logic)                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Repository Layer                            │
│              (Data Access Logic)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Database Layer                            │
│              (PostgreSQL Connection Pool)                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Concepts

### Modular Architecture

The application is organized into feature modules, each containing:
- **Controllers**: Handle HTTP requests
- **Services**: Implement business logic
- **Repositories**: Manage data access
- **Models**: Define domain entities
- **DTOs**: Data transfer objects
- **Validators**: Input validation

### Dependency Injection

All components use dependency injection for:
- Loose coupling
- Easy testing
- Flexible configuration
- Clear dependencies

### Layered Design

Clear separation of concerns:
- **Presentation Layer**: Controllers
- **Business Layer**: Services
- **Data Layer**: Repositories
- **Infrastructure**: Database, logging, config

## 📝 Code Examples

### Creating a Client

```javascript
// API Request
POST /api/v2/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+1234567890"
}

// Response
{
  "id": 1,
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Service Implementation

```javascript
class ClientService extends BaseService {
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

## 🧪 Testing

The application has comprehensive test coverage:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test module integration
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Load and stress testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:perf

# Run with coverage
npm run test:coverage
```

## 🔒 Security

Security is built into every layer:

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Express-validator
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **HTTPS**: Required in production
- **Rate Limiting**: Prevent abuse
- **Security Headers**: Helmet.js

## 📊 Monitoring

The application includes comprehensive logging and monitoring:

- **Structured Logging**: Winston with correlation IDs
- **Error Tracking**: Centralized error handling
- **Performance Metrics**: Response time tracking
- **Database Monitoring**: Query logging and optimization

## 🚢 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker

```bash
docker-compose up
```

### AWS

See deployment documentation for AWS-specific setup.

## 🤝 Contributing

1. Read the [Developer Guide](./DEVELOPER_GUIDE.md)
2. Follow the [JSDoc Style Guide](./JSDOC_STYLE_GUIDE.md)
3. Write tests for new features
4. Update documentation
5. Submit pull request

## 📞 Support

- **Documentation Issues**: Create a GitHub issue
- **API Questions**: Check [API Documentation](./API.md)
- **Development Help**: See [Developer Guide](./DEVELOPER_GUIDE.md)
- **Architecture Questions**: Review [Architecture Documentation](./ARCHITECTURE.md)

## 📜 License

MIT License - See LICENSE file for details

## 🔄 Version History

### Version 2.0.0 (Current)

- Complete architecture refactor
- Modular design with dependency injection
- PostgreSQL database
- Comprehensive test coverage
- Enhanced security
- Improved performance

### Version 1.0.0

- Initial release
- Basic CRUD operations
- SQLite database
- Simple authentication

---

**Last Updated**: December 2024

**Maintained By**: Development Team

**Questions?** Open an issue or contact the team!
