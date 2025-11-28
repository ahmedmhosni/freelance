// Run GDPR features migration on Azure PostgreSQL
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({
    host: 'roastifydbpost.postgres.database.azure.com',
    port: 5432,
    database: 'roastifydb',
    user: 'adminuser',
    password: 'AHmed#123456',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Running GDPR Features Migration');
    console.log('📍 Database: roastifydb');
    console.log('📍 Host: roastifydbpost.postgres.database.azure.com\n');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/ADD_GDPR_FEATURES.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('\n✅ SUCCESS! GDPR features added to Azure!');
    console.log('📊 Added:');
    console.log('   - email_preferences column to users table');
    console.log('   - deleted_at column to users table (soft delete)');
    console.log('   - deletion_reason column to users table');
    console.log('   - data_export_requests table');
    console.log('   - Indexes for performance');
    console.log('   - Cleanup function for expired exports');
    console.log('\n🎉 GDPR compliance features are now LIVE!');
    console.log('✅ Email preferences management');
    console.log('✅ Data export (resource-friendly)');
    console.log('✅ Account deletion (soft delete)');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running migration:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Features already exist! Migration not needed.');
      console.log('🎉 GDPR features are already live on production!');
      await pool.end();
      process.exit(0);
    } else {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your .env.production file');
      console.error('   - Verify database credentials');
      console.error('   - Make sure Azure PostgreSQL firewall allows your IP');
      await pool.end();
      process.exit(1);
    }
  }
}

console.log('========================================');
console.log('   GDPR Features Migration Tool');
console.log('========================================\n');

runMigration();
