# 🚀 Quick Start Guide

## Your App is Running!

✅ **Backend**: http://localhost:5000  
✅ **Frontend**: http://localhost:3000  
✅ **Database**: SQLite initialized with sample data

## 🎯 Try It Now

### 1. Open the App
Navigate to: **http://localhost:3000**

### 2. Login with Demo Accounts

**Admin Account** (Full Access)
```
Email: admin@example.com
Password: admin123
```

**Freelancer Account** (Personal Data)
```
Email: freelancer@example.com
Password: freelancer123
```

### 3. Explore Features

#### As Freelancer:
1. **Dashboard** - View your statistics
2. **Clients** - Add/Edit/Delete clients
3. **Projects** - Create projects linked to clients
4. **Tasks** - Use Kanban board to manage tasks (drag & drop!)
5. **Invoices** - Generate and track invoices

#### As Admin:
1. All freelancer features +
2. **Admin Panel** - Manage all users and view system stats
3. Change user roles
4. View system-wide reports

## 📋 What's Included

### Sample Data (Freelancer Account)
- ✅ 1 Client: Acme Corp
- ✅ 1 Project: Website Redesign
- ✅ 2 Tasks: Design mockups, Frontend development
- ✅ 1 Invoice: INV-001 ($5,000)

## 🎨 Key Features to Test

### 1. Client Management
- Click "Add Client" button
- Fill in client details
- Edit or delete existing clients

### 2. Task Kanban Board
- Go to Tasks page
- Drag tasks between columns (To Do → In Progress → Review → Done)
- Switch to List view for detailed table
- Add new tasks with priority levels

### 3. Project Creation
- Create projects and link them to clients
- Set deadlines and status
- View projects in card layout

### 4. Invoice Tracking
- Create invoices with unique numbers
- Link to clients and projects
- Track payment status
- View revenue statistics

### 5. Admin Features (Admin account only)
- View all system users
- Change user roles (Freelancer ↔ Admin)
- See system-wide statistics
- Delete users

## 🛠️ Development Commands

### Stop the Servers
Press `Ctrl+C` in the terminal windows

### Restart Everything
```bash
npm run dev
```

### Backend Only
```bash
cd backend
npm run dev
```

### Frontend Only
```bash
cd frontend
npm run dev
```

### Reset Database
```bash
cd backend
del database.sqlite
npm run seed
```

## 📱 Test the API Directly

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```

## 🎓 Next Steps

1. **Customize**: Update branding, colors, and content
2. **Add Features**: Implement cloud storage, notifications
3. **Deploy**: Move to Azure for production
4. **Secure**: Update JWT_SECRET in `.env`
5. **Scale**: Switch to Azure SQL for production database

## 📚 Documentation

- **SETUP_COMPLETE.md** - Full setup details
- **FEATURES.md** - Complete feature list
- **README.md** - Project overview

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in backend/.env
PORT=5001

# Change port in frontend/vite.config.js
server: { port: 3001 }
```

### Database Issues
```bash
cd backend
del database.sqlite
npm run seed
```

### Dependencies Issues
```bash
npm run install:all
```

## 💡 Tips

- **Drag & Drop**: Tasks can be dragged between Kanban columns
- **Demo Credentials**: Shown on login page for easy access
- **Hot Reload**: Frontend updates automatically on file changes
- **API Testing**: Use the health endpoint to verify backend

---

**Enjoy building your freelancer management platform! 🎉**
