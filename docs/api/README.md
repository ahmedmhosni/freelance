# 🔌 Roastify API Documentation

Complete API reference for the Roastify freelance management system.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [WebSocket Events](#websocket-events)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

## 🚀 Getting Started

### Base URL

**Production**: `https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net`
**Development**: `http://localhost:5000`

### API Version

Current version: `v1` (no version prefix in URLs yet)

### Content Type

All requests and responses use `application/json`

### Headers

```http
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

## 🔐 Authentication

### Register

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "freelancer"
}
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

### Login

Authenticate and receive a JWT token.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "freelancer"
  }
}
```

### Get Current User

Get the authenticated user's information.

**Endpoint**: `GET /api/auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "freelancer"
}
```

## 📚 API Endpoints

### Clients

#### Get All Clients
```http
GET /api/clients
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1234567890",
      "company": "Acme Corporation",
      "address": "123 Main St",
      "notes": "Important client",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Get Single Client
```http
GET /api/clients/:id
Authorization: Bearer <token>
```

#### Create Client
```http
POST /api/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "company": "Acme Corporation",
  "address": "123 Main St",
  "notes": "Important client"
}
```

#### Update Client
```http
PUT /api/clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@acme.com"
}
```

#### Delete Client
```http
DELETE /api/clients/:id
Authorization: Bearer <token>
```

### Projects

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

#### Get Single Project
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete website overhaul",
  "client_id": 1,
  "status": "active",
  "budget": 5000.00,
  "start_date": "2024-01-01",
  "end_date": "2024-03-31"
}
```

#### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
```

#### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

**Query Parameters**:
- `project_id` (optional): Filter by project
- `status` (optional): Filter by status (todo, in-progress, done)
- `priority` (optional): Filter by priority (low, medium, high, urgent)

#### Get Single Task
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design homepage",
  "description": "Create mockups for homepage",
  "project_id": 1,
  "assigned_to": 2,
  "status": "todo",
  "priority": "high",
  "due_date": "2024-01-15"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### Invoices

#### Get All Invoices
```http
GET /api/invoices
Authorization: Bearer <token>
```

#### Get Single Invoice
```http
GET /api/invoices/:id
Authorization: Bearer <token>
```

#### Create Invoice
```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "invoice_number": "INV-001",
  "client_id": 1,
  "project_id": 1,
  "amount": 1000.00,
  "tax": 100.00,
  "total": 1100.00,
  "status": "draft",
  "issue_date": "2024-01-01",
  "due_date": "2024-01-31",
  "notes": "Payment terms: Net 30",
  "items": [
    {
      "description": "Website Design",
      "quantity": 1,
      "rate": 1000.00,
      "amount": 1000.00
    }
  ]
}
```

#### Update Invoice
```http
PUT /api/invoices/:id
Authorization: Bearer <token>
```

#### Delete Invoice
```http
DELETE /api/invoices/:id
Authorization: Bearer <token>
```

### Time Tracking

#### Get Time Entries
```http
GET /api/time-tracking
Authorization: Bearer <token>
```

**Query Parameters**:
- `project_id` (optional): Filter by project
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

#### Start Timer
```http
POST /api/time-tracking/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": 1,
  "task_id": 5,
  "description": "Working on homepage design"
}
```

#### Stop Timer
```http
POST /api/time-tracking/stop/:id
Authorization: Bearer <token>
```

#### Create Manual Entry
```http
POST /api/time-tracking
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": 1,
  "task_id": 5,
  "description": "Design work",
  "start_time": "2024-01-01T09:00:00Z",
  "end_time": "2024-01-01T11:00:00Z",
  "duration": 7200,
  "is_billable": true
}
```

### Dashboard

#### Get Dashboard Stats
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "clients": 25,
  "projects": 12,
  "tasks": 48,
  "totalRevenue": 45000.00,
  "activeProjects": 8,
  "activeTasks": 23,
  "pendingInvoices": 5
}
```

#### Get Recent Tasks
```http
GET /api/dashboard/recent-tasks
Authorization: Bearer <token>
```

### Reports

#### Get Revenue Report
```http
GET /api/reports/revenue
Authorization: Bearer <token>
```

**Query Parameters**:
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)

#### Get Time Report
```http
GET /api/reports/time
Authorization: Bearer <token>
```

#### Get Project Report
```http
GET /api/reports/projects
Authorization: Bearer <token>
```

### Notifications

#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

### Quotes (Motivational)

#### Get Daily Quote
```http
GET /api/quotes/daily
```
*Note: This endpoint is public (no authentication required)*

#### Get All Quotes (Admin Only)
```http
GET /api/quotes
Authorization: Bearer <token>
```

#### Create Quote (Admin Only)
```http
POST /api/quotes
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Success is not final, failure is not fatal.",
  "author": "Winston Churchill",
  "is_active": true
}
```

### Maintenance Mode

#### Get Maintenance Status
```http
GET /api/maintenance/status
```
*Note: This endpoint is public*

**Response**:
```json
{
  "is_active": false
}
```

#### Get Maintenance Content
```http
GET /api/maintenance
```

#### Update Maintenance (Admin Only)
```http
PUT /api/maintenance
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "We'll be back soon!",
  "subtitle": "System Maintenance",
  "message": "We're upgrading our systems...",
  "launch_date": "2024-01-15",
  "is_active": true
}
```

## 🔌 WebSocket Events

### Connection

```javascript
const socket = io('https://your-backend-url');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Join user's room
  socket.emit('join', userId);
});
```

### Events

#### Notification Received
```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
  // data: { id, title, message, type, created_at }
});
```

#### Task Updated
```javascript
socket.on('task_updated', (data) => {
  console.log('Task updated:', data);
  // data: { taskId, status, updatedBy }
});
```

## ❌ Error Handling

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Authentication required or failed)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `409` - Conflict (Resource already exists)
- `500` - Internal Server Error (Server error)

### Common Errors

#### Authentication Error
```json
{
  "error": "Invalid credentials"
}
```

#### Validation Error
```json
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### Not Found Error
```json
{
  "error": "Client not found"
}
```

## ⚡ Rate Limiting

Currently, there is no rate limiting implemented. This will be added in a future update.

**Planned limits**:
- 100 requests per minute per user
- 1000 requests per hour per user

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values are in decimal format (e.g., 1000.00)
- Pagination is available on list endpoints
- Soft deletes are used (resources are marked as deleted, not removed)

## 🔄 Changelog

### Version 1.0.0 (Current)
- Initial API release
- Authentication endpoints
- CRUD operations for all resources
- WebSocket support
- Maintenance mode API

---

**Last Updated**: ${new Date().toLocaleDateString()}
**API Version**: 1.0.0

For questions or issues, please [create an issue](https://github.com/ahmedmhosni/freelance/issues) on GitHub.
