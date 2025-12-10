const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env.local' });

async function checkAITables() {
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
        
        // Check ai_conversations table structure
        console.log('🔍 Checking ai_conversations table structure:');
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'ai_conversations'
            ORDER BY ordinal_position
        `);
        
        if (result.rows.length > 0) {
            console.table(result.rows);
        } else {
            console.log('❌ ai_conversations table does not exist');
        }
        
        client.release();
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAITables().catch(console.error);