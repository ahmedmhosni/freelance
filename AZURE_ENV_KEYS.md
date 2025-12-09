# Azure Environment Variables Configuration

## 🔑 REQUIRED: Add to Azure App Service

Go to: **Azure Portal → App Service (roastify-webapp-api) → Configuration → Application settings**

### AI Assistant Configuration

```
Name: GEMINI_API_KEY
Value: AIzaSyACrmn14lPWw2D5-vPiJmZhiaqqi1MJaW8
```

**Purpose:** Enables Google Gemini AI Assistant functionality

---

## ✅ CURRENT PRODUCTION STATUS

### Working:
- ✅ Server is UP and running
- ✅ Health check responding (200 OK)
- ✅ API version endpoint working
- ✅ Legal Terms page working
- ✅ Database connection established

### Issues Found:
- ❌ Login endpoint returning 401 (credentials issue)
- ❌ Auth check endpoint 404 (route not found)
- ❌ Legal Privacy returning 500
- ❌ Public Changelog returning 500

---

## 🔧 HOW TO ADD ENVIRONMENT VARIABLE

### Method 1: Azure Portal (Recommended)
1. Go to https://portal.azure.com
2. Navigate to **App Services**
3. Select **roastify-webapp-api**
4. Click **Configuration** in left menu
5. Click **+ New application setting**
6. Enter:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyACrmn14lPWw2D5-vPiJmZhiaqqi1MJaW8`
7. Click **OK**
8. Click **Save** at the top
9. Click **Continue** to restart the app

### Method 2: Azure CLI
```bash
az webapp config appsettings set \
  --name roastify-webapp-api \
  --resource-group your-resource-group \
  --settings GEMINI_API_KEY="AIzaSyACrmn14lPWw2D5-vPiJmZhiaqqi1MJaW8"
```

---

## 📝 VERIFICATION

After adding the key, verify it's working:

### Check Server Logs
Look for this message in Application Insights or Log Stream:
```
✅ AI Assistant initialized and enabled
```

### Test AI Endpoint
```bash
curl https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/ai/usage \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return:
```json
{
  "daily_requests": 0,
  "monthly_requests": 0,
  "daily_limit": 100,
  "monthly_limit": 1000
}
```

---

## 🎯 NEXT STEPS

1. **Add GEMINI_API_KEY** to Azure (see above)
2. **Fix remaining 500 errors** (Privacy & Changelog routes)
3. **Test login** with correct credentials
4. **Enable AI in database:**
   ```sql
   UPDATE ai_settings SET enabled = true WHERE id = 1;
   ```

---

## 📊 PRODUCTION HEALTH SUMMARY

**Server Status:** ✅ ONLINE  
**Database:** ✅ CONNECTED  
**API Endpoints:** ⚠️ PARTIALLY WORKING (43% passing)  
**AI Assistant:** ⏳ READY (needs API key)  

**Critical Issues:** 2 (Privacy & Changelog 500 errors)  
**Minor Issues:** 2 (Login credentials & Auth check route)

---

## 🔐 SECURITY NOTES

- API key is for development/testing
- Consider rotating keys periodically
- Monitor usage in Google Cloud Console
- Set up billing alerts to prevent overages

---

## 📞 SUPPORT

If AI Assistant doesn't work after adding the key:
1. Check Azure App Service logs
2. Verify key is correct in Configuration
3. Restart the App Service
4. Check database `ai_settings` table
5. Review Application Insights for errors
