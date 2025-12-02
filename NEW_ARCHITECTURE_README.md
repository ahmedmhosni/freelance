# New Architecture - Complete Guide

## 🎯 Overview

تم إعادة هيكلة المشروع بالكامل باستخدام:
- **Backend**: Modular Monolith Architecture
- **Frontend**: Feature-based React Architecture

## 📊 Current Status

### ✅ Completed

#### Backend Modules (3/14)
- ✅ **Auth** - Complete with authentication & authorization
- ✅ **Clients** - Full CRUD operations
- ✅ **Projects** - Full CRUD with filtering

#### Frontend Features (3/14)
- ✅ **Auth** - Login, Register, Password Reset
- ✅ **Clients** - Complete client management
- ✅ **Projects** - Project management with hooks

#### Shared Infrastructure
- ✅ Database connection (PostgreSQL)
- ✅ Middleware (Auth, Error Handler)
- ✅ Logger utility
- ✅ API client with interceptors
- ✅ Shared components (Button, Modal, LoadingSpinner, ErrorMessage)
- ✅ Shared hooks (useDebounce, useLocalStorage)
- ✅ Shared utilities (formatters, validators)

### ⏳ Pending

#### Backend Modules (11/14)
- Tasks
- Invoices
- Quotes
- Time Tracking
- Reports
- Dashboard
- Admin
- Announcements
- Changelog
- Feedback
- Notifications
- Status

#### Frontend Features (11/14)
- Tasks
- Invoices
- Quotes
- Time Tracking
- Reports
- Dashboard
- Admin
- Announcements
- Changelog
- Profile
- Home

## 🏗️ Architecture

### Backend Structure

```
backend/src-new/
├── modules/                    # Business modules
│   ├── auth/                   # ✅ Authentication
│   │   ├── controllers/        # HTTP handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access
│   │   ├── validators/         # Input validation
│   │   └── index.js            # Routes
│   ├── clients/                # ✅ Client management
│   ├── projects/               # ✅ Project management
│   └── ...                     # Other modules
├── shared/                     # Shared infrastructure
│   ├── database/               # DB connection
│   ├── middleware/             # Express middleware
│   ├── utils/                  # Utilities
│   └── config/                 # Configuration
├── app.js                      # Express setup
└── server.js                   # Entry point
```

### Frontend Structure

```
frontend/src-new/
├── features/                   # Feature modules
│   ├── auth/                   # ✅ Authentication
│   │   ├── components/         # Feature components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API calls
│   │   ├── pages/              # Pages
│   │   └── index.js            # Public API
│   ├── clients/                # ✅ Client management
│   ├── projects/               # ✅ Project management
│   └── ...                     # Other features
├── shared/                     # Shared resources
│   ├── components/             # UI components
│   ├── hooks/                  # Reusable hooks
│   ├── services/               # API client
│   ├── utils/                  # Utilities
│   ├── context/                # Global contexts
│   └── layouts/                # Layouts
├── App.jsx                     # Main app
└── main.jsx                    # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd freelancemanagment

# Checkout restructure branch
git checkout restructure

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

#### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roastify_local
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

#### Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend: http://localhost:5000
Frontend: http://localhost:3000

#### Production Mode

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

### Auth Module

```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password - Reset password
POST   /api/auth/verify-email   - Verify email
GET    /api/auth/me             - Get current user
```

### Clients Module

```
GET    /api/clients             - Get all clients
GET    /api/clients/:id         - Get client by ID
POST   /api/clients             - Create new client
PUT    /api/clients/:id         - Update client
DELETE /api/clients/:id         - Delete client
```

### Projects Module

```
GET    /api/projects            - Get all projects
GET    /api/projects/:id        - Get project by ID
POST   /api/projects            - Create new project
PUT    /api/projects/:id        - Update project
DELETE /api/projects/:id        - Delete project
PATCH  /api/projects/:id/status - Update project status
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📖 Code Examples

### Backend: Creating a New Module

```javascript
// 1. Create module structure
modules/tasks/
├── controllers/tasks.controller.js
├── services/tasks.service.js
├── repositories/tasks.repository.js
└── index.js

// 2. Implement controller
class TasksController {
  async getAll(req, res, next) {
    try {
      const tasks = await tasksService.getAll(req.user.id);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }
}

// 3. Implement service
class TasksService {
  async getAll(userId) {
    return await tasksRepository.findByUserId(userId);
  }
}

// 4. Implement repository
class TasksRepository {
  async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }
}

// 5. Register routes
app.use('/api/tasks', tasksModule);
```

### Frontend: Creating a New Feature

```javascript
// 1. Create feature structure
features/tasks/
├── components/TaskList.jsx
├── hooks/useTasks.js
├── services/tasks.service.js
├── pages/TasksPage.jsx
└── index.js

// 2. Create service
export const tasksService = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data)
};

// 3. Create hook
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  
  const fetchTasks = async () => {
    const data = await tasksService.getAll();
    setTasks(data);
  };
  
  return { tasks, fetchTasks };
};

// 4. Create page
const TasksPage = () => {
  const { tasks, fetchTasks } = useTasks();
  
  return (
    <div>
      <h1>Tasks</h1>
      <TaskList tasks={tasks} />
    </div>
  );
};

// 5. Add route in App.jsx
<Route path="tasks" element={<TasksPage />} />
```

## 🔧 Development Guidelines

### Backend

1. **Controllers** - Only HTTP handling
2. **Services** - Business logic only
3. **Repositories** - Database queries only
4. **Validators** - Use Joi for validation
5. **Error Handling** - Use next(error)

### Frontend

1. **Components** - Presentational only
2. **Hooks** - State management & side effects
3. **Services** - API calls only
4. **Pages** - Composition & routing
5. **Shared** - Truly reusable code only

## 📝 Migration Guide

See [MIGRATION_STEPS.md](./MIGRATION_STEPS.md) for detailed migration instructions.

## 📄 Documentation Files

- `RESTRUCTURE_PLAN.md` - Architecture overview
- `RESTRUCTURE_GUIDE.md` - Detailed implementation guide
- `BEFORE_AFTER_COMPARISON.md` - Before/After comparison
- `ARCHITECTURE_DIAGRAM.md` - Visual diagrams
- `MIGRATION_STEPS.md` - Step-by-step migration
- `RESTRUCTURE_SUMMARY.md` - Quick summary

## 🤝 Contributing

1. Create feature branch from `restructure`
2. Follow architecture patterns
3. Write tests
4. Update documentation
5. Submit pull request

## 📞 Support

For questions or issues:
1. Check documentation files
2. Review code examples
3. Ask team members

## 🎉 Next Steps

1. Review documentation
2. Run migration scripts
3. Migrate remaining modules
4. Add tests
5. Deploy to staging

---

**Branch**: `restructure`
**Status**: In Development
**Last Updated**: December 2, 2025
