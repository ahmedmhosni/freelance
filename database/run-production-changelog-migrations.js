// Run ALL changelog migrations on production Azure PostgreSQL
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env.production') });
const { Pool } = require('pg');

async function runMigrations() {
  const pool = new Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Running Production Changelog Migrations');
    console.log('📍 Database:', process.env.PG_DATABASE);
    console.log('📍 Host:', process.env.PG_HOST);
    console.log('\n⚠️  WARNING: Running on PRODUCTION database!\n');
    
    // Migration 1: Changelog System
    console.log('1️⃣  Creating changelog system tables...');
    const sql1 = fs.readFileSync(
      path.join(__dirname, 'migrations/CREATE_CHANGELOG_SYSTEM.sql'),
      'utf8'
    );
    await pool.query(sql1);
    console.log('✅ Changelog system tables created');
    
    // Migration 2: Git Commits Tracking
    console.log('\n2️⃣  Adding git commits tracking...');
    const sql2 = fs.readFileSync(
      path.join(__dirname, 'migrations/ADD_GIT_COMMITS_TRACKING.sql'),
      'utf8'
    );
    await pool.query(sql2);
    console.log('✅ Git commits tracking enabled');
    
    console.log('\n🎉 SUCCESS! All migrations completed!');
    console.log('\n📊 Tables created:');
    console.log('   - versions: Store version releases');
    console.log('   - changelog_items: Multiple items per version');
    console.log('   - git_commits: Track git commits');
    console.log('   - git_sync_status: Track sync status');
    console.log('\n✅ Production database is ready!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    await pool.end();
    process.exit(1);
  }
}

console.log('========================================');
console.log('   Production Changelog Migrations');
console.log('========================================\n');

runMigrations();
