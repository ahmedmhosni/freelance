# Maintenance Table Error - Fixed

## Error in Production Logs
```
PostgreSQL query error: error: relation "maintenance_content" does not exist
```

## What Happened
Your app is running on Azure with PostgreSQL, but the `maintenance_content` table is missing from the database. The schema had an old `maintenance` table with different columns.

## The Fix

### Files Created:
1. **database/QUICK_FIX_MAINTENANCE.sql** - SQL to run in Azure Portal
2. **database/migrations/ADD_MAINTENANCE_CONTENT_POSTGRES.sql** - Full migration file
3. **database/apply-maintenance-content-azure.js** - Node script (requires firewall access)
4. **FIX_MAINTENANCE_TABLE.md** - Detailed instructions

### What You Need to Do:

**OPTION 1: Azure Portal (EASIEST - DO THIS)**
1. Open Azure Portal: https://portal.azure.com
2. Go to your PostgreSQL database: `roastifydbpost`
3. Click "Query editor" 
4. Login as `adminuser`
5. Copy/paste SQL from `database/QUICK_FIX_MAINTENANCE.sql`
6. Click "Run"
7. Restart your App Service

**OPTION 2: Add Your IP to Firewall**
If you want to run the Node.js script locally:
1. Azure Portal → PostgreSQL → Networking
2. Add your current IP address
3. Run: `cd backend && node apply-maintenance-content-azure.js`

## What the Fix Does:
- Drops old `maintenance` table
- Creates new `maintenance_content` table with columns:
  - title, subtitle, message, launch_date, is_active, updated_by, updated_at
- Inserts default maintenance content
- Creates auto-update trigger

## After Applying:
The error will disappear and these endpoints will work:
- `GET /api/maintenance` - Get maintenance content
- `GET /api/maintenance/status` - Check if maintenance mode is active
- `PUT /api/maintenance` - Update maintenance content (admin only)

## Updated Files:
- ✅ `backend/.env` - Added PostgreSQL environment variables
- ✅ `database/schema-postgres.sql` - Updated with correct table definition
- ✅ Created migration files and scripts

## Next Step:
**Run the SQL in Azure Portal Query Editor NOW** to fix the production error.
