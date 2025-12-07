const { Pool } = require('pg');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: false
});

async function test() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Testing Azure PostgreSQL Connection                 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    // Test connection
    const result = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✓ Connection successful!');
    console.log(`  Time: ${result.rows[0].time}`);
    console.log(`  Version: ${result.rows[0].version.split(',')[0]}`);
    
    // Check database
    const dbResult = await pool.query('SELECT current_database()');
    console.log(`  Database: ${dbResult.rows[0].current_database}`);
    
    // Count tables
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`  Tables: ${tablesResult.rows[0].count}`);
    
    // Check main tables
    console.log('\nTable Row Counts:');
    const tables = ['users', 'clients', 'projects', 'tasks', 'invoices', 'time_entries'];
    
    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ${table}: ${countResult.rows[0].count} rows`);
      } catch (error) {
        console.log(`  ${table}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✓ Azure PostgreSQL is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Start your backend server: cd backend && npm start');
    console.log('2. Start your frontend: cd frontend && npm run dev');
    console.log('3. Test the application');
    
  } catch (error) {
    console.log('✗ Connection failed!');
    console.log(`  Error: ${error.message}`);
    console.log('\nTroubleshooting:');
    console.log('1. Check if your IP is in Azure firewall rules');
    console.log('2. Wait 5-10 minutes for firewall rules to propagate');
    console.log('3. Verify credentials are correct');
    console.log('4. Check if database exists');
  } finally {
    await pool.end();
  }
}

test();
