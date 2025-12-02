# 🚀 Quick Start Guide

## Get Started in 5 Minutes!

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Git

---

## Step 1: Clone & Checkout

```bash
git clone <your-repo-url>
cd freelancemanagment
git checkout restructure
```

---

## Step 2: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Step 3: Configure Environment

### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roastify_local
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
cd frontend
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 4: Setup Database

```bash
# Create database
createdb roastify_local

# Or using psql
psql -U postgres
CREATE DATABASE roastify_local;
\q
```

---

## Step 5: Run the Application

### Terminal 1 - Backend
```bash
cd backend
node src-new/server.js
```

You should see:
```
Database connection successful
Server running on port 5000
Environment: development
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

---

## Step 6: Test It!

1. Open browser: http://localhost:3000
2. Click "Register" to create account
3. Fill in the form and submit
4. Login with your credentials
5. Explore the dashboard!

---

## 🎯 What You Can Do Now

### Working Features
- ✅ **Authentication**: Register, Login, Logout
- ✅ **Clients**: Create, view, edit, delete clients
- ✅ **Projects**: Create, view, edit, delete projects
- ✅ **Tasks**: Create, view, edit, delete tasks
- ✅ **Invoices**: Create, view, edit, delete invoices
- ✅ **Dashboard**: View stats and overview

### Coming Soon
- 🔄 Reports
- 🔄 Time Tracking
- 🔄 Quotes
- 🔄 Profile Management

---

## 🧪 Quick API Test

```bash
# Health check
curl http://localhost:5000/health

# Status
curl http://localhost:5000/api/status

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

---

## 📁 Project Structure

### Backend
```
backend/src-new/
├── modules/        # Business modules
│   ├── auth/       # Authentication
│   ├── clients/    # Client management
│   ├── projects/   # Project management
│   ├── tasks/      # Task management
│   └── invoices/   # Invoice management
├── shared/         # Shared infrastructure
│   ├── database/   # DB connection
│   ├── middleware/ # Express middleware
│   └── utils/      # Utilities
├── app.js          # Express app
└── server.js       # Entry point
```

### Frontend
```
frontend/src-new/
├── features/       # Feature modules
│   ├── auth/       # Authentication
│   ├── clients/    # Client management
│   ├── projects/   # Project management
│   ├── tasks/      # Task management
│   └── invoices/   # Invoice management
├── shared/         # Shared resources
│   ├── components/ # UI components
│   ├── hooks/      # Custom hooks
│   ├── services/   # API client
│   └── utils/      # Utilities
├── App.jsx         # Main app
└── main.jsx        # Entry point
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep roastify_local

# Check .env file exists
cat backend/.env
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check .env file
cat frontend/.env
```

### Database connection error
```bash
# Test connection
psql -U postgres -d roastify_local

# If fails, check:
# 1. PostgreSQL is running
# 2. Database exists
# 3. Credentials in .env are correct
```

### Port already in use
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Learn More

- **Architecture**: Read `RESTRUCTURE_PLAN.md`
- **Implementation**: Read `RESTRUCTURE_GUIDE.md`
- **Migration**: Read `MIGRATION_STEPS.md`
- **Complete Guide**: Read `NEW_ARCHITECTURE_README.md`

---

## 🎉 You're Ready!

The new architecture is:
- ✅ Modular and organized
- ✅ Easy to understand
- ✅ Easy to modify
- ✅ Production-ready
- ✅ Scalable

**Happy coding!** 🚀
