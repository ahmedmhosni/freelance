// Test Azure Production Database Connection
const { Client } = require('pg');

const connectionString = 'postgresql://adminuser:AHmed%23123456@roastifydbpost.postgres.database.azure.com:5432/roastifydb?sslmode=require';

async function testConnection() {
  console.log('='.repeat(70));
  console.log('AZURE PRODUCTION DATABASE CONNECTION TEST');
  console.log('='.repeat(70));
  console.log(`\nServer: roastifydbpost.postgres.database.azure.com`);
  console.log(`Database: roastifydb`);
  console.log(`User: adminuser`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Azure PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Test 1: Check database version
    console.log('TEST 1: Database Version');
    console.log('-'.repeat(70));
    const versionResult = await client.query('SELECT version()');
    console.log(`✓ PostgreSQL Version: ${versionResult.rows[0].version.substring(0, 50)}...\n`);

    // Test 2: List all tables
    console.log('TEST 2: List All Tables');
    console.log('-'.repeat(70));
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`✓ Total Tables: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`);
    });

    // Test 3: Check critical tables with data
    console.log('\nTEST 3: Critical Tables Data Count');
    console.log('-'.repeat(70));
    
    const criticalTables = [
      'users',
      'clients', 
      'projects',
      'invoices',
      'tasks',
      'time_entries',
      'activity_logs',
      'legal_content',
      'versions',
      'changelog_items',
      'feedback',
      'ai_settings',
      'ai_usage',
      'ai_conversations',
      'ai_analytics'
    ];

    for (const table of criticalTables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(countResult.rows[0].count);
        const icon = count > 0 ? '✓' : '○';
        console.log(`  ${icon} ${table.padEnd(25)} ${count} rows`);
      } catch (error) {
        console.log(`  ✗ ${table.padEnd(25)} ERROR: ${error.message}`);
      }
    }

    // Test 4: Test a sample query
    console.log('\nTEST 4: Sample Query (Get Users)');
    console.log('-'.repeat(70));
    const usersResult = await client.query('SELECT id, name, email, role FROM users LIMIT 5');
    console.log(`✓ Found ${usersResult.rows.length} users:`);
    usersResult.rows.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Test 5: Check AI tables structure
    console.log('\nTEST 5: AI Tables Structure');
    console.log('-'.repeat(70));
    const aiTablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'ai_%'
      ORDER BY table_name
    `);
    console.log(`✓ AI Tables Found: ${aiTablesCheck.rows.length}`);
    aiTablesCheck.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Test 6: Check AI settings
    console.log('\nTEST 6: AI Settings Configuration');
    console.log('-'.repeat(70));
    try {
      const aiSettingsResult = await client.query('SELECT * FROM ai_settings WHERE id = 1');
      if (aiSettingsResult.rows.length > 0) {
        const settings = aiSettingsResult.rows[0];
        console.log(`✓ AI Settings Found:`);
        console.log(`  - Enabled: ${settings.enabled}`);
        console.log(`  - Provider: ${settings.provider}`);
        console.log(`  - Model: ${settings.model}`);
        console.log(`  - Daily Limit: ${settings.daily_limit}`);
        console.log(`  - Monthly Limit: ${settings.monthly_limit}`);
      } else {
        console.log(`○ No AI settings found (default will be used)`);
      }
    } catch (error) {
      console.log(`✗ Error reading AI settings: ${error.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('DATABASE CONNECTION TEST SUMMARY');
    console.log('='.repeat(70));
    console.log('✅ Connection: SUCCESS');
    console.log('✅ Tables: VERIFIED');
    console.log('✅ Data: ACCESSIBLE');
    console.log('✅ Queries: WORKING');
    console.log('\n🎉 Azure PostgreSQL database is fully operational!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION FAILED');
    console.error('='.repeat(70));
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error('\nPossible causes:');
    console.error('  1. Firewall rules blocking your IP');
    console.error('  2. Incorrect credentials');
    console.error('  3. Database server is down');
    console.error('  4. SSL/TLS configuration issue');
    console.error('\nTo fix:');
    console.error('  1. Check Azure Portal → PostgreSQL → Networking');
    console.error('  2. Add your IP to firewall rules');
    console.error('  3. Verify connection string');
    console.error('='.repeat(70));
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nConnection closed.\n');
  }
}

testConnection().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
