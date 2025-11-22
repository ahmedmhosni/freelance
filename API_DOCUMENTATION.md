# 📡 API Documentation

Complete API reference for the Freelancer Management Platform.

**Base URL**: `http://localhost:5000/api`  
**Production**: `https://your-domain.com/api`

---

## 🔐 Authentication

All endpoints (except auth) require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

### Register User
```http
POST /auth/register
```

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "freelancer"
}
```

**Response** (201):
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

---

### Login
```http
POST /auth/login
```

**Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
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

---

## 👥 Clients

### Get All Clients
```http
GET /clients?search=acme
```

**Query Parameters**:
- `search` (optional): Search by name, email, or company

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "company": "Acme Corporation",
    "notes": "Important client",
    "tags": "vip,active",
    "created_at": "2025-11-21T10:00:00.000Z",
    "updated_at": "2025-11-21T10:00:00.000Z"
  }
]
```

---

### Get Single Client
```http
GET /clients/:id
```

**Response** (200):
```json
{
  "id": 1,
  "name": "Acme Corp",
  "email": "contact@acme.com",
  ...
}
```

---

### Create Client
```http
POST /clients
```

**Body**:
```json
{
  "name": "New Client",
  "email": "client@example.com",
  "phone": "+1234567890",
  "company": "Client Company",
  "notes": "Some notes",
  "tags": "tag1,tag2"
}
```

**Response** (201):
```json
{
  "id": 2,
  "message": "Client created"
}
```

---

### Update Client
```http
PUT /clients/:id
```

**Body**: Same as Create

**Response** (200):
```json
{
  "message": "Client updated"
}
```

---

### Delete Client
```http
DELETE /clients/:id
```

**Response** (200):
```json
{
  "message": "Client deleted"
}
```

---

## 📁 Projects

### Get All Projects
```http
GET /projects
```

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "client_id": 1,
    "title": "Website Redesign",
    "description": "Complete redesign",
    "status": "active",
    "deadline": "2025-12-31",
    "created_at": "2025-11-21T10:00:00.000Z",
    "updated_at": "2025-11-21T10:00:00.000Z"
  }
]
```

---

### Create Project
```http
POST /projects
```

**Body**:
```json
{
  "client_id": 1,
  "title": "New Project",
  "description": "Project description",
  "status": "active",
  "deadline": "2025-12-31"
}
```

**Status Options**: `active`, `completed`, `on-hold`, `cancelled`

**Response** (201):
```json
{
  "id": 2,
  "message": "Project created"
}
```

---

### Update Project
```http
PUT /projects/:id
```

**Body**: Same as Create

---

### Delete Project
```http
DELETE /projects/:id
```

---

## ✅ Tasks

### Get All Tasks
```http
GET /tasks
```

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "project_id": 1,
    "title": "Design mockups",
    "description": "Create initial designs",
    "priority": "high",
    "status": "in-progress",
    "due_date": "2025-11-30",
    "comments": null,
    "created_at": "2025-11-21T10:00:00.000Z",
    "updated_at": "2025-11-21T10:00:00.000Z"
  }
]
```

---

### Create Task
```http
POST /tasks
```

**Body**:
```json
{
  "project_id": 1,
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "status": "todo",
  "due_date": "2025-12-01",
  "comments": "Some comments"
}
```

**Priority Options**: `low`, `medium`, `high`, `urgent`  
**Status Options**: `todo`, `in-progress`, `review`, `done`

---

### Update Task
```http
PUT /tasks/:id
```

**Body**: Same as Create

---

### Delete Task
```http
DELETE /tasks/:id
```

---

## 💰 Invoices

### Get All Invoices
```http
GET /invoices
```

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "project_id": 1,
    "client_id": 1,
    "invoice_number": "INV-001",
    "amount": 5000.00,
    "status": "sent",
    "due_date": "2025-12-01",
    "sent_date": "2025-11-21",
    "paid_date": null,
    "notes": "First milestone",
    "created_at": "2025-11-21T10:00:00.000Z",
    "updated_at": "2025-11-21T10:00:00.000Z"
  }
]
```

---

### Create Invoice
```http
POST /invoices
```

**Body**:
```json
{
  "project_id": 1,
  "client_id": 1,
  "invoice_number": "INV-002",
  "amount": 3000.00,
  "status": "draft",
  "due_date": "2025-12-15",
  "notes": "Second milestone"
}
```

**Status Options**: `draft`, `sent`, `paid`, `overdue`, `cancelled`

---

### Update Invoice
```http
PUT /invoices/:id
```

**Body**: Same as Create + optional `sent_date`, `paid_date`

---

### Delete Invoice
```http
DELETE /invoices/:id
```

---

### Generate PDF
```http
GET /invoices/:id/pdf
```

**Response**: PDF file download

---

## ⏱️ Time Tracking

### Get Time Entries
```http
GET /time-tracking?task_id=1&project_id=1&start_date=2025-11-01&end_date=2025-11-30
```

**Query Parameters** (all optional):
- `task_id`: Filter by task
- `project_id`: Filter by project
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "task_id": 1,
    "project_id": 1,
    "description": "Working on designs",
    "date": "2025-11-21",
    "start_time": "09:00:00",
    "end_time": "12:30:00",
    "duration": 3.5,
    "is_running": 0,
    "created_at": "2025-11-21T09:00:00.000Z"
  }
]
```

---

### Start Timer
```http
POST /time-tracking/start
```

**Body**:
```json
{
  "task_id": 1,
  "project_id": 1,
  "description": "Working on feature X"
}
```

**Response** (201):
```json
{
  "id": 2,
  "message": "Time tracking started"
}
```

---

### Stop Timer
```http
POST /time-tracking/stop/:id
```

**Response** (200):
```json
{
  "message": "Time tracking stopped",
  "duration": 2.5
}
```

---

### Get Summary
```http
GET /time-tracking/summary?start_date=2025-11-01&end_date=2025-11-30
```

**Response** (200):
```json
{
  "total_hours": 45.5,
  "total_entries": 23
}
```

---

## 📊 Dashboard

### Get Dashboard Statistics
```http
GET /dashboard/stats
```

**Response** (200):
```json
{
  "clients": 15,
  "projects": 8,
  "activeProjects": 5,
  "tasks": 42,
  "activeTasks": 28,
  "invoices": 12,
  "pendingInvoices": 3,
  "totalRevenue": 45000.00
}
```

---

### Get Recent Tasks
```http
GET /dashboard/recent-tasks?limit=5
```

**Query Parameters**:
- `limit` (optional): Number of tasks to return (default: 5)

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "project_id": 2,
    "title": "Design mockups",
    "description": "Create initial design mockups",
    "priority": "high",
    "status": "in-progress",
    "due_date": "2025-11-30",
    "project_name": "Website Redesign",
    "created_at": "2025-11-20T10:00:00.000Z",
    "updated_at": "2025-11-20T10:00:00.000Z"
  }
]
```

---

### Get Chart Data
```http
GET /dashboard/charts
```

**Response** (200):
```json
{
  "taskData": [
    { "name": "todo", "value": 10 },
    { "name": "in progress", "value": 8 },
    { "name": "review", "value": 5 },
    { "name": "done", "value": 19 }
  ],
  "invoiceData": [
    { "name": "Draft", "count": 2 },
    { "name": "Sent", "count": 3 },
    { "name": "Paid", "count": 7 }
  ]
}
```

---

## 📊 Reports

### Financial Report
```http
GET /reports/financial?start_date=2025-11-01&end_date=2025-11-30
```

**Response** (200):
```json
{
  "totalInvoices": 10,
  "totalRevenue": 25000.00,
  "pendingAmount": 5000.00,
  "overdueAmount": 1000.00,
  "byStatus": {
    "draft": 2,
    "sent": 3,
    "paid": 4,
    "overdue": 1,
    "cancelled": 0
  },
  "invoices": [...]
}
```

---

### Project Report
```http
GET /reports/projects
```

**Response** (200):
```json
{
  "totalProjects": 5,
  "byStatus": {
    "active": 3,
    "completed": 1,
    "on-hold": 1,
    "cancelled": 0
  },
  "totalTasks": 25,
  "tasksByStatus": {
    "todo": 5,
    "in-progress": 10,
    "review": 5,
    "done": 5
  },
  "projects": [...]
}
```

---

### Client Report
```http
GET /reports/clients
```

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "company": "Acme Corporation",
    "projectCount": 3,
    "invoiceCount": 5,
    "totalRevenue": 15000.00
  }
]
```

---

## 🔔 Notifications

### Get Notifications
```http
GET /notifications
```

**Response** (200):
```json
[
  {
    "type": "task_due",
    "title": "Task Due Soon",
    "message": "Task 'Design mockups' is due on 11/30/2025",
    "date": "2025-11-30",
    "priority": "high"
  },
  {
    "type": "invoice_overdue",
    "title": "Invoice Overdue",
    "message": "Invoice INV-001 is overdue",
    "date": "2025-11-20",
    "priority": "urgent"
  }
]
```

---

## 📁 Files

### Get File Metadata
```http
GET /files
```

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "project_id": 1,
    "file_name": "design.pdf",
    "cloud_provider": "google_drive",
    "file_link": "https://drive.google.com/...",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "created_at": "2025-11-21T10:00:00.000Z"
  }
]
```

---

### Store File Metadata
```http
POST /files
```

**Body**:
```json
{
  "project_id": 1,
  "file_name": "document.pdf",
  "cloud_provider": "dropbox",
  "file_link": "https://dropbox.com/...",
  "file_size": 2048000,
  "mime_type": "application/pdf"
}
```

---

### Connect Cloud Storage
```http
POST /files/connect
```

**Body**:
```json
{
  "provider": "google_drive",
  "oauth_token": "ya29.a0AfH6..."
}
```

---

## ⚙️ Admin (Admin Only)

### Get All Users
```http
GET /admin/users
```

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "freelancer",
    "created_at": "2025-11-21T10:00:00.000Z"
  }
]
```

---

### Get User Details
```http
GET /admin/users/:id
```

**Response** (200):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "freelancer",
    "created_at": "2025-11-21T10:00:00.000Z"
  },
  "stats": {
    "clients": { "count": 5 },
    "projects": { "count": 3 },
    "tasks": { "count": 15 },
    "invoices": { "count": 8 }
  }
}
```

---

### Update User Role
```http
PUT /admin/users/:id/role
```

**Body**:
```json
{
  "role": "admin"
}
```

---

### Delete User
```http
DELETE /admin/users/:id
```

---

### System Reports
```http
GET /admin/reports
```

**Response** (200):
```json
{
  "users": 10,
  "projects": 25,
  "invoices": 50,
  "revenue": 125000.00
}
```

---

### Activity Logs
```http
GET /admin/logs
```

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "action": "CREATE",
    "entity_type": "client",
    "entity_id": 5,
    "details": "{\"method\":\"POST\",\"path\":\"/api/clients\"}",
    "ip_address": "192.168.1.1",
    "created_at": "2025-11-21T10:00:00.000Z"
  }
]
```

---

## 🏥 Health Check

### Check API Status
```http
GET /health
```

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notes

### Rate Limiting
- Currently not implemented
- Recommended: 100 requests per 15 minutes per user

### Pagination
- Currently returns all results
- Recommended: Add `?page=1&limit=20` for large datasets

### Sorting
- Currently sorted by `created_at DESC`
- Can be enhanced with `?sort=name&order=asc`

### Filtering
- Basic filtering implemented
- Can be enhanced with more operators

---

## 🔒 Security

### Headers Required
```
Authorization: Bearer <token>
Content-Type: application/json
```

### CORS
- Configured for frontend origin
- Update in production

### HTTPS
- Required in production
- Use SSL certificates

---

## 🧪 Testing

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get clients (with token)
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Import collection
2. Set environment variables
3. Test endpoints

---

**API Version**: 1.1.0  
**Last Updated**: November 21, 2025  
**Base URL**: http://localhost:5000/api
