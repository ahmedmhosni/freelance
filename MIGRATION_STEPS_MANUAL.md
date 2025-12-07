# Manual Migration Steps - Azure PostgreSQL

## Current Status
- ✅ Azure PostgreSQL server: `roastifydbpost.postgres.database.azure.com`
- ✅ Database: `roastifydb`
- ✅ User: `adminuser`
- ✅ Tables exist in Azure (27 tables detected)
- ⚠️ Firewall rule needs to propagate or be reconfigured

## Issue
The Node.js migration script cannot connect due to firewall/pg_hba.conf restrictions, even though the initial connection test worked.

## Solution Options

### Option 1: Wait and Retry (Simplest)
Sometimes firewall rules take 5-10 minutes to fully propagate.

1. Wait 5-10 minutes
2. Run the migration again:
```powershell
$env:AZURE_PG_HOST="roastifydbpost.postgres.database.azure.com"
$env:AZURE_PG_PORT="5432"
$env:AZURE_PG_DATABASE="roastifydb"
$env:AZURE_PG_USER="adminuser"
$env:AZURE_PG_PASSWORD="AHmed#123456"
$env:LOCAL_PG_HOST="localhost"
$env:LOCAL_PG_PORT="5432"
$env:LOCAL_PG_DATABASE="roastify"
$env:LOCAL_PG_USER="postgres"
$env:LOCAL_PG_PASSWORD="postgres123"
node migrate-to-azure.js
```

### Option 2: Use Azure Data Studio or pgAdmin (Recommended)

1. **Install Azure Data Studio** (if not installed):
   - Download from: https://aka.ms/azuredatastudio

2. **Connect to Local PostgreSQL**:
   - Server: localhost
   - Database: roastify
   - User: postgres
   - Password: postgres123

3. **Export Data**:
   - Right-click database → Tasks → Export Data
   - Or use SQL: `SELECT * FROM table_name`

4. **Connect to Azure PostgreSQL**:
   - Server: roastifydbpost.postgres.database.azure.com
   - Database: roastifydb
   - User: adminuser
   - Password: AHmed#123456

5. **Import Data**:
   - Run the exported SQL scripts

### Option 3: Use Application to Migrate

Since your application can connect to both databases, create a simple migration script:

```javascript
// migrate-via-app.js
const { Pool } = require('pg');

const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123'
});

const azurePool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: false
});

async function migrateTable(tableName) {
  console.log(`Migrating ${tableName}...`);
  
  // Get data from local
  const { rows } = await localPool.query(`SELECT * FROM ${tableName}`);
  
  if (rows.length === 0) {
    console.log(`  No data in ${tableName}`);
    return;
  }
  
  // Clear Azure table
  await azurePool.query(`TRUNCATE TABLE ${tableName} CASCADE`);
  
  // Insert into Azure
  for (const row of rows) {
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    await azurePool.query(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
  }
  
  console.log(`  Migrated ${rows.length} rows`);
}

async function migrate() {
  const tables = [
    'users', 'clients', 'projects', 'tasks',
    'time_entries', 'invoices', 'invoice_items',
    'notifications', 'files', 'quotes'
  ];
  
  for (const table of tables) {
    await migrateTable(table);
  }
  
  await localPool.end();
  await azurePool.end();
  console.log('Migration complete!');
}

migrate().catch(console.error);
```

### Option 4: Check Azure Firewall Settings Again

1. Go to Azure Portal
2. Navigate to your PostgreSQL server
3. Click "Connection security" or "Networking"
4. Verify:
   - Your IP `154.184.198.48` is listed
   - The rule is saved
   - Try adding IP range: `154.184.198.0` to `154.184.198.255`
   - Enable "Allow access to Azure services"
5. Click "Save" and wait 5 minutes

### Option 5: Update Backend .env to Use Azure Directly

Since Azure already has the schema (27 tables), you might already have data there. Let's just update your application to use Azure:

1. Update `backend/.env`:
```env
PG_HOST=roastifydbpost.postgres.database.azure.com
PG_PORT=5432
PG_DATABASE=roastifydb
PG_USER=adminuser
PG_PASSWORD=AHmed#123456
PG_SSL=false
```

2. Restart your backend server

3. Check if data already exists in Azure

4. If no data, manually add test data through your application

## Verification Commands

Once migration works, verify with:

```javascript
// verify-migration.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: false
});

async function verify() {
  const tables = ['users', 'clients', 'projects', 'tasks', 'invoices'];
  
  for (const table of tables) {
    const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
    console.log(`${table}: ${result.rows[0].count} rows`);
  }
  
  await pool.end();
}

verify();
```

## Next Steps After Successful Migration

1. ✅ Update `backend/.env` with Azure credentials
2. ✅ Set `PG_SSL=false` (since your Azure instance doesn't require SSL)
3. ✅ Restart backend server
4. ✅ Test application functionality
5. ✅ Verify all features work
6. ✅ Deploy to production

## Support

If you continue having issues:
1. Check Azure Portal → PostgreSQL → Connection security
2. Verify firewall rules are saved
3. Wait 5-10 minutes for propagation
4. Try connecting from Azure Cloud Shell
5. Contact Azure support if firewall issues persist
