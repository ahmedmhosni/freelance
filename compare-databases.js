/**
 * Compare Local and Production Databases
 * Identifies missing tables in production
 */

const { Client } = require('pg');

// Local database config
const localConfig = {
  host: 'localhost',
  port: 5432,
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123'
};

// Azure production database config
const azureConfig = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: {
    rejectUnauthorized: false
  }
};

async function getTables(config, label) {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log(`✅ Connected to ${label} database`);
    
    const result = await client.query(`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error(`❌ Error connecting to ${label}:`, error.message);
    return [];
  } finally {
    await client.end();
  }
}

async function getTableDetails(config, tableName) {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    // Get column count
    const columns = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = $1
    `, [tableName]);
    
    // Get row count
    const rows = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    
    return {
      columns: parseInt(columns.rows[0].count),
      rows: parseInt(rows.rows[0].count)
    };
  } catch (error) {
    return { columns: 0, rows: 0, error: error.message };
  } finally {
    await client.end();
  }
}

async function compareDatabases() {
  console.log('🔍 Comparing Local and Production Databases\n');
  console.log('=' .repeat(80));
  
  // Get tables from both databases
  const localTables = await getTables(localConfig, 'LOCAL');
  const azureTables = await getTables(azureConfig, 'AZURE PRODUCTION');
  
  console.log(`\n📊 Summary:`);
  console.log(`   Local tables: ${localTables.length}`);
  console.log(`   Azure tables: ${azureTables.length}`);
  
  // Find missing tables in Azure
  const missingInAzure = localTables.filter(table => !azureTables.includes(table));
  
  // Find extra tables in Azure (shouldn't happen but good to know)
  const extraInAzure = azureTables.filter(table => !localTables.includes(table));
  
  // Common tables
  const commonTables = localTables.filter(table => azureTables.includes(table));
  
  console.log('\n' + '='.repeat(80));
  console.log('❌ MISSING TABLES IN PRODUCTION (Need to create):');
  console.log('='.repeat(80));
  
  if (missingInAzure.length === 0) {
    console.log('✅ No missing tables! Production has all tables from local.');
  } else {
    console.log(`\nFound ${missingInAzure.length} missing tables:\n`);
    
    for (const table of missingInAzure) {
      const details = await getTableDetails(localConfig, table);
      console.log(`   ❌ ${table}`);
      console.log(`      Columns: ${details.columns}, Rows: ${details.rows}`);
    }
    
    console.log('\n📝 These tables need to be created in production:');
    missingInAzure.forEach(table => console.log(`   - ${table}`));
  }
  
  if (extraInAzure.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('ℹ️  EXTRA TABLES IN PRODUCTION (Not in local):');
    console.log('='.repeat(80));
    extraInAzure.forEach(table => console.log(`   + ${table}`));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ COMMON TABLES (Exist in both):');
  console.log('='.repeat(80));
  console.log(`\nFound ${commonTables.length} common tables\n`);
  
  // Show first 20 common tables
  const displayTables = commonTables.slice(0, 20);
  for (const table of displayTables) {
    console.log(`   ✓ ${table}`);
  }
  
  if (commonTables.length > 20) {
    console.log(`   ... and ${commonTables.length - 20} more`);
  }
  
  // Generate migration SQL for missing tables
  if (missingInAzure.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 MIGRATION NEEDED:');
    console.log('='.repeat(80));
    console.log('\nTo fix the 500 errors, you need to create these tables in production:');
    console.log('\nOption 1: Run migrations manually');
    console.log('   - Connect to Azure PostgreSQL');
    console.log('   - Run the SQL files from database/migrations/');
    console.log('\nOption 2: Use pg_dump to export and import');
    console.log('   - Export: pg_dump -h localhost -U postgres -d roastify --schema-only -t "table_name" > table.sql');
    console.log('   - Import: psql -h roastify-db-server.postgres.database.azure.com -U roastifyadmin -d roastify-production < table.sql');
    
    console.log('\n🔧 Missing tables that are causing 500 errors:');
    const criticalTables = [
      'activity_logs',
      'versions',
      'changelog_items',
      'version_names',
      'git_commits',
      'git_sync_status',
      'feedback',
      'legal_content',
      'data_export_requests',
      'data_deletion_requests'
    ];
    
    const criticalMissing = missingInAzure.filter(t => criticalTables.includes(t));
    if (criticalMissing.length > 0) {
      console.log('\n   CRITICAL (causing current 500 errors):');
      criticalMissing.forEach(table => console.log(`   ❗ ${table}`));
    }
    
    const nonCriticalMissing = missingInAzure.filter(t => !criticalTables.includes(t));
    if (nonCriticalMissing.length > 0) {
      console.log('\n   NON-CRITICAL (future features):');
      nonCriticalMissing.forEach(table => console.log(`   ⚠️  ${table}`));
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Comparison Complete');
  console.log('='.repeat(80));
}

// Run comparison
compareDatabases().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
