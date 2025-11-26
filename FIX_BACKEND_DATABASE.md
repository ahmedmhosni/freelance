# Fix Backend Database Connection

## Problem Detected
The backend is still using Azure SQL Server instead of PostgreSQL!

Error: `syntax error at or near "RETURNING"` - This is SQL Server, not PostgreSQL.

## Solution: Update Environment Variables Properly

### Step 1: Go to Azure Portal
1. Navigate to your App Service: `roastify-webapp-api-c0hgg2h4f4djcwaf`
2. Click "Configuration" in the left menu
3. Click "Application settings" tab

### Step 2: Verify These Variables Exist

Make sure these are set (click "New application setting" if missing):

```
USE_POSTGRES = true
USE_AZURE_SQL = false
PG_HOST = roastifydbpost.postgres.database.azure.com
PG_PORT = 5432
PG_DATABASE = roastifydb
PG_USER = adminuser
PG_PASSWORD = AHmed#123456
PG_SSL = true
```

### Step 3: IMPORTANT - Save and Restart

1. Click "Save" at the top
2. Click "Continue" when prompted
3. Wait for it to say "Saved successfully"
4. Then go to "Overview"
5. Click "Restart" button
6. Wait 2-3 minutes for restart to complete

### Step 4: Verify

After restart, check logs:
1. Go to "Log stream" in left menu
2. Look for: `🐘 Using PostgreSQL Database`
3. Should see: `✓ Connected to PostgreSQL database`

If you see `🔵 Using Azure SQL Database` - the env vars didn't save!

## Alternative: Set via Azure CLI

```bash
az webapp config appsettings set \
  --name roastify-webapp-api-c0hgg2h4f4djcwaf \
  --resource-group your-resource-group \
  --settings \
    USE_POSTGRES=true \
    USE_AZURE_SQL=false \
    PG_HOST=roastifydbpost.postgres.database.azure.com \
    PG_PORT=5432 \
    PG_DATABASE=roastifydb \
    PG_USER=adminuser \
    PG_PASSWORD="AHmed#123456" \
    PG_SSL=true
```

## Common Issues

### Issue 1: Variables Not Saving
- Make sure you click "Save" at the top
- Wait for "Saved successfully" message
- Then restart the app

### Issue 2: App Not Restarting
- Manually restart from Overview page
- Wait 2-3 minutes
- Check logs to confirm

### Issue 3: Still Using Azure SQL
- Double-check USE_POSTGRES=true (not "True" or "TRUE")
- Double-check USE_AZURE_SQL=false
- Make sure no typos in variable names

## After Fix

Once fixed, you should be able to:
1. Login with: ahmedmhosni90@gmail.com / Ahmed#123456
2. See PostgreSQL in logs
3. All features working

