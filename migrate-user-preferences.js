/**
 * Migration Script for User Preferences & GDPR Tables
 * Run with: node migrate-user-preferences.js
 */

const { query } = require('./backend/src/db/postgresql');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('='.repeat(80));
  console.log('USER PREFERENCES & GDPR MIGRATION');
  console.log('='.repeat(80));

  try {
    console.log('\nReading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'database/migrations/add_user_preferences_and_gdpr_tables.sql'),
      'utf8'
    );

    console.log('Executing migration...\n');
    await query(migrationSQL);

    console.log('✓ Migration completed successfully');

    // Verify tables were created
    console.log('\nVerifying tables...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('user_preferences', 'data_export_requests')
      ORDER BY table_name
    `);

    console.log('\nTables created:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Verify indexes
    const indexes = await query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('user_preferences', 'data_export_requests')
      ORDER BY indexname
    `);

    console.log('\nIndexes created:');
    indexes.rows.forEach(row => {
      console.log(`  ✓ ${row.indexname}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✓ MIGRATION COMPLETE');
    console.log('='.repeat(80));
    console.log('\nYou can now restart your backend server.');
    console.log('The new endpoints will be available at:');
    console.log('  - GET/PUT /api/user/preferences');
    console.log('  - GET/PUT /api/user/preferences/email');
    console.log('  - POST /api/gdpr/export');
    console.log('  - POST /api/gdpr/delete-account');
    console.log('  - GET /api/gdpr/exports');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('✗ MIGRATION FAILED');
    console.error('='.repeat(80));
    console.error('\nError:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    if (error.detail) {
      console.error('Detail:', error.detail);
    }

    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

// Run migration
runMigration();
