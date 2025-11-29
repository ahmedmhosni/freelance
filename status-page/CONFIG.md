# Configuration Guide

## API URL Configuration

The status page needs to know where your API is located.

### Finding Your API URL

**Development**:
```
http://localhost:3000
```

**Production** (Azure App Service):
```
https://your-app-name.azurewebsites.net
```

**Production** (Custom Domain):
```
https://api.roastify.com
```

### Setting the API URL

Edit `status-page/index.html` around line 380:

```javascript
const API_URL = window.location.origin === 'http://localhost:5173' 
    ? 'http://localhost:3000'           // Development
    : 'https://api.roastify.com';       // Production - CHANGE THIS
```

Replace `https://api.roastify.com` with your actual API URL.

## CORS Configuration

If your API blocks requests from the status page, you need to enable CORS.

### Check if CORS is Blocking

1. Open status page in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for errors like:
   ```
   Access to XMLHttpRequest at 'https://api.roastify.com/api/status' 
   from origin 'https://status.roastify.com' has been blocked by CORS policy
   ```

### Fix CORS in Backend

Edit `backend/src/server.js`:

```javascript
const cors = require('cors');

// Add this before your routes
app.use(cors({
  origin: [
    'https://status.roastify.com',      // Your status page domain
    'http://localhost:5173',             // Local frontend
    'http://localhost:3000'              // Local backend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Then restart your backend.

## Environment-Specific Configuration

### Local Development

```javascript
const API_URL = 'http://localhost:3000';
```

Test by opening `status-page/index.html` in your browser.

### Staging

```javascript
const API_URL = 'https://staging-api.roastify.com';
```

### Production

```javascript
const API_URL = 'https://api.roastify.com';
```

## API Endpoints Required

Your backend must have these endpoints:

### 1. GET /api/status

**Response**:
```json
{
  "status": "operational",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "api": {
      "status": "operational",
      "responseTime": 5
    },
    "database": {
      "status": "operational",
      "responseTime": 12
    },
    "email": {
      "status": "operational",
      "responseTime": 0
    },
    "websocket": {
      "status": "operational"
    }
  }
}
```

**Status values**: `operational`, `degraded`, `down`, `error`

### 2. GET /api/status/history

**Response**:
```json
{
  "history": {
    "api": [
      {
        "hour": "2024-01-15T00:00:00Z",
        "uptime": "100.00",
        "avgResponseTime": 5,
        "checks": 288
      }
    ],
    "database": [
      {
        "hour": "2024-01-15T00:00:00Z",
        "uptime": "99.50",
        "avgResponseTime": 12,
        "checks": 288
      }
    ]
  }
}
```

Both endpoints are already implemented in your backend!

## Customization

### Change Refresh Interval

Default: 60 seconds

Edit line 430 in `index.html`:
```javascript
setInterval(updateStatus, 60000); // milliseconds
```

Options:
- `30000` = 30 seconds
- `60000` = 60 seconds (default)
- `120000` = 2 minutes

### Change Colors

Edit CSS variables in `<style>` tag:

```css
:root {
    --color-operational: #10b981;  /* Green */
    --color-degraded: #f59e0b;     /* Yellow */
    --color-down: #ef4444;         /* Red */
}
```

### Change Title

Edit line 6:
```html
<title>Roastify - System Status</title>
```

### Change Header Text

Edit lines 150-152:
```html
<h1>Roastify Status</h1>
<p>Real-time system monitoring</p>
```

### Change Footer Text

Edit lines 200-203:
```html
<p>For support, contact <a href="mailto:support@roastify.com">support@roastify.com</a></p>
```

## Monitoring Configuration

### Azure Application Insights

Set up availability tests to monitor your API:

1. Go to Azure Portal → Application Insights
2. Click "Availability" → "Add Standard test"
3. Configure:
   - **Test name**: `API Health Check`
   - **URL**: `https://your-api.com/api/status`
   - **Test frequency**: 5 minutes
   - **Test locations**: 3-5 global locations
   - **Success criteria**: HTTP 200
   - **Timeout**: 30 seconds

This way, even if your status page is down, Azure records the outages.

### External Monitoring Services

Alternatives to Azure:
- **UptimeRobot**: Free tier, simple setup
- **Pingdom**: Professional monitoring
- **StatusPage.io**: Full status page solution
- **Datadog**: Enterprise monitoring

## Troubleshooting Configuration

### Status page won't load

**Check**:
1. File path is correct
2. Browser can access the file
3. No JavaScript errors (F12 → Console)

### API returns 404

**Check**:
1. API URL is correct
2. API is running
3. Endpoints exist: `/api/status` and `/api/status/history`

### CORS errors

**Check**:
1. Backend has CORS enabled
2. Status page domain is in CORS whitelist
3. Backend is restarted after CORS changes

### History not showing

**Check**:
1. `/api/status/history` endpoint works
2. Database has `status_history` table
3. Data has been collected (wait a few hours)

### Slow loading

**Check**:
1. API response time
2. Network latency
3. Browser cache (Ctrl+Shift+Delete)

## Security Considerations

### Public Endpoints

Both `/api/status` and `/api/status/history` are public (no authentication required).

This is intentional - status pages should be accessible to everyone.

### Sensitive Information

Don't expose:
- Database credentials
- API keys
- Internal IP addresses
- Detailed error messages

Your backend already sanitizes this!

### HTTPS

Always use HTTPS for production:
- Status page: `https://status.roastify.com`
- API: `https://api.roastify.com`

## Performance Tips

### Reduce Refresh Interval

If you want more frequent updates:
```javascript
setInterval(updateStatus, 30000); // 30 seconds
```

**Note**: More frequent updates = more API calls

### Cache Status Page

Use CDN caching for the HTML file:
- Azure Static Web Apps: Automatic
- Netlify: Automatic
- GitHub Pages: Automatic

### Optimize API Responses

Keep `/api/status` response small:
- Only include necessary fields
- Don't include large objects
- Use compression (gzip)

## Next Steps

1. ✅ Update API URL
2. ✅ Test locally
3. ✅ Deploy
4. ✅ Verify CORS works
5. ✅ Set up monitoring
6. ✅ Add to website
