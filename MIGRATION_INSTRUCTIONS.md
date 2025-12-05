# Database Migration Instructions

## ✅ Safe Migration - No Data Loss

The migration script (`database/safe-migration.sql`) is designed to:
- Use `CREATE TABLE IF NOT EXISTS` - won't recreate existing tables
- Use `ALTER TABLE ADD COLUMN IF NOT EXISTS` - won't duplicate columns
- **PRESERVE ALL EXISTING USERS AND DATA**

---

## Method 1: Azure Portal (EASIEST - RECOMMENDED)

### Steps:

1. **Go to Azure Portal**
   - Navigate to: https://portal.azure.com
   - Search for "roastifydbpost" (your PostgreSQL server)

2. **Open Query Editor**
   - Click on your database: `roastifydb`
   - In the left menu, find **"Query editor"** or **"Query"**
   - Login with:
     - Username: `adminuser`
     - Password: [your database password]

3. **Run Migration**
   - Open the file: `database/safe-migration.sql`
   - Copy ALL the content
   - Paste into the Azure Query Editor
   - Click **"Run"** or press F5

4. **Verify**
   - You should see success messages
   - Check the verification query at the end shows all tables
   - Confirm user count matches your existing users

---

## Method 2: PowerShell Script (If psql is installed)

### Prerequisites:
- PostgreSQL client (psql) must be installed
- Download from: https://www.postgresql.org/download/windows/

### Steps:

```powershell
# Run the migration script
.\run-migration.ps1
```

Enter your database password when prompted.

---

## Method 3: Using DBeaver or pgAdmin (GUI Tools)

### Using DBeaver:

1. **Install DBeaver** (if not installed)
   - Download: https://dbeaver.io/download/

2. **Connect to Database**
   - Host: `roastifydbpost.postgres.database.azure.com`
   - Port: `5432`
   - Database: `roastifydb`
   - Username: `adminuser`
   - Password: [your password]
   - SSL: Required

3. **Run Migration**
   - Open `database/safe-migration.sql`
   - Execute the script (Ctrl+Enter or click Execute)

---

## What the Migration Does

### Creates These Tables (if they don't exist):
- ✅ users (with profile fields)
- ✅ clients
- ✅ projects
- ✅ tasks
- ✅ invoices
- ✅ invoice_items
- ✅ time_entries
- ✅ announcements
- ✅ changelog_entries
- ✅ version_names
- ✅ quotes
- ✅ maintenance
- ✅ feedback
- ✅ legal_content
- ✅ activity_log
- ✅ gdpr_requests

### Adds Missing Columns (if they don't exist):
- User profile fields (username, bio, social links, etc.)
- Theme preference
- Email verification fields
- Invoice dates
- Task assignments

### Creates Indexes for Performance

---

## Verification

After running the migration, verify it worked:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify users are preserved
SELECT COUNT(*) as total_users FROM users;

-- Check a sample user
SELECT id, name, email, created_at FROM users LIMIT 5;
```

---

## Troubleshooting

### Error: "relation already exists"
- **This is OK!** It means the table already exists and was skipped.

### Error: "column already exists"
- **This is OK!** It means the column already exists and was skipped.

### Error: "password authentication failed"
- Check your database password
- Verify username is `adminuser`

### Error: "SSL connection required"
- Make sure SSL is enabled in your connection settings

---

## After Migration

Once migration is complete:

1. **Test Authentication**
   - Try logging in to your app
   - Try registering a new user

2. **Test Core Features**
   - Create a client
   - Create a project
   - Create a task
   - Track time

3. **Check Logs**
   - Azure Portal → Web App → Log stream
   - Look for any database errors

---

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify database connection details
3. Ensure SSL is enabled
4. Check Azure firewall rules allow your IP

---

## Summary

✅ Migration is SAFE - no data will be lost  
✅ Existing users will be preserved  
✅ Only missing tables/columns will be added  
✅ Can be run multiple times safely  

**Recommended**: Use Azure Portal Query Editor (Method 1)
