# Independent Status Page Setup

This is a completely independent status page that works even when your main application is down. It's based on your existing API structure and will display real-time status from your `/api/status` endpoint.

## Features

✅ **Independent Hosting**: Completely separate from your main app
✅ **Works When App is Down**: Shows status even during outages
✅ **90-Day History**: Displays uptime trends
✅ **Dark Mode**: User-friendly theme toggle
✅ **Real-time Updates**: Refreshes every 60 seconds
✅ **Responsive Design**: Works on all devices
✅ **No Dependencies**: Pure HTML/CSS/JavaScript

## Quick Start

### Option 1: Deploy to Azure Static Web Apps (Recommended)

1. **Create Azure Static Web App:**
   - Go to Azure Portal → Static Web Apps → Create
   - Connect your GitHub repository
   - Set build configuration:
     - **App location**: `status-page`
     - **API location**: (leave empty)
     - **Output location**: `.`

2. **Configure API URL:**
   - Edit `status-page/index.html`
   - Find this line (around line 380):
   ```javascript
   const API_URL = window.location.origin === 'http://localhost:5173' 
       ? 'http://localhost:3000' 
       : 'https://api.roastify.com'; // Replace with your production API URL
   ```
   - Replace `https://api.roastify.com` with your actual API URL

3. **Deploy:**
   ```bash
   git add status-page/
   git commit -m "Add independent status page"
   git push origin main
   ```

4. **Access your status page:**
   - Azure will provide a URL like: `https://<your-app-name>.azurestaticapps.net`
   - Or set up a custom domain like `status.roastify.com`

### Option 2: Deploy to GitHub Pages

1. Create a `gh-pages` branch
2. Copy `status-page/index.html` to the root
3. Update the API_URL in the file
4. Push to `gh-pages` branch
5. Enable GitHub Pages in repository settings

### Option 3: Deploy Anywhere

The status page is just a single HTML file. You can:
- Upload to any web server
- Use Netlify, Vercel, or any static hosting
- Serve from your CDN

## Configuration

### API URL

The page automatically detects your API URL:
- **Local development**: `http://localhost:3000`
- **Production**: Update the URL in `index.html` line 380

```javascript
const API_URL = 'https://your-api-domain.com'; // Your production API
```

### CORS Configuration

If your API blocks requests from the status page, add CORS headers to your backend:

```javascript
// In backend/src/server.js
const cors = require('cors');

app.use(cors({
  origin: ['https://status.roastify.com', 'http://localhost:5173'],
  credentials: true
}));
```

## How It Works

```
Status Page (Independent)
    ↓ (fetches every 60 seconds)
Your API (/api/status)
    ↓ (returns current status)
Status Page displays:
    - Overall system status
    - Individual service status
    - Response times
    - 90-day uptime history
```

## Data Sources

The page fetches from your existing endpoints:

1. **Current Status**: `GET /api/status`
   - Returns: `{ status, services: { api, database, email, websocket } }`

2. **History**: `GET /api/status/history`
   - Returns: 90-day uptime data grouped by service

Both endpoints are already implemented in your backend!

## Monitoring Setup (Optional)

For even better reliability, set up external monitoring:

### Azure Application Insights Availability Tests

1. Go to Azure Portal → Application Insights
2. Click "Availability" → "Add Standard test"
3. Configure:
   - **URL**: `https://your-api.com/api/status`
   - **Test frequency**: 5 minutes
   - **Test locations**: 3-5 global locations
   - **Success criteria**: HTTP 200

This way, even if your status page is down, Azure records the outages.

## Troubleshooting

### Status page shows "Loading status..." forever

**Cause**: API is unreachable or CORS is blocked

**Solution**:
1. Check browser console (F12 → Console tab)
2. Verify API URL is correct
3. Check API is running and accessible
4. Add CORS headers to your backend

### History not showing

**Cause**: No historical data yet

**Solution**:
- History data is populated by your `/api/status/history` endpoint
- Make sure your backend is saving status history to the database
- Wait for data to accumulate (at least a few hours)

### Page not updating

**Cause**: API might be down or CORS blocked

**Solution**:
- Check browser console for errors
- Verify API is responding to requests
- Check network tab in DevTools

## Customization

### Change Refresh Interval

Edit line 430 in `index.html`:
```javascript
setInterval(updateStatus, 60000); // Change 60000 to desired milliseconds
```

### Change Colors

Edit the CSS variables at the top of the `<style>` tag:
```css
:root {
    --color-operational: #10b981;
    --color-degraded: #f59e0b;
    --color-down: #ef4444;
}
```

### Add Custom Branding

Edit the header section in the HTML to add your logo or custom text.

## Next Steps

1. Update `API_URL` in `status-page/index.html`
2. Test locally: Open the file in a browser
3. Deploy to your hosting platform
4. Set up custom domain (optional)
5. Monitor the status page to ensure it's working

## Support

If the status page isn't working:
1. Check browser console for errors (F12)
2. Verify API is accessible from the status page domain
3. Check CORS configuration
4. Ensure `/api/status` and `/api/status/history` endpoints are working
