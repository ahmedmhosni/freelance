# Deploy to Production - Step by Step Guide

**Date**: November 25, 2025  
**Changes**: Added character avatar picker for profile pictures

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Commit and Push Changes

```bash
# Add all changes
git add .

# Commit with message
git commit -m "feat: Add character avatar picker for profile pictures

- Added AvatarPicker component with DiceBear API integration
- Updated Profile page to use avatar picker instead of URL input
- Created migration script for Azure SQL profile fields
- Built frontend successfully"

# Push to GitHub
git push origin main
```

### Step 2: Apply Database Migration (Azure SQL)

**Option A: Using Azure Portal Query Editor**

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your SQL Database: `roastifydbazure`
3. Click "Query editor" in the left menu
4. Login with:
   - Server: `roastify-db-server.database.windows.net`
   - Database: `roastifydbazure`
   - Username: `adminuser`
   - Password: `AHmed#123456`

5. Run this SQL script:

```sql
-- Check if profile fields exist
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME IN (
  'username', 'job_title', 'bio', 'profile_picture', 'location', 
  'website', 'linkedin', 'behance', 'instagram', 'facebook', 
  'twitter', 'github', 'dribbble', 'portfolio', 'profile_visibility'
)
ORDER BY COLUMN_NAME;
```

6. If no results (fields don't exist), run this migration:

```sql
-- Add profile fields to users table
ALTER TABLE users ADD username NVARCHAR(100) NULL;
ALTER TABLE users ADD job_title NVARCHAR(255) NULL;
ALTER TABLE users ADD bio NVARCHAR(MAX) NULL;
ALTER TABLE users ADD profile_picture NVARCHAR(500) NULL;
ALTER TABLE users ADD location NVARCHAR(255) NULL;
ALTER TABLE users ADD website NVARCHAR(500) NULL;
ALTER TABLE users ADD linkedin NVARCHAR(500) NULL;
ALTER TABLE users ADD behance NVARCHAR(500) NULL;
ALTER TABLE users ADD instagram NVARCHAR(500) NULL;
ALTER TABLE users ADD facebook NVARCHAR(500) NULL;
ALTER TABLE users ADD twitter NVARCHAR(500) NULL;
ALTER TABLE users ADD github NVARCHAR(500) NULL;
ALTER TABLE users ADD dribbble NVARCHAR(500) NULL;
ALTER TABLE users ADD portfolio NVARCHAR(500) NULL;
ALTER TABLE users ADD profile_visibility NVARCHAR(50) DEFAULT 'public';

-- Create unique index for username
CREATE UNIQUE NONCLUSTERED INDEX idx_users_username_unique 
ON users(username) 
WHERE username IS NOT NULL;
```

7. Verify the migration:

```sql
-- Check total columns
SELECT COUNT(*) as total_columns
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users';

-- Should return 22 columns (7 original + 15 profile fields)
```

**Option B: Using Azure Cloud Shell**

1. Go to Azure Portal
2. Click the Cloud Shell icon (>_) at the top
3. Run the migration script:

```bash
# Upload the script first, then run:
bash deploy-scripts/apply-profile-migration-azure.sh
```

### Step 3: Deploy Frontend (Automatic via GitHub Actions)

The frontend will deploy automatically when you push to GitHub. Check the deployment status:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Look for the latest workflow run
4. Wait for "Azure Static Web Apps CI/CD" to complete

**Manual Deployment (if needed)**:

```bash
# Build frontend
npm run build --prefix frontend

# Deploy using Azure Static Web Apps CLI
# (Install first: npm install -g @azure/static-web-apps-cli)
swa deploy ./frontend/dist \
  --deployment-token <YOUR_DEPLOYMENT_TOKEN> \
  --app-name roastify-webapp
```

### Step 4: Deploy Backend (Automatic via GitHub Actions)

The backend will also deploy automatically. Check the deployment:

1. Go to GitHub Actions
2. Look for "Build and deploy Node.js app to Azure Web App"
3. Wait for completion

**Manual Deployment (if needed)**:

```bash
# Deploy backend to Azure Web App
az webapp deployment source config-zip \
  --resource-group roastify-rg \
  --name roastify-webapp-api \
  --src backend.zip
```

### Step 5: Verify Deployment

1. **Check Frontend**: https://white-sky-0a7e9f003.3.azurestaticapps.net
   - Login to your account
   - Go to Profile page
   - Click "Choose Avatar" button
   - Select an avatar from the picker
   - Save changes

2. **Check Backend API**: https://roastify-webapp-api.azurewebsites.net
   - Test profile endpoint: `/api/profile/me`
   - Should return profile with all fields

3. **Check Database**:
   ```sql
   -- Verify profile fields are saved
   SELECT 
     id, 
     name, 
     username, 
     profile_picture, 
     job_title, 
     bio
   FROM users
   WHERE id = YOUR_USER_ID;
   ```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [x] Frontend built successfully
- [x] Avatar picker component created
- [x] Profile page updated
- [x] Migration script created
- [ ] Changes committed to Git
- [ ] Changes pushed to GitHub

### During Deployment:
- [ ] Database migration applied
- [ ] Frontend deployment started
- [ ] Backend deployment started
- [ ] GitHub Actions workflows completed

### Post-Deployment:
- [ ] Frontend accessible
- [ ] Backend API responding
- [ ] Profile page loads
- [ ] Avatar picker opens
- [ ] Avatar selection works
- [ ] Profile saves successfully
- [ ] Public profile displays avatar

---

## 🔧 TROUBLESHOOTING

### Issue: Database Migration Fails

**Solution**:
1. Check if you're logged into Azure Portal
2. Verify database credentials
3. Check firewall rules (add your IP if needed)
4. Run migration queries one by one

### Issue: Avatar Picker Not Showing

**Solution**:
1. Clear browser cache
2. Check browser console for errors
3. Verify AvatarPicker.jsx is deployed
4. Check if DiceBear API is accessible

### Issue: Avatars Not Saving

**Solution**:
1. Check backend logs in Azure Portal
2. Verify profile_picture column exists in database
3. Test API endpoint directly: `PUT /api/profile/me`
4. Check request payload includes profile_picture

### Issue: GitHub Actions Failing

**Solution**:
1. Check Actions tab for error details
2. Verify secrets are configured:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `AZUREAPPSERVICE_PUBLISHPROFILE`
3. Re-run failed workflows

---

## 📊 WHAT'S NEW IN THIS DEPLOYMENT

### Frontend Changes:
- ✅ Added `AvatarPicker.jsx` component
- ✅ Updated `Profile.jsx` to use avatar picker
- ✅ Integrated DiceBear API for character avatars
- ✅ 8 avatar styles available
- ✅ 32 character variations per style
- ✅ Hover effects and selection UI
- ✅ Preview of selected avatar

### Backend Changes:
- ✅ Profile fields already supported (no code changes)
- ✅ Migration script created for Azure SQL
- ✅ Database schema updated with profile fields

### Database Changes:
- ✅ 15 new profile fields added
- ✅ Unique index for username
- ✅ Profile visibility control

---

## 🎨 AVATAR PICKER FEATURES

### Available Avatar Styles:
1. **Avataaars** - Cartoon avatars (default)
2. **Bottts** - Robot avatars
3. **Personas** - Professional avatars
4. **Initials** - Letter-based avatars
5. **Lorelei** - Illustrated avatars
6. **Micah** - Diverse avatars
7. **Adventurer** - Adventure style
8. **Big Smile** - Happy faces

### Character Seeds:
32 unique characters per style:
- Felix, Aneka, Jasmine, Max, Luna, Oliver, Emma, Leo
- Sophia, Jack, Mia, Charlie, Ava, George, Isabella, Oscar
- Amelia, Harry, Lily, Noah, Grace, Lucas, Ella, Mason
- Chloe, Ethan, Zoe, Logan, Aria, James, Riley, Benjamin

### API Used:
- **DiceBear API v7**: https://api.dicebear.com/7.x/
- **Free tier**: Unlimited requests
- **No authentication required**
- **SVG format**: Scalable and lightweight

---

## 🚀 QUICK DEPLOYMENT COMMANDS

```bash
# 1. Commit and push
git add .
git commit -m "feat: Add character avatar picker"
git push origin main

# 2. Wait for GitHub Actions to complete
# Check: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# 3. Apply database migration (Azure Portal Query Editor)
# Copy SQL from Step 2 above

# 4. Verify deployment
# Frontend: https://white-sky-0a7e9f003.3.azurestaticapps.net
# Backend: https://roastify-webapp-api.azurewebsites.net
```

---

## 📝 NOTES

- Avatar URLs are stored as full DiceBear API URLs
- No file upload needed - avatars are generated on-demand
- Avatars are cached by browsers for performance
- Users can change avatars anytime
- Old profile picture URLs still work (backward compatible)

---

## 🎉 AFTER DEPLOYMENT

Once deployed, users can:
1. Go to Profile page
2. Click "Choose Avatar" button
3. Select avatar style
4. Pick their favorite character
5. See preview immediately
6. Save and use on public profile

**No file uploads, no storage costs, instant avatars!** 🚀

---

**Ready to deploy? Follow the steps above!**
