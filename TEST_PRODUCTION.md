# Test Production PostgreSQL Migration

## ✅ Environment Variables Updated

Now let's verify everything works!

## Test Checklist

### 1. Check App Service Status
- Go to Azure Portal → Your App Service
- Check "Overview" - Status should be "Running"
- Check "Log stream" for any errors

### 2. Test Backend API
Open your browser and test these endpoints:

**Health Check:**
```
https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/health
```
Should return: `{"status":"ok"}`

**Database Connection:**
Check the logs - should see: `🐘 Using PostgreSQL Database`

### 3. Test Registration
1. Go to: https://roastify.online/register
2. Register a new test user
3. Check email for verification code
4. Verify email

### 4. Test Login
1. Go to: https://roastify.online/login
2. Login with test user
3. Should redirect to dashboard

### 5. Test Features
- ✅ Create a project
- ✅ Add a task
- ✅ Create an invoice
- ✅ Track time
- ✅ View reports

## Expected Results

### Backend Logs Should Show:
```
🐘 Using PostgreSQL Database
✓ Connected to PostgreSQL database
Server running on port 8080
```

### Frontend Should:
- Load without errors
- Allow registration/login
- All features working
- No 500 errors

## If Something Goes Wrong

### Check App Service Logs:
1. Azure Portal → App Service
2. Click "Log stream"
3. Look for errors

### Common Issues:

**Connection Error:**
- Check PG_HOST is correct
- Check PG_SSL=true
- Check firewall rules

**Module Not Found:**
- App Service might need restart
- Check if `pg` package is in package.json

**Authentication Failed:**
- Check PG_USER and PG_PASSWORD
- Check if user has permissions

## Quick Fixes

### Restart App Service:
```bash
az webapp restart --name roastify-webapp-api-c0hgg2h4f4djcwaf --resource-group your-rg
```

### View Logs:
```bash
az webapp log tail --name roastify-webapp-api-c0hgg2h4f4djcwaf --resource-group your-rg
```

## Success Indicators

✅ App Service running
✅ No errors in logs
✅ Can register new user
✅ Can login
✅ Can create data
✅ All features working

## Next Steps After Verification

1. Monitor for 24 hours
2. Check performance
3. Verify all features
4. After 1 week, can decommission Azure SQL Server

