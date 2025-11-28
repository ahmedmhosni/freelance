// Add version names and major release flag
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
    console.log('🚀 Adding version names and major release flag');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/ADD_VERSION_NAMES.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('✅ Version names and major release flag added!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
