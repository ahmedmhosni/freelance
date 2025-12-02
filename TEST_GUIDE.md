# 🧪 Local Testing Guide

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
test-local.bat
```

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

#### 2. Configure Environment

Backend `.env` is already created with defaults. Update if needed:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roastify_local
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345
PORT=5000
```

Frontend `.env` is already created:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Roastify
```

#### 3. Setup Database
```bash
# Create database
createdb roastify_local

# Or using psql
psql -U postgres
CREATE DATABASE roastify_local;
\q
```

#### 4. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
Database connection successful
Server running on port 5000
Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

## Testing Checklist

### ✅ Backend Tests

1. **Health Check**
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"ok","timestamp":"..."}`

2. **Status Endpoint**
```bash
curl http://localhost:5000/api/status
```
Expected: `{"status":"operational",...}`

3. **Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

4. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### ✅ Frontend Tests

1. **Open Browser**
   - Navigate to: http://localhost:3000
   - Should see login page

2. **Register Flow**
   - Click "Register" or go to `/register`
   - Fill in form
   - Submit
   - Should redirect to dashboard

3. **Login Flow**
   - Go to `/login`
   - Enter credentials
   - Submit
   - Should redirect to dashboard

4. **Protected Routes**
   - Try accessing `/dashboard` without login
   - Should redirect to `/login`

5. **Navigation**
   - Test all menu items:
     - Dashboard
     - Clients
     - Projects
     - Tasks
     - Invoices

6. **CRUD Operations**
   - **Clients**: Create, view, edit, delete
   - **Projects**: Create, view, edit, delete
   - **Tasks**: Create, view, edit, delete
   - **Invoices**: Create, view, edit, delete

## Available Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Clients
- `GET /api/clients` - Get all
- `POST /api/clients` - Create
- `PUT /api/clients/:id` - Update
- `DELETE /api/clients/:id` - Delete

### Projects
- `GET /api/projects` - Get all
- `POST /api/projects` - Create
- `PUT /api/projects/:id` - Update
- `DELETE /api/projects/:id` - Delete
- `PATCH /api/projects/:id/status` - Update status

### Tasks
- `GET /api/tasks` - Get all
- `POST /api/tasks` - Create
- `PUT /api/tasks/:id` - Update
- `DELETE /api/tasks/:id` - Delete
- `PATCH /api/tasks/:id/status` - Update status
- `PATCH /api/tasks/:id/complete` - Mark complete

### Invoices
- `GET /api/invoices` - Get all
- `POST /api/invoices` - Create
- `PUT /api/invoices/:id` - Update
- `DELETE /api/invoices/:id` - Delete
- `PATCH /api/invoices/:id/status` - Update status
- `GET /api/invoices/:id/pdf` - Download PDF

### Other
- `GET /health` - Health check
- `GET /api/status` - Status check

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

**Database connection error:**
- Check PostgreSQL is running
- Verify database exists
- Check credentials in `.env`

**Module not found:**
```bash
cd backend
npm install
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Vite errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**API connection error:**
- Check backend is running
- Verify `VITE_API_URL` in `.env`
- Check browser console for errors

### Common Issues

**CORS errors:**
- Backend should allow `http://localhost:3000`
- Check `FRONTEND_URL` in backend `.env`

**401 Unauthorized:**
- Token expired or invalid
- Logout and login again

**404 Not Found:**
- Check route exists in backend
- Check URL is correct

## Performance Testing

### Load Test (Optional)
```bash
# Install Apache Bench
# Windows: Download from Apache website

# Test endpoint
ab -n 1000 -c 10 http://localhost:5000/health
```

### Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Test operations
4. Check response times

## Success Criteria

### Backend ✅
- [x] Server starts without errors
- [x] Database connects successfully
- [x] Health endpoint responds
- [x] Auth endpoints work
- [x] CRUD endpoints work
- [x] Errors are handled properly

### Frontend ✅
- [x] App loads without errors
- [x] Login/Register works
- [x] Protected routes work
- [x] Navigation works
- [x] CRUD operations work
- [x] UI is responsive

## Next Steps

After successful testing:

1. **Review Code**
   - Check for any issues
   - Review console logs
   - Check error handling

2. **Add Tests**
   - Unit tests
   - Integration tests
   - E2E tests

3. **Optimize**
   - Performance improvements
   - Code cleanup
   - Documentation updates

4. **Deploy**
   - Staging environment
   - Production environment

## Support

If you encounter issues:

1. Check this guide
2. Review documentation in root folder
3. Check console logs
4. Review error messages

## Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Install dependencies
npm install

# Check logs
# Backend: Check terminal
# Frontend: Check browser console (F12)
```

---

**Happy Testing!** 🚀
