# Freelance Management API Documentation

## Overview

The Freelance Management API is a RESTful API built with Node.js and Express that provides comprehensive functionality for managing freelance projects, clients, tasks, invoices, and time tracking.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.freelancemanagement.com`

## Interactive Documentation

Visit `/api-docs` for interactive Swagger UI documentation where you can test all endpoints.

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. Register a new user: `POST /api/v2/auth/register`
2. Login: `POST /api/v2/auth/login`
3. Use the returned token in subsequent requests

## API Versioning

The API uses URL versioning. Current version: `v2`

All endpoints are prefixed with `/api/v2/`

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation failed
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

## Error Codes

The API uses specific error codes to help identify issues:

| Error Code | Description | HTTP Status |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `AUTHENTICATION_ERROR` | Authentication failed or token invalid | 401 |
| `AUTHORIZATION_ERROR` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource already exists or conflict | 409 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message",
      "value": "invalid value"
    }
  ],
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/v2/clients"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination using `limit` and `offset` query parameters:

```
GET /api/v2/clients?limit=20&offset=40
```

- `limit`: Number of items to return (default: 10, max: 100)
- `offset`: Number of items to skip (default: 0)

Response includes pagination metadata:

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 40
  }
}
```

## Filtering and Searching

Many endpoints support filtering and searching:

```
GET /api/v2/clients?search=acme
GET /api/v2/projects?status=active&clientId=1
GET /api/v2/tasks?priority=high&status=in-progress
```

## Endpoints Overview

### Authentication

- `POST /api/v2/auth/register` - Register new user
- `POST /api/v2/auth/login` - Login user
- `GET /api/v2/auth/me` - Get current user
- `POST /api/v2/auth/refresh` - Refresh JWT token
- `POST /api/v2/auth/logout` - Logout user

### Clients

- `GET /api/v2/clients` - List all clients
- `POST /api/v2/clients` - Create new client
- `GET /api/v2/clients/:id` - Get client by ID
- `PUT /api/v2/clients/:id` - Update client
- `DELETE /api/v2/clients/:id` - Delete client

### Projects

- `GET /api/v2/projects` - List all projects
- `POST /api/v2/projects` - Create new project
- `GET /api/v2/projects/:id` - Get project by ID
- `PUT /api/v2/projects/:id` - Update project
- `DELETE /api/v2/projects/:id` - Delete project

### Tasks

- `GET /api/v2/tasks` - List all tasks
- `POST /api/v2/tasks` - Create new task
- `GET /api/v2/tasks/:id` - Get task by ID
- `PUT /api/v2/tasks/:id` - Update task
- `DELETE /api/v2/tasks/:id` - Delete task

### Invoices

- `GET /api/v2/invoices` - List all invoices
- `POST /api/v2/invoices` - Create new invoice
- `GET /api/v2/invoices/:id` - Get invoice by ID
- `PUT /api/v2/invoices/:id` - Update invoice
- `DELETE /api/v2/invoices/:id` - Delete invoice

### Time Tracking

- `GET /api/v2/time-tracking` - List all time entries
- `POST /api/v2/time-tracking` - Create new time entry
- `GET /api/v2/time-tracking/:id` - Get time entry by ID
- `PUT /api/v2/time-tracking/:id` - Update time entry
- `DELETE /api/v2/time-tracking/:id` - Delete time entry

### Reports

- `GET /api/v2/reports/time-tracking` - Get time tracking report
- `GET /api/v2/reports/revenue` - Get revenue report
- `GET /api/v2/reports/productivity` - Get productivity report

### Notifications

- `GET /api/v2/notifications` - List all notifications
- `POST /api/v2/notifications` - Create notification
- `PUT /api/v2/notifications/:id/read` - Mark as read
- `DELETE /api/v2/notifications/:id` - Delete notification

### Dashboard

- `GET /api/v2/dashboard` - Get dashboard statistics

### Admin

- `GET /api/v2/admin/stats` - Get system statistics
- `GET /api/v2/admin/users` - List all users
- `PUT /api/v2/admin/users/:id` - Update user

## Example Requests

### Register a New User

```bash
curl -X POST http://localhost:3000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "freelancer"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Create a Client

```bash
curl -X POST http://localhost:3000/api/v2/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "company": "Acme Corporation"
  }'
```

### Get All Projects

```bash
curl -X GET "http://localhost:3000/api/v2/projects?status=active&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a Task

```bash
curl -X POST http://localhost:3000/api/v2/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Design homepage",
    "description": "Create mockups for homepage redesign",
    "projectId": 1,
    "priority": "high",
    "status": "todo",
    "dueDate": "2024-12-31"
  }'
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

### Validation Error (400)

```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

### Authentication Error (401)

```json
{
  "error": "No token provided"
}
```

### Not Found Error (404)

```json
{
  "error": "Resource not found"
}
```

### Server Error (500)

```json
{
  "error": "Internal server error"
}
```

## Best Practices

1. **Always use HTTPS in production**
2. **Store JWT tokens securely** (httpOnly cookies or secure storage)
3. **Implement token refresh** before expiration
4. **Handle rate limiting** gracefully with exponential backoff
5. **Validate input** on the client side before sending requests
6. **Use pagination** for large datasets
7. **Implement proper error handling** for all API calls
8. **Log errors** for debugging and monitoring

## Security

- All passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Email verification required for new accounts (in production)
- SQL injection protection through parameterized queries
- XSS protection through input sanitization
- CORS configured for allowed origins
- Helmet.js for security headers

## Support

For API support, contact: support@freelancemanagement.com

## Changelog

### Version 2.0.0 (Current)

- Complete architecture refactor
- Modular design with dependency injection
- Improved error handling
- Comprehensive test coverage
- Enhanced security features
- Better performance and scalability

### Version 1.0.0

- Initial release
- Basic CRUD operations
- Authentication and authorization
