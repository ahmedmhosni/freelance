const { Pool } = require('pg');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function enableAI() {
  console.log('\n🤖 Enabling AI Assistant in Production Database...\n');
  
  try {
    // Check current AI settings
    console.log('📊 Checking current AI settings...');
    const current = await pool.query('SELECT * FROM ai_settings WHERE id = 1');
    
    if (current.rows.length === 0) {
      console.log('❌ No AI settings found. Creating default settings...');
      await pool.query(`
        INSERT INTO ai_settings (id, enabled, model, daily_limit, monthly_limit)
        VALUES (1, true, 'gemini-2.0-flash-exp', 100, 1000)
      `);
      console.log('✅ AI settings created and enabled');
    } else {
      console.log('\nCurrent settings:');
      console.log('  Enabled:', current.rows[0].enabled);
      console.log('  Model:', current.rows[0].model);
      console.log('  Daily Limit:', current.rows[0].daily_limit);
      console.log('  Monthly Limit:', current.rows[0].monthly_limit);
      
      // Update to enable AI
      console.log('\n🔄 Updating AI settings...');
      await pool.query(`
        UPDATE ai_settings 
        SET enabled = true, 
            model = 'gemini-2.0-flash-exp',
            daily_limit = 100,
            monthly_limit = 1000,
            updated_at = NOW()
        WHERE id = 1
      `);
      console.log('✅ AI settings updated');
    }
    
    // Verify the update
    console.log('\n✓ Verifying changes...');
    const updated = await pool.query('SELECT * FROM ai_settings WHERE id = 1');
    console.log('\nNew settings:');
    console.log('  Enabled:', updated.rows[0].enabled);
    console.log('  Model:', updated.rows[0].model);
    console.log('  Daily Limit:', updated.rows[0].daily_limit);
    console.log('  Monthly Limit:', updated.rows[0].monthly_limit);
    console.log('  Updated At:', updated.rows[0].updated_at);
    
    console.log('\n✅ AI Assistant is now ENABLED in production!\n');
    console.log('Next steps:');
    console.log('1. Add GEMINI_API_KEY to Azure environment variables');
    console.log('   - Go to: Azure Portal → App Services → roastify-webapp-api');
    console.log('   - Configuration → Application settings → + New application setting');
    console.log('   - Name: GEMINI_API_KEY');
    console.log('   - Value: AIzaSyACrmn14lPWw2D5-vPiJmZhiaqqi1MJaW8');
    console.log('   - Click Save and wait for restart (30-60 seconds)');
    console.log('\n2. Test AI endpoints after adding the API key\n');
    
  } catch (error) {
    console.error('\n❌ Error enabling AI:', error.message);
    console.error('\nDetails:', error);
  } finally {
    await pool.end();
  }
}

enableAI();
