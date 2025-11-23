# 🌐 Custom Domain Setup - roastify.online

## 📋 Overview

You want to point **roastify.online** (from your domain registrar) to your Azure Static Web App.

**Current URL:** https://white-sky-0a7e9f003.3.azurestaticapps.net  
**Target URL:** https://roastify.online

---

## 🎯 Step-by-Step Setup

### Step 1: Add Custom Domain in Azure Portal

#### 1.1 Go to Azure Portal
1. Open [Azure Portal](https://portal.azure.com)
2. Navigate to your Static Web App: **white-sky-0a7e9f003**
3. In the left menu, click **"Custom domains"**

#### 1.2 Add Your Domain
1. Click **"+ Add"**
2. Select **"Custom domain on other DNS"**
3. Enter your domain: `roastify.online`
4. Click **"Next"**

#### 1.3 Get DNS Records
Azure will show you the DNS records you need to add. You'll see something like:

**For Root Domain (roastify.online):**
```
Type: TXT
Name: @
Value: <verification-code>
TTL: 3600

Type: CNAME (or ALIAS/ANAME)
Name: @
Value: white-sky-0a7e9f003.3.azurestaticapps.net
TTL: 3600
```

**For www subdomain (www.roastify.online):**
```
Type: CNAME
Name: www
Value: white-sky-0a7e9f003.3.azurestaticapps.net
TTL: 3600
```

**Keep this page open!** You'll need these values for the next step.

---

### Step 2: Configure DNS at Your Domain Registrar

You need to add DNS records at your domain registrar (where you bought roastify.online).

#### 2.1 Login to Your Domain Registrar
Common registrars:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- Name.com
- etc.

#### 2.2 Find DNS Management
Look for:
- "DNS Management"
- "DNS Settings"
- "Manage DNS"
- "Domain Settings"
- "Advanced DNS"

#### 2.3 Add DNS Records

**Option A: If your registrar supports ALIAS/ANAME records (Recommended)**

Add these records:

| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| TXT | @ | `<verification-code-from-azure>` | 3600 |
| ALIAS (or ANAME) | @ | `white-sky-0a7e9f003.3.azurestaticapps.net` | 3600 |
| CNAME | www | `white-sky-0a7e9f003.3.azurestaticapps.net` | 3600 |

**Option B: If your registrar only supports A records**

1. First, get the IP address:
```bash
nslookup white-sky-0a7e9f003.3.azurestaticapps.net
```

2. Add these records:

| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| TXT | @ | `<verification-code-from-azure>` | 3600 |
| A | @ | `<IP-address-from-nslookup>` | 3600 |
| CNAME | www | `white-sky-0a7e9f003.3.azurestaticapps.net` | 3600 |

**Option C: Using Cloudflare (Recommended for best performance)**

If you use Cloudflare:

| Type | Name | Target | Proxy Status | TTL |
|------|------|--------|--------------|-----|
| TXT | @ | `<verification-code>` | DNS only | Auto |
| CNAME | @ | `white-sky-0a7e9f003.3.azurestaticapps.net` | Proxied | Auto |
| CNAME | www | `white-sky-0a7e9f003.3.azurestaticapps.net` | Proxied | Auto |

---

### Step 3: Verify Domain in Azure

#### 3.1 Wait for DNS Propagation
- DNS changes can take 5 minutes to 48 hours
- Usually takes 15-30 minutes
- Check status: https://dnschecker.org

#### 3.2 Verify in Azure Portal
1. Go back to Azure Portal → Static Web App → Custom domains
2. Click **"Validate"** next to your domain
3. If successful, you'll see a green checkmark ✅
4. Azure will automatically provision an SSL certificate (takes 5-10 minutes)

---

## 🔧 Detailed Instructions by Registrar

### GoDaddy

1. Login to [GoDaddy](https://www.godaddy.com)
2. Go to **My Products** → **Domains**
3. Click on **roastify.online**
4. Click **"DNS"** or **"Manage DNS"**
5. Scroll to **"Records"** section
6. Click **"Add"** for each record:

**TXT Record:**
- Type: TXT
- Name: @
- Value: `<verification-code-from-azure>`
- TTL: 1 Hour

**CNAME Record (for www):**
- Type: CNAME
- Name: www
- Value: white-sky-0a7e9f003.3.azurestaticapps.net
- TTL: 1 Hour

**For root domain (@):**
- GoDaddy doesn't support ALIAS, so you'll need to use domain forwarding:
- Go to **"Forwarding"** section
- Add forwarding from `roastify.online` to `www.roastify.online`

### Namecheap

1. Login to [Namecheap](https://www.namecheap.com)
2. Go to **Domain List**
3. Click **"Manage"** next to roastify.online
4. Go to **"Advanced DNS"** tab
5. Click **"Add New Record"**

**TXT Record:**
- Type: TXT Record
- Host: @
- Value: `<verification-code-from-azure>`
- TTL: Automatic

**CNAME Record:**
- Type: CNAME Record
- Host: www
- Value: white-sky-0a7e9f003.3.azurestaticapps.net
- TTL: Automatic

**ALIAS Record (for root):**
- Type: ALIAS Record
- Host: @
- Value: white-sky-0a7e9f003.3.azurestaticapps.net
- TTL: Automatic

### Cloudflare (Recommended)

1. Login to [Cloudflare](https://dash.cloudflare.com)
2. Select **roastify.online**
3. Go to **DNS** → **Records**
4. Click **"Add record"**

**TXT Record:**
- Type: TXT
- Name: @
- Content: `<verification-code-from-azure>`
- Proxy status: DNS only (gray cloud)
- TTL: Auto

**CNAME for root:**
- Type: CNAME
- Name: @
- Target: white-sky-0a7e9f003.3.azurestaticapps.net
- Proxy status: Proxied (orange cloud) ✅
- TTL: Auto

**CNAME for www:**
- Type: CNAME
- Name: www
- Target: white-sky-0a7e9f003.3.azurestaticapps.net
- Proxy status: Proxied (orange cloud) ✅
- TTL: Auto

**Cloudflare Benefits:**
- ✅ Free SSL certificate
- ✅ CDN for faster loading
- ✅ DDoS protection
- ✅ Analytics

---

## 🔍 Verification & Testing

### Check DNS Propagation

**Online Tools:**
- https://dnschecker.org
- https://www.whatsmydns.net
- https://mxtoolbox.com/SuperTool.aspx

**Command Line:**
```bash
# Check TXT record
nslookup -type=TXT roastify.online

# Check CNAME record
nslookup www.roastify.online

# Check root domain
nslookup roastify.online
```

### Test Your Domain

Once DNS is propagated and Azure verification is complete:

1. **Test HTTP redirect:**
   - Visit: http://roastify.online
   - Should redirect to: https://roastify.online

2. **Test HTTPS:**
   - Visit: https://roastify.online
   - Should show your app with valid SSL certificate

3. **Test www subdomain:**
   - Visit: https://www.roastify.online
   - Should work or redirect to https://roastify.online

---

## ⚙️ Update Application Configuration

After your domain is working, update your app configuration:

### 1. Update Frontend Environment Variable

**In GitHub Actions workflow:**
`.github/workflows/azure-static-web-apps.yml`

```yaml
env:
  VITE_API_URL: https://api.roastify.online  # or keep backend URL
```

### 2. Update Backend CORS

**In Azure Web App Configuration:**

Add your new domain to allowed origins:
```
https://roastify.online
https://www.roastify.online
```

### 3. Update Socket.io CORS

**In `backend/src/server.js`:**

```javascript
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://roastify.online',
      'https://www.roastify.online'
    ],
    methods: ['GET', 'POST']
  }
});
```

---

## 🎯 Optional: Setup API Subdomain

You can also setup a subdomain for your API:

**api.roastify.online** → Azure Web App

### In Your DNS:

Add CNAME record:
```
Type: CNAME
Name: api
Value: roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net
TTL: 3600
```

### In Azure Web App:

1. Go to Azure Portal → Your Web App
2. Click **"Custom domains"**
3. Click **"Add custom domain"**
4. Enter: `api.roastify.online`
5. Follow verification steps

### Update Frontend:

```yaml
# .github/workflows/azure-static-web-apps.yml
env:
  VITE_API_URL: https://api.roastify.online
```

---

## 🐛 Troubleshooting

### Domain not verifying in Azure?

**Check:**
1. TXT record is added correctly
2. DNS has propagated (use dnschecker.org)
3. Wait 15-30 minutes after adding DNS records
4. Try clicking "Validate" again in Azure Portal

### SSL Certificate not provisioning?

**Solutions:**
1. Wait 10-15 minutes after domain verification
2. Check that CNAME record is correct
3. Remove and re-add the custom domain in Azure
4. Contact Azure support if issue persists

### Domain shows "Not Secure" warning?

**Causes:**
1. SSL certificate is still provisioning (wait 10-15 minutes)
2. Mixed content (HTTP resources on HTTPS page)
3. DNS not fully propagated

### www subdomain not working?

**Fix:**
1. Make sure CNAME record for www is added
2. Check DNS propagation
3. In Azure Portal, add www.roastify.online as a separate custom domain

### Root domain not working?

**Solutions:**
1. If using A record, make sure IP is correct
2. If using ALIAS/ANAME, make sure it points to Azure Static Web App URL
3. Some registrars don't support ALIAS for root domain - use domain forwarding

---

## 📊 DNS Records Summary

Here's what your final DNS should look like:

```
roastify.online
├── TXT @ → <azure-verification-code>
├── ALIAS/CNAME @ → white-sky-0a7e9f003.3.azurestaticapps.net
├── CNAME www → white-sky-0a7e9f003.3.azurestaticapps.net
└── CNAME api → roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net (optional)
```

---

## ✅ Checklist

- [ ] Login to Azure Portal
- [ ] Add custom domain in Static Web App
- [ ] Copy verification code and CNAME value
- [ ] Login to domain registrar
- [ ] Add TXT record for verification
- [ ] Add CNAME/ALIAS record for root domain
- [ ] Add CNAME record for www subdomain
- [ ] Wait for DNS propagation (15-30 minutes)
- [ ] Verify domain in Azure Portal
- [ ] Wait for SSL certificate (5-10 minutes)
- [ ] Test https://roastify.online
- [ ] Test https://www.roastify.online
- [ ] Update CORS settings in backend
- [ ] Update environment variables if needed
- [ ] Celebrate! 🎉

---

## 🎉 Expected Result

After setup is complete:

- ✅ https://roastify.online → Your app (with SSL)
- ✅ https://www.roastify.online → Your app (with SSL)
- ✅ http://roastify.online → Redirects to HTTPS
- ✅ Valid SSL certificate (green padlock)
- ✅ Fast loading (via Azure CDN)

---

## 📞 Need Help?

**Where is your domain registered?**
Tell me your registrar (GoDaddy, Namecheap, Cloudflare, etc.) and I can provide specific instructions!

**Common Registrars:**
- GoDaddy: https://www.godaddy.com
- Namecheap: https://www.namecheap.com
- Google Domains: https://domains.google
- Cloudflare: https://www.cloudflare.com
- Name.com: https://www.name.com

---

**Last Updated:** November 23, 2025  
**Domain:** roastify.online  
**Azure Static Web App:** white-sky-0a7e9f003
