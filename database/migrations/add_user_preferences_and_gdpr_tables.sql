-- ============================================
-- User Preferences & GDPR Tables Migration
-- ============================================

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_marketing BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  email_updates BOOLEAN DEFAULT true,
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add comment
COMMENT ON TABLE user_preferences IS 'Stores user preferences for email notifications, theme, language, etc.';

-- Create data_export_requests table for GDPR compliance
CREATE TABLE IF NOT EXISTS data_export_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_url TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Add comment
COMMENT ON TABLE data_export_requests IS 'Tracks GDPR data export requests from users';

-- Create indexes (after table is created)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_data_export_requests_user_id') THEN
    CREATE INDEX idx_data_export_requests_user_id ON data_export_requests(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_data_export_requests_status') THEN
    CREATE INDEX idx_data_export_requests_status ON data_export_requests(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_data_export_requests_created_at') THEN
    CREATE INDEX idx_data_export_requests_created_at ON data_export_requests(created_at);
  END IF;
END $$;
