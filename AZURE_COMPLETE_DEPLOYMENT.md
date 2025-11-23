# Azure Complete Deployment Guide

## ✅ Your Azure Resources

**Database:**
- Server: `roastify-db-server.database.windows.net`
- Database: `roastifydbazure`
- Username: `adminuser`
- Password: `AHmed#123456`

**Backend:**
- URL: `https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net`
- Service: App Service (Node.js 18)

**Frontend:**
- URL: `https://white-sky-0a7e9f003.3.azurestaticapps.net`
- Service: Static Web App

---

## 🔄 Migration Status

### Completed:
1. ✅ Azure SQL driver installed (`mssql`)
2. ✅ Azure SQL connection file created
3. ✅ Azure environment file created
4. ✅ Azure SQL schema created
5. ✅ Migration script created

### In Progress:
- ⏳ Converting all route files to Azure SQL syntax
- ⏳ Testing database operations
- ⏳ Deploying to Azure

---

## 📝 What's Being Migrated

**Total Files:** 15 files  
**Total Queries:** ~150 queries  
**Estimated Changes:** ~2,500 lines  

**Files:**
1. auth.js - Authentication routes
2. clients.js - Client management
3. projects.js - Project management
4. tasks.js - Task management
5. invoices.js - Invoice management
6. files.js - File uploads
7. admin.js - Admin operations
8. notifications.js - Notifications
9. reports.js - Reporting
10. timeTracking.js - Time tracking
11. dashboard.js - Dashboard data
12. quotes.js - Daily quotes
13. seed.js - Seed data

---

## 💰 Final Cost

**Your Azure Setup:**
- Months 1-12: **$0/month**
- After 12 months: **$18/month**

**Breakdown:**
- App Service B1: $13/month
- Azure SQL Basic: $5/month
- Static Web App: FREE
- Storage: Included

---

## 🎯 Deployment Timeline

1. **Code Migration:** 4-6 hours (in progress)
2. **Testing:** 1 hour
3. **Deployment:** 30 minutes
4. **Verification:** 30 minutes

**Total:** 6-8 hours

---

## ⏭️ Next Steps

I'm now migrating all route files to Azure SQL syntax. This is a comprehensive process to ensure nothing is skipped.

**Status:** Migration in progress...


---

## 📋 Step-by-Step Deployment Process

### Phase 1: Database Setup (30 minutes)

#### 1.1 Initialize Azure SQL Database

```bash
# Navigate to backend
cd backend

# Run migration script
node src/db/migrate-azure.js
```

This will:
- Create all tables
- Set up indexes
- Configure constraints
- Seed initial data

#### 1.2 Verify Database Connection

```bash
# Test connection
node -e "const db = require('./src/db/azuresql'); db.testConnection();"
```

Expected output: `✅ Azure SQL connection successful`

---

### Phase 2: Backend Migration (4-6 hours)

#### 2.1 Update Database Import

All route files need to switch from SQLite to Azure SQL:

**Before:**
```javascript
const db = require('../db/database');
```

**After:**
```javascript
const db = require('../db/azuresql');
```

#### 2.2 Convert Query Syntax

**SQLite Syntax (Old):**
```javascript
db.get('SELECT * FROM users WHERE id = ?', [userId])
```

**Azure SQL Syntax (New):**
```javascript
const request = db.request();
request.input('userId', sql.Int, userId);
const result = await request.query('SELECT * FROM users WHERE id = @userId');
const user = result.recordset[0];
```

#### 2.3 Files to Migrate

Priority order:

1. **auth.js** - Critical (login/register)
2. **clients.js** - High priority
3. **projects.js** - High priority
4. **tasks.js** - High priority
5. **invoices.js** - High priority
6. **dashboard.js** - Medium priority
7. **timeTracking.js** - Medium priority
8. **reports.js** - Medium priority
9. **notifications.js** - Low priority
10. **quotes.js** - Low priority
11. **files.js** - Low priority
12. **admin.js** - Low priority

---

### Phase 3: Backend Deployment (30 minutes)

#### 3.1 Configure App Service

```bash
# Login to Azure
az login

# Set deployment source to local Git
az webapp deployment source config-local-git \
  --name roastify-webapp-api-c0hgg2h4f4djcwaf \
  --resource-group roastify-rg
```

#### 3.2 Configure Environment Variables

In Azure Portal:
1. Go to App Service → Configuration
2. Add Application Settings:

```
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
AZURE_SQL_SERVER=roastify-db-server.database.windows.net
AZURE_SQL_DATABASE=roastifydbazure
AZURE_SQL_USER=adminuser
AZURE_SQL_PASSWORD=AHmed#123456
AZURE_SQL_PORT=1433
FRONTEND_URL=https://white-sky-0a7e9f003.3.azurestaticapps.net
```

#### 3.3 Deploy Backend Code

```bash
# Add Azure remote
git remote add azure https://roastify-webapp-api-c0hgg2h4f4djcwaf.scm.azurewebsites.net/roastify-webapp-api-c0hgg2h4f4djcwaf.git

# Deploy
git add .
git commit -m "Azure SQL migration complete"
git push azure main
```

#### 3.4 Verify Backend Deployment

```bash
# Check health endpoint
curl https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/health
```

Expected: `{"status":"ok"}`

---

### Phase 4: Frontend Deployment (20 minutes)

#### 4.1 Update Frontend Environment

Edit `frontend/.env`:

```env
VITE_API_URL=https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net
```

#### 4.2 Build Frontend

```bash
cd frontend
npm run build
```

#### 4.3 Deploy to Static Web App

```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist \
  --app-name white-sky-0a7e9f003 \
  --resource-group roastify-rg \
  --env production
```

Or use GitHub Actions (recommended):

1. Connect your GitHub repo to Static Web App
2. Azure will auto-generate workflow file
3. Push code → automatic deployment

---

### Phase 5: Testing & Verification (30 minutes)

#### 5.1 Backend API Tests

```bash
# Test authentication
curl -X POST https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Test clients endpoint (with token)
curl https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5.2 Frontend Tests

Visit: `https://white-sky-0a7e9f003.3.azurestaticapps.net`

Test:
- ✅ Login page loads
- ✅ Can login with credentials
- ✅ Dashboard displays data
- ✅ Can create/edit clients
- ✅ Can create/edit projects
- ✅ Can create/edit tasks
- ✅ Can generate invoices
- ✅ Time tracking works
- ✅ Reports generate correctly

#### 5.3 Database Verification

```sql
-- Connect to Azure SQL via Azure Portal Query Editor
-- Check record counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices;
```

---

## 🔧 Configuration Files Reference

### backend/src/server.js

Ensure it uses the correct database:

```javascript
// Use Azure SQL in production
const db = process.env.NODE_ENV === 'production' 
  ? require('./db/azuresql')
  : require('./db/database');
```

### backend/package.json

Add start script:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate:azure": "node src/db/migrate-azure.js"
  }
}
```

---

## 🚨 Troubleshooting

### Database Connection Issues

**Error:** `Login failed for user 'adminuser'`

**Solution:**
1. Check firewall rules in Azure SQL
2. Add your IP: Azure Portal → SQL Server → Firewalls and virtual networks
3. Enable "Allow Azure services"

### Backend Not Starting

**Error:** `Application Error`

**Solution:**
1. Check logs: `az webapp log tail --name roastify-webapp-api-c0hgg2h4f4djcwaf --resource-group roastify-rg`
2. Verify environment variables are set
3. Check `package.json` has correct start script

### Frontend API Calls Failing

**Error:** `CORS error` or `Network error`

**Solution:**
1. Verify `FRONTEND_URL` in backend environment variables
2. Check CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Migration Script Fails

**Error:** `Table already exists`

**Solution:**
```sql
-- Drop all tables and re-run migration
DROP TABLE IF EXISTS time_entries;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS daily_quotes;
DROP TABLE IF EXISTS users;
```

---

## 📊 Monitoring & Maintenance

### Enable Application Insights

```bash
az monitor app-insights component create \
  --app roastify-insights \
  --location canadaeast \
  --resource-group roastify-rg \
  --application-type web
```

### Set Up Alerts

1. Go to Azure Portal → Monitor → Alerts
2. Create alert rules for:
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Failed requests (>10 in 5 minutes)
   - Database DTU usage (>80%)

### Backup Strategy

**Automated Backups:**
- Azure SQL: Automatic daily backups (7-day retention)
- App Service: Configure backup in portal

**Manual Backup:**
```bash
# Export database
az sql db export \
  --resource-group roastify-rg \
  --server roastify-db-server \
  --name roastifydbazure \
  --admin-user adminuser \
  --admin-password "AHmed#123456" \
  --storage-key-type StorageAccessKey \
  --storage-key YOUR_STORAGE_KEY \
  --storage-uri https://yourstorage.blob.core.windows.net/backups/backup.bacpac
```

---

## 🎯 Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
```

### Backend Optimization

1. Enable compression:
```javascript
const compression = require('compression');
app.use(compression());
```

2. Add caching headers:
```javascript
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

### Frontend Optimization

1. Enable CDN for Static Web App
2. Optimize images (use WebP format)
3. Enable lazy loading for components
4. Use React.memo for expensive components

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET to strong random value
- [ ] Enable HTTPS only (force SSL)
- [ ] Configure SQL firewall rules (whitelist only)
- [ ] Enable Azure AD authentication (optional)
- [ ] Set up rate limiting on API
- [ ] Enable SQL threat detection
- [ ] Configure Content Security Policy
- [ ] Enable CORS only for your domain
- [ ] Regular security updates (npm audit)

---

## 📈 Scaling Strategy

### When to Scale Up

**Database:**
- DTU usage consistently >80%
- Query response time >1 second
- Upgrade: Basic → Standard S0 ($15/month)

**App Service:**
- CPU usage consistently >80%
- Memory usage consistently >80%
- Response time >2 seconds
- Upgrade: B1 → S1 ($70/month) for auto-scaling

### Horizontal Scaling

For high traffic:
1. Enable App Service auto-scaling
2. Use Azure Front Door for load balancing
3. Implement Redis cache for sessions
4. Use Azure CDN for static assets

---

## 🎉 Post-Deployment Checklist

- [ ] Database initialized and seeded
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] All API endpoints tested
- [ ] Login/authentication working
- [ ] CRUD operations verified
- [ ] File uploads working
- [ ] Email notifications configured
- [ ] PDF generation working
- [ ] Reports generating correctly
- [ ] Time tracking functional
- [ ] Dashboard displaying data
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation updated

---

## 📞 Support Resources

**Azure Documentation:**
- App Service: https://docs.microsoft.com/azure/app-service/
- SQL Database: https://docs.microsoft.com/azure/sql-database/
- Static Web Apps: https://docs.microsoft.com/azure/static-web-apps/

**Azure Support:**
- Portal: https://portal.azure.com → Help + support
- Community: https://docs.microsoft.com/answers/
- Stack Overflow: Tag with `azure`

**Cost Management:**
- Monitor costs: Azure Portal → Cost Management
- Set budget alerts
- Review monthly invoices

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Frontend loads at Static Web App URL
2. ✅ Can login with admin credentials
3. ✅ Dashboard shows data from Azure SQL
4. ✅ Can perform all CRUD operations
5. ✅ No console errors in browser
6. ✅ No errors in App Service logs
7. ✅ Database queries execute in <500ms
8. ✅ API responses in <1 second
9. ✅ All features working as expected
10. ✅ Cost within budget ($0-18/month)

---

## 🚀 You're Ready!

Your Azure infrastructure is set up and ready for deployment. Follow the phases above in order, and you'll have a fully functional production application running on Azure.

**Estimated Total Time:** 6-8 hours
**Monthly Cost:** $0 (first 12 months), then $18/month

Good luck with your deployment! 🎉
