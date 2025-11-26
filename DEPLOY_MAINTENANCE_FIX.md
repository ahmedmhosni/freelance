# Deploy Maintenance Fix to Azure

## Current Status
- ✅ Database table `maintenance_content` created successfully
- ❌ Azure App Service is running OLD CODE with SQL Server syntax
- ❌ Error still appears: `SELECT TOP 1` instead of `LIMIT 1`

## Why the Error Persists
The deployed code on Azure (`/home/site/wwwroot/`) is outdated. Your local code has been fixed, but Azure is still running the old version that uses SQL Server syntax.

## Solution: Deploy Updated Code

### Option 1: Git Push (Automatic Deployment)
Your GitHub Actions workflow will automatically deploy when you push to `main`:

```bash
# Stage all changes
git add .

# Commit with message
git commit -m "Fix: Update maintenance route to use PostgreSQL syntax and add maintenance_content table"

# Push to main branch
git push origin main
```

The GitHub Action will:
1. Build the backend
2. Deploy to Azure App Service
3. Restart the app automatically

### Option 2: Manual Deployment via Azure Portal
1. Go to Azure Portal
2. Navigate to App Service: `roastify-webapp-api`
3. Click "Deployment Center"
4. Click "Sync" or "Redeploy"

### Option 3: Azure CLI
```bash
# Zip the backend folder
cd backend
zip -r ../backend.zip .

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group your-resource-group \
  --name roastify-webapp-api \
  --src ../backend.zip
```

## Files Changed (Ready to Commit)
- ✅ `backend/.env` - Added PostgreSQL credentials
- ✅ `backend/src/routes/maintenance.js` - Already uses correct PostgreSQL syntax
- ✅ `database/schema-postgres.sql` - Updated with maintenance_content table
- ✅ `database/QUICK_FIX_MAINTENANCE.sql` - Migration SQL
- ✅ `database/migrations/ADD_MAINTENANCE_CONTENT_POSTGRES.sql` - Full migration

## After Deployment
Monitor the logs in Azure Portal. You should see:
- ✅ No more "relation maintenance_content does not exist" errors
- ✅ No more "SELECT TOP 1" syntax errors
- ✅ Successful queries to maintenance_content table

## Verify Deployment
After pushing, check:
1. GitHub Actions tab - Watch the deployment progress
2. Azure Portal → App Service → Log stream - Watch for successful startup
3. Test endpoint: `https://roastify.online/api/maintenance/status`

Expected response:
```json
{
  "is_active": false
}
```

---

**NEXT STEP: Commit and push your changes to trigger deployment**

```bash
git add .
git commit -m "Fix: Add maintenance_content table and update PostgreSQL queries"
git push origin main
```
