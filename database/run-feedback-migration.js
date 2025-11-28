require('dotenv').config({ path: '../backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
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
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
