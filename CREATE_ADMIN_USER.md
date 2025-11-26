# Create Admin User - Simple Method

## Option 1: Register Through Website (Easiest)

1. Go to: https://roastify.online/register
2. Register with:
   - Name: Ahmed Hosni
   - Email: ahmedmhosni90@gmail.com
   - Password: Ahmed#123456
3. Check your email for verification code
4. Verify your email
5. Then run this SQL in Azure Portal to make yourself admin:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'ahmedmhosni90@gmail.com';
```

## Option 2: Use Azure Portal Query Editor

1. Go to Azure Portal
2. Navigate to your PostgreSQL server: `roastifydbpost`
3. Click "Query editor" in the left menu
4. Connect with your credentials
5. Select database: `roastifydb`
6. Run this SQL:

```sql
-- First, let's see if user exists
SELECT id, email, role FROM users WHERE email = 'ahmedmhosni90@gmail.com';

-- If user exists, update to admin:
UPDATE users 
SET role = 'admin',
    email_verified = true
WHERE email = 'ahmedmhosni90@gmail.com';

-- If user doesn't exist, register first through the website
```

## Option 3: Use pgAdmin (If you have it)

1. Open pgAdmin
2. Add new server:
   - Host: roastifydbpost.postgres.database.azure.com
   - Port: 5432
   - Database: roastifydb
   - Username: adminuser
   - Password: AHmed#123456
   - SSL: Require
3. Connect
4. Open Query Tool
5. Run the UPDATE query above

## Recommended: Option 1

Just register normally through the website, then update your role to admin using Azure Portal Query Editor. This is the safest and easiest method!

