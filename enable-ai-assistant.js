/**
 * Enable AI Assistant
 * Quick script to enable AI assistant in the database
 */

require('dotenv').config({ path: './backend/.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'roastify',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres123'
});

async function enableAI() {
  const client = await pool.connect();
  
  try {
    console.log('🤖 Enabling AI Assistant...\n');
    
    // Enable AI assistant
    const result = await client.query(`
      UPDATE ai_settings 
      SET enabled = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM ai_settings ORDER BY id DESC LIMIT 1)
      RETURNING *
    `);
    
    if (result.rows.length > 0) {
      const settings = result.rows[0];
      console.log('✅ AI Assistant ENABLED!\n');
      console.log('Current Settings:');
      console.log(`  • Status: ${settings.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
      console.log(`  • Provider: ${settings.provider}`);
      console.log(`  • Max requests per hour: ${settings.max_requests_per_user_per_hour}`);
      console.log(`  • Max requests per day: ${settings.max_requests_per_user_per_day}`);
      console.log(`  • Max message length: ${settings.max_message_length} characters`);
      console.log('\n🎉 Users can now use the AI assistant!');
      console.log('\nNext steps:');
      console.log('1. Restart your backend server (if running)');
      console.log('2. Test with: POST /api/ai/chat');
      console.log('3. Check status: GET /api/ai/status');
    } else {
      console.log('❌ No AI settings found. Run migration first.');
    }
    
  } catch (error) {
    console.error('❌ Error enabling AI:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

enableAI();
