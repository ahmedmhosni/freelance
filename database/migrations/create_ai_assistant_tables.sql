-- AI Assistant Tables Migration
-- Creates tables for AI Assistant feature with Google Gemini integration

-- AI Settings Table
CREATE TABLE IF NOT EXISTS ai_settings (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    provider VARCHAR(50) DEFAULT 'gemini',
    api_key_encrypted TEXT,
    daily_limit INTEGER DEFAULT 50,
    hourly_limit INTEGER DEFAULT 10,
    max_message_length INTEGER DEFAULT 500,
    system_prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Usage Tracking Table
CREATE TABLE IF NOT EXISTS ai_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    daily_count INTEGER DEFAULT 0,
    hourly_count INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    daily_reset_at TIMESTAMP,
    hourly_reset_at TIMESTAMP,
    last_request_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB,
    tokens INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Analytics Table
CREATE TABLE IF NOT EXISTS ai_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_requests INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_date ON ai_analytics(date);

-- Insert default AI settings
INSERT INTO ai_settings (enabled, provider, daily_limit, hourly_limit, max_message_length, system_prompt)
VALUES (
    FALSE,
    'gemini',
    50,
    10,
    500,
    'You are a helpful AI assistant for a freelance management application. Help users with tasks, projects, invoices, time tracking, and general questions about using the application. Be concise and friendly.'
)
ON CONFLICT DO NOTHING;

-- Create function to reset usage counters
CREATE OR REPLACE FUNCTION reset_ai_usage_counters()
RETURNS void AS $$
BEGIN
    -- Reset daily counters
    UPDATE ai_usage
    SET daily_count = 0, daily_reset_at = CURRENT_TIMESTAMP + INTERVAL '1 day'
    WHERE daily_reset_at < CURRENT_TIMESTAMP;
    
    -- Reset hourly counters
    UPDATE ai_usage
    SET hourly_count = 0, hourly_reset_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'
    WHERE hourly_reset_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE ai_settings IS 'Global AI Assistant configuration and settings';
COMMENT ON TABLE ai_usage IS 'Per-user AI usage tracking and rate limiting';
COMMENT ON TABLE ai_conversations IS 'AI conversation history for analytics and debugging';
COMMENT ON TABLE ai_analytics IS 'Daily AI usage analytics and statistics';
