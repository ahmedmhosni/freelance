// Run Git Commits Tracking migration
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
    console.log('🚀 Running Git Commits Tracking Migration');
    console.log('📍 Database:', process.env.PG_DATABASE || 'roastify_local\n');

    const sql = fs.readFileSync(
      path.join(
        __dirname,
        '../database/migrations/ADD_GIT_COMMITS_TRACKING.sql'
      ),
      'utf8'
    );

    await pool.query(sql);

    console.log('\n✅ SUCCESS! Git commits tracking enabled!');
    console.log('📊 Tables created:');
    console.log('   - git_commits: Track all git commits');
    console.log('   - git_sync_status: Track last synced commit');
    console.log('\n💡 How it works:');
    console.log('   - System detects new git commits');
    console.log('   - Shows them in admin dashboard');
    console.log('   - Admin reviews and creates versions');
    console.log('   - Commits marked as processed');
    console.log('\n🎉 Ready to track commits!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

console.log('========================================');
console.log('   Git Commits Tracking Migration');
console.log('========================================\n');

runMigration();
