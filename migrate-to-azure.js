/**
 * Database Migration Script: Local PostgreSQL to Azure PostgreSQL
 * 
 * This script migrates all data from local PostgreSQL to Azure PostgreSQL
 * 
 * Usage:
 * 1. Set Azure PostgreSQL credentials in .env or pass as arguments
 * 2. Run: node migrate-to-azure.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Local PostgreSQL connection
const localPool = new Pool({
  host: process.env.LOCAL_PG_HOST || 'localhost',
  port: process.env.LOCAL_PG_PORT || 5432,
  database: process.env.LOCAL_PG_DATABASE || 'roastify',
  user: process.env.LOCAL_PG_USER || 'postgres',
  password: process.env.LOCAL_PG_PASSWORD || 'postgres123',
  ssl: false
});

// Azure PostgreSQL connection
const azurePool = new Pool({
  host: process.env.AZURE_PG_HOST,
  port: process.env.AZURE_PG_PORT || 5432,
  database: process.env.AZURE_PG_DATABASE,
  user: process.env.AZURE_PG_USER,
  password: process.env.AZURE_PG_PASSWORD,
  ssl: false // SSL disabled for this Azure instance
});

// Tables to migrate in order (respecting foreign key dependencies)
const TABLES = [
  'users',
  'clients',
  'projects',
  'tasks',
  'time_entries',
  'invoices',
  'invoice_items',
  'notifications',
  'files',
  'quotes',
  'maintenance_content'
];

/**
 * Test database connections
 */
async function testConnections() {
  log('\n=== Testing Database Connections ===', 'cyan');
  
  try {
    // Test local connection
    log('Testing local PostgreSQL connection...', 'yellow');
    const localResult = await localPool.query('SELECT NOW()');
    log(`✓ Local PostgreSQL connected: ${localResult.rows[0].now}`, 'green');
    
    // Test Azure connection
    log('Testing Azure PostgreSQL connection...', 'yellow');
    const azureResult = await azurePool.query('SELECT NOW()');
    log(`✓ Azure PostgreSQL connected: ${azureResult.rows[0].now}`, 'green');
    
    return true;
  } catch (error) {
    log(`✗ Connection test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Get table row count
 */
async function getRowCount(pool, tableName) {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    return parseInt(result.rows[0].count);
  } catch (error) {
    return 0;
  }
}

/**
 * Check if table exists
 */
async function tableExists(pool, tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    return false;
  }
}

/**
 * Create schema on Azure if it doesn't exist
 */
async function createSchema() {
  log('\n=== Creating Schema on Azure PostgreSQL ===', 'cyan');
  
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema-postgres.sql');
    
    if (!fs.existsSync(schemaPath)) {
      log('✗ Schema file not found at: ' + schemaPath, 'red');
      return false;
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    log('Executing schema creation...', 'yellow');
    await azurePool.query(schema);
    log('✓ Schema created successfully', 'green');
    
    return true;
  } catch (error) {
    log(`✗ Schema creation failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Backup Azure data before migration
 */
async function backupAzureData() {
  log('\n=== Backing Up Azure Data ===', 'cyan');
  
  const backup = {};
  
  for (const table of TABLES) {
    try {
      const exists = await tableExists(azurePool, table);
      if (!exists) continue;
      
      const result = await azurePool.query(`SELECT * FROM ${table}`);
      backup[table] = result.rows;
      log(`✓ Backed up ${result.rows.length} rows from ${table}`, 'green');
    } catch (error) {
      log(`⚠ Could not backup ${table}: ${error.message}`, 'yellow');
    }
  }
  
  // Save backup to file
  const backupPath = path.join(__dirname, `azure-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  log(`✓ Backup saved to: ${backupPath}`, 'green');
  
  return backup;
}

/**
 * Migrate a single table
 */
async function migrateTable(tableName) {
  try {
    // Check if table exists in local
    const localExists = await tableExists(localPool, tableName);
    if (!localExists) {
      log(`⚠ Table ${tableName} does not exist in local database`, 'yellow');
      return { success: true, rows: 0 };
    }
    
    // Get data from local
    const localData = await localPool.query(`SELECT * FROM ${tableName}`);
    const rowCount = localData.rows.length;
    
    if (rowCount === 0) {
      log(`⚠ No data to migrate from ${tableName}`, 'yellow');
      return { success: true, rows: 0 };
    }
    
    log(`Migrating ${rowCount} rows from ${tableName}...`, 'yellow');
    
    // Clear existing data in Azure (optional - comment out if you want to keep existing data)
    await azurePool.query(`TRUNCATE TABLE ${tableName} CASCADE`);
    
    // Get column names
    const columns = Object.keys(localData.rows[0]);
    const columnList = columns.join(', ');
    
    // Insert data in batches
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < localData.rows.length; i += batchSize) {
      const batch = localData.rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        const values = columns.map(col => row[col]);
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
        
        const query = `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders})`;
        
        try {
          await azurePool.query(query, values);
          inserted++;
        } catch (error) {
          log(`✗ Error inserting row into ${tableName}: ${error.message}`, 'red');
        }
      }
      
      log(`  Progress: ${Math.min(i + batchSize, rowCount)}/${rowCount} rows`, 'cyan');
    }
    
    // Reset sequence for SERIAL columns
    try {
      await azurePool.query(`
        SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), 
        COALESCE((SELECT MAX(id) FROM ${tableName}), 1), true)
      `);
    } catch (error) {
      // Ignore if table doesn't have id column
    }
    
    log(`✓ Migrated ${inserted}/${rowCount} rows to ${tableName}`, 'green');
    
    return { success: true, rows: inserted };
  } catch (error) {
    log(`✗ Error migrating ${tableName}: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Verify migration
 */
async function verifyMigration() {
  log('\n=== Verifying Migration ===', 'cyan');
  
  const report = [];
  
  for (const table of TABLES) {
    const localCount = await getRowCount(localPool, table);
    const azureCount = await getRowCount(azurePool, table);
    
    const status = localCount === azureCount ? '✓' : '✗';
    const color = localCount === azureCount ? 'green' : 'red';
    
    const line = `${status} ${table}: Local=${localCount}, Azure=${azureCount}`;
    log(line, color);
    
    report.push({
      table,
      local: localCount,
      azure: azureCount,
      match: localCount === azureCount
    });
  }
  
  return report;
}

/**
 * Main migration function
 */
async function migrate() {
  log('\n╔════════════════════════════════════════════════════════╗', 'bright');
  log('║   Database Migration: Local → Azure PostgreSQL        ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝', 'bright');
  
  try {
    // Step 1: Test connections
    const connected = await testConnections();
    if (!connected) {
      log('\n✗ Migration aborted: Connection test failed', 'red');
      process.exit(1);
    }
    
    // Step 2: Backup Azure data
    await backupAzureData();
    
    // Step 3: Create schema (if needed)
    log('\n=== Checking Azure Schema ===', 'cyan');
    const hasUsers = await tableExists(azurePool, 'users');
    if (!hasUsers) {
      log('Schema not found, creating...', 'yellow');
      await createSchema();
    } else {
      log('✓ Schema already exists', 'green');
    }
    
    // Step 4: Migrate tables
    log('\n=== Migrating Tables ===', 'cyan');
    const results = {};
    
    for (const table of TABLES) {
      log(`\n--- ${table} ---`, 'blue');
      results[table] = await migrateTable(table);
    }
    
    // Step 5: Verify migration
    const verification = await verifyMigration();
    
    // Step 6: Summary
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║                  Migration Summary                     ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝', 'bright');
    
    const totalTables = TABLES.length;
    const successfulTables = verification.filter(v => v.match).length;
    const totalRows = verification.reduce((sum, v) => sum + v.azure, 0);
    
    log(`\nTables migrated: ${successfulTables}/${totalTables}`, 'cyan');
    log(`Total rows migrated: ${totalRows}`, 'cyan');
    
    if (successfulTables === totalTables) {
      log('\n✓ Migration completed successfully!', 'green');
    } else {
      log('\n⚠ Migration completed with warnings', 'yellow');
    }
    
  } catch (error) {
    log(`\n✗ Migration failed: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await localPool.end();
    await azurePool.end();
  }
}

// Run migration
if (require.main === module) {
  migrate().catch(console.error);
}

module.exports = { migrate, testConnections, verifyMigration };
