const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env.local' });

async function checkAISettings() {
    console.log('🔍 CHECKING AI SETTINGS IN DATABASE');
    console.log('===================================');
    
    const pool = new Pool({
        host: process.env.PG_HOST || 'localhost',
        port: process.env.PG_PORT || 5432,
        database: process.env.PG_DATABASE || 'roastify',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres123',
        ssl: false
    });

    try {
        const client = await pool.connect();
        
        // Check ai_settings
        console.log('🔄 Checking ai_settings table...');
        const result = await client.query('SELECT * FROM ai_settings WHERE id = 1');
        
        if (result.rows.length > 0) {
            console.log('✅ AI Settings found:');
            console.table(result.rows[0]);
        } else {
            console.log('❌ No AI settings found in database');
        }
        
        // Check environment variables
        console.log('\n🔄 Checking environment variables...');
        console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
        console.log('AI_PROVIDER:', process.env.AI_PROVIDER || 'NOT SET');
        
        client.release();
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAISettings().catch(console.error);