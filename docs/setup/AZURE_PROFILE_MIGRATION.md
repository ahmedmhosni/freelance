# 🚀 Azure Profile Migration Guide

## Quick Steps (2 minutes)

### Step 1: Open Azure Portal
1. Go to: https://portal.azure.com
2. Navigate to: **SQL databases** → **roastifydbazure**
3. Click: **Query editor (preview)** in the left sidebar

### Step 2: Login
- **Authentication type**: SQL server authentication
- **Login**: `adminuser`
- **Password**: `AHmed#123456`
- Click **OK**

### Step 3: Run Migration
1. Open file: `database/migrations/ADD_USER_PROFILE_FIELDS_AZURE.sql`
2. **Copy ALL content** (Ctrl+A, Ctrl+C)
3. **Paste** into Azure Query Editor (Ctrl+V)
4. Click **Run** button
5. Wait 30-60 seconds

### Step 4: Verify Success
You should see:
```
✓ Added username column
✓ Added job_title column
✓ Added bio column
... (and so on)
✅ User Profile Fields Migration Complete!
```

Plus a table showing all 15 profile fields.

## ✅ What Gets Added

**15 New Columns**:
- username (unique)
- job_title
- bio
- profile_picture
- location
- website
- linkedin
- behance
- instagram
- facebook
- twitter
- github
- dribbble
- portfolio
- profile_visibility

**Plus**:
- Unique constraint on username
- Index on username for fast lookups

## 🧪 Test in Production

After migration:
1. Visit: https://roastify.online/profile
2. Fill in your profile
3. Set a username
4. Save changes
5. Visit: https://roastify.online/profile/your-username
6. See your public profile!

## ⚠️ Important Notes

- **Safe to run**: Won't delete any data
- **Idempotent**: Safe to run multiple times
- **Fast**: Takes 30-60 seconds
- **No downtime**: App keeps running

## 🐛 Troubleshooting

**Can't login to Query Editor?**
- Username: `adminuser` (no @server part)
- Password: `AHmed#123456`
- Try refreshing the page

**Script fails?**
- Check if fields already exist (that's OK!)
- Verify you have permissions
- Try running in smaller batches

**Fields already exist?**
- That's fine! Script will skip them
- Check the verification query at the end

## ✅ Success Checklist

After running:
- [ ] See ✓ messages for each field
- [ ] See verification table with 15 fields
- [ ] No error messages
- [ ] Can access /profile page
- [ ] Can save profile changes
- [ ] Public profile works

---

**Ready to go live!** 🚀
