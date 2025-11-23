# 🚀 Deployment & Development Workflow Guide

## 📋 Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Deployment Process](#deployment-process)
3. [Environment Configuration](#environment-configuration)
4. [Common Workflows](#common-workflows)
5. [Troubleshooting](#troubleshooting)

---

## 🖥️ Local Development Setup

### Initial Setup (One-time)

#### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Configure Local Environment
```bash
# Backend - Create/Edit backend/.env
cd backend
# Copy from .env.example if needed
```

**backend/.env:**
```env
PORT=5000
NODE_ENV=development

# Local SQLite (for development)
DB_TYPE=sqlite
DB_PATH=./database.sqlite

# OR use Azure SQL for testing
# DB_TYPE=azuresql
# DB_SERVER=roastify-sql-server.database.windows.net
# DB_DATABASE=roastify-db
# DB_USER=your-username
# DB_PASSWORD=your-password

JWT_SECRET=your-secret-key-here
```

**frontend/.env** (already exists):
```env
VITE_API_URL=http://localhost:5000
```

#### 3. Setup Local Database
```bash
# If using SQLite (recommended for local dev)
cd backend
npm run migrate  # Run migrations
npm run seed     # Add sample data (optional)
```

### Daily Development Workflow

#### Start Development Servers

**Option 1: Two Terminals (Recommended)**
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

**Option 2: Using npm-run-all (if configured)**
```bash
# From root directory
npm run dev
# Starts both frontend and backend
```

#### Development Features
- ✅ **Hot Reload:** Both frontend and backend auto-reload on changes
- ✅ **API Proxy:** Vite proxies `/api/*` to `localhost:5000`
- ✅ **Local Database:** SQLite for fast development
- ✅ **Debug Mode:** Full error messages and logging

---

## 🚀 Deployment Process

### Automatic Deployment (Current Setup)

Your deployment is **fully automated** via GitHub Actions!

#### How It Works:
```
1. You make changes locally
2. Commit and push to GitHub
3. GitHub Actions automatically:
   - Builds frontend
   - Deploys to Azure Static Web Apps
4. Live in 2-3 minutes!
```

#### Step-by-Step Deployment:

**1. Make Your Changes**
```bash
# Edit files locally
# Test in local development environment
```

**2. Commit Changes**
```bash
git add .
git commit -m "Description of your changes"
```

**3. Push to Azure Branch**
```bash
git push origin azure-migration
```

**4. Monitor Deployment**
- Go to: https://github.com/ahmedmhosni/freelance/actions
- Watch the "Azure Static Web Apps CI/CD" workflow
- Wait 2-3 minutes for completion
- Check your live site: https://white-sky-0a7e9f003.3.azurestaticapps.net

**5. Verify Deployment**
```bash
# Check if site is updated
# Test the new features
# Check browser console for errors
```

### Backend Deployment (Azure Web App)

Your backend is deployed separately. To update:

#### Option 1: Via Azure Portal (Recommended)
1. Go to [Azure Portal](https://portal.azure.com)
2. Find your Web App: `roastify-webapp-api-c0hgg2h4f4djcwaf`
3. Go to **Deployment Center**
4. Connect to your GitHub repo
5. Select branch: `azure-migration`
6. Azure will auto-deploy on push

#### Option 2: Manual Deployment
```bash
# From backend directory
cd backend

# Login to Azure
az login

# Deploy
az webapp up --name roastify-webapp-api-c0hgg2h4f4djcwaf --resource-group roastify-rg
```

#### Option 3: Using VS Code
1. Install "Azure App Service" extension
2. Right-click on backend folder
3. Select "Deploy to Web App"
4. Choose your Web App

---

## ⚙️ Environment Configuration

### Frontend Environments

#### Local Development
**File:** `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
```

#### Production (Azure)
**Configured in:** `.github/workflows/azure-static-web-apps.yml`
```yaml
env:
  VITE_API_URL: https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net
```

### Backend Environments

#### Local Development
**File:** `backend/.env`
```env
NODE_ENV=development
PORT=5000
DB_TYPE=sqlite
DB_PATH=./database.sqlite
```

#### Production (Azure)
**Configured in:** Azure Portal → Web App → Configuration
```env
NODE_ENV=production
PORT=8080
DB_TYPE=azuresql
DB_SERVER=roastify-sql-server.database.windows.net
DB_DATABASE=roastify-db
DB_USER=your-username
DB_PASSWORD=your-password
```

---

## 🔄 Common Workflows

### Workflow 1: Adding a New Feature

```bash
# 1. Create a new branch (optional)
git checkout -b feature/new-feature

# 2. Develop locally
cd backend
npm run dev  # Terminal 1

cd frontend
npm run dev  # Terminal 2

# 3. Make changes and test
# Edit files, test at http://localhost:3000

# 4. Commit changes
git add .
git commit -m "Add new feature"

# 5. Merge to azure-migration branch
git checkout azure-migration
git merge feature/new-feature

# 6. Deploy
git push origin azure-migration

# 7. Wait 2-3 minutes and verify
# Check: https://white-sky-0a7e9f003.3.azurestaticapps.net
```

### Workflow 2: Fixing a Bug

```bash
# 1. Reproduce bug locally
npm run dev

# 2. Fix the bug
# Edit the problematic file

# 3. Test the fix locally
# Verify bug is fixed at http://localhost:3000

# 4. Deploy
git add .
git commit -m "Fix: description of bug fix"
git push origin azure-migration

# 5. Verify in production
```

### Workflow 3: Database Changes

```bash
# 1. Create migration file
cd backend/src/db/migrations
# Create new migration file

# 2. Test locally
cd backend
npm run migrate

# 3. Update Azure database
node src/db/migrate-azure.js

# 4. Commit and deploy
git add .
git commit -m "Database: add new table/column"
git push origin azure-migration
```

### Workflow 4: Updating Dependencies

```bash
# 1. Update package.json
cd frontend  # or backend
npm update

# 2. Test locally
npm run dev

# 3. Commit and deploy
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin azure-migration
```

---

## 🔧 Switching Between Environments

### Use Local Backend
```bash
# frontend/.env
VITE_API_URL=http://localhost:5000

# Start backend
cd backend
npm run dev
```

### Use Production Backend (for testing)
```bash
# frontend/.env
VITE_API_URL=https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net

# No need to run backend locally
cd frontend
npm run dev
```

### Use Local Database
```bash
# backend/.env
DB_TYPE=sqlite
DB_PATH=./database.sqlite
```

### Use Production Database (careful!)
```bash
# backend/.env
DB_TYPE=azuresql
DB_SERVER=roastify-sql-server.database.windows.net
DB_DATABASE=roastify-db
# ... other Azure SQL settings
```

---

## 🐛 Troubleshooting

### Local Development Issues

#### Frontend can't connect to backend
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check frontend/.env
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:5000

# Restart frontend
cd frontend
npm run dev
```

#### Database errors
```bash
# Reset local database
cd backend
rm database.sqlite
npm run migrate
npm run seed
```

#### Port already in use
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Deployment Issues

#### Deployment failed
```bash
# Check GitHub Actions logs
# Go to: https://github.com/ahmedmhosni/freelance/actions
# Click on failed workflow
# Read error messages

# Common fixes:
# 1. Check syntax errors
# 2. Verify all files are committed
# 3. Check environment variables
```

#### Site not updating
```bash
# 1. Hard refresh browser
Ctrl + F5  # Windows
Cmd + Shift + R  # Mac

# 2. Clear browser cache
# 3. Check deployment completed successfully
# 4. Verify correct branch was pushed
```

#### API calls failing in production
```bash
# Check browser console
# Look for CORS errors or 404s

# Verify environment variable
# Should see in console:
# 🔧 API Configuration: { VITE_API_URL: "https://..." }

# If undefined, check:
# .github/workflows/azure-static-web-apps.yml
```

---

## 📝 Quick Reference

### Local Development Commands
```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run migrate      # Run migrations
npm run seed         # Seed database
npm test            # Run tests

# Frontend
cd frontend
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Deployment Commands
```bash
# Deploy frontend (automatic)
git push origin azure-migration

# Deploy backend (if configured)
cd backend
az webapp up --name roastify-webapp-api-c0hgg2h4f4djcwaf

# Check deployment status
# Visit: https://github.com/ahmedmhosni/freelance/actions
```

### Useful URLs
- **Local Frontend:** http://localhost:3000
- **Local Backend:** http://localhost:5000
- **Production Frontend:** https://white-sky-0a7e9f003.3.azurestaticapps.net
- **Production Backend:** https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net
- **GitHub Actions:** https://github.com/ahmedmhosni/freelance/actions
- **Azure Portal:** https://portal.azure.com

---

## 🎯 Best Practices

### Development
1. ✅ Always test locally before deploying
2. ✅ Use meaningful commit messages
3. ✅ Keep dependencies updated
4. ✅ Use SQLite for local development
5. ✅ Don't commit `.env` files (they're in `.gitignore`)

### Deployment
1. ✅ Deploy during low-traffic times
2. ✅ Test in production after deployment
3. ✅ Monitor GitHub Actions for errors
4. ✅ Keep production and development branches separate
5. ✅ Backup database before major changes

### Security
1. ✅ Never commit secrets or passwords
2. ✅ Use environment variables for sensitive data
3. ✅ Keep Azure credentials secure
4. ✅ Regularly update dependencies
5. ✅ Monitor Azure costs

---

## 📞 Need Help?

### Resources
- **Azure Documentation:** https://docs.microsoft.com/azure
- **Vite Documentation:** https://vitejs.dev
- **GitHub Actions:** https://docs.github.com/actions

### Common Issues
- Check `TROUBLESHOOTING.md` (if exists)
- Review GitHub Actions logs
- Check Azure Portal logs
- Review browser console errors

---

**Last Updated:** November 23, 2025
**Your Setup:** Azure Static Web Apps + Azure Web App + Azure SQL
