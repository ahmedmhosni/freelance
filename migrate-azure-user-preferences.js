/**
 * Azure PostgreSQL Migration Script
 * Migrates user_preferences and data_export_requests tables to Azure
 * 
 * Usage: node migrate-azure-user-preferences.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Azure PostgreSQL connection details
// Using Azure credentials directly
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

async function runAzureMigration() {
  console.log('='.repeat(80));
  console.log('AZURE POSTGRESQL MIGRATION');
  console.log('User Preferences & GDPR Tables');
  console.log('='.repeat(80));

  console.log('\nConnecting to Azure PostgreSQL...');
  console.log(`Host: ${azureConfig.host}`);
  console.log(`Database: ${azureConfig.database}`);
  console.log(`User: ${azureConfig.user}`);

  const client = new Client(azureConfig);

  try {
    await client.connect();
    console.log('✓ Connected to Azure PostgreSQL\n');

    // Read migration file
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'database/migrations/add_user_preferences_and_gdpr_tables.sql'),
      'utf8'
    );

    console.log('Executing migration...\n');
    await client.query(migrationSQL);
    console.log('✓ Migration executed successfully');

    // Verify tables
    console.log('\nVerifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('user_preferences', 'data_export_requests')
      ORDER BY table_name
    `);

    console.log('\nTables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Verify indexes
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('user_preferences', 'data_export_requests')
      ORDER BY indexname
    `);

    console.log('\nIndexes created:');
    indexesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.indexname}`);
    });

    // Check table structures
    console.log('\nTable structures:');
    
    const userPrefsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_preferences'
      ORDER BY ordinal_position
    `);
    
    console.log('\nuser_preferences columns:');
    userPrefsColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    const exportRequestsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'data_export_requests'
      ORDER BY ordinal_position
    `);
    
    console.log('\ndata_export_requests columns:');
    exportRequestsColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✓ AZURE MIGRATION COMPLETE');
    console.log('='.repeat(80));
    console.log('\nThe following endpoints are now available in production:');
    console.log('  - GET/PUT /api/user/preferences');
    console.log('  - GET/PUT /api/user/preferences/email');
    console.log('  - POST /api/gdpr/export');
    console.log('  - POST /api/gdpr/delete-account');
    console.log('  - GET /api/gdpr/exports');
    console.log('\nDeploy your backend code to Azure to activate these endpoints.');

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

    if (error.code === 'ENOTFOUND') {
      console.error('\nTroubleshooting:');
      console.error('  - Check that the Azure PostgreSQL server hostname is correct');
      console.error('  - Verify your internet connection');
    } else if (error.code === '28P01') {
      console.error('\nTroubleshooting:');
      console.error('  - Check that PG_USER and PG_PASSWORD are correct in .env');
      console.error('  - Verify the user has access to the database');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nTroubleshooting:');
      console.error('  - Check Azure PostgreSQL firewall rules');
      console.error('  - Ensure your IP address is allowed');
    }

    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migration
runAzureMigration();
