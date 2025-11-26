# PostgreSQL Routes Fix Required

## Problem
Most backend routes are still importing the old `queries` module which is designed for SQL Server, not PostgreSQL. This causes 500 errors when the routes try to execute queries.

## Current Errors
- `/api/time-tracking` - 500 error
- `/api/notifications` - 500 error  
- `/api/reports/*` - 500 errors
- `/api/admin/*` - 500 errors
- `/api/auth/login` - 401 error (wrong queries module)

## Root Cause
Routes are importing:
```javascript
const queries = require('../db/queries');  // SQL Server queries
```

They should import:
```javascript
const queries = process.env.USE_POSTGRES === 'true' 
  ? require('../db/queries-pg')   // PostgreSQL queries
  : require('../db/queries');      // SQL Server queries
```

## Routes That Need Fixing

### ✅ Already Fixed:
- `backend/src/routes/auth.js` - Updated to use conditional import

### ❌ Need Fixing:
- `backend/src/routes/admin.js`
- `backend/src/routes/clients.js`
- `backend/src/routes/dashboard.js`
- `backend/src/routes/files.js`
- `backend/src/routes/invoices.js`
- `backend/src/routes/invoiceItems.js`
- `backend/src/routes/notifications.js`
- `backend/src/routes/profile.js`
- `backend/src/routes/projects.js`
- `backend/src/routes/quotes.js`
- `backend/src/routes/reports.js`
- `backend/src/routes/tasks.js`
- `backend/src/routes/timeTracking.js`
- `backend/src/routes/userPreferences.js`

## Quick Fix

Run this command to update all routes at once:
```bash
node backend/fix-all-routes-postgres.js
```

Or manually update each route file by changing the queries import from:
```javascript
const queries = require('../db/queries');
```

To:
```javascript
const queries = process.env.USE_POSTGRES === 'true' 
  ? require('../db/queries-pg') 
  : require('../db/queries');
```

## After Fixing
1. Restart the backend server
2. Test login with: `node backend/test-login.js`
3. Test the frontend - all 500 errors should be resolved

## Alternative: Use queries-pg Directly
If you're only using PostgreSQL (recommended for consistency), you can directly import:
```javascript
const queries = require('../db/queries-pg');
```

This is simpler and removes the conditional logic.
