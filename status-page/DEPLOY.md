# Deployment Guide

## Before You Deploy

1. **Update API URL** in `index.html` (line 380):
   ```javascript
   const API_URL = 'https://your-actual-api-domain.com';
   ```

2. **Test locally**:
   ```bash
   # Open in browser
   open status-page/index.html
   
   # Or use Python
   cd status-page
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

3. **Verify API endpoints work**:
   - `https://your-api.com/api/status` should return JSON
   - `https://your-api.com/api/status/history` should return JSON

## Deployment Options

### Option 1: Azure Static Web Apps (Recommended)

**Pros**: Free tier, automatic GitHub integration, global CDN

**Steps**:

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Static Web Apps" → Create
3. Fill in:
   - **Name**: `roastify-status` (or your choice)
   - **Region**: Choose closest to you
   - **GitHub Account**: Connect your account
   - **Organization**: Select your org
   - **Repository**: Select your repo
   - **Branch**: `main`
   - **Build Presets**: Custom
   - **App location**: `status-page`
   - **API location**: (leave empty)
   - **Output location**: `.`

4. Click "Review + Create" → "Create"

5. Azure will create a GitHub Actions workflow automatically

6. Your status page will be available at:
   ```
   https://<your-app-name>.azurestaticapps.net
   ```

7. (Optional) Set up custom domain:
   - In Azure Portal → Static Web Apps → Your app
   - Click "Custom domains"
   - Add `status.roastify.com` (or your domain)
   - Follow DNS configuration

### Option 2: GitHub Pages

**Pros**: Free, simple, no Azure needed

**Steps**:

1. Create a new branch:
   ```bash
   git checkout -b gh-pages
   ```

2. Copy the status page to root:
   ```bash
   cp status-page/index.html index.html
   ```

3. Update API URL in `index.html`

4. Push:
   ```bash
   git add index.html
   git commit -m "Add status page"
   git push origin gh-pages
   ```

5. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll to "Pages"
   - Select `gh-pages` branch
   - Save

6. Your page will be at:
   ```
   https://your-username.github.io/your-repo
   ```

### Option 3: Netlify

**Pros**: Easy deployment, good performance

**Steps**:

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `status-page` folder
4. Update API URL in the deployed version
5. Your page will be at a Netlify URL

### Option 4: Vercel

**Pros**: Excellent performance, easy setup

**Steps**:

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repo
4. Set root directory to `status-page`
5. Deploy
6. Your page will be at a Vercel URL

### Option 5: Your Own Server

**Steps**:

1. Copy `status-page/index.html` to your web server
2. Update API URL
3. Serve via HTTP/HTTPS

## Post-Deployment

### 1. Test the Status Page

- Visit your status page URL
- Verify it loads without errors
- Check browser console (F12) for any errors
- Verify status displays correctly

### 2. Set Up Monitoring (Optional)

Create an Azure Application Insights availability test:

1. Go to Azure Portal → Application Insights
2. Click "Availability" → "Add Standard test"
3. Configure:
   - **Test name**: `Status Page Health Check`
   - **URL**: `https://your-status-page-url`
   - **Test frequency**: 5 minutes
   - **Test locations**: 3-5 global locations
   - **Success criteria**: HTTP 200

### 3. Add to Your Website

Add a link to your status page from your main website:

```html
<a href="https://status.roastify.com">System Status</a>
```

### 4. Set Up Alerts (Optional)

In Azure Portal → Application Insights → Alerts:

1. Create alert rule
2. Condition: Status page returns non-200
3. Action: Send email/SMS notification

## Troubleshooting

### Status page shows "Loading status..." forever

**Check**:
1. Browser console (F12 → Console)
2. Network tab (F12 → Network)
3. Verify API URL is correct
4. Verify API is accessible from status page domain

**Fix**:
- Add CORS headers to your backend
- Verify API endpoint is working
- Check firewall/security rules

### History not showing

**Cause**: No data yet or API not returning history

**Fix**:
- Wait for data to accumulate (a few hours)
- Verify `/api/status/history` endpoint works
- Check database has status_history table

### Custom domain not working

**Fix**:
- Verify DNS records are configured correctly
- Wait for DNS propagation (up to 24 hours)
- Check SSL certificate is valid

## Maintenance

### Update API URL

If your API domain changes:

1. Edit `status-page/index.html` line 380
2. Update `const API_URL = '...'`
3. Redeploy

### Monitor Status Page

- Check status page loads correctly
- Verify it's accessible from your domain
- Monitor uptime with external service

### Backup

Keep a backup of your status page configuration:

```bash
git commit -am "Backup status page"
git push origin main
```

## Support

For issues:

1. Check browser console for errors
2. Verify API is accessible
3. Check CORS configuration
4. Review deployment logs
5. Contact support@roastify.com

## Next Steps

1. ✅ Update API URL in `index.html`
2. ✅ Test locally
3. ✅ Choose deployment platform
4. ✅ Deploy
5. ✅ Test deployed version
6. ✅ Set up monitoring (optional)
7. ✅ Add to your website
