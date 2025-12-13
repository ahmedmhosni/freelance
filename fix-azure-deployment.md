# Fix Azure Deployment - Publish Profile Issue

## Problem
The GitHub Actions deployment is failing with:
```
Error: Publish profile is invalid for app-name and slot-name provided
```

## Root Cause
The `AZURE_WEBAPP_PUBLISH_PROFILE` secret in GitHub doesn't match the app name `roastify-webapp-api-c0hgg2h4f4djcwaf` we're using in the workflow.

## Solution Options

### Option 1: Update Publish Profile (Recommended)
1. Go to Azure Portal: https://portal.azure.com
2. Navigate to **App Services**
3. Find your app: `roastify-webapp-api-c0hgg2h4f4djcwaf`
4. Click **Get publish profile** (download button)
5. Open the downloaded `.PublishSettings` file
6. Copy the entire XML content
7. Go to GitHub: https://github.com/ahmedmhosni/freelance/settings/secrets/actions
8. Update the secret `AZURE_WEBAPP_PUBLISH_PROFILE` with the new content

### Option 2: Use Correct App Name
If your current publish profile is for a different app name:
1. Check what app name your current publish profile is for
2. Update the workflow to use that app name instead

### Option 3: Use Azure CLI Deployment
Use the alternative workflow file I created: `deploy-backend-cli.yml`
This requires these GitHub secrets:
- `AZURE_CREDENTIALS` (Service Principal JSON)
- `AZURE_RESOURCE_GROUP` (Resource group name)

## Quick Test
After updating the publish profile, the deployment should work and you should see:
- ✅ https://api.roastify.online/api/health returns 200 OK
- ✅ Response shows "Full Production Server" instead of "Minimal Server"

## Current Status
- ✅ API is working with minimal server
- ✅ All Azure fixes are applied (database config, restart prevention)
- ⏳ Need to fix publish profile to deploy full server

## Next Steps
1. Update the publish profile secret (Option 1)
2. Commit any small change to trigger new deployment
3. Test the full server deployment