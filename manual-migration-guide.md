# Manual Database Migration Guide

Since the Node.js connection is having firewall issues, let's use PostgreSQL's native tools which might handle the connection better.

## Option 1: Using pg_dump and pg_restore (Recommended)

### Step 1: Export from Local Database

```powershell
# Set local database credentials
$env:PGPASSWORD="postgres123"

# Export the database
pg_dump -h localhost -U postgres -d roastify -F c -f roastify_backup.dump

# Or export as SQL (alternative)
pg_dump -h localhost -U postgres -d roastify -f roastify_backup.sql
```

### Step 2: Import to Azure Database

```powershell
# Set Azure database credentials
$env:PGPASSWORD="AHmed#123456"

# Import using custom format
pg_restore -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -F c roastify_backup.dump

# Or import SQL file (if you used SQL export)
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f roastify_backup.sql
```

## Option 2: Using psql with SQL Export

### Step 1: Export as SQL

```powershell
$env:PGPASSWORD="postgres123"
pg_dump -h localhost -U postgres -d roastify --no-owner --no-acl -f roastify_export.sql
```

### Step 2: Import to Azure

```powershell
$env:PGPASSWORD="AHmed#123456"
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f roastify_export.sql
```

## Option 3: Table by Table Export/Import

If the above methods fail, export and import each table:

### Export Tables

```powershell
$env:PGPASSWORD="postgres123"

# Export each table
pg_dump -h localhost -U postgres -d roastify -t users --data-only -f users.sql
pg_dump -h localhost -U postgres -d roastify -t clients --data-only -f clients.sql
pg_dump -h localhost -U postgres -d roastify -t projects --data-only -f projects.sql
pg_dump -h localhost -U postgres -d roastify -t tasks --data-only -f tasks.sql
pg_dump -h localhost -U postgres -d roastify -t time_entries --data-only -f time_entries.sql
pg_dump -h localhost -U postgres -d roastify -t invoices --data-only -f invoices.sql
pg_dump -h localhost -U postgres -d roastify -t invoice_items --data-only -f invoice_items.sql
pg_dump -h localhost -U postgres -d roastify -t notifications --data-only -f notifications.sql
pg_dump -h localhost -U postgres -d roastify -t files --data-only -f files.sql
pg_dump -h localhost -U postgres -d roastify -t quotes --data-only -f quotes.sql
```

### Import Tables

```powershell
$env:PGPASSWORD="AHmed#123456"

# Import each table
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f users.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f clients.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f projects.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f tasks.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f time_entries.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f invoices.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f invoice_items.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f notifications.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f files.sql
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f quotes.sql
```

## Troubleshooting

### If you get "no pg_hba.conf entry" error:

1. **Check Azure Portal Firewall Rules**:
   - Go to Azure Portal
   - Navigate to your PostgreSQL server
   - Click "Connection security"
   - Verify your IP (154.184.198.48) is in the firewall rules
   - Click "Save" and wait 2-3 minutes

2. **Enable "Allow Azure services"**:
   - In the same "Connection security" page
   - Toggle "Allow access to Azure services" to ON
   - Click "Save"

3. **Try adding IP range**:
   - Instead of single IP, try adding a range
   - Example: 154.184.198.0 - 154.184.198.255

### If you get SSL errors:

Add `sslmode=disable` to connection:
```powershell
psql "host=roastifydbpost.postgres.database.azure.com port=5432 dbname=roastifydb user=adminuser sslmode=disable"
```

## Verification

After migration, verify the data:

```powershell
$env:PGPASSWORD="AHmed#123456"

# Connect to Azure database
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb

# Run these queries:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM invoices;
```

Compare counts with your local database.

## Update Application Configuration

After successful migration, update `backend/.env`:

```env
PG_HOST=roastifydbpost.postgres.database.azure.com
PG_PORT=5432
PG_DATABASE=roastifydb
PG_USER=adminuser
PG_PASSWORD=AHmed#123456
PG_SSL=false
```

## Quick Commands Reference

### Export entire database:
```powershell
$env:PGPASSWORD="postgres123"
pg_dump -h localhost -U postgres -d roastify -f backup.sql
```

### Import to Azure:
```powershell
$env:PGPASSWORD="AHmed#123456"
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -f backup.sql
```

### Check if psql can connect:
```powershell
$env:PGPASSWORD="AHmed#123456"
psql -h roastifydbpost.postgres.database.azure.com -U adminuser -d roastifydb -c "SELECT version();"
```
