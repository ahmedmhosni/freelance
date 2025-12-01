// Run GDPR features migration on local PostgreSQL
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'roastify_local',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    ssl: false,
  });

  try {
    console.log('🚀 Running GDPR Features Migration (Local)');
    console.log('📍 Database:', process.env.PG_DATABASE || 'roastify_local');
    console.log('📍 Host:', process.env.PG_HOST || 'localhost\n');

    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/ADD_GDPR_FEATURES.sql'),
      'utf8'
    );

    await pool.query(sql);

    console.log('\n✅ SUCCESS! GDPR features added to local database!');
    console.log('📊 Added:');
    console.log('   - email_preferences column to users table');
    console.log('   - deleted_at column to users table (soft delete)');
    console.log('   - deletion_reason column to users table');
    console.log('   - data_export_requests table');
    console.log('   - Indexes for performance');
    console.log('   - Cleanup function for expired exports');
    console.log('\n🎉 GDPR compliance features are now available locally!');
    console.log('✅ Email preferences management');
    console.log('✅ Data export (resource-friendly)');
    console.log('✅ Account deletion (soft delete)');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running migration:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n✅ Features already exist! Migration not needed.');
      console.log('🎉 GDPR features are already available locally!');
      await pool.end();
      process.exit(0);
    } else {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your .env file');
      console.error('   - Verify database credentials');
      console.error('   - Make sure PostgreSQL is running');
      console.error('\nFull error:', error);
      await pool.end();
      process.exit(1);
    }
  }
}

console.log('========================================');
console.log('   GDPR Features Migration Tool (Local)');
console.log('========================================\n');

runMigration();
