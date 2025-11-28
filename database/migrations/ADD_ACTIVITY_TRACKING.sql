-- Add activity tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45) NULL;

-- Create activity_logs table for detailed tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON activity_logs(user_id, action);

-- Create function to get inactive users
CREATE OR REPLACE FUNCTION get_inactive_users(days_inactive INTEGER)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR,
  email VARCHAR,
  last_login_at TIMESTAMP,
  days_since_login INTEGER,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.last_login_at,
    EXTRACT(DAY FROM NOW() - COALESCE(u.last_login_at, u.created_at))::INTEGER as days_since_login,
    u.created_at
  FROM users u
  WHERE u.deleted_at IS NULL
  AND (
    u.last_login_at IS NULL 
    OR u.last_login_at < NOW() - (days_inactive || ' days')::INTERVAL
  )
  AND u.created_at < NOW() - (days_inactive || ' days')::INTERVAL
  ORDER BY COALESCE(u.last_login_at, u.created_at) ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to log activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity_at on any user table update
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update last_activity_at
DROP TRIGGER IF EXISTS update_user_activity ON users;
CREATE TRIGGER update_user_activity
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_activity();

-- Add comments
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.last_activity_at IS 'Timestamp of last activity (any action)';
COMMENT ON COLUMN users.login_count IS 'Total number of successful logins';
COMMENT ON COLUMN users.last_login_ip IS 'IP address of last login';
COMMENT ON TABLE activity_logs IS 'Detailed activity logs for audit trail';
