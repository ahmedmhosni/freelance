const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env.local' });

async function recreateAITables() {
    console.log('🔧 Recreating AI Module Database Tables');
    console.log('=======================================');
    
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
        console.log('✅ Connected to database');

        // Drop existing AI tables if they exist
        console.log('🔄 Dropping existing AI tables...');
        await client.query('DROP TABLE IF EXISTS ai_conversations CASCADE');
        await client.query('DROP TABLE IF EXISTS ai_usage CASCADE');
        await client.query('DROP TABLE IF EXISTS ai_analytics CASCADE');
        await client.query('DROP TABLE IF EXISTS ai_settings CASCADE');
        console.log('✅ Existing AI tables dropped');

        // Create ai_settings table
        console.log('🔄 Creating ai_settings table...');
        await client.query(`
            CREATE TABLE ai_settings (
                id INTEGER PRIMARY KEY DEFAULT 1,
                enabled BOOLEAN DEFAULT false,
                provider VARCHAR(50) DEFAULT 'gemini',
                model VARCHAR(100) DEFAULT 'gemini-pro',
                max_tokens INTEGER DEFAULT 1000,
                temperature DECIMAL(3,2) DEFAULT 0.7,
                system_prompt TEXT DEFAULT 'You are a helpful AI assistant for a freelance management platform. Help users with their questions about projects, clients, invoices, and time tracking.',
                rate_limit_per_user INTEGER DEFAULT 10,
                rate_limit_window INTEGER DEFAULT 3600,
                welcome_message TEXT DEFAULT 'Hello! I''m your AI assistant. How can I help you today?',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT single_settings CHECK (id = 1)
            )
        `);
        console.log('✅ ai_settings table created');

        // Create ai_conversations table
        console.log('🔄 Creating ai_conversations table...');
        await client.query(`
            CREATE TABLE ai_conversations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                conversation_id UUID DEFAULT gen_random_uuid(),
                role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                tokens_used INTEGER DEFAULT 0,
                response_time INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ ai_conversations table created');

        // Create ai_usage table
        console.log('🔄 Creating ai_usage table...');
        await client.query(`
            CREATE TABLE ai_usage (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                daily_requests INTEGER DEFAULT 0,
                monthly_requests INTEGER DEFAULT 0,
                last_request_date DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id)
            )
        `);
        console.log('✅ ai_usage table created');

        // Create ai_analytics table
        console.log('🔄 Creating ai_analytics table...');
        await client.query(`
            CREATE TABLE ai_analytics (
                id SERIAL PRIMARY KEY,
                date DATE UNIQUE DEFAULT CURRENT_DATE,
                total_requests INTEGER DEFAULT 0,
                unique_users INTEGER DEFAULT 0,
                avg_response_time INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ ai_analytics table created');

        // Create indexes for better performance
        console.log('🔄 Creating database indexes...');
        await client.query('CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id)');
        await client.query('CREATE INDEX idx_ai_conversations_conversation_id ON ai_conversations(conversation_id)');
        await client.query('CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at)');
        await client.query('CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id)');
        await client.query('CREATE INDEX idx_ai_analytics_date ON ai_analytics(date)');
        console.log('✅ Database indexes created');

        // Insert default settings
        console.log('🔄 Inserting default AI settings...');
        await client.query(`
            INSERT INTO ai_settings (
                id, enabled, provider, model, max_tokens, temperature, 
                system_prompt, rate_limit_per_user, rate_limit_window, welcome_message
            )
            VALUES (
                1, true, 'gemini', 'gemini-pro', 1000, 0.7, 
                'You are a helpful AI assistant for a freelance management platform. Help users with their questions about projects, clients, invoices, and time tracking.',
                10, 3600, 'Hello! I''m your AI assistant. How can I help you today?'
            )
        `);
        console.log('✅ Default AI settings inserted');

        client.release();
        await pool.end();

        console.log('\n🎉 AI Module Database Recreation Complete!');
        console.log('==========================================');
        console.log('✅ ai_settings table ready');
        console.log('✅ ai_conversations table ready');
        console.log('✅ ai_usage table ready');
        console.log('✅ ai_analytics table ready');
        console.log('✅ Database indexes created');
        console.log('✅ Default settings configured');
        console.log('\n🎯 AI Module is now ready!');
        console.log('- Modular architecture implemented');
        console.log('- Database tables created');
        console.log('- Default settings configured');
        console.log('- Admin panel integration ready');

    } catch (error) {
        console.error('❌ Error recreating AI tables:', error);
        process.exit(1);
    }
}

recreateAITables().catch(console.error);