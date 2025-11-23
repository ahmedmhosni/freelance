# 🚀 Quick Domain Setup - roastify.online

## 📋 Quick Steps

### 1️⃣ Azure Portal (5 minutes)
1. Go to [Azure Portal](https://portal.azure.com)
2. Open: **white-sky-0a7e9f003** (Static Web App)
3. Click: **Custom domains** → **+ Add**
4. Enter: `roastify.online`
5. **Copy the verification code shown!**

### 2️⃣ Your Domain Registrar (10 minutes)
Login to where you bought roastify.online and add these DNS records:

**TXT Record (for verification):**
```
Type: TXT
Name: @
Value: <paste-verification-code-from-azure>
TTL: 3600
```

**CNAME for www:**
```
Type: CNAME
Name: www
Value: white-sky-0a7e9f003.3.azurestaticapps.net
TTL: 3600
```

**CNAME/ALIAS for root domain:**
```
Type: CNAME (or ALIAS/ANAME)
Name: @
Value: white-sky-0a7e9f003.3.azurestaticapps.net
TTL: 3600
```

### 3️⃣ Wait & Verify (15-30 minutes)
1. Wait for DNS to propagate
2. Check: https://dnschecker.org
3. Go back to Azure Portal
4. Click **"Validate"** next to your domain
5. Wait 5-10 minutes for SSL certificate

### 4️⃣ Test (2 minutes)
- Visit: https://roastify.online ✅
- Visit: https://www.roastify.online ✅

---

## 🎯 DNS Records Summary

Add these 3 records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| TXT | @ | `<verification-code>` |
| CNAME | @ | `white-sky-0a7e9f003.3.azurestaticapps.net` |
| CNAME | www | `white-sky-0a7e9f003.3.azurestaticapps.net` |

---

## ❓ Where is your domain registered?

**Tell me your registrar for specific instructions:**
- GoDaddy
- Namecheap  
- Cloudflare
- Google Domains
- Name.com
- Other?

---

## 🔗 Useful Links

- **Azure Portal:** https://portal.azure.com
- **DNS Checker:** https://dnschecker.org
- **Full Guide:** See `CUSTOM_DOMAIN_SETUP.md`

---

**Total Time:** ~30-45 minutes (mostly waiting for DNS)
