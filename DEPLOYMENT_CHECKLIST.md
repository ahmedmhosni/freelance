# 🚀 Azure Deployment Checklist

## Pre-Deployment

### ✅ Code Migration
- [x] All route files migrated to Azure SQL
- [x] Database connection file created (azuresql.js)
- [x] Schema file created (schema-azure.sql)
- [x] Migration script created (migrate-azure.js)
- [x] Seed script updated
- [x] No syntax errors in code

### ✅ Azure Resources Created
- [x] Resource Group: `roastify-rg`
- [x] SQL Server: `roastify-db-server.database.windows.net`
- [x] SQL Database: `roastifydbazure`
- [x] App Service: `roastify-webapp-api-c0hgg2h4f4djcwaf`
- [x] Static Web App: `white-sky-0a7e9f003`

---

## Deployment Steps

### Phase 1: Database Setup (15 minutes)

#### 1.1 Configure Firewall
```bash
# Add your IP to SQL Server firewall
az sql server firewall-rule create \
  --resource-group roastify-rg \
  --server roastify-db-server \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP

# Allow Azure services
az sql server firewall-rule create \
  --resource-group roastify-rg \
  --server roastify-db-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### 1.2 Run Migration
```bash
cd backend
node src/db/migrate-azure.js
```

Expected: ✅ Schema created successfully

#### 1.3 Seed Database
```bash
node src/db/seed.js
```

Expected: ✅ Admin and sample data created

---

### Phase 2: Backend Deployment (20 minutes)

#### 2.1 Configure Environment Variables

In Azure Portal → App Service → Configuration → Application Settings:

```
NODE_ENV = production
PORT = 8080
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
AZURE_SQL_SERVER = roastify-db-server.database.windows.net
AZURE_SQL_DATABASE = roastifydbazure
AZURE_SQL_USER = adminuser
AZURE_SQL_PASSWORD = AHmed#123456
AZURE_SQL_PORT = 1433
FRONTEND_URL = https://white-sky-0a7e9f003.3.azurestaticapps.net
```

Click **Save** and **Continue**

#### 2.2 Deploy Backend Code

**Option A: Local Git Deployment**
```bash
# Get deployment credentials
az webapp deployment list-publishing-credentials \
  --name roastify-webapp-api-c0hgg2h4f4djcwaf \
  --resource-group roastify-rg

# Add Azure remote
git remote add azure https://roastify-webapp-api-c0hgg2h4f4djcwaf.scm.azurewebsites.net/roastify-webapp-api-c0hgg2h4f4djcwaf.git

# Deploy
git add .
git commit -m "Azure SQL migration complete"
git push azure main
```

**Option B: ZIP Deployment**
```bash
# Create deployment package
cd backend
npm install --production
zip -r deploy.zip .

# Deploy
az webapp deployment source config-zip \
  --resource-group roastify-rg \
  --name roastify-webapp-api-c0hgg2h4f4djcwaf \
  --src deploy.zip
```

#### 2.3 Verify Backend
```bash
# Check health
curl https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/health

# Test login
curl -X POST https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Expected: 200 OK with token

---

### Phase 3: Frontend Deployment (15 minutes)

#### 3.1 Update Frontend Environment

Edit `frontend/.env`:
```env
VITE_API_URL=https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net
```

#### 3.2 Build Frontend
```bash
cd frontend
npm install
npm run build
```

Expected: `dist` folder created

#### 3.3 Deploy to Static Web App

**Option A: GitHub Actions (Recommended)**
1. Push code to GitHub
2. Azure Static Web App auto-deploys via GitHub Actions
3. Check Actions tab for deployment status

**Option B: Manual Deployment**
```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
cd frontend
swa deploy ./dist \
  --app-name white-sky-0a7e9f003 \
  --resource-group roastify-rg \
  --env production
```

#### 3.4 Verify Frontend
Visit: `https://white-sky-0a7e9f003.3.azurestaticapps.net`

Expected: Login page loads

---

### Phase 4: Testing (20 minutes)

#### 4.1 Authentication Tests
- [ ] Can access login page
- [ ] Can login with admin@example.com / admin123
- [ ] Can login with freelancer@example.com / freelancer123
- [ ] JWT token is stored
- [ ] Can logout

#### 4.2 Feature Tests
- [ ] Dashboard loads with statistics
- [ ] Can view clients list
- [ ] Can create new client
- [ ] Can edit client
- [ ] Can delete client
- [ ] Can search clients
- [ ] Can view projects list
- [ ] Can create new project
- [ ] Can edit project
- [ ] Can delete project
- [ ] Can view tasks list
- [ ] Can create new task
- [ ] Can edit task
- [ ] Can delete task
- [ ] Can view invoices list
- [ ] Can create new invoice
- [ ] Can edit invoice
- [ ] Can delete invoice
- [ ] Time tracking works
- [ ] Reports generate correctly
- [ ] Notifications display
- [ ] Daily quote displays

#### 4.3 Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Database queries < 500ms
- [ ] No console errors
- [ ] No network errors

---

## Post-Deployment

### Monitoring Setup

#### Enable Application Insights
```bash
az monitor app-insights component create \
  --app roastify-insights \
  --location canadaeast \
  --resource-group roastify-rg \
  --application-type web
```

#### Set Up Alerts
1. Go to Azure Portal → Monitor → Alerts
2. Create alert rules:
   - CPU usage > 80%
   - Memory usage > 80%
   - Failed requests > 10 in 5 minutes
   - Database DTU > 80%

### Backup Configuration

#### Database Backup
- Automatic daily backups enabled (7-day retention)
- Manual backup:
```bash
az sql db export \
  --resource-group roastify-rg \
  --server roastify-db-server \
  --name roastifydbazure \
  --admin-user adminuser \
  --admin-password "AHmed#123456" \
  --storage-key-type StorageAccessKey \
  --storage-key YOUR_KEY \
  --storage-uri https://yourstorage.blob.core.windows.net/backups/backup.bacpac
```

### Security Hardening

- [ ] Change default admin password
- [ ] Update JWT_SECRET to strong random value
- [ ] Enable HTTPS only (force SSL)
- [ ] Configure SQL firewall (whitelist only)
- [ ] Enable Azure AD authentication (optional)
- [ ] Set up rate limiting
- [ ] Enable SQL threat detection
- [ ] Configure Content Security Policy
- [ ] Regular security updates (npm audit)

---

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
az webapp log tail \
  --name roastify-webapp-api-c0hgg2h4f4djcwaf \
  --resource-group roastify-rg

# Check environment variables
az webapp config appsettings list \
  --name roastify-webapp-api-c0hgg2h4f4djcwaf \
  --resource-group roastify-rg
```

### Database Connection Failed
1. Check firewall rules
2. Verify credentials
3. Test connection:
```bash
cd backend
node -e "const db = require('./src/db/azuresql'); db.then(() => console.log('Connected!')).catch(err => console.error(err));"
```

### Frontend API Calls Failing
1. Check CORS configuration in backend
2. Verify FRONTEND_URL environment variable
3. Check browser console for errors
4. Verify API URL in frontend .env

---

## Success Criteria

Your deployment is successful when:

✅ Frontend loads at Static Web App URL  
✅ Can login with credentials  
✅ Dashboard shows data from Azure SQL  
✅ All CRUD operations work  
✅ No console errors  
✅ No App Service errors  
✅ Database queries < 500ms  
✅ API responses < 1 second  
✅ All features working  
✅ Cost within budget ($0-18/month)  

---

## 🎉 Deployment Complete!

Once all checkboxes are marked, your application is successfully deployed to Azure!

**Live URLs:**
- Frontend: https://white-sky-0a7e9f003.3.azurestaticapps.net
- Backend: https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net

**Login Credentials:**
- Admin: admin@example.com / admin123
- Freelancer: freelancer@example.com / freelancer123

**Monthly Cost:** $0 (first 12 months), then $18/month

Congratulations! 🚀
