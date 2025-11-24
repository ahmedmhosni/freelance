# Find Your Backend URL

## The Problem

The frontend is trying to connect to `roastify-webapp-api.azurewebsites.net` but getting `ERR_NAME_NOT_RESOLVED`.

This means either:
1. The backend isn't deployed yet
2. The URL is different
3. The backend is in a different region/name

## How to Find the Correct URL

### Method 1: Azure Portal (Easiest)

1. Go to https://portal.azure.com
2. Click **App Services** in the left menu (or search for it)
3. Look for your backend app in the list
4. Click on it
5. In the **Overview** page, look for **URL** or **Default domain**
6. Copy that URL

### Method 2: Check GitHub Actions Logs

1. Go to https://github.com/ahmedmhosni/freelance/actions
2. Click on a successful backend deployment
3. Look in the logs for the deployment URL
4. It might show something like: "Deployed to: https://[app-name].azurewebsites.net"

### Method 3: Check Azure CLI (If Installed)

```bash
az webapp list --query "[].{name:name, url:defaultHostName}" --output table
```

## Common Backend URLs

Your backend might be at one of these:
- `https://roastify-webapp-api.azurewebsites.net`
- `https://roastify-webapp-api-[random].azurewebsites.net`
- `https://roastify-api.azurewebsites.net`
- `https://roastify-backend.azurewebsites.net`

## Test the URL

Once you find a URL, test it in your browser:

```
https://[your-backend-url]/api/quotes/daily
```

Should return JSON like:
```json
{
  "text": "Success is not final...",
  "author": "Winston Churchill"
}
```

## After Finding the URL

### Update These Files:

1. **`.github/workflows/azure-static-web-apps-white-sky-0a7e9f003.yml`**
```yaml
env:
  VITE_API_URL: https://[YOUR-ACTUAL-BACKEND-URL]
```

2. **`frontend/staticwebapp.config.json`**
```json
"connect-src": "'self' https://[YOUR-ACTUAL-BACKEND-URL] ws://[YOUR-ACTUAL-BACKEND-URL] wss://[YOUR-ACTUAL-BACKEND-URL]"
```

3. **Commit and push**:
```bash
git add .
git commit -m "fix: Update to correct backend URL"
git push origin main
```

## If Backend Doesn't Exist

If you can't find the backend in Azure Portal, it might not be deployed. Check:

1. **GitHub Actions** - Did the backend deployment succeed?
2. **Azure Portal** - Do you have an App Service?
3. **Subscription** - Is your Azure subscription active?

## Current Deployment Status

The backend workflow was just updated to deploy only the backend folder. Wait ~5 minutes for it to complete, then check Azure Portal for the URL.

---

**Action Required**: Find the backend URL in Azure Portal and update the frontend configuration
