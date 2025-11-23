# 🌐 Namecheap Domain Setup - roastify.online

## 📋 Step-by-Step Guide for Namecheap

### Step 1: Get Verification Code from Azure (5 minutes)

1. **Login to Azure Portal**
   - Go to: https://portal.azure.com
   - Navigate to: **Static Web Apps**
   - Click on: **white-sky-0a7e9f003**

2. **Add Custom Domain**
   - In the left menu, click: **Custom domains**
   - Click: **+ Add**
   - Select: **Custom domain on other DNS**
   - Enter domain: `roastify.online`
   - Click: **Next**

3. **Copy the Verification Code**
   - Azure will show you a TXT record
   - **IMPORTANT:** Copy this verification code
   - Example: `ms-domain-verification=abc123def456...`
   - Keep this page open!

---

### Step 2: Configure DNS in Namecheap (10 minutes)

#### 2.1 Login to Namecheap
1. Go to: https://www.namecheap.com
2. Click: **Sign In** (top right)
3. Enter your credentials

#### 2.2 Access Domain Management
1. Click: **Domain List** (in the left sidebar)
2. Find: **roastify.online**
3. Click: **Manage** button next to it

#### 2.3 Go to Advanced DNS
1. Click on the **Advanced DNS** tab
2. You'll see your current DNS records

#### 2.4 Add DNS Records

**Record 1: TXT Record (for verification)**

Click **"Add New Record"** and enter:
```
Type: TXT Record
Host: @
Value: <paste-the-verification-code-from-azure>
TTL: Automatic
```

Example:
```
Type: TXT Record
Host: @
Value: ms-domain-verification=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
TTL: Automatic
```

Click **✓ (checkmark)** to save.

---

**Record 2: ALIAS Record (for root domain)**

Click **"Add New Record"** and enter:
```
Type: ALIAS Record
Host: @
Value: white-sky-0a7e9f003.3.azurestaticapps.net
TTL: Automatic
```

Click **✓ (checkmark)** to save.

---

**Record 3: CNAME Record (for www subdomain)**

Click **"Add New Record"** and enter:
```
Type: CNAME Record
Host: www
Value: white-sky-0a7e9f003.3.azurestaticapps.net
TTL: Automatic
```

Click **✓ (checkmark)** to save.

---

#### 2.5 Remove Conflicting Records (Important!)

**Check for these and DELETE them if they exist:**
- Any **A Record** with Host: `@`
- Any **URL Redirect Record** for the root domain
- Any **Parking Page** records

To delete:
1. Find the record
2. Click the **trash icon** 🗑️ on the right
3. Confirm deletion

---

### Step 3: Verify Domain in Azure (15-30 minutes)

#### 3.1 Wait for DNS Propagation
- DNS changes take 5-30 minutes to propagate
- Namecheap is usually fast (10-15 minutes)

#### 3.2 Check DNS Propagation
Visit: https://dnschecker.org
- Enter: `roastify.online`
- Select: **TXT** record type
- Click: **Search**
- Wait until you see your verification code in multiple locations

#### 3.3 Verify in Azure Portal
1. Go back to Azure Portal (the page you left open)
2. Click: **Validate** button
3. If successful: ✅ Green checkmark appears
4. If failed: Wait 5 more minutes and try again

#### 3.4 Wait for SSL Certificate
- After verification, Azure provisions an SSL certificate
- This takes 5-10 minutes
- You'll see "Certificate provisioning" status
- Wait for it to show "Secured" ✅

---

### Step 4: Test Your Domain (2 minutes)

Once SSL is provisioned, test these URLs:

1. **Root domain:**
   - Visit: http://roastify.online
   - Should redirect to: https://roastify.online ✅
   - Should show your app with green padlock 🔒

2. **WWW subdomain:**
   - Visit: https://www.roastify.online
   - Should work or redirect to root domain ✅

3. **Check SSL Certificate:**
   - Click the padlock icon in browser
   - Should show valid certificate from Microsoft

---

## 📊 Your Final DNS Records in Namecheap

After setup, your **Advanced DNS** should look like this:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT Record | @ | `ms-domain-verification=...` | Automatic |
| ALIAS Record | @ | `white-sky-0a7e9f003.3.azurestaticapps.net` | Automatic |
| CNAME Record | www | `white-sky-0a7e9f003.3.azurestaticapps.net` | Automatic |

**Make sure there are NO:**
- ❌ A Records with Host: @
- ❌ URL Redirect Records
- ❌ Parking Page Records

---

## 🎯 Visual Guide with Screenshots

### Namecheap Advanced DNS Page

Your screen should look like this:

```
┌─────────────────────────────────────────────────────────┐
│  Advanced DNS                                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Add New Record]                                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Type: TXT Record                                  │  │
│  │ Host: @                                           │  │
│  │ Value: ms-domain-verification=abc123...          │  │
│  │ TTL: Automatic                              [✓]  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Type: ALIAS Record                                │  │
│  │ Host: @                                           │  │
│  │ Value: white-sky-0a7e9f003.3.azurestaticapps.net│  │
│  │ TTL: Automatic                              [✓]  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Type: CNAME Record                                │  │
│  │ Host: www                                         │  │
│  │ Value: white-sky-0a7e9f003.3.azurestaticapps.net│  │
│  │ TTL: Automatic                              [✓]  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: "Domain verification failed"

**Solutions:**
1. **Check TXT record:**
   - Make sure Host is: `@` (not blank, not `roastify.online`)
   - Make sure Value is the FULL verification code
   - No extra spaces or quotes

2. **Wait longer:**
   - DNS can take up to 48 hours (usually 15-30 minutes)
   - Check: https://dnschecker.org

3. **Try again:**
   - Click "Validate" button in Azure again
   - Wait 5 minutes between attempts

---

### Issue: "ALIAS Record not available"

**If Namecheap doesn't show ALIAS Record:**

Use **CNAME Flattening** instead:
1. Contact Namecheap support
2. Ask them to enable "CNAME Flattening" for your domain
3. Then use CNAME record for @ instead of ALIAS

**OR** use **URL Redirect** (temporary solution):
1. Add CNAME for www (as shown above)
2. Add URL Redirect:
   - Source URL: `http://roastify.online`
   - Destination URL: `https://www.roastify.online`
   - Type: Permanent (301)

---

### Issue: "SSL Certificate not provisioning"

**Solutions:**
1. **Wait 15 minutes** after domain verification
2. **Check ALIAS/CNAME records** are correct
3. **Remove and re-add** the custom domain in Azure:
   - Azure Portal → Custom domains
   - Click trash icon next to roastify.online
   - Wait 5 minutes
   - Add it again

---

### Issue: "Site shows Namecheap parking page"

**Solutions:**
1. **Delete parking page records** in Advanced DNS
2. **Make sure ALIAS record** points to Azure
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Wait for DNS propagation** (15-30 minutes)

---

## ✅ Verification Checklist

- [ ] Logged into Azure Portal
- [ ] Added custom domain in Static Web App
- [ ] Copied verification code
- [ ] Logged into Namecheap
- [ ] Went to Domain List → Manage → Advanced DNS
- [ ] Added TXT record with verification code
- [ ] Added ALIAS record for @ (root domain)
- [ ] Added CNAME record for www
- [ ] Deleted any conflicting A records
- [ ] Deleted any URL Redirect records
- [ ] Waited 15-30 minutes for DNS propagation
- [ ] Checked DNS propagation on dnschecker.org
- [ ] Clicked "Validate" in Azure Portal
- [ ] Waited for SSL certificate (5-10 minutes)
- [ ] Tested https://roastify.online
- [ ] Tested https://www.roastify.online
- [ ] Verified SSL certificate (green padlock)

---

## 🎉 Success!

Once complete, you should have:
- ✅ https://roastify.online → Your app (with SSL)
- ✅ https://www.roastify.online → Your app (with SSL)
- ✅ http://roastify.online → Redirects to HTTPS
- ✅ Valid SSL certificate (green padlock 🔒)
- ✅ Fast loading via Azure CDN

---

## 📞 Need Help?

### Namecheap Support
- **Live Chat:** Available 24/7 on Namecheap.com
- **Phone:** Check their website for your region
- **Email:** support@namecheap.com

### Azure Support
- **Documentation:** https://docs.microsoft.com/azure/static-web-apps/custom-domain
- **Support:** Azure Portal → Help + Support

### Common Questions

**Q: How long does DNS propagation take?**
A: Usually 15-30 minutes, but can take up to 48 hours.

**Q: Can I use Cloudflare with Namecheap?**
A: Yes! Change nameservers in Namecheap to Cloudflare's nameservers, then manage DNS in Cloudflare.

**Q: Do I need to pay extra for SSL?**
A: No! Azure provides free SSL certificates automatically.

**Q: Can I use a subdomain like app.roastify.online?**
A: Yes! Just add another CNAME record with Host: `app`

---

## 🚀 Optional: Setup API Subdomain

Want to use `api.roastify.online` for your backend?

### In Namecheap:
Add CNAME record:
```
Type: CNAME Record
Host: api
Value: roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net
TTL: Automatic
```

### In Azure Web App:
1. Go to your Web App in Azure Portal
2. Click: **Custom domains**
3. Click: **Add custom domain**
4. Enter: `api.roastify.online`
5. Follow verification steps

---

**Last Updated:** November 23, 2025  
**Domain:** roastify.online  
**Registrar:** Namecheap  
**Azure Static Web App:** white-sky-0a7e9f003
