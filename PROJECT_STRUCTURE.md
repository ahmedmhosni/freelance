# 📁 Project Structure

```
freelancemanagment/
│
├── 📄 package.json                 # Root package with dev scripts
├── 📄 .gitignore                   # Git ignore rules
├── 📄 README.md                    # Project overview
├── 📄 SETUP_COMPLETE.md            # Setup completion guide
├── 📄 QUICK_START.md               # Quick start guide
├── 📄 FEATURES.md                  # Feature documentation
├── 📄 PROJECT_STRUCTURE.md         # This file
│
├── 📂 backend/                     # Node.js Backend
│   ├── 📄 package.json             # Backend dependencies
│   ├── 📄 .env                     # Environment variables (SECRET!)
│   ├── 📄 .env.example             # Environment template
│   ├── 📄 database.sqlite          # SQLite database file
│   │
│   └── 📂 src/
│       ├── 📄 server.js            # Express server entry point
│       │
│       ├── 📂 routes/              # API Routes
│       │   ├── 📄 auth.js          # Authentication endpoints
│       │   ├── 📄 clients.js       # Client CRUD operations
│       │   ├── 📄 projects.js      # Project management
│       │   ├── 📄 tasks.js         # Task management
│       │   ├── 📄 invoices.js      # Invoice operations
│       │   ├── 📄 files.js         # File metadata & cloud storage
│       │   └── 📄 admin.js         # Admin-only endpoints
│       │
│       ├── 📂 middleware/          # Express Middleware
│       │   └── 📄 auth.js          # JWT authentication & role check
│       │
│       └── 📂 db/                  # Database Layer
│           ├── 📄 database.js      # Database connection & helpers
│           ├── 📄 schema.sql       # Database schema (tables)
│           └── 📄 seed.js          # Sample data seeder
│
└── 📂 frontend/                    # React Frontend
    ├── 📄 package.json             # Frontend dependencies
    ├── 📄 vite.config.js           # Vite configuration
    ├── 📄 index.html               # HTML entry point
    ├── 📄 .env                     # Frontend environment
    ├── 📄 .env.example             # Environment template
    │
    └── 📂 src/
        ├── 📄 main.jsx             # React entry point
        ├── 📄 App.jsx              # Main app component with routing
        ├── 📄 index.css            # Global styles
        │
        ├── 📂 pages/               # Page Components
        │   ├── 📄 Login.jsx        # Login page
        │   ├── 📄 Register.jsx     # Registration page
        │   ├── 📄 Dashboard.jsx    # Main dashboard with stats
        │   ├── 📄 Clients.jsx      # Client management
        │   ├── 📄 Projects.jsx     # Project management
        │   ├── 📄 Tasks.jsx        # Task board (Kanban/List)
        │   ├── 📄 Invoices.jsx     # Invoice management
        │   └── 📄 AdminPanel.jsx   # Admin user management
        │
        ├── 📂 components/          # Reusable Components
        │   └── 📄 Layout.jsx       # Main layout with sidebar
        │
        └── 📂 context/             # React Context
            └── 📄 AuthContext.jsx  # Authentication state management
```

## 🔑 Key Files Explained

### Backend

#### `server.js`
- Express app initialization
- Middleware setup (CORS, Helmet, Morgan)
- Route mounting
- Error handling

#### `routes/auth.js`
- User registration
- User login
- JWT token generation
- Password hashing with bcrypt

#### `routes/clients.js`
- GET all clients for user
- POST create new client
- PUT update client
- DELETE remove client

#### `routes/projects.js`
- Project CRUD operations
- Client linking
- Status management

#### `routes/tasks.js`
- Task CRUD operations
- Priority and status tracking
- Project linking

#### `routes/invoices.js`
- Invoice generation
- Payment tracking
- Financial calculations

#### `routes/admin.js`
- User management (admin only)
- System statistics
- Role management
- User deletion

#### `middleware/auth.js`
- `authenticateToken`: Verify JWT
- `requireAdmin`: Check admin role

#### `db/database.js`
- SQLite connection
- Query helpers (runQuery, getOne, getAll)
- Database initialization

#### `db/schema.sql`
- Complete database schema
- All tables with relationships
- Indexes for performance

#### `db/seed.js`
- Create demo users
- Generate sample data
- Database population script

### Frontend

#### `App.jsx`
- React Router setup
- Route definitions
- Private route protection
- Admin route protection

#### `pages/Dashboard.jsx`
- Statistics display
- Recent tasks
- Quick overview cards

#### `pages/Clients.jsx`
- Client list table
- Add/Edit client form
- Delete functionality

#### `pages/Projects.jsx`
- Project cards grid
- Create project form
- Status badges

#### `pages/Tasks.jsx`
- Kanban board view
- List view
- Drag & drop functionality
- Task creation

#### `pages/Invoices.jsx`
- Invoice table
- Financial statistics
- Invoice creation form

#### `pages/AdminPanel.jsx`
- User management table
- System statistics
- Role management

#### `components/Layout.jsx`
- Sidebar navigation
- User profile display
- Active route highlighting
- Logout functionality

#### `context/AuthContext.jsx`
- Authentication state
- Login/Logout functions
- Token management
- User data storage

## 🗄️ Database Schema

### Tables
1. **users** - User accounts with roles
2. **clients** - Client information
3. **projects** - Projects linked to clients
4. **tasks** - Tasks linked to projects
5. **invoices** - Invoices linked to clients/projects
6. **file_metadata** - Cloud file references
7. **activity_logs** - Audit trail

### Relationships
- Users → Clients (1:many)
- Users → Projects (1:many)
- Users → Tasks (1:many)
- Users → Invoices (1:many)
- Clients → Projects (1:many)
- Projects → Tasks (1:many)
- Projects → Invoices (1:many)

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
DATABASE_URL=./database.sqlite
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## 📦 Dependencies

### Backend
- express - Web framework
- cors - Cross-origin resource sharing
- dotenv - Environment variables
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- sqlite3 - Database
- express-validator - Input validation
- helmet - Security headers
- morgan - HTTP logging

### Frontend
- react - UI library
- react-dom - React DOM rendering
- react-router-dom - Routing
- axios - HTTP client
- vite - Build tool

## 🚀 Deployment Structure (Future)

```
Azure Resources:
├── App Service (Backend API)
├── Static Web App (Frontend)
├── Azure SQL Database
├── Key Vault (Secrets)
├── Functions (Background Jobs)
└── Application Insights (Monitoring)
```

---

**This structure provides a clean separation of concerns and scalability for future growth.**
