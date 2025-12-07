# Azure Application Insights - Analytics Guide

## ✅ Already Configured!

Azure Application Insights is **already set up** in your application and collecting data automatically.

---

## 📊 What You're Already Tracking

### **Automatic Tracking (No Code Needed)**

1. **Performance Metrics**
   - Page load times
   - API response times
   - Server response times
   - Database query performance

2. **User Activity**
   - Page views
   - Unique users
   - Session duration
   - User flows

3. **Errors & Exceptions**
   - JavaScript errors
   - Server errors
   - Failed requests
   - Stack traces

4. **Dependencies**
   - Database calls
   - External API calls
   - Response times

---

## 🎯 How to View Your Analytics

### **Option 1: Azure Portal (Recommended)**

1. Go to: https://portal.azure.com
2. Navigate to your Application Insights resource
3. Click on different sections:

**Overview Dashboard:**
- Failed requests
- Server response time
- Server requests
- Availability

**Usage:**
- Users (unique visitors)
- Sessions
- Page views
- Events

**Performance:**
- Operations (API endpoints)
- Dependencies (database, external APIs)
- Slow requests

**Failures:**
- Exceptions
- Failed requests
- Error details with stack traces

---

## 📈 Key Metrics to Monitor

### **1. User Metrics**

**Where:** Application Insights → Usage → Users

**What to look for:**
- Daily active users
- Weekly active users
- Monthly active users
- User retention

### **2. Performance Metrics**

**Where:** Application Insights → Performance

**What to look for:**
- Average response time (should be < 500ms)
- Slow operations (> 1 second)
- Database query times
- API endpoint performance

### **3. Error Tracking**

**Where:** Application Insights → Failures

**What to look for:**
- Exception count
- Failed request rate
- Error types
- Affected users

### **4. Business Metrics**

**Where:** Application Insights → Logs (Custom Events)

**What to track:**
- Sign-ups
- Logins
- Invoices created
- Projects created
- Feature usage

---

## 🔧 Add Custom Tracking (Optional)

If you want to track specific business events, you can add custom tracking:

### **Backend (Node.js)**

```javascript
const appInsights = require('applicationinsights');

// Track custom event
appInsights.defaultClient.trackEvent({
  name: 'InvoiceCreated',
  properties: {
    userId: user.id,
    amount: invoice.amount
  }
});

// Track custom metric
appInsights.defaultClient.trackMetric({
  name: 'InvoiceAmount',
  value: invoice.amount
});
```

### **Frontend (React)**

```javascript
// Add Application Insights SDK
// npm install @microsoft/applicationinsights-web

import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: 'YOUR_CONNECTION_STRING'
  }
});

appInsights.loadAppInsights();

// Track page view
appInsights.trackPageView({ name: 'Dashboard' });

// Track custom event
appInsights.trackEvent({ name: 'InvoiceCreated' });
```

---

## 📊 Useful Queries (Kusto/KQL)

### **1. Daily Active Users**

```kusto
customEvents
| where timestamp > ago(30d)
| summarize Users = dcount(user_Id) by bin(timestamp, 1d)
| render timechart
```

### **2. Most Used Features**

```kusto
pageViews
| where timestamp > ago(30d)
| summarize Count = count() by name
| order by Count desc
| take 10
```

### **3. Slowest API Endpoints**

```kusto
requests
| where timestamp > ago(7d)
| summarize AvgDuration = avg(duration) by name
| order by AvgDuration desc
| take 10
```

### **4. Error Rate**

```kusto
requests
| where timestamp > ago(24h)
| summarize 
    Total = count(),
    Failed = countif(success == false)
| extend ErrorRate = (Failed * 100.0) / Total
```

### **5. User Journey**

```kusto
pageViews
| where timestamp > ago(1d)
| order by timestamp asc
| project timestamp, name, user_Id
```

---

## 🎯 Setting Up Alerts

### **Create Alerts for Important Events**

1. Go to Application Insights → Alerts
2. Click "New alert rule"
3. Set conditions:

**Example Alerts:**

**High Error Rate:**
- Metric: Failed requests
- Threshold: > 5% in 5 minutes
- Action: Send email

**Slow Performance:**
- Metric: Server response time
- Threshold: > 2 seconds
- Action: Send email

**Low Availability:**
- Metric: Availability
- Threshold: < 95%
- Action: Send email

---

## 💰 Cost Management

### **Free Tier Limits**

- **5 GB of data per month** - FREE
- **90 days retention** - FREE
- **Unlimited users** - FREE

### **What Uses Data:**

- Page views: ~1 KB each
- Custom events: ~1 KB each
- Exceptions: ~2 KB each
- Requests: ~1 KB each

**Typical Usage:**
- Small app (< 1000 users): ~500 MB/month
- Medium app (1000-10000 users): ~2-3 GB/month
- Large app (> 10000 users): May exceed free tier

### **Reduce Data Usage:**

```javascript
// Sample only 50% of telemetry
appInsights.setup(connectionString)
  .setSamplingPercentage(50)
  .start();
```

---

## 📱 Mobile App (Optional)

View analytics on your phone:

1. Download "Azure" app from App Store/Play Store
2. Sign in with your Azure account
3. Navigate to Application Insights
4. View real-time metrics

---

## 🔍 Common Use Cases

### **1. Monitor User Growth**

**Query:**
```kusto
customEvents
| where name == "UserSignup"
| summarize Signups = count() by bin(timestamp, 1d)
| render timechart
```

### **2. Track Feature Adoption**

**Query:**
```kusto
pageViews
| where name contains "Invoice"
| summarize Views = count() by bin(timestamp, 1d)
| render timechart
```

### **3. Identify Performance Issues**

**Query:**
```kusto
requests
| where duration > 1000  // Slower than 1 second
| summarize Count = count() by name
| order by Count desc
```

### **4. Monitor Business Metrics**

**Query:**
```kusto
customEvents
| where name in ("InvoiceCreated", "ProjectCreated", "ClientAdded")
| summarize Count = count() by name, bin(timestamp, 1d)
| render timechart
```

---

## 🎨 Create Custom Dashboard

1. Go to Application Insights → Overview
2. Click "Dashboard" at the top
3. Pin important metrics:
   - Active users
   - Response time
   - Failed requests
   - Custom events

4. Arrange tiles as you like
5. Share with team members

---

## 📊 Best Practices

### **1. Set Up Alerts**
- Monitor error rates
- Track performance degradation
- Get notified of issues

### **2. Review Weekly**
- Check user growth
- Monitor performance trends
- Review error logs

### **3. Track Business Metrics**
- Add custom events for key actions
- Monitor conversion funnels
- Track feature usage

### **4. Optimize Performance**
- Identify slow endpoints
- Optimize database queries
- Reduce page load times

---

## 🚀 Quick Start Checklist

- [x] Application Insights configured (already done!)
- [ ] View metrics in Azure Portal
- [ ] Set up error alerts
- [ ] Set up performance alerts
- [ ] Create custom dashboard
- [ ] Add custom event tracking (optional)
- [ ] Review metrics weekly

---

## 📚 Resources

**Azure Portal:**
https://portal.azure.com

**Documentation:**
https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview

**Query Language (KQL):**
https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/

**Best Practices:**
https://docs.microsoft.com/en-us/azure/azure-monitor/app/best-practices

---

## 💡 Pro Tips

1. **Use Workbooks** for advanced visualizations
2. **Set up Availability Tests** to monitor uptime
3. **Enable Profiler** to identify performance bottlenecks
4. **Use Smart Detection** for automatic anomaly detection
5. **Export data** to Power BI for advanced analytics

---

## ✅ Summary

**You already have:**
- ✅ Free analytics (5GB/month)
- ✅ User tracking
- ✅ Performance monitoring
- ✅ Error tracking
- ✅ 90 days data retention

**Next steps:**
1. Open Azure Portal
2. Navigate to Application Insights
3. Explore your data
4. Set up alerts
5. Create dashboard

**No additional cost, no additional setup needed!**

---

*Last Updated: December 7, 2024*
