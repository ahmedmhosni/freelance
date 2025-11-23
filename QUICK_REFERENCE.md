# 🚀 Quick Reference Card

## 💻 Local Development

### Start Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**Access:** http://localhost:3000

---

## 🚀 Deploy to Production

### Simple 3-Step Deployment
```bash
# 1. Commit your changes
git add .
git commit -m "Your change description"

# 2. Push to Azure branch
git push origin azure-migration

# 3. Wait 2-3 minutes
# Check: https://github.com/ahmedmhosni/freelance/actions
```

**Live Site:** https://white-sky-0a7e9f003.3.azurestaticapps.net

---

## 🔧 Environment Files

### Local Development
**frontend/.env**
```env
VITE_API_URL=http://localhost:5000
```

**backend/.env**
```env
PORT=5000
NODE_ENV=development
DB_TYPE=sqlite
DB_PATH=./database.sqlite
JWT_SECRET=your-secret-key
```

### Production (Automatic)
- Frontend: Configured in GitHub Actions
- Backend: Configured in Azure Portal

---

## 📊 Important URLs

| Service | URL |
|---------|-----|
| **Local Frontend** | http://localhost:3000 |
| **Local Backend** | http://localhost:5000 |
| **Production Site** | https://white-sky-0a7e9f003.3.azurestaticapps.net |
| **Production API** | https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net |
| **GitHub Actions** | https://github.com/ahmedmhosni/freelance/actions |
| **Azure Portal** | https://portal.azure.com |

---

## 🐛 Quick Fixes

### Frontend not connecting to backend?
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Restart frontend
cd frontend
npm run dev
```

### Deployment not working?
```bash
# Hard refresh browser
Ctrl + F5

# Check GitHub Actions
# https://github.com/ahmedmhosni/freelance/actions
```

### Database issues?
```bash
# Reset local database
cd backend
rm database.sqlite
npm run migrate
npm run seed
```

---

## 📝 Common Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Run migrations
npm run migrate

# Seed database
npm run seed

# Run tests
npm test
```

---

## ✅ Deployment Checklist

- [ ] Test locally first
- [ ] Commit all changes
- [ ] Push to azure-migration branch
- [ ] Wait for GitHub Actions to complete
- [ ] Test production site
- [ ] Check browser console for errors

---

**Full Guide:** See `DEPLOYMENT_WORKFLOW.md`
