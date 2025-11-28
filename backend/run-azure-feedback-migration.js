// Run feedback table migration on Azure PostgreSQL
// Usage: node run-azure-feedback-migration.js

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
    console.log('🔄 Running feedback table migration on Azure PostgreSQL...');
    console.log(`📍 Database: ${process.env.PG_DATABASE}`);
    console.log(`📍 Host: ${process.env.PG_HOST}`);
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/CREATE_FEEDBACK_TABLE.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('\n✅ SUCCESS! Feedback table created on Azure!');
    console.log('📊 Table: feedback');
    console.log('📋 Columns: id, user_id, type, title, description, screenshot_url, status, admin_notes, created_at, updated_at');
    console.log('🎯 Indexes: user_id, type, status, created_at');
    console.log('⚡ Trigger: auto-update timestamps');
    console.log('\n🎉 Feedback system is now LIVE on production!');
    console.log('💬 Users can now submit feedback, bugs, and feature requests.');
    
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
      console.error('   - Check your .env file has correct Azure credentials');
      console.error('   - Verify PG_HOST, PG_DATABASE, PG_USER, PG_PASSWORD');
      console.error('   - Make sure Azure PostgreSQL firewall allows your IP');
      await pool.end();
      process.exit(1);
    }
  }
}

console.log('🚀 Azure PostgreSQL Migration Tool');
console.log('📦 Creating feedback table for production...\n');

runMigration();
