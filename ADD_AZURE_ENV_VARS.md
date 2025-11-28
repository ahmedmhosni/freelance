# 🚀 Quick Setup - Add Azure Environment Variables

**Time:** 5 minutes  
**What:** Add 3 environment variables to Azure App Service

---

## 📋 Step-by-Step Instructions

### 1. Go to Azure Portal
👉 https://portal.azure.com

### 2. Navigate to Your App Service
- Click "App Services" in left menu
- Click your app: **roastify** (or your backend app name)

### 3. Open Configuration
- Click "Configuration" in left menu
- Click "Application settings" tab

### 4. Add Environment Variables

Click "+ New application setting" and add each of these:

#### ✅ Variable 1: Connection String
```
Name: AZURE_STORAGE_CONNECTION_STRING
Value: DefaultEndpointsProtocol=https;AccountName=roastifystorge;AccountKey=QuoWr/TLMzxex1692Vlh6HQY39FAOiPgcFKh4MzpH/h3q09C5dIe++7eKSbz86Q6zk04097z8Q12+AStT91geQ==;EndpointSuffix=core.windows.net
```

#### ✅ Variable 2: Container Name
```
Name: AZURE_STORAGE_CONTAINER_NAME
Value: profile-pictures
```

#### ✅ Variable 3: Account Name
```
Name: AZURE_STORAGE_ACCOUNT_NAME
Value: roastifystorge
```

### 5. Save Changes
- Click "Save" button at the top
- Click "Continue" when prompted (this will restart your app)
- Wait 30-60 seconds for restart

---

## ✅ That's It!

Your app will now:
- ✅ Upload profile pictures to Azure Blob Storage
- ✅ Store images securely
- ✅ Serve images publicly
- ✅ Clean up old pictures automatically

---

## 🎨 How It Works

**Users can now:**
1. **Choose Avatar** - Free DiceBear avatars (no storage needed)
2. **Upload Picture** - Custom images to Azure Blob Storage

**Both options work seamlessly!**

---

## 🧪 Test It

After adding variables:
1. Go to your site: https://white-sky-0a7e9f003.3.azurestaticapps.net
2. Login
3. Go to Profile page
4. Click profile picture
5. Try both tabs:
   - "Choose Avatar" - should work
   - "Upload Picture" - should upload to Azure

---

## 💰 Cost

**~$0.02/month** for 1,000 users  
**~$0.10/month** for 10,000 users

Basically free! 💸

---

## 🔍 Verify Upload

Check Azure Portal:
1. Go to Storage Account: **roastifystorge**
2. Click "Containers"
3. Click "profile-pictures"
4. You should see uploaded images: `user-1-timestamp.jpg`

---

**Status:** Code deployed ✓  
**Next:** Add environment variables (5 minutes)  
**Then:** Feature is live! 🎉
