/**
 * Run AI Assistant Migration
 * Creates necessary database tables for AI assistant feature
 */

require('dotenv').config({ path: './backend/.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'roastify',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres'
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Running AI Assistant migration...\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'database/migrations/create_ai_assistant_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('Created tables:');
    console.log('  - ai_settings');
    console.log('  - ai_usage');
    console.log('  - ai_conversations');
    console.log('  - ai_analytics\n');
    
    // Verify tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'ai_%'
      ORDER BY table_name
    `);
    
    console.log('Verified tables:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    console.log('\n🎉 AI Assistant database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Restart your backend server');
    console.log('2. AI Assistant is disabled by default');
    console.log('3. Go to Admin Panel → AI Settings to enable it');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
