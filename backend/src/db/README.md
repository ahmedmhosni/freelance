# Old Database Connection Layer

## Status: LEGACY - Still in use by non-migrated routes

This directory contains the old database connection layer that is still being used by routes that haven't been migrated to the new architecture yet.

## Files in This Directory

### Active Files (Still in Use)
- `database.js` - Old database connection logic
- `postgresql.js` - PostgreSQL connection helper
- `pool.js` - Connection pool management
- `queries-pg.js` - Direct SQL queries
- `index.js` - Database exports
- `pg-helper.js` - PostgreSQL helper functions

### Migration Files (Still Needed)
- `migrations/` - Database migration scripts
- `schema.sql` - Database schema
- `schema-azure.sql` - Azure-specific schema
- `seed.js` - Database seeding
- `seed-announcements.js` - Announcements seeding
- `run-announcements-migration.js` - Migration runner

### Deprecated Files
- `cockroachdb.js` - CockroachDB connection (not used)
- `migrate-cockroach.js` - CockroachDB migrations (not used)

## Routes Still Using This Layer

The following routes still use this old database connection layer:
- `/api/dashboard` - Dashboard routes
- `/api/quotes` - Quotes management
- `/api/maintenance` - Maintenance mode
- `/api/status` - Status page
- `/api/profile` - User profile
- `/api/user` - User preferences
- `/api/legal` - Legal content
- `/api/files` - File uploads
- `/api/feedback` - User feedback
- `/api/preferences` - User preferences
- `/api/gdpr` - GDPR compliance
- `/api/admin/gdpr` - Admin GDPR tools
- `/api/admin/activity` - Admin activity tracking
- `/api/version` - Version information
- `/api/changelog` - Changelog
- `/api/announcements` - Announcements

## New Architecture Database Layer

The new modular architecture uses:
- **Location:** `backend/src/core/database/Database.js`
- **Features:**
  - Connection pooling with `pg` library
  - Transaction support
  - Query logging
  - Error handling
  - Retry logic
  - Works with both local PostgreSQL and AWS RDS

## Migration Plan

### Phase 1: ✅ COMPLETE
Migrated these modules to new database layer:
- Clients
- Projects
- Tasks
- Invoices
- Time Tracking
- Reports
- Notifications
- Auth
- Admin

### Phase 2: PENDING
Migrate remaining routes to new architecture:
1. Dashboard module
2. Quotes module
3. Maintenance module
4. Status module
5. Profile module
6. User preferences module
7. Legal module
8. Files module
9. Feedback module
10. GDPR module
11. Version/Changelog module
12. Announcements module

### Phase 3: CLEANUP
Once all routes are migrated:
1. Archive this directory to `backend/src/db-old/`
2. Update any remaining references
3. Remove old database connection code
4. Keep migration files and schemas for reference

## DO NOT DELETE YET

⚠️ **WARNING:** Do not delete files in this directory until all routes have been migrated to the new architecture. Deleting these files will break the remaining non-migrated routes.

## Date Created

**December 4, 2025**

## Related Documentation

- New database layer: `backend/src/core/database/Database.js`
- Architecture docs: `backend/docs/ARCHITECTURE.md`
- Migration status: `backend/TASK_56_COMPLETE.md`
