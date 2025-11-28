const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from your .env
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'roastify_local',
  user: 'postgres',
  password: 'postgres123',
  ssl: false
});

async function runMigration() {
  try {
    console.log('🔄 Running feedback table migration...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'CREATE_FEEDBACK_TABLE.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('✅ Feedback table created successfully!');
    console.log('📊 Table: feedback');
    console.log('📋 Columns: id, user_id, type, title, description, screenshot_url, status, admin_notes, created_at, updated_at');
    console.log('🎯 Indexes created for performance');
    console.log('⚡ Trigger added for auto-update timestamps');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
