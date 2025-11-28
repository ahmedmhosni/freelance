# Changelog System Deployment Steps

## 1. Commit Changes

```bash
git add .
git commit -m "Add complete changelog system with git commits detection

Features:
- Manual changelog management with versions and items
- Git commits detection and tracking
- Admin workflow to review and publish commits
- Version date display in sidebar/footer
- Pending commits section in admin panel
- Public changelog page with grouped items
- Edit functionality for changelog items"

git push origin main
```

## 2. Update Production Database

### Option A: Using Node Script (Recommended)
```bash
cd database
node run-production-changelog-migrations.js
```

### Option B: Manual SQL Execution
If the script fails, run these SQL files manually in Azure Portal:

1. Go to Azure Portal → Your PostgreSQL Database
2. Open Query Editor
3. Run these files in order:
   - `database/migrations/CREATE_CHANGELOG_SYSTEM.sql`
   - `database/migrations/ADD_GIT_COMMITS_TRACKING.sql`

## 3. Deploy to Production

### If using Railway/Heroku:
```bash
git push railway main
# or
git push heroku main
```

### If using Azure:
- Push will trigger automatic deployment
- Wait for deployment to complete

## 4. Verify Deployment

1. **Check Database:**
   - Tables exist: `versions`, `changelog_items`, `git_commits`, `git_sync_status`

2. **Check API:**
   - Visit: `https://your-domain.com/api/changelog/current-version`
   - Should return: `{"version":"1.0.0","release_date":"..."}`

3. **Check Admin Panel:**
   - Login as admin
   - Go to Admin Panel → Changelog tab
   - Should see "Pending Git Commits" section
   - Click "Sync Commits"

4. **Check Public Changelog:**
   - Visit: `https://your-domain.com/changelog`
   - Should load without errors

5. **Check Version Display:**
   - Sidebar should show version with date
   - Footer should show version with date

## 5. Create First Version

1. Go to Admin Panel → Changelog
2. Click "Sync Commits" to load recent commits
3. Select commits you want to include
4. Click "Create Version"
5. Fill in version: `1.0.0`
6. Add items based on commits
7. Publish

## 6. Test Complete Workflow

1. Make a test commit locally
2. Push to production
3. Admin syncs commits
4. Admin creates version from commits
5. Admin publishes
6. Check public changelog
7. Verify version in footer

## Rollback Plan (If Needed)

If something goes wrong:

```sql
-- Drop new tables
DROP TABLE IF EXISTS git_commits CASCADE;
DROP TABLE IF EXISTS git_sync_status CASCADE;
DROP TABLE IF EXISTS changelog_items CASCADE;
DROP TABLE IF EXISTS versions CASCADE;
```

Then redeploy previous version of code.

## Environment Variables

Make sure these are set in production:
- `PG_HOST`
- `PG_PORT`
- `PG_DATABASE`
- `PG_USER`
- `PG_PASSWORD`

## Post-Deployment

1. Monitor logs for errors
2. Test all changelog features
3. Create announcement about new changelog
4. Update documentation if needed
