# Hotfix: Production 500 Errors

## Problem
Production Azure site is throwing 500 errors on multiple endpoints because database tables don't exist.

## Failing Endpoints
1. `/api/admin/activity/stats` - Missing `activity_logs` table
2. `/api/admin/gdpr/export-requests` - Missing GDPR tables
3. `/api/legal/terms` - Missing legal content tables
4. `/api/changelog/*` - Missing `versions` and `changelog_items` tables
5. `/api/feedback` - Missing `feedback` table

## Root Cause
These features were developed but their database migrations were never run on Azure production database.

## Solution
Add graceful error handling to all routes so they return empty data instead of 500 errors.

## Files Modified

### 1. backend/src/routes/admin-activity.js
✅ FIXED - Added try/catch to handle missing `activity_logs` table

### 2. backend/src/routes/changelog.js
Need to add error handling for missing `versions` table

### 3. backend/src/routes/feedback.js
Need to add error handling for missing `feedback` table

### 4. backend/src/routes/legal.js
Need to add error handling for missing legal tables

### 5. backend/src/routes/admin-gdpr.js
Need to add error handling for missing GDPR tables

## Steps to Apply Fix

1. **Modify all failing route files** to handle missing tables gracefully
2. **Test locally** to ensure no breaking changes
3. **Commit changes** to a hotfix branch
4. **Push to main** branch
5. **Azure auto-deploys** from main

## Commands

```bash
# Once git lock is released:
git checkout main
git checkout -b hotfix/production-500-errors
# Apply all fixes
git add backend/src/routes/
git commit -m "fix: handle missing database tables gracefully in production"
git push origin hotfix/production-500-errors
git checkout main
git merge hotfix/production-500-errors
git push origin main
```

## Alternative: Run Migrations on Azure

Instead of graceful degradation, we could run the missing migrations on Azure:

1. Connect to Azure PostgreSQL
2. Run migration scripts:
   - `create_activity_logs_table.sql`
   - `create_versions_table.sql`
   - `create_feedback_table.sql`
   - `create_legal_content_table.sql`

## Recommendation

**Do both:**
1. Add graceful error handling (immediate fix)
2. Run migrations on Azure (proper fix)

This way the site works immediately, and features work properly once migrations are run.

## Status

- ✅ admin-activity.js - FIXED
- ⏳ changelog.js - IN PROGRESS
- ⏳ feedback.js - PENDING
- ⏳ legal.js - PENDING
- ⏳ admin-gdpr.js - PENDING
