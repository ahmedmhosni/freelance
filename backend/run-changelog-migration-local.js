// Run Changelog Entries migration on local PostgreSQL
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
    ssl: false
  });

  try {
    console.log('🚀 Running Changelog Entries Migration (Local)');
    console.log('📍 Database:', process.env.PG_DATABASE || 'roastify_local');
    console.log('📍 Host:', process.env.PG_HOST || 'localhost\n');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/CREATE_CHANGELOG_ENTRIES_TABLE.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('\n✅ SUCCESS! Changelog entries table created!');
    console.log('📊 Added:');
    console.log('   - changelog_entries table');
    console.log('   - Indexes for performance');
    console.log('   - Support for git commit tracking');
    console.log('   - Support for manual changelog entries');
    console.log('\n🎉 Versioning system is now available locally!');
    console.log('✅ Automatic git commit syncing');
    console.log('✅ Manual changelog management');
    console.log('✅ Public changelog page');
    console.log('✅ Admin changelog editor');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running migration:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Table already exists! Migration not needed.');
      console.log('🎉 Changelog system is already available locally!');
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
console.log('   Changelog Migration Tool (Local)');
console.log('========================================\n');

runMigration();
