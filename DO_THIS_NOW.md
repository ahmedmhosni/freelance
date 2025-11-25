# ⚡ DO THIS NOW - Quick Action Guide

**Time Required**: 5 minutes  
**Difficulty**: Easy  
**Status**: Code deployed, database migration needed

---

## 🎯 YOUR TASK

Apply the database migration to enable the new avatar picker feature.

---

## 📋 STEP-BY-STEP (Copy & Paste)

### 1. Open Azure Portal
**URL**: https://portal.azure.com

### 2. Navigate to Database
1. Search for: `roastifydbazure`
2. Click on the database
3. Click "Query editor" (left sidebar)

### 3. Login
- **Server**: `roastify-db-server.database.windows.net`
- **Database**: `roastifydbazure`
- **Username**: `adminuser`
- **Password**: `AHmed#123456`

### 4. Run This SQL (Copy & Paste)

```sql
-- Check if migration is needed
SELECT COUNT(*) as profile_fields_count
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME IN (
  'username', 'job_title', 'bio', 'profile_picture', 'location', 
  'website', 'linkedin', 'behance', 'instagram', 'facebook', 
  'twitter', 'github', 'dribbble', 'portfolio', 'profile_visibility'
);
```

**If result is 0**, run this:

```sql
-- Add profile fields
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

-- Create unique index
CREATE UNIQUE NONCLUSTERED INDEX idx_users_username_unique 
ON users(username) 
WHERE username IS NOT NULL;
```

**If result is 15**, you're done! ✅

### 5. Verify

```sql
-- Should return 22
SELECT COUNT(*) as total_columns
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users';
```

---

## ✅ DONE!

Now test the feature:
1. Go to: https://white-sky-0a7e9f003.3.azurestaticapps.net
2. Login
3. Click "Profile"
4. Click "Choose Avatar"
5. Select an avatar
6. Save

---

## 🔗 LINKS

- **Azure Portal**: https://portal.azure.com
- **Live App**: https://white-sky-0a7e9f003.3.azurestaticapps.net
- **GitHub Actions**: https://github.com/ahmedmhosni/freelance/actions

---

## ⏱️ TIMELINE

- **Now**: Apply migration (5 min)
- **+5 min**: GitHub Actions complete
- **+10 min**: Test feature
- **+15 min**: LIVE! 🎉

---

**That's it! Simple and quick.** 🚀
