/**
 * Migrate AI Assistant Tables to Azure Production
 * Run this when deploying AI Assistant feature to production
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const azureConfig = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: {
    rejectUnauthorized: false
  }
};

async function migrateAITables() {
  const client = new Client(azureConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to Azure PostgreSQL\n');
    
    // Read the AI migration SQL file
    const migrationPath = path.join(__dirname, 'database/migrations/create_ai_assistant_tables.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      console.log('\nPlease ensure the file exists at:');
      console.log('   database/migrations/create_ai_assistant_tables.sql');
      return;
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Running AI Assistant tables migration...\n');
    console.log('Creating tables:');
    console.log('   - ai_settings');
    console.log('   - ai_usage');
    console.log('   - ai_conversations');
    console.log('   - ai_analytics\n');
    
    // Execute the migration
    await client.query(sql);
    
    console.log('✅ AI Assistant tables created successfully!\n');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ai_settings', 'ai_usage', 'ai_conversations', 'ai_analytics')
      ORDER BY table_name
    `);
    
    console.log('✅ Verification - Tables created:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    if (result.rows.length === 4) {
      console.log('\n✅ All AI Assistant tables successfully migrated to Azure!');
      console.log('\n📋 Next steps:');
      console.log('   1. Deploy AI Assistant code to production');
      console.log('   2. Set GEMINI_API_KEY in Azure App Service configuration');
      console.log('   3. Enable AI Assistant in admin panel');
    } else {
      console.log(`\n⚠️  Warning: Expected 4 tables, found ${result.rows.length}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
  } finally {
    await client.end();
    console.log('\n✅ Connection closed');
  }
}

// Run migration
console.log('🚀 AI Assistant Tables Migration to Azure\n');
console.log('=' .repeat(60));
migrateAITables().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
