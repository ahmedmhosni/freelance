// Run Changelog System migration
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
    console.log('🚀 Running Changelog System Migration');
    console.log('📍 Database:', process.env.PG_DATABASE || 'roastify_local\n');

    // Drop old tables if exist
    await pool.query('DROP TABLE IF EXISTS changelog CASCADE');
    await pool.query('DROP TABLE IF EXISTS changelog_entries CASCADE');
    console.log('✅ Cleaned up old tables');

    const sql = fs.readFileSync(
      path.join(
        __dirname,
        '../database/migrations/CREATE_CHANGELOG_SYSTEM.sql'
      ),
      'utf8'
    );

    await pool.query(sql);

    console.log('\n✅ SUCCESS! Changelog system created!');
    console.log('📊 Tables:');
    console.log('   1. versions - Store version releases (1.0.0, 1.1.0, etc.)');
    console.log('   2. changelog_items - Multiple items per version');
    console.log('\n💡 How it works:');
    console.log('   - Create a version (e.g., 1.0.0)');
    console.log('   - Add multiple items to that version:');
    console.log('     • Feature: New user dashboard');
    console.log('     • Fix: Login bug resolved');
    console.log('     • Improvement: Faster loading');
    console.log('   - Publish when ready!');
    console.log('\n🎉 Ready to use!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

console.log('========================================');
console.log('   Changelog System Migration');
console.log('========================================\n');

runMigration();
