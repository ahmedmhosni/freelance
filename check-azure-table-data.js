/**
 * Check Azure Tables for Data
 * Specifically checks tables that were causing 500 errors
 */

const { Client } = require('pg');

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

// Tables that were causing 500 errors
const criticalTables = [
  'activity_logs',
  'versions',
  'changelog_items',
  'version_names',
  'git_commits',
  'git_sync_status',
  'feedback',
  'legal_content',
  'data_export_requests'
];

async function checkTableData() {
  const client = new Client(azureConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to Azure PostgreSQL\n');
    console.log('=' .repeat(80));
    console.log('🔍 Checking Tables That Were Causing 500 Errors');
    console.log('=' .repeat(80));
    
    const results = [];
    
    for (const tableName of criticalTables) {
      try {
        // Check if table exists
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [tableName]);
        
        const exists = tableCheck.rows[0].exists;
        
        if (!exists) {
          results.push({
            table: tableName,
            exists: false,
            rows: 0,
            columns: 0,
            status: '❌ MISSING'
          });
          continue;
        }
        
        // Get row count
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const rowCount = parseInt(countResult.rows[0].count);
        
        // Get column count
        const columnsResult = await client.query(`
          SELECT COUNT(*) as count
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = $1
        `, [tableName]);
        const columnCount = parseInt(columnsResult.rows[0].count);
        
        // Get sample data if exists
        let sampleData = null;
        if (rowCount > 0) {
          const sampleResult = await client.query(`SELECT * FROM "${tableName}" LIMIT 1`);
          sampleData = sampleResult.rows[0];
        }
        
        results.push({
          table: tableName,
          exists: true,
          rows: rowCount,
          columns: columnCount,
          status: rowCount > 0 ? '✅ HAS DATA' : '⚠️  EMPTY',
          sampleData
        });
        
      } catch (error) {
        results.push({
          table: tableName,
          exists: false,
          rows: 0,
          columns: 0,
          status: '❌ ERROR',
          error: error.message
        });
      }
    }
    
    // Display results
    console.log('\n📊 Results:\n');
    
    let hasData = 0;
    let isEmpty = 0;
    let missing = 0;
    
    results.forEach(result => {
      console.log(`${result.status} ${result.table}`);
      if (result.exists) {
        console.log(`   Columns: ${result.columns}, Rows: ${result.rows}`);
        if (result.rows > 0) {
          hasData++;
          console.log(`   Sample: ${JSON.stringify(result.sampleData).substring(0, 100)}...`);
        } else {
          isEmpty++;
        }
      } else {
        missing++;
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
      console.log('');
    });
    
    // Summary
    console.log('=' .repeat(80));
    console.log('📈 Summary:');
    console.log('=' .repeat(80));
    console.log(`Total tables checked: ${criticalTables.length}`);
    console.log(`✅ Tables with data: ${hasData}`);
    console.log(`⚠️  Empty tables: ${isEmpty}`);
    console.log(`❌ Missing tables: ${missing}`);
    
    // Analysis
    console.log('\n' + '=' .repeat(80));
    console.log('💡 Analysis:');
    console.log('=' .repeat(80));
    
    if (missing > 0) {
      console.log('\n❌ CRITICAL: Some tables are missing!');
      console.log('   These tables need to be created in Azure.');
    } else if (isEmpty === criticalTables.length) {
      console.log('\n⚠️  All tables exist but are EMPTY');
      console.log('   This is normal for a fresh deployment.');
      console.log('   Tables will populate as features are used.');
    } else if (hasData > 0) {
      console.log('\n✅ Some tables have data');
      console.log('   Database is being used and populated.');
    }
    
    console.log('\n🔧 Impact on 500 Errors:');
    if (missing > 0) {
      console.log('   ❌ Missing tables WILL cause 500 errors');
      console.log('   ✅ BUT: Our code fixes handle this gracefully now');
    } else {
      console.log('   ✅ All tables exist - no 500 errors from missing tables');
      console.log('   ✅ Empty tables are fine - routes return empty arrays');
    }
    
    // Recommendations
    console.log('\n' + '=' .repeat(80));
    console.log('📋 Recommendations:');
    console.log('=' .repeat(80));
    
    const emptyTables = results.filter(r => r.exists && r.rows === 0);
    if (emptyTables.length > 0) {
      console.log('\n⚠️  Empty tables (will show empty states in UI):');
      emptyTables.forEach(t => console.log(`   - ${t.table}`));
      console.log('\n   These are optional features. They will populate when:');
      console.log('   - activity_logs: Users perform actions');
      console.log('   - versions/changelog: Admin creates changelog entries');
      console.log('   - feedback: Users submit feedback');
      console.log('   - legal_content: Admin adds terms/privacy policy');
      console.log('   - data_export_requests: Users request data exports');
    }
    
    const tablesWithData = results.filter(r => r.exists && r.rows > 0);
    if (tablesWithData.length > 0) {
      console.log('\n✅ Tables with data (features in use):');
      tablesWithData.forEach(t => console.log(`   - ${t.table} (${t.rows} rows)`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n✅ Connection closed');
  }
}

// Run check
console.log('🔍 Azure Database Table Data Check\n');
checkTableData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
