# 📊 Setup Application Insights (2 Minutes)

## What is Application Insights?

Application Insights monitors your app in real-time:
- Track requests and response times
- Monitor errors and exceptions
- View live metrics
- Analyze user behavior
- Performance monitoring

---

## ✅ Setup Steps

### **Step 1: Create Application Insights Resource**

1. **Go to Azure Portal**
   - https://portal.azure.com

2. **Create Resource**
   - Click "+ Create a resource"
   - Search for "Application Insights"
   - Click "Create"

3. **Configure**
   - **Subscription**: Your subscription
   - **Resource Group**: Same as your app (roastify-rg or similar)
   - **Name**: `roastify-insights`
   - **Region**: Same as your app (Europe or your region)
   - **Resource Mode**: Workspace-based (recommended)
   - Click "Review + Create"
   - Click "Create"

4. **Wait** (~30 seconds for deployment)

### **Step 2: Get Connection String**

1. **Open Application Insights**
   - Go to the resource you just created
   - Or search "Application Insights" → click "roastify-insights"

2. **Copy Connection String**
   - In the Overview page, look for **"Connection String"**
   - Click the copy icon
   - It looks like: `InstrumentationKey=xxx;IngestionEndpoint=https://...`

### **Step 3: Add to App Service**

1. **Open Your App Service**
   - Search for "App Services"
   - Click your app (roastify or similar)

2. **Go to Configuration**
   - In left menu, click **"Configuration"**
   - Click **"+ New application setting"**

3. **Add Setting**
   - **Name**: `APPLICATIONINSIGHTS_CONNECTION_STRING`
   - **Value**: Paste the connection string you copied
   - Click "OK"
   - Click **"Save"** at the top
   - Click "Continue" to confirm restart

4. **Wait** (~1 minute for app to restart)

---

## ✅ Verify It's Working

### **Option 1: Check Live Metrics**

1. Go to Application Insights → **"Live Metrics"**
2. You should see:
   - Server online
   - Incoming requests
   - Response times
   - Memory usage

### **Option 2: Make Some Requests**

1. Visit your app: https://roastify.online
2. Login, navigate around
3. Go to Application Insights → **"Logs"**
4. Wait 2-3 minutes
5. You should see requests logged

### **Option 3: Check Logs**

Run this query in Application Insights → Logs:

```kusto
requests
| where timestamp > ago(1h)
| summarize count() by resultCode
```

You should see your requests! ✅

---

## 📊 What You Can Monitor

### **Performance**
- Average response time
- Slowest requests
- Database query times
- External API calls

### **Errors**
- Exception count
- Error rate
- Failed requests
- Stack traces

### **Usage**
- Active users
- Page views
- User sessions
- Geographic distribution

### **Dependencies**
- Database calls
- External API calls
- Email service calls
- Response times

---

## 🎯 Useful Queries

### **Slowest Requests**
```kusto
requests
| where timestamp > ago(1d)
| summarize avg(duration) by name
| order by avg_duration desc
| take 10
```

### **Error Rate**
```kusto
requests
| where timestamp > ago(1d)
| summarize 
    total = count(),
    errors = countif(success == false)
| extend errorRate = (errors * 100.0) / total
```

### **Most Popular Pages**
```kusto
pageViews
| where timestamp > ago(1d)
| summarize count() by name
| order by count_ desc
| take 10
```

---

## 🔔 Setup Alerts (Optional)

1. **Go to Application Insights → Alerts**
2. **Create Alert Rule**
3. **Examples**:
   - Alert when error rate > 5%
   - Alert when response time > 2 seconds
   - Alert when app is down

---

## ✅ Done!

Your app is now monitored! 📊

**Benefits:**
- Real-time performance monitoring
- Automatic error tracking
- User behavior analytics
- Performance optimization insights

---

## 🔗 Quick Links

- **Live Metrics**: Application Insights → Live Metrics
- **Logs**: Application Insights → Logs
- **Performance**: Application Insights → Performance
- **Failures**: Application Insights → Failures

---

## 💡 Pro Tips

1. **Check Live Metrics daily** - See real-time performance
2. **Review Failures weekly** - Fix errors proactively
3. **Analyze Performance monthly** - Optimize slow queries
4. **Setup Alerts** - Get notified of issues immediately

---

**Your app is now fully monitored! 🎉**
