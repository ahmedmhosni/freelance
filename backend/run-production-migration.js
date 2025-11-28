// Run feedback table migration on Azure PostgreSQL PRODUCTION
// Usage: node run-production-migration.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load production environment variables
require('dotenv').config({ path: '.env.production' });

async function runMigration() {
  const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 Azure PostgreSQL PRODUCTION Migration');
    console.log('📦 Creating feedback table...\n');
    console.log('🔄 Connecting to Azure PostgreSQL...');
    console.log(`📍 Host: ${process.env.PG_HOST}`);
    console.log(`📍 Database: ${process.env.PG_DATABASE}`);
    console.log(`📍 User: ${process.env.PG_USER}\n`);
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/CREATE_FEEDBACK_TABLE.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('✅ SUCCESS! Feedback table created on Azure Production!');
    console.log('\n📊 Table Details:');
    console.log('   • Table: feedback');
    console.log('   • Columns: id, user_id, type, title, description, screenshot_url, status, admin_notes, created_at, updated_at');
    console.log('   • Indexes: user_id, type, status, created_at');
    console.log('   • Trigger: auto-update timestamps');
    console.log('\n🎉 Feedback system is now LIVE on production!');
    console.log('💬 Users can now submit feedback, bugs, and feature requests.');
    console.log('📧 You\'ll receive notifications at support@roastify.com');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running migration:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Table already exists! Migration not needed.');
      console.log('🎉 Feedback system is already live on production!');
      await pool.end();
      process.exit(0);
    } else {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check .env.production file has correct Azure credentials');
      console.error('   - Verify PG_HOST, PG_DATABASE, PG_USER, PG_PASSWORD');
      console.error('   - Make sure Azure PostgreSQL firewall allows your IP');
      console.error('   - Check if SSL is required (PG_SSL=true)');
      await pool.end();
      process.exit(1);
    }
  }
}

runMigration();
