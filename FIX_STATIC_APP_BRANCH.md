# Fix Azure Static Web App Branch Configuration

## Problem
Your Azure Static Web App is still watching the `azure-migration` branch instead of `main`.

```json
"branch": "azure-migration"  ❌ Wrong!
```

Should be:
```json
"branch": "main"  ✅ Correct!
```

## Solution: Update via Azure Portal

### Step 1: Go to Azure Portal
1. Visit: https://portal.azure.com
2. Navigate to: **Static Web Apps** → **roastify-static**

### Step 2: Disconnect Current Repository
1. In the left menu, click **"Configuration"**
2. Under **"Source"**, you'll see:
   - Repository: `ahmedmhosni/freelance`
   - Branch: `azure-migration`
3. Click **"Disconnect"** button

### Step 3: Reconnect with Main Branch
1. Click **"Connect to GitHub"**
2. Select your repository: `ahmedmhosni/freelance`
3. **Important**: Select branch: `main` (not azure-migration!)
4. Set build details:
   - App location: `./frontend`
   - Api location: (leave empty)
   - Output location: `build`
5. Click **"Save"**

### Step 4: Verify
After reconnecting, Azure will:
1. Create/update the workflow file
2. Trigger a new deployment from `main` branch
3. Deploy your latest code

## Alternative: Update Workflow File Manually

If you prefer to update the workflow file directly:

1. The workflow file is: `.github/workflows/azure-static-web-apps-white-sky-0a7e9f003.yml`
2. It already watches `main` branch ✅
3. But Azure's configuration still points to `azure-migration`
4. Disconnecting and reconnecting will sync them

## What Will Happen

After updating:
- ✅ Every push to `main` will deploy the frontend
- ✅ Your latest changes will be deployed
- ✅ The `azure-migration` branch will no longer trigger deployments

## Verification

After the change, check:
1. Go to: https://portal.azure.com
2. Navigate to: Static Web Apps → roastify-static → Configuration
3. Verify: Branch shows `main`
4. Check: https://github.com/ahmedmhosni/freelance/actions
5. You should see a new deployment triggered

## Quick Steps Summary

```
1. Azure Portal → Static Web Apps → roastify-static
2. Configuration → Disconnect
3. Connect to GitHub → Select main branch
4. Save
5. Wait for deployment (~5 minutes)
6. Test: https://white-sky-0a7e9f003.3.azurestaticapps.net
```

## Expected Result

After this fix:
- ✅ Frontend deploys from `main` branch
- ✅ Backend deploys from `main` branch
- ✅ Both stay in sync
- ✅ Your latest code is live

---

**Current Status**: Static Web App watching wrong branch
**Action Required**: Update branch to `main` in Azure Portal
**Time Required**: ~2 minutes to update, ~5 minutes to deploy
