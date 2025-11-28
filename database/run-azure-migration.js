require('dotenv').config({ path: '../backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use Azure PostgreSQL connection
const pool = new Pool({
  host: process.env.AZURE_PG_HOST || process.env.PG_HOST,
  port: process.env.AZURE_PG_PORT || process.env.PG_PORT || 5432,
  database: process.env.AZURE_PG_DATABASE || process.env.PG_DATABASE,
  user: process.env.AZURE_PG_USER || process.env.PG_USER,
  password: process.env.AZURE_PG_PASSWORD || process.env.PG_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    console.log('🔄 Running feedback table migration on Azure PostgreSQL...');
    console.log(`📍 Database: ${process.env.AZURE_PG_DATABASE || process.env.PG_DATABASE}`);
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'CREATE_FEEDBACK_TABLE.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('✅ Feedback table created successfully on Azure!');
    console.log('📊 Table: feedback');
    console.log('📋 Columns: id, user_id, type, title, description, screenshot_url, status, admin_notes, created_at, updated_at');
    console.log('🎯 Indexes created for performance');
    console.log('⚡ Trigger added for auto-update timestamps');
    console.log('\n🎉 Migration complete! Feedback system is now live on production.');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.error('\n💡 Make sure your Azure PostgreSQL credentials are in backend/.env');
    await pool.end();
    process.exit(1);
  }
}

runMigration();
