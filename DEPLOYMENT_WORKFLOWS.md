# Deployment Workflows - Current Setup

## ✅ Active Workflows

Your application now deploys automatically from the `main` branch with 2 workflows:

### 1. Frontend Deployment
**File**: `.github/workflows/azure-static-web-apps-white-sky-0a7e9f003.yml`

```yaml
Trigger: Push to main branch
Deploys: Frontend (React app)
Target: Azure Static Web Apps
URL: https://white-sky-0a7e9f003.3.azurestaticapps.net
```

**What it does:**
- Builds the React frontend from `./frontend` directory
- Deploys to Azure Static Web Apps
- Automatically updates on every push to main

### 2. Backend Deployment
**File**: `.github/workflows/main_roastify-webapp-api.yml`

```yaml
Trigger: Push to main branch
Deploys: Backend (Node.js API)
Target: Azure Web App
URL: https://roastify-webapp-api.azurewebsites.net
```

**What it does:**
- Installs dependencies
- Builds the backend
- Deploys to Azure Web App
- Automatically updates on every push to main

## 🔄 How It Works

```
You push to main
       ↓
GitHub Actions triggers
       ↓
   ┌───────┴───────┐
   ↓               ↓
Frontend        Backend
Workflow        Workflow
   ↓               ↓
Azure Static    Azure Web
Web Apps        App
   ↓               ↓
   └───────┬───────┘
           ↓
    Deployment Complete!
```

## 📊 Deployment Status

Check your deployments:
- **GitHub Actions**: https://github.com/ahmedmhosni/freelance/actions
- **Azure Portal**: https://portal.azure.com

### Current Deployment
- **Branch**: main
- **Status**: Deploying...
- **ETA**: 5-10 minutes

## 🎯 What Triggers Deployment

### Automatic Triggers
- ✅ Push to `main` branch
- ✅ Merge to `main` branch
- ✅ Direct commit to `main` branch

### Manual Trigger
You can also trigger manually:
1. Go to GitHub Actions
2. Select the workflow
3. Click "Run workflow"

## 🗑️ Removed Workflows

**Deleted**: `azure-migration_roastify-webapp-api.yml`
- **Reason**: Was watching `azure-migration` branch
- **Status**: No longer needed since we merged to main

## 📝 Workflow Details

### Frontend Workflow Steps
1. Checkout code
2. Build React app
3. Deploy to Azure Static Web Apps
4. Update production environment

### Backend Workflow Steps
1. Checkout code
2. Setup Node.js 22.x
3. Install dependencies
4. Build (if needed)
5. Upload artifact
6. Login to Azure
7. Deploy to Azure Web App

## 🔐 Secrets Used

Your workflows use these GitHub secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN_WHITE_SKY_0A7E9F003`
- `AZUREAPPSERVICE_CLIENTID_*`
- `AZUREAPPSERVICE_TENANTID_*`
- `AZUREAPPSERVICE_SUBSCRIPTIONID_*`

These are automatically managed by Azure.

## 🚀 Deployment Best Practices

### Before Pushing to Main
1. Test locally
2. Check for errors
3. Update documentation
4. Review changes

### After Pushing to Main
1. Monitor GitHub Actions
2. Check deployment logs
3. Test the deployed app
4. Verify all features work

## 🐛 Troubleshooting

### If Frontend Deployment Fails
1. Check GitHub Actions logs
2. Verify `frontend` directory exists
3. Check for build errors
4. Ensure `package.json` is correct

### If Backend Deployment Fails
1. Check GitHub Actions logs
2. Verify Node.js version (22.x)
3. Check for dependency errors
4. Verify Azure credentials

### If Both Fail
1. Check if main branch is protected
2. Verify GitHub secrets exist
3. Check Azure service status
4. Review recent code changes

## 📈 Monitoring

### GitHub Actions
- View all runs: https://github.com/ahmedmhosni/freelance/actions
- Filter by workflow
- Check logs for errors

### Azure Portal
- **Static Web Apps**: Monitor frontend
- **App Services**: Monitor backend
- **Application Insights**: View metrics

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ GitHub Actions shows green checkmarks
- ✅ Frontend URL loads correctly
- ✅ Backend API responds
- ✅ No errors in browser console
- ✅ All features work as expected

## 📞 Quick Reference

**Frontend URL**: https://white-sky-0a7e9f003.3.azurestaticapps.net
**Backend URL**: https://roastify-webapp-api.azurewebsites.net
**GitHub Actions**: https://github.com/ahmedmhosni/freelance/actions
**Azure Portal**: https://portal.azure.com

---

**Last Updated**: ${new Date().toLocaleString()}
**Active Branch**: main
**Deployment**: Automatic on push
