-- AI Assistant Tables Migration
-- Creates tables for AI assistant settings, usage tracking, and conversation history

-- AI Assistant Settings (Admin Control)
CREATE TABLE IF NOT EXISTS ai_settings (
  id SERIAL PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  provider VARCHAR(50) DEFAULT 'gemini',
  max_requests_per_user_per_day INT DEFAULT 50,
  max_requests_per_user_per_hour INT DEFAULT 10,
  max_message_length INT DEFAULT 500,
  system_prompt TEXT DEFAULT 'You are a helpful assistant for a freelancer management app. Help users navigate features, answer questions about invoicing, time tracking, clients, projects, and tasks. Be concise and friendly.',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO ai_settings (enabled, provider, max_requests_per_user_per_day, max_requests_per_user_per_hour)
VALUES (false, 'gemini', 50, 10)
ON CONFLICT DO NOTHING;

-- AI Usage Tracking (Per User)
CREATE TABLE IF NOT EXISTS ai_usage (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_count INT DEFAULT 0,
  last_request_at TIMESTAMP,
  daily_count INT DEFAULT 0,
  daily_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hourly_count INT DEFAULT 0,
  hourly_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_tokens_used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- AI Conversation History (Optional - for context)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  tokens_used INT DEFAULT 0,
  response_time_ms INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Analytics (Admin Dashboard)
CREATE TABLE IF NOT EXISTS ai_analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_requests INT DEFAULT 0,
  total_users INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  avg_response_time_ms INT DEFAULT 0,
  error_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_date ON ai_analytics(date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_usage_updated_at
  BEFORE UPDATE ON ai_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_updated_at();
