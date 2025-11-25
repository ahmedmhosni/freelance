# 📚 Swagger API Docs & Azure Alerts - Quick Access

**Your API Documentation is LIVE!** 🎉

---

## 📖 ACCESS SWAGGER API DOCUMENTATION

### Live Swagger URL:
**https://roastify-webapp-api.azurewebsites.net/api-docs**

### What You'll See:
- Complete API documentation
- All endpoints listed
- Try out API calls directly
- Request/response examples
- Authentication setup

### How to Use Swagger:

1. **Open Swagger UI**:
   - Go to: https://roastify-webapp-api.azurewebsites.net/api-docs
   - You'll see all your API endpoints

2. **Authenticate** (for protected endpoints):
   - Click "Authorize" button (top right)
   - Enter: `Bearer YOUR_JWT_TOKEN`
   - Click "Authorize"
   - Click "Close"

3. **Try an Endpoint**:
   - Click on any endpoint (e.g., GET /api/profile/me)
   - Click "Try it out"
   - Fill in parameters if needed
   - Click "Execute"
   - See the response

### Available API Groups:

1. **Authentication** (`/api/auth`)
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password
   - GET /api/auth/verify-email/:token
   - POST /api/auth/verify-code

2. **Profile** (`/api/profile`)
   - GET /api/profile/me
   - PUT /api/profile/me
   - GET /api/profile/:username
   - GET /api/profile/check-username/:username

3. **Clients** (`/api/clients`)
   - GET /api/clients
   - POST /api/clients
   - GET /api/clients/:id
   - PUT /api/clients/:id
   - DELETE /api/clients/:id

4. **Projects** (`/api/projects`)
   - GET /api/projects
   - POST /api/projects
   - PUT /api/projects/:id
   - DELETE /api/projects/:id

5. **Tasks** (`/api/tasks`)
   - GET /api/tasks
   - POST /api/tasks
   - PUT /api/tasks/:id
   - DELETE /api/tasks/:id

6. **Invoices** (`/api/invoices`)
   - GET /api/invoices
   - POST /api/invoices
   - PUT /api/invoices/:id
   - DELETE /api/invoices/:id
   - GET /api/invoices/:id/pdf

7. **Time Tracking** (`/api/time-tracking`)
   - GET /api/time-tracking
   - POST /api/time-tracking/start
   - POST /api/time-tracking/stop/:id
   - DELETE /api/time-tracking/:id
   - GET /api/time-tracking/summary

8. **Reports** (`/api/reports`)
   - GET /api/reports/financial
   - GET /api/reports/projects
   - GET /api/reports/clients

9. **Dashboard** (`/api/dashboard`)
   - GET /api/dashboard/stats
   - GET /api/dashboard/recent-tasks
   - GET /api/dashboard/charts

10. **Admin** (`/api/admin`)
    - GET /api/admin/users
    - GET /api/admin/users/:id
    - PUT /api/admin/users/:id/role
    - DELETE /api/admin/users/:id
    - GET /api/admin/reports
    - GET /api/admin/logs

11. **Quotes** (`/api/quotes`)
    - GET /api/quotes/daily
    - GET /api/quotes (admin)
    - POST /api/quotes (admin)
    - PUT /api/quotes/:id (admin)
    - DELETE /api/quotes/:id (admin)

12. **Notifications** (`/api/notifications`)
    - GET /api/notifications

13. **Files** (`/api/files`)
    - GET /api/files
    - POST /api/files
    - POST /api/files/connect

---

## 🚨 SETUP AZURE ALERTS (15 minutes)

### Quick Setup - 5 Critical Alerts:

#### 1. APP DOWN ALERT (Most Important!)

**Steps**:
1. Go to: https://portal.azure.com
2. Search: `roastify-webapp-api`
3. Click: **Alerts** → **+ Create** → **Alert rule**
4. **Condition**: 
   - Search: "HTTP Server Errors"
   - Threshold: > 5
   - Time: 5 minutes
5. **Actions**: 
   - Create action group: `Critical-Alerts`
   - Add email: YOUR_EMAIL
6. **Details**:
   - Name: `App-Down-Alert`
   - Severity: Sev 0 (Critical)
7. Click: **Create**

✅ **You'll get email if app goes down**

---

#### 2. HIGH ERROR RATE ALERT

**Steps**:
1. Same resource: `roastify-webapp-api`
2. **Alerts** → **+ Create** → **Alert rule**
3. **Condition**:
   - Search: "Failed requests"
   - Threshold: > 10
   - Time: 5 minutes
4. **Actions**: Select `Critical-Alerts` (created above)
5. **Details**:
   - Name: `High-Error-Rate`
   - Severity: Sev 1 (Error)
6. Click: **Create**

✅ **You'll get email if errors spike**

---

#### 3. SLOW PERFORMANCE ALERT

**Steps**:
1. Same resource: `roastify-webapp-api`
2. **Alerts** → **+ Create** → **Alert rule**
3. **Condition**:
   - Search: "Response Time"
   - Threshold: > 5 seconds
   - Time: 5 minutes
4. **Actions**: Select `Critical-Alerts`
5. **Details**:
   - Name: `Slow-Performance`
   - Severity: Sev 2 (Warning)
6. Click: **Create**

✅ **You'll get email if app is slow**

---

#### 4. DATABASE DTU ALERT

**Steps**:
1. Search: `roastifydbazure` (your database)
2. **Alerts** → **+ Create** → **Alert rule**
3. **Condition**:
   - Search: "DTU percentage"
   - Threshold: > 80
   - Time: 5 minutes
4. **Actions**: Select `Critical-Alerts`
5. **Details**:
   - Name: `High-DTU-Usage`
   - Severity: Sev 2 (Warning)
6. Click: **Create**

✅ **You'll get email if database is stressed**

---

#### 5. COST ALERT

**Steps**:
1. Search: "Cost Management + Billing"
2. Click: **Cost alerts** → **+ Add**
3. **Budget**:
   - Name: `Monthly-Budget`
   - Amount: $200 (or your budget)
   - Period: Monthly
4. **Alerts**:
   - Alert 1: 80% of budget
   - Alert 2: 100% of budget
5. **Email**: YOUR_EMAIL
6. Click: **Create**

✅ **You'll get email when costs reach 80% and 100%**

---

## 📧 WHAT YOU'LL RECEIVE

### Email Alert Example:
```
From: Microsoft Azure
Subject: Azure Alert: App-Down-Alert - Fired

Alert: App-Down-Alert
Severity: Sev 0 - Critical
Resource: roastify-webapp-api
Condition: HTTP Server Errors > 5
Time: 2025-11-25 14:30:00 UTC

View in Azure Portal: [Link]
```

### When You Get an Alert:
1. **Check Azure Portal** - Click link in email
2. **View logs** - See what caused the issue
3. **Fix the problem** - Deploy fix if needed
4. **Monitor** - Make sure it's resolved

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

### Swagger API Docs:
- [ ] Open: https://roastify-webapp-api.azurewebsites.net/api-docs
- [ ] See all endpoints listed
- [ ] Try authentication
- [ ] Test an endpoint

### Azure Alerts:
- [ ] 5 alerts created
- [ ] Action group configured
- [ ] Email confirmed
- [ ] Test one alert (optional)

---

## 🔗 QUICK LINKS

### API Documentation:
- **Swagger UI**: https://roastify-webapp-api.azurewebsites.net/api-docs
- **API Base URL**: https://roastify-webapp-api.azurewebsites.net
- **Health Check**: https://roastify-webapp-api.azurewebsites.net/api/status

### Azure Portal:
- **Portal Home**: https://portal.azure.com
- **Backend App**: Portal → roastify-webapp-api
- **Database**: Portal → roastifydbazure
- **Alerts**: Portal → Monitor → Alerts
- **Costs**: Portal → Cost Management

### Documentation:
- **Full Alert Guide**: `SETUP_AZURE_ALERTS.md`
- **Monitoring Checklist**: `MONITORING_CHECKLIST.md`
- **Testing Guide**: `TEST_THE_FEATURE.md`

---

## 📊 MONITORING DASHBOARD

### Daily Check (5 min):
1. **Swagger**: https://roastify-webapp-api.azurewebsites.net/api-docs
2. **Frontend**: https://white-sky-0a7e9f003.3.azurestaticapps.net
3. **Alerts**: Check email for any alerts

### Weekly Check (15 min):
1. **Azure Portal** → Application Insights
2. Review performance metrics
3. Check user activity
4. Review error logs

### Monthly Check (30 min):
1. **Cost Management** → Review costs
2. **Database** → Check size and performance
3. **Security** → Update dependencies
4. **Backups** → Verify backups working

---

## 🎯 NEXT STEPS

### Right Now:
1. ✅ Open Swagger: https://roastify-webapp-api.azurewebsites.net/api-docs
2. ✅ Set up 5 critical alerts (15 min)
3. ✅ Test avatar picker feature

### This Week:
1. Monitor alerts
2. Check Swagger regularly
3. Start implementing payment integration

### This Month:
1. Review all metrics
2. Optimize based on data
3. Complete remaining features

---

## 💡 PRO TIPS

1. **Bookmark Swagger**: Quick access to API docs
2. **Set Up Alerts Early**: Don't wait for problems
3. **Check Logs Daily**: Catch issues before users do
4. **Monitor Costs**: Azure costs can add up
5. **Use Swagger for Testing**: Test APIs without Postman

---

## 🎉 YOU'RE ALL SET!

You now have:
- ✅ Live API documentation (Swagger)
- ✅ Azure alerts setup guide
- ✅ Monitoring checklist
- ✅ All documentation committed and pushed

**Swagger URL**: https://roastify-webapp-api.azurewebsites.net/api-docs

**Next**: Set up those 5 critical alerts (15 minutes)! 🚀
