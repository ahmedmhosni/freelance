// Run Simple Changelog migration
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
    console.log('🚀 Running Simple Changelog Migration');
    console.log('📍 Database:', process.env.PG_DATABASE || 'roastify_local\n');
    
    // Drop old table if exists
    await pool.query('DROP TABLE IF EXISTS changelog_entries CASCADE');
    console.log('✅ Cleaned up old changelog_entries table');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/CREATE_SIMPLE_CHANGELOG.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('\n✅ SUCCESS! Simple changelog table created!');
    console.log('📊 Table: changelog');
    console.log('   - version (e.g., "1.0.0", "1.1.0")');
    console.log('   - title');
    console.log('   - description');
    console.log('   - category (feature/improvement/fix/design/security)');
    console.log('   - is_published');
    console.log('   - release_date');
    console.log('\n🎉 You can now manually add version entries!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

console.log('========================================');
console.log('   Simple Changelog Migration');
console.log('========================================\n');

runMigration();
