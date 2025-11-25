# 🚨 How to Set Up Azure Alerts - Step by Step

**Time Required**: 15 minutes  
**Difficulty**: Easy  
**Result**: Get notified when something goes wrong

---

## 🎯 WHAT YOU'LL SET UP

1. **App Down Alert** - Know immediately if your app stops working
2. **High Error Rate Alert** - Get notified when errors spike
3. **Slow Performance Alert** - Know when app is slow
4. **Cost Alert** - Get warned when costs are high

---

## 📋 STEP 1: APP DOWN ALERT (Most Important!)

### Go to Azure Portal:
1. Open: https://portal.azure.com
2. Search for: `roastify-webapp-api` (your backend)
3. Click on it

### Create Alert:
1. In left menu, click: **"Alerts"**
2. Click: **"+ Create"** → **"Alert rule"**

### Configure Alert:

#### Scope (already selected):
- Resource: `roastify-webapp-api`

#### Condition:
1. Click: **"Add condition"**
2. Search for: **"HTTP Server Errors"**
3. Select: **"Http Server Errors"**
4. Configure:
   - **Operator**: Greater than
   - **Threshold value**: 5
   - **Aggregation granularity**: 5 minutes
5. Click: **"Done"**

#### Actions:
1. Click: **"Add action groups"**
2. Click: **"+ Create action group"**
3. Fill in:
   - **Subscription**: Your subscription
   - **Resource group**: `roastify-rg`
   - **Action group name**: `Critical-Alerts`
   - **Display name**: `Critical`
4. Click: **"Next: Notifications"**

#### Notifications:
1. **Notification type**: Email/SMS/Push/Voice
2. **Name**: `Email-Alert`
3. Check: **Email**
4. Enter: **Your email address**
5. Click: **"OK"**
6. Click: **"Review + create"**
7. Click: **"Create"**

#### Alert Details:
1. **Alert rule name**: `App-Down-Alert`
2. **Description**: `Alert when backend has server errors`
3. **Severity**: **Sev 0 (Critical)**
4. **Enable upon creation**: **Yes**

#### Review and Create:
1. Click: **"Review + create"**
2. Click: **"Create"**

✅ **Done!** You'll get an email if your app has errors.

---

## 📋 STEP 2: HIGH ERROR RATE ALERT

### Same Process, Different Condition:

1. Go to: `roastify-webapp-api` → **Alerts**
2. Click: **"+ Create"** → **"Alert rule"**

#### Condition:
1. Search for: **"Failed requests"**
2. Select: **"Failed requests"**
3. Configure:
   - **Operator**: Greater than
   - **Threshold value**: 10
   - **Aggregation granularity**: 5 minutes

#### Actions:
1. Select existing: **"Critical-Alerts"** (created in Step 1)

#### Alert Details:
1. **Alert rule name**: `High-Error-Rate`
2. **Description**: `Alert when failed requests exceed 10`
3. **Severity**: **Sev 1 (Error)**

✅ **Done!** You'll get notified of high error rates.

---

## 📋 STEP 3: SLOW PERFORMANCE ALERT

### Same Process:

1. Go to: `roastify-webapp-api` → **Alerts**
2. Click: **"+ Create"** → **"Alert rule"**

#### Condition:
1. Search for: **"Response time"**
2. Select: **"Response Time"**
3. Configure:
   - **Operator**: Greater than
   - **Threshold value**: 5 (seconds)
   - **Aggregation granularity**: 5 minutes

#### Actions:
1. Select: **"Critical-Alerts"**

#### Alert Details:
1. **Alert rule name**: `Slow-Performance`
2. **Description**: `Alert when response time > 5 seconds`
3. **Severity**: **Sev 2 (Warning)**

✅ **Done!** You'll know when your app is slow.

---

## 📋 STEP 4: COST ALERT

### Different Location:

1. Azure Portal → Search: **"Cost Management + Billing"**
2. Click: **"Cost Management"**
3. In left menu, click: **"Cost alerts"**
4. Click: **"+ Add"**

#### Budget Alert:
1. **Scope**: Select your subscription
2. Click: **"Next"**
3. **Budget name**: `Monthly-Budget`
4. **Reset period**: Monthly
5. **Creation date**: Today
6. **Expiration date**: 1 year from now
7. **Amount**: $200 (or your budget)
8. Click: **"Next"**

#### Alert Conditions:
1. **Alert condition 1**:
   - **Type**: Actual
   - **% of budget**: 80%
2. Click: **"+ Add alert condition"**
3. **Alert condition 2**:
   - **Type**: Actual
   - **% of budget**: 100%

#### Alert Recipients:
1. **Email**: Your email address
2. Click: **"Create"**

✅ **Done!** You'll get warned when costs reach 80% and 100% of budget.

---

## 📋 STEP 5: DATABASE ALERTS

### For SQL Database:

1. Azure Portal → Search: `roastifydbazure`
2. Click on your database
3. Click: **"Alerts"** (left menu)
4. Click: **"+ Create"** → **"Alert rule"**

#### DTU Usage Alert:
1. **Condition**: Search for **"DTU percentage"**
2. Configure:
   - **Operator**: Greater than
   - **Threshold**: 80
   - **Aggregation granularity**: 5 minutes
3. **Actions**: Select **"Critical-Alerts"**
4. **Alert name**: `High-DTU-Usage`
5. **Severity**: Sev 2 (Warning)

#### Storage Alert:
1. Create another alert
2. **Condition**: Search for **"Storage percentage"**
3. Configure:
   - **Operator**: Greater than
   - **Threshold**: 80
4. **Alert name**: `High-Storage-Usage`

✅ **Done!** You'll know when database is under stress.

---

## 📋 STEP 6: FRONTEND ALERTS (Static Web App)

### For Frontend:

1. Azure Portal → Search: `roastify-webapp`
2. Click on your Static Web App
3. Click: **"Alerts"**
4. Click: **"+ Create"** → **"Alert rule"**

#### Bandwidth Alert:
1. **Condition**: Search for **"Bandwidth"**
2. Configure:
   - **Operator**: Greater than
   - **Threshold**: 10 GB (adjust based on your needs)
   - **Aggregation granularity**: 1 day
3. **Actions**: Select **"Critical-Alerts"**
4. **Alert name**: `High-Bandwidth-Usage`
5. **Severity**: Sev 2 (Warning)

✅ **Done!** You'll know if bandwidth usage spikes.

---

## 📧 WHAT YOU'LL RECEIVE

### Email Alert Example:
```
Subject: Azure Alert: App-Down-Alert - Fired

Alert: App-Down-Alert
Severity: Sev 0 - Critical
Resource: roastify-webapp-api
Condition: HTTP Server Errors > 5
Time: 2025-11-25 14:30:00 UTC

Description: Alert when backend has server errors

View in Azure Portal: [Link]
```

### When You Get an Alert:
1. **Don't panic** - Check what's wrong
2. **Open Azure Portal** - Click link in email
3. **Check logs** - See what caused the issue
4. **Fix the problem** - Deploy fix if needed
5. **Monitor** - Make sure it's resolved

---

## 🔧 MANAGING ALERTS

### View All Alerts:
1. Azure Portal → Search: **"Monitor"**
2. Click: **"Alerts"**
3. See all fired alerts

### Disable Alert Temporarily:
1. Go to resource → **Alerts**
2. Click on alert rule
3. Click: **"Disable"**
4. Re-enable when ready

### Modify Alert:
1. Go to alert rule
2. Click: **"Edit"**
3. Change threshold or conditions
4. Click: **"Save"**

### Delete Alert:
1. Go to alert rule
2. Click: **"Delete"**
3. Confirm

---

## 📊 RECOMMENDED ALERT SETUP

### Critical (Sev 0) - Immediate Action:
- ✅ App Down (HTTP Server Errors > 5)
- ✅ Database Down (Connection failures)

### Error (Sev 1) - Action Within Hours:
- ✅ High Error Rate (Failed requests > 10)
- ✅ Database DTU > 90%

### Warning (Sev 2) - Action Within Day:
- ✅ Slow Performance (Response time > 5s)
- ✅ Database DTU > 80%
- ✅ High Storage Usage > 80%
- ✅ Cost > 80% of budget

### Informational (Sev 3) - Monitor:
- ✅ Cost > 50% of budget
- ✅ Bandwidth usage spike

---

## 🎯 QUICK SETUP CHECKLIST

Use this to set up all alerts quickly:

### Backend Alerts:
- [ ] App Down (HTTP Server Errors)
- [ ] High Error Rate (Failed Requests)
- [ ] Slow Performance (Response Time)
- [ ] High CPU Usage
- [ ] High Memory Usage

### Database Alerts:
- [ ] High DTU Usage (> 80%)
- [ ] High Storage Usage (> 80%)
- [ ] Connection Failures

### Frontend Alerts:
- [ ] High Bandwidth Usage

### Cost Alerts:
- [ ] Budget at 80%
- [ ] Budget at 100%

### Action Group:
- [ ] Email notifications configured
- [ ] SMS notifications (optional)

---

## 💡 PRO TIPS

1. **Start with Critical Alerts**: Set up app down alert first
2. **Use Action Groups**: Reuse same email for all alerts
3. **Set Realistic Thresholds**: Don't set too sensitive (avoid alert fatigue)
4. **Test Alerts**: Trigger a test alert to verify it works
5. **Document Responses**: Know what to do when each alert fires
6. **Review Monthly**: Adjust thresholds based on actual usage
7. **Add SMS for Critical**: Get text messages for critical alerts

---

## 🧪 TEST YOUR ALERTS

### Test App Down Alert:
1. Stop your backend temporarily
2. Wait 5 minutes
3. Should receive email
4. Restart backend

### Test Cost Alert:
1. Set budget to $1
2. Should trigger immediately
3. Reset to actual budget

---

## 📱 MOBILE MONITORING

### Azure Mobile App:
1. Download: **Azure Mobile App** (iOS/Android)
2. Login with Azure account
3. View alerts on the go
4. Get push notifications

---

## 🔗 QUICK LINKS

- **Azure Portal**: https://portal.azure.com
- **Monitor Dashboard**: Portal → Monitor
- **Cost Management**: Portal → Cost Management + Billing
- **Alert Rules**: Portal → Monitor → Alerts → Alert rules

---

## 📝 ALERT RESPONSE PLAN

### When You Get an Alert:

#### App Down:
1. Check Azure Portal logs
2. Check if deployment failed
3. Restart app if needed
4. Check database connection
5. Monitor for 10 minutes

#### High Error Rate:
1. Check error logs
2. Identify error pattern
3. Check recent deployments
4. Rollback if needed
5. Fix and redeploy

#### Slow Performance:
1. Check database queries
2. Check API response times
3. Check for traffic spike
4. Optimize slow queries
5. Scale up if needed

#### High Costs:
1. Check cost breakdown
2. Identify expensive service
3. Optimize resource usage
4. Consider scaling down
5. Review pricing tier

---

## ✅ VERIFICATION

After setting up alerts, verify:

1. **Check Alert Rules**:
   - Portal → Monitor → Alerts → Alert rules
   - Should see all your alerts

2. **Check Action Groups**:
   - Portal → Monitor → Action groups
   - Should see "Critical-Alerts"

3. **Verify Email**:
   - Check email for confirmation
   - Confirm subscription if needed

4. **Test One Alert**:
   - Trigger a test alert
   - Verify you receive email

---

## 🎉 YOU'RE DONE!

You now have:
- ✅ App down monitoring
- ✅ Error rate monitoring
- ✅ Performance monitoring
- ✅ Cost monitoring
- ✅ Database monitoring
- ✅ Email notifications

**Sleep better knowing you'll be notified if something goes wrong!** 😴

---

**Time Spent**: 15 minutes  
**Peace of Mind**: Priceless  
**Next Step**: Monitor your alerts and adjust thresholds as needed
