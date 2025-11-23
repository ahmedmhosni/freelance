# 🖥️ Local Development Setup - FIXED!

## ✅ Problem Solved!

Your backend was trying to connect to Azure SQL even in local development. I've fixed it to use SQLite locally.

## 🔧 What Was Fixed:

### 1. Created Database Adapter (`backend/src/db/index.js`)
- Automatically switches between SQLite (local) and Azure SQL (production)
- Based on `NODE_ENV` and `USE_AZURE_SQL` environment variables

### 2. Updated All Route Files
Updated 12 route files to use the new adapter:
- ✅ admin.js
- ✅ auth.js
- ✅ clients.js
- ✅ dashboard.js
- ✅ files.js
- ✅ invoices.js
- ✅ notifications.js
- ✅ projects.js
- ✅ quotes.js
- ✅ reports.js
- ✅ tasks.js
- ✅ timeTracking.js

### 3. Updated `.env` File
Added `USE_AZURE_SQL=false` for local development

---

## 🚀 How to Start Local Development

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

**You should see:**
```
Server running on port 5000
WebSocket server ready
🟢 Using SQLite Database (Local Development)
✓ SQLite Database initialized successfully
```

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

**Access:** http://localhost:3000

---

## ⚙️ Environment Configuration

### Local Development (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
USE_AZURE_SQL=false  # ← This makes it use SQLite
DATABASE_URL=./database.sqlite
```

### Production (Azure Web App)
```env
NODE_ENV=production  # ← This makes it use Azure SQL
# Azure SQL credentials configured in Azure Portal
```

---

## 🔄 Switching Databases

### Use SQLite (Local Development)
```env
# backend/.env
USE_AZURE_SQL=false
```

### Use Azure SQL (Testing Production DB Locally)
```env
# backend/.env
USE_AZURE_SQL=true
# Make sure Azure SQL credentials are correct
```

---

## 📊 Database Files

### SQLite (Local)
- **Location:** `backend/database.sqlite`
- **Schema:** `backend/src/db/schema.sql`
- **Migrations:** Automatic on startup
- **Seed Data:** Run `npm run seed` if needed

### Azure SQL (Production)
- **Server:** roastify-db-server.database.windows.net
- **Database:** roastifydbazure
- **Managed:** Via Azure Portal

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Database errors?
```bash
# Reset SQLite database
cd backend
del database.sqlite  # Windows
# rm database.sqlite  # Mac/Linux

# Restart backend (will recreate database)
npm run dev
```

### Still trying to connect to Azure SQL?
```bash
# Check .env file
cat backend/.env

# Make sure it says:
# USE_AZURE_SQL=false
# NODE_ENV=development
```

---

## ✅ Verification Checklist

When you start the backend, you should see:

- ✅ `Server running on port 5000`
- ✅ `WebSocket server ready`
- ✅ `🟢 Using SQLite Database (Local Development)`
- ✅ `✓ SQLite Database initialized successfully`

**NOT:**
- ❌ `🔵 Using Azure SQL Database`
- ❌ `Azure SQL connection error`
- ❌ `Login failed for user 'adminuser'`

---

## 🎯 Quick Commands

```bash
# Start backend (local SQLite)
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Reset local database
cd backend && del database.sqlite && npm run dev

# Seed database with sample data
cd backend && npm run seed

# Deploy to production
git add . && git commit -m "message" && git push origin azure-migration
```

---

## 📝 How It Works

```
┌─────────────────────────────────────────┐
│  backend/src/db/index.js (Adapter)      │
│  Checks: NODE_ENV & USE_AZURE_SQL       │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│  database.js│  │  azuresql.js │
│  (SQLite)   │  │  (Azure SQL) │
│  Local Dev  │  │  Production  │
└─────────────┘  └──────────────┘
```

---

## 🎉 You're All Set!

Now you can:
- ✅ Develop locally with SQLite
- ✅ No Azure SQL connection needed for local dev
- ✅ Automatic switch to Azure SQL in production
- ✅ Fast local development
- ✅ Easy deployment

**Try it now:**
```bash
cd backend
npm run dev
```

You should see the green message: `🟢 Using SQLite Database (Local Development)`

---

**Last Updated:** November 23, 2025
**Status:** ✅ Ready for Local Development
