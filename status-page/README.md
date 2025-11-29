# Roastify Status Page

A completely independent, static status page that displays real-time system status and 90-day uptime history. Works even when your main application is down.

## What's Included

- **index.html** - Complete status page (single file, no build needed)
- **staticwebapp.config.json** - Azure Static Web Apps configuration
- **SETUP.md** - Detailed setup instructions

## Quick Deploy

### Azure Static Web Apps (Recommended)

```bash
# 1. Push to GitHub
git add status-page/
git commit -m "Add status page"
git push origin main

# 2. Create Static Web App in Azure Portal
# - Connect your GitHub repo
# - Set App location: status-page
# - Deploy!
```

### Local Testing

```bash
# Open in browser
open status-page/index.html

# Or serve locally
python -m http.server 8000
# Visit http://localhost:8000/status-page/
```

## Configuration

Edit `status-page/index.html` line 380:

```javascript
const API_URL = 'https://your-api-domain.com'; // Your production API
```

## Features

- 📊 Real-time service status
- 📈 90-day uptime history
- 🌙 Dark mode support
- 📱 Fully responsive
- ⚡ No dependencies
- 🔄 Auto-refresh every 60 seconds

## API Requirements

Your backend must have these endpoints:

1. `GET /api/status` - Returns current status
2. `GET /api/status/history` - Returns 90-day history

Both are already implemented in your backend!

## Monitoring

For external monitoring, set up Azure Application Insights availability tests to ping your API every 5 minutes.

## Support

See SETUP.md for detailed troubleshooting and configuration options.
