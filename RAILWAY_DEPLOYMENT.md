# Railway Deployment Guide - All-in-One Production Platform

**Complete full-stack deployment in ONE platform**

⏱️ **Time:** 20 minutes  
💰 **Cost:** $0 (free $5 credit/month)  
🎯 **Difficulty:** Beginner-friendly  

---

## ✨ What You Get

- ✅ Frontend + Backend + Database in one dashboard
- ✅ Automatic HTTPS with custom domain support
- ✅ Managed PostgreSQL database with backups
- ✅ Auto-deploy from GitHub
- ✅ Environment variables management
- ✅ Real-time logs and monitoring
- ✅ 99%+ uptime guarantee
- ✅ Professional production setup

---

## 📋 Prerequisites

1. GitHub account (free)
2. Railway account (free - no credit card for trial)
3. Your project code

---

## PART 1: Prepare Your Code (5 minutes)

### Step 1: Update Backend for PostgreSQL

We need to switch from SQLite to PostgreSQL for Railway.

Install PostgreSQL driver:
```powershell
cd backend
npm install pg
```

Create `backend/src/db/postgres.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = { pool };
```

### Step 2: Create Railway Configuration Files

Create `railway.json` in root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `Procfile` in root:
```
web: cd backend && npm start
```

Create `nixpacks.toml` in root:
```toml
[phases.setup]
nixPkgs = ['nodejs-18_x']

[phases.install]
cmds = ['cd backend && npm ci --production']

[phases.build]
cmds = ['cd frontend && npm ci && npm run build']

[start]
cmd = 'cd backend && npm start'
```

### Step 3: Update package.json

Update `backend/package.json` to add start script:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Step 4: Create .railwayignore

Create `.railwayignore` in root:
```
node_modules
.git
.env
.env.local
*.log
.DS_Store
.vscode
.idea
```

### Step 5: Push to GitHub

```powershell
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

If you don't have a GitHub repo yet:
```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## PART 2: Deploy to Railway (10 minutes)

### Step 6: Create Railway Account

1. Go to https://railway.app/
2. Click "Login"
3. Sign in with GitHub
4. Authorize Railway

### Step 7: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Click "Deploy Now"

Railway will start deploying automatically.

### Step 8: Add PostgreSQL Database

1. In your project dashboard, click "+ New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Wait 30 seconds for database to provision

### Step 9: Configure Environment Variables

1. Click on your backend service
2. Go to "Variables" tab
3. Add these variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secure-random-string-at-least-32-characters-long
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

**Important:** 
- Change `JWT_SECRET` to a random string
- `${{Postgres.DATABASE_URL}}` will auto-link to your database
- `${{RAILWAY_PUBLIC_DOMAIN}}` will auto-fill your domain

### Step 10: Configure Frontend Build

1. Click on your service
2. Go to "Settings" tab
3. Under "Build Command", add:
```bash
cd frontend && npm ci && npm run build
```

4. Under "Start Command", add:
```bash
cd backend && npm start
```

### Step 11: Setup Static File Serving

Update `backend/src/server.js` to serve frontend:

Add this BEFORE your API routes:
```javascript
const path = require('path');

// Serve static files from frontend build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}
```

Push changes:
```powershell
git add .
git commit -m "Add static file serving"
git push
```

Railway will auto-deploy!

### Step 12: Initialize Database

1. Click on your service
2. Go to "Deployments" tab
3. Click on the latest deployment
4. Click "View Logs"
5. Wait for deployment to complete

Then run database initialization:
1. Go to your PostgreSQL service
2. Click "Connect"
3. Copy the connection string
4. Use a PostgreSQL client or Railway's built-in query editor
5. Run your schema from `backend/src/db/schema.sql`

Or use Railway CLI:
```powershell
npm install -g @railway/cli
railway login
railway link
railway run node backend/src/db/database.js
```

### Step 13: Get Your Public URL

1. Click on your service
2. Go to "Settings" tab
3. Under "Domains", click "Generate Domain"
4. Copy your Railway domain (e.g., `your-app.up.railway.app`)

---

## PART 3: Verify Deployment (2 minutes)

### Step 14: Test Your Application

1. Open your Railway domain in browser
2. You should see your login page
3. Login with: `admin@example.com` / `admin123`
4. Test creating a project, task, etc.

### Step 15: Check Logs

1. Go to Railway dashboard
2. Click on your service
3. Click "Deployments"
4. Click "View Logs"
5. Verify no errors

---

## PART 4: Production Setup (3 minutes)

### Step 16: Add Custom Domain (Optional)

1. Go to your service settings
2. Under "Domains", click "Custom Domain"
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Add the CNAME record to your DNS provider:
   - Type: CNAME
   - Name: app (or your subdomain)
   - Value: your-app.up.railway.app

### Step 17: Enable Automatic Deployments

Already enabled! Every push to `main` branch auto-deploys.

### Step 18: Setup Database Backups

Railway automatically backs up your PostgreSQL database daily.

To manually backup:
1. Go to PostgreSQL service
2. Click "Data" tab
3. Click "Export"

---

## 🎉 You're Live!

Your application is now running in production on Railway!

**Your URLs:**
- **Application:** `https://your-app.up.railway.app`
- **API:** `https://your-app.up.railway.app/api`
- **Database:** Managed by Railway

---

## 📊 Monitoring & Management

### View Logs
```powershell
railway logs
```

### View Metrics
1. Go to Railway dashboard
2. Click on your service
3. View CPU, Memory, Network usage

### Restart Service
1. Go to service settings
2. Click "Restart"

### Rollback Deployment
1. Go to "Deployments"
2. Click on previous deployment
3. Click "Redeploy"

---

## 💰 Cost Management

### Free Tier Limits
- **$5 credit per month** (renews monthly)
- **500 hours of usage** (enough for 1 always-on service)
- **100GB bandwidth**
- **1GB PostgreSQL storage**

### Typical Usage
- Small app: ~$3-4/month
- Medium app: ~$5-8/month
- Large app: ~$10-15/month

### Monitor Usage
1. Go to Railway dashboard
2. Click "Usage" in sidebar
3. View current month's usage

---

## 🔄 Update Your Application

### Method 1: Git Push (Automatic)
```powershell
# Make changes
git add .
git commit -m "Update feature"
git push
```

Railway auto-deploys in 2-3 minutes!

### Method 2: Manual Deploy
1. Go to Railway dashboard
2. Click "Deploy"
3. Select branch
4. Click "Deploy"

---

## 🛠️ Troubleshooting

### Build Failed
1. Check logs in Railway dashboard
2. Verify `package.json` scripts
3. Check Node.js version compatibility

### Database Connection Error
1. Verify `DATABASE_URL` variable is set
2. Check PostgreSQL service is running
3. Review connection string format

### Frontend Not Loading
1. Verify build completed successfully
2. Check static file serving in `server.js`
3. Verify `frontend/dist` folder exists

### 500 Server Error
1. Check application logs
2. Verify environment variables
3. Check database migrations ran

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to secure random string
- [ ] Change default admin password
- [ ] Enable HTTPS (automatic on Railway)
- [ ] Review environment variables
- [ ] Setup database backups (automatic)
- [ ] Monitor error logs regularly

---

## 📈 Scaling

### Vertical Scaling (More Resources)
1. Go to service settings
2. Upgrade to Pro plan ($20/month)
3. Get more CPU, RAM, storage

### Horizontal Scaling (Multiple Instances)
1. Upgrade to Pro plan
2. Enable "Replicas"
3. Set number of instances

---

## 🆘 Support

- **Railway Docs:** https://docs.railway.app/
- **Railway Discord:** https://discord.gg/railway
- **Railway Status:** https://status.railway.app/

---

## 📚 Additional Features

### Environment Variables per Branch
1. Go to service settings
2. Click "Variables"
3. Add branch-specific variables

### Webhooks
1. Go to service settings
2. Click "Webhooks"
3. Add webhook URL for deployment notifications

### Cron Jobs
1. Create new service
2. Select "Cron Job"
3. Set schedule and command

---

## ✅ Success Checklist

- [ ] Application accessible via Railway URL
- [ ] Database connected and working
- [ ] Can login and use all features
- [ ] Logs show no errors
- [ ] Auto-deployment working
- [ ] Custom domain configured (optional)
- [ ] Admin password changed
- [ ] Monitoring setup

---

## 🎓 Next Steps

1. **Monitor your app** - Check logs and metrics daily
2. **Setup alerts** - Get notified of issues
3. **Add custom domain** - Professional URL
4. **Optimize performance** - Review slow queries
5. **Scale as needed** - Upgrade when traffic grows

---

**Congratulations! Your app is live on Railway! 🚀**

**Estimated monthly cost:** $3-5 (within free credit)  
**Deployment time:** 20 minutes  
**Maintenance:** Minimal (auto-updates, auto-backups)
