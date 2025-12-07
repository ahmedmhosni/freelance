# Azure Deployment Fix for Password Reset

## Issue
The Azure production server is returning 404 for all routes, including the new password reset endpoints.

## Root Cause
The GitHub Actions deployment may have failed or the Azure Web App needs to be restarted.

## Solution Steps

### 1. Verify Code is Pushed
```bash
git log --oneline -3
# Should show: "Fix: Password reset functionality - move methods inside AuthService class"
```

### 2. Check GitHub Actions
- Go to: https://github.com/ahmedmhosni/freelance/actions
- Look for the latest workflow run
- Check if "Build and deploy Node.js app to Azure Web App" succeeded

### 3. Manual Azure Restart (if needed)
If you have Azure CLI installed:
```bash
az webapp restart --name roastify-webapp-api --resource-group roastify-rg
```

Or via Azure Portal:
1. Go to https://portal.azure.com
2. Navigate to App Services > roastify-webapp-api
3. Click "Restart" button
4. Wait 2-3 minutes for the app to start

### 4. Check Deployment Logs
Via Azure Portal:
1. Go to App Services > roastify-webapp-api
2. Click "Deployment Center" in left menu
3. Check "Logs" tab for recent deployments
4. Look for errors in the deployment process

### 5. Check Application Logs
Via Azure Portal:
1. Go to App Services > roastify-webapp-api
2. Click "Log stream" in left menu
3. Watch for startup errors or missing environment variables

## Password Reset Implementation Summary

### Routes Added
- `POST /api/v2/auth/forgot-password` - Request password reset
- `POST /api/v2/auth/reset-password` - Reset password with token

### Database Schema
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
```
✅ Already applied to Azure database

### Files Modified
1. `backend/src/modules/auth/controllers/AuthController.js` - Added routes
2. `backend/src/modules/auth/services/AuthService.js` - Added methods
3. `backend/src/services/emailService.js` - Added email template

### Testing Locally
Once Azure is fixed, test with:
```bash
node test-password-reset.js
```

## Current Status
- ✅ Code pushed to GitHub
- ✅ Database schema updated
- ✅ Email service configured
- ❌ Azure deployment not reflecting changes (404 errors)

## Next Steps
1. Check GitHub Actions workflow status
2. Restart Azure Web App if needed
3. Monitor deployment logs
4. Test endpoints once deployed
