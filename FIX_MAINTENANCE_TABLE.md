# Fix Maintenance Table Error

## Problem
The application is crashing with error: `relation "maintenance_content" does not exist`

## Root Cause
The PostgreSQL schema has a `maintenance` table but the code expects `maintenance_content` with different columns (title, subtitle, message, launch_date, etc.)

## Solution - Run SQL in Azure Portal (RECOMMENDED)

### Step 1: Open Azure Portal Query Editor
1. Go to https://portal.azure.com
2. Navigate to your PostgreSQL database: `roastifydbpost`
3. Click on "Query editor" in the left menu
4. Login with:
   - Username: `adminuser`
   - Password: `AHmed#123456`

### Step 2: Run the SQL
Copy and paste the contents of: `database/QUICK_FIX_MAINTENANCE.sql`

Or copy this SQL directly:
```sql
DROP TABLE IF EXISTS maintenance CASCADE;

CREATE TABLE IF NOT EXISTS maintenance_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL DEFAULT 'Brilliant ideas take time to be roasted',
    subtitle VARCHAR(500) NOT NULL DEFAULT 'Roastify is coming soon',
    message TEXT NOT NULL DEFAULT 'We are crafting something extraordinary.',
    launch_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO maintenance_content (title, subtitle, message, is_active)
VALUES (
    'Brilliant ideas take time to be roasted',
    'Roastify is coming soon',
    'We are crafting something extraordinary.',
    FALSE
);

CREATE TRIGGER update_maintenance_content_updated_at
    BEFORE UPDATE ON maintenance_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Verify
Run this to confirm:
```sql
SELECT * FROM maintenance_content;
```

## What the migration does:
1. Drops the old `maintenance` table
2. Creates new `maintenance_content` table with proper columns:
   - title (VARCHAR 500)
   - subtitle (VARCHAR 500)
   - message (TEXT)
   - launch_date (DATE)
   - is_active (BOOLEAN)
   - updated_by (INTEGER, FK to users)
   - updated_at (TIMESTAMP)
3. Inserts default maintenance content
4. Creates trigger for auto-updating updated_at

## After applying:
The `/api/maintenance/status` endpoint will work correctly and return:
```json
{
  "is_active": false
}
```

## Verification
After running the migration, check the logs - you should no longer see the "relation does not exist" error.
