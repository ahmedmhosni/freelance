# Minimal Production Checklist - Launch Ready

## What You Need RIGHT NOW (Before Launch)

This is the absolute minimum to launch safely. No extra features, just essentials.

---

## ✅ Already Done

- ✅ Core features working (auth, clients, projects, invoices, time tracking)
- ✅ Azure deployment configured
- ✅ Database (PostgreSQL) set up
- ✅ Email service (Azure Communication Services)
- ✅ Rate limiting implemented
- ✅ Console log security (sensitive data sanitization)
- ✅ HTTPS security headers
- ✅ Error pages (404, 500)
- ✅ Legal pages (Terms, Privacy, Refund, Contact)
- ✅ Password reset functionality
- ✅ GDPR compliance tools

---

## 🚨 CRITICAL - Do Before Launch (2-3 hours)

### 1. Database Backups (30 minutes)
**Why:** Prevent data loss if something goes wrong

**Azure Portal Steps:**
```
1. Go to Azure Portal → PostgreSQL Server
2. Click "Backup and restore"
3. Enable "Automated backups"
   - Retention: 7 days minimum (35 days recommended)
   - Geo-redundant: Yes (if available in your region)
4. Test restore:
   - Click "Restore"
   - Choose a point in time
   - Create test server
   - Verify data
   - Delete test server
```

**CLI Alternative:**
```bash
# Enable automated backups
az postgres server update \
  --resource-group roastify-rg \
  --name roastify-db \
  --backup-retention 7 \
  --geo-redundant-backup Enabled

# Test backup (creates restore point)
az postgres server restore \
  --resource-group roastify-rg \
  --name roastify-db-test \
  --restore-point-in-time "2024-12-07T22:00:00Z" \
  --source-server roastify-db
```

**Verify:** ✅ Backups enabled, ✅ Test restore successful

---

### 2. Environment Variables Audit (30 minutes)
**Why:** Ensure no secrets in code, everything in environment

**Check These Files:**
```bash
# Backend - Check .env is NOT in git
backend/.env

# Frontend - Check .env is NOT in git  
frontend/.env

# Verify .gitignore includes
.env
.env.local
.env.production
```

**Create .env.example files:**

**backend/.env.example:**
```bash
# Database
DB_HOST=your-db-server.postgres.database.azure.com
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER_NAME=your-container-name

# Azure Email
AZURE_COMMUNICATION_CONNECTION_STRING=your-email-connection-string
AZURE_COMMUNICATION_SENDER_EMAIL=noreply@yourdomain.com

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

**frontend/.env.example:**
```bash
VITE_API_URL=https://your-backend.azurewebsites.net
VITE_APP_NAME=Roastify
```

**Verify:** ✅ .env files not in git, ✅ .env.example created, ✅ All secrets in environment

---

### 3. Error Monitoring Setup (1 hour)
**Why:** Know immediately when something breaks

**Option A: Sentry (Recommended - Free tier available)**

```bash
# Install Sentry
npm install @sentry/node @sentry/react --save

# Backend: backend/src/app.js (add at top)
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});

// Add error handler (before other error handlers)
app.use(Sentry.Handlers.errorHandler());

# Frontend: frontend/src/main.jsx (add at top)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
});
```

**Setup:**
1. Sign up at https://sentry.io (free tier: 5K errors/month)
2. Create project for backend (Node.js)
3. Create project for frontend (React)
4. Copy DSN to environment variables
5. Deploy and test by triggering an error

**Option B: Application Insights (Already configured)**
- Already set up ✅
- Just verify it's working in Azure Portal

**Verify:** ✅ Error tracking active, ✅ Test error logged, ✅ Alerts configured

---

### 4. Uptime Monitoring (15 minutes)
**Why:** Know if your site goes down

**UptimeRobot (Free - Recommended):**
```
1. Sign up at https://uptimerobot.com (free)
2. Add monitor:
   - Type: HTTPS
   - URL: https://roastify.online
   - Interval: 5 minutes
   - Alert contacts: Your email
3. Add API monitor:
   - Type: HTTPS
   - URL: https://your-backend.azurewebsites.net/api/health
   - Interval: 5 minutes
```

**Alternative: Azure Monitor (Already available):**
```bash
# Create availability test
az monitor app-insights web-test create \
  --resource-group roastify-rg \
  --app roastify-insights \
  --name "Homepage Availability" \
  --location eastus \
  --kind ping \
  --web-test-kind ping \
  --locations "us-east-1" "us-west-1" \
  --frequency 300 \
  --timeout 30 \
  --enabled true \
  --url "https://roastify.online"
```

**Verify:** ✅ Uptime monitor active, ✅ Test alert received

---

### 5. Critical Alerts (30 minutes)
**Why:** Get notified of problems immediately

**Azure Portal Setup:**
```
1. Go to Azure Portal → Monitor → Alerts
2. Create alert rules:

Alert 1: High CPU
- Resource: App Service
- Condition: CPU Percentage > 80%
- Duration: 5 minutes
- Action: Email you

Alert 2: High Memory
- Resource: App Service
- Condition: Memory Percentage > 85%
- Duration: 5 minutes
- Action: Email you

Alert 3: High Error Rate
- Resource: App Service
- Condition: Http Server Errors > 10
- Duration: 5 minutes
- Action: Email you

Alert 4: Database Connection Failures
- Resource: PostgreSQL
- Condition: Failed Connections > 5
- Duration: 5 minutes
- Action: Email you
```

**CLI Alternative:**
```bash
# High CPU alert
az monitor metrics alert create \
  --name "High CPU Usage" \
  --resource-group roastify-rg \
  --scopes /subscriptions/{sub-id}/resourceGroups/roastify-rg/providers/Microsoft.Web/sites/roastify \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email your-email@example.com

# High error rate alert
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group roastify-rg \
  --scopes /subscriptions/{sub-id}/resourceGroups/roastify-rg/providers/Microsoft.Web/sites/roastify \
  --condition "total Http Server Errors > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email your-email@example.com
```

**Verify:** ✅ Alerts created, ✅ Test alert received

---

## ⚠️ IMPORTANT - Do Before Launch (1-2 hours)

### 6. SSL Certificate Verification (15 minutes)
**Why:** Ensure HTTPS is working properly

**Check:**
```bash
# Test SSL certificate
curl -I https://roastify.online

# Should see:
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains; preload
```

**Azure Portal:**
```
1. Go to App Service → Custom domains
2. Verify domain is added
3. Go to TLS/SSL settings
4. Verify certificate is valid
5. Enable "HTTPS Only"
6. Set minimum TLS version to 1.2
```

**Verify:** ✅ HTTPS working, ✅ Certificate valid, ✅ HTTP redirects to HTTPS

---

### 7. Database Connection Pooling (30 minutes)
**Why:** Prevent "too many connections" errors

**Backend: Check/Update database config**

**backend/src/db/postgresql.js:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pooling settings
  max: 20, // Maximum connections (adjust based on your DB tier)
  min: 2,  // Minimum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout after 10s
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
```

**Verify:** ✅ Connection pooling configured, ✅ No connection errors in logs

---

### 8. Performance Check (30 minutes)
**Why:** Ensure site loads fast

**Run Lighthouse Audit:**
```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://roastify.online --output html --output-path ./lighthouse-report.html

# Check scores (aim for):
# Performance: > 80
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

**Quick Fixes if Scores Low:**
```javascript
// 1. Add compression (backend/src/app.js)
const compression = require('compression');
app.use(compression());

// 2. Add caching headers (backend/src/app.js)
app.use((req, res, next) => {
  if (req.url.match(/\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});

// 3. Optimize images (use WebP format, compress)
// 4. Lazy load images (add loading="lazy" to img tags)
```

**Verify:** ✅ Lighthouse score > 80, ✅ Page loads < 3 seconds

---

## 📝 RECOMMENDED - Do Before Launch (Optional, 1 hour)

### 9. Basic Documentation (30 minutes)
**Why:** Help users and yourself

**Create: DEPLOYMENT.md**
```markdown
# Deployment Guide

## Prerequisites
- Azure account
- Node.js 18+
- PostgreSQL database

## Environment Variables
See .env.example files in backend/ and frontend/

## Deploy Backend
1. Push to GitHub
2. GitHub Actions deploys automatically
3. Verify at https://your-backend.azurewebsites.net/api/health

## Deploy Frontend
1. Build: npm run build
2. Deploy to Azure Static Web Apps or App Service
3. Verify at https://roastify.online

## Rollback
1. Go to Azure Portal → App Service → Deployment Center
2. Select previous deployment
3. Click "Redeploy"

## Support
Contact: your-email@example.com
```

**Verify:** ✅ Documentation created

---

### 10. Test Critical User Flows (30 minutes)
**Why:** Ensure everything works end-to-end

**Test These Flows:**
```
1. ✅ Register new account
2. ✅ Verify email
3. ✅ Login
4. ✅ Create client
5. ✅ Create project
6. ✅ Create task
7. ✅ Track time
8. ✅ Create invoice
9. ✅ Download invoice PDF
10. ✅ Password reset
11. ✅ Logout
```

**Verify:** ✅ All flows working, ✅ No errors in console

---

## 🎯 Launch Day Checklist

### Morning of Launch
- [ ] Verify database backup completed last night
- [ ] Check all services are running (App Service, Database, Storage)
- [ ] Test critical user flows one more time
- [ ] Verify error monitoring is active
- [ ] Verify uptime monitoring is active
- [ ] Check SSL certificate is valid
- [ ] Verify email sending works
- [ ] Clear any test data from production database

### During Launch
- [ ] Monitor Application Insights for errors
- [ ] Monitor uptime status
- [ ] Watch for alert emails
- [ ] Test site from different devices/browsers
- [ ] Monitor database connections
- [ ] Check response times

### First 24 Hours
- [ ] Check error logs every 2-4 hours
- [ ] Monitor user registrations
- [ ] Respond to any user feedback
- [ ] Fix critical bugs immediately
- [ ] Document any issues for later

### First Week
- [ ] Review error logs daily
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Plan first update
- [ ] Thank early adopters

---

## 📊 Current Status

### ✅ Complete (78%)
- Core features
- Security (rate limiting, HTTPS, console logs)
- Error pages
- Legal compliance
- Azure deployment

### 🚨 Critical (Need Now)
- [ ] Database backups (30 min)
- [ ] Environment variables audit (30 min)
- [ ] Error monitoring (1 hour)
- [ ] Uptime monitoring (15 min)
- [ ] Critical alerts (30 min)

### ⚠️ Important (Before Launch)
- [ ] SSL verification (15 min)
- [ ] Connection pooling (30 min)
- [ ] Performance check (30 min)

### 📝 Recommended (Optional)
- [ ] Documentation (30 min)
- [ ] Test critical flows (30 min)

---

## ⏱️ Time Estimate

**Minimum (Critical only):** 2-3 hours
**Recommended (Critical + Important):** 4-5 hours
**Complete (Everything):** 5-6 hours

---

## 💰 Cost Breakdown (Using Azure Student Credits)

```
App Service (Basic B1):        $13/month  (or use Free F1 for now)
PostgreSQL (Basic):            $30/month  (covered by $100 student credit)
Blob Storage:                  $5/month   (covered by student credit)
Application Insights:          $0/month   (5GB free tier)
Email Service:                 $5/month   (covered by student credit)
Sentry (Error Tracking):       $0/month   (free tier)
UptimeRobot:                   $0/month   (free tier)
---------------------------------------------------
Total:                         $0-13/month (with student credits)
```

**Note:** You have $100/month in Azure credits, so everything except App Service upgrade is covered.

---

## 🚀 Ready to Launch?

### Checklist Summary
- [ ] Database backups enabled and tested
- [ ] Environment variables secured
- [ ] Error monitoring active (Sentry or App Insights)
- [ ] Uptime monitoring active (UptimeRobot)
- [ ] Critical alerts configured
- [ ] SSL certificate valid
- [ ] Connection pooling configured
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] Critical user flows tested
- [ ] Documentation created

### When All Checked
**You're ready to launch! 🎉**

### If Something's Missing
**Don't launch yet.** The critical items (database backups, error monitoring, alerts) are non-negotiable for production.

---

## 📞 Need Help?

**Common Issues:**
1. **Database connection errors** → Check connection pooling settings
2. **Site is slow** → Run Lighthouse audit, optimize
3. **Emails not sending** → Verify Azure Communication Services config
4. **SSL errors** → Check certificate in Azure Portal
5. **High CPU usage** → Enable auto-scaling or optimize code

**Resources:**
- Azure Documentation: https://docs.microsoft.com/azure
- Sentry Documentation: https://docs.sentry.io
- Your Application Insights: Azure Portal → Application Insights

---

## 🎯 After Launch

### Week 1 Priorities
1. Monitor error rates
2. Gather user feedback
3. Fix critical bugs
4. Optimize performance
5. Plan first update

### Month 1 Priorities
1. Add automated testing
2. Improve documentation
3. Optimize database queries
4. Consider auto-scaling
5. Plan new features

**Remember:** Launch with the minimum, iterate based on real user feedback! 🚀
