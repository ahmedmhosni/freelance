# 🔧 Azure Environment Variables Setup Guide

## You Are Here: ✅
**Azure Portal → roastify-webapp-api → Settings → Environment variables**

---

## 📝 Click "+ Add" Button and Add These Variables:

### 1. NODE_ENV
```
Name: NODE_ENV
Value: production
```

### 2. PORT
```
Name: PORT
Value: 8080
```

### 3. JWT_SECRET
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-in-production-12345
```

### 4. JWT_EXPIRES_IN
```
Name: JWT_EXPIRES_IN
Value: 7d
```

### 5. AZURE_SQL_SERVER
```
Name: AZURE_SQL_SERVER
Value: roastify-db-server.database.windows.net
```

### 6. AZURE_SQL_DATABASE
```
Name: AZURE_SQL_DATABASE
Value: roastifydbazure
```

### 7. AZURE_SQL_USER
```
Name: AZURE_SQL_USER
Value: adminuser
```

### 8. AZURE_SQL_PASSWORD
```
Name: AZURE_SQL_PASSWORD
Value: AHmed#123456
```

### 9. AZURE_SQL_PORT
```
Name: AZURE_SQL_PORT
Value: 1433
```

### 10. AZURE_SQL_ENCRYPT
```
Name: AZURE_SQL_ENCRYPT
Value: true
```

### 11. FRONTEND_URL
```
Name: FRONTEND_URL
Value: https://white-sky-0a7e9f003.3.azurestaticapps.net
```

---

## 🎯 Step-by-Step Instructions:

### For Each Variable Above:

1. Click the **"+ Add"** button (top of the page)
2. In the **Name** field, enter the variable name (e.g., `NODE_ENV`)
3. In the **Value** field, enter the value (e.g., `production`)
4. Click **Apply** or **OK**
5. Repeat for all 11 variables

---

## ⚡ Quick Copy-Paste Format

If Azure allows bulk import, use this format:

```
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=7d
AZURE_SQL_SERVER=roastify-db-server.database.windows.net
AZURE_SQL_DATABASE=roastifydbazure
AZURE_SQL_USER=adminuser
AZURE_SQL_PASSWORD=AHmed#123456
AZURE_SQL_PORT=1433
AZURE_SQL_ENCRYPT=true
FRONTEND_URL=https://white-sky-0a7e9f003.3.azurestaticapps.net
```

---

## ✅ After Adding All Variables:

1. Click **"Apply"** at the bottom of the page
2. Click **"Confirm"** when prompted (this will restart your app)
3. Wait 1-2 minutes for the app to restart

---

## 🔍 Verify Variables Were Added:

You should see all 11 variables listed in the table with:
- **Name** column showing the variable name
- **Value** column showing the value (passwords will be hidden)
- **Source** column showing "App Service"

---

## 📋 Checklist:

- [ ] NODE_ENV = production
- [ ] PORT = 8080
- [ ] JWT_SECRET = (your secret)
- [ ] JWT_EXPIRES_IN = 7d
- [ ] AZURE_SQL_SERVER = roastify-db-server.database.windows.net
- [ ] AZURE_SQL_DATABASE = roastifydbazure
- [ ] AZURE_SQL_USER = adminuser
- [ ] AZURE_SQL_PASSWORD = AHmed#123456
- [ ] AZURE_SQL_PORT = 1433
- [ ] AZURE_SQL_ENCRYPT = true
- [ ] FRONTEND_URL = https://white-sky-0a7e9f003.3.azurestaticapps.net
- [ ] Clicked "Apply" button
- [ ] Confirmed restart
- [ ] App restarted successfully

---

## 🎉 Done!

Once all variables are added and the app has restarted, your backend will be configured to use Azure SQL Database.

**Next Step:** Deploy your code to Azure App Service
