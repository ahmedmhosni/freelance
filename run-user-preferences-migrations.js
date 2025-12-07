const { query } = require('./backend/src/db/postgresql');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  console.log('='.repeat(80));
  console.log('USER PREFERENCES & GDPR MIGRATIONS');
  console.log('='.repeat(80));

  try {
    // Migration 1: Create user_preferences table
    console.log('\n1. Creating user_preferences table...');
    const userPrefsSql = fs.readFileSync(
      path.join(__dirname, 'database/migrations/create_user_preferences_table.sql'),
      'utf8'
    );
    await query(userPrefsSql);
    console.log('✓ user_preferences table created');

    // Migration 2: Create data_export_requests table
    console.log('\n2. Creating data_export_requests table...');
    const exportRequestsSql = fs.readFileSync(
      path.join(__dirname, 'database/migrations/create_data_export_requests_table.sql'),
      'utf8'
    );
    await query(exportRequestsSql);
    console.log('✓ data_export_requests table created');

    // Verify tables
    console.log('\n3. Verifying tables...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('user_preferences', 'data_export_requests')
      ORDER BY table_name
    `);

    console.log('Tables found:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✓ ALL MIGRATIONS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('✗ MIGRATION FAILED');
    console.error('='.repeat(80));
    console.error('\nError:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

runMigrations();
