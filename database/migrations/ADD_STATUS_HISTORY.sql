-- Create status_history table to track system uptime
CREATE TABLE IF NOT EXISTS status_history (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  response_time INTEGER,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT,
  metadata JSONB
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_status_history_service ON status_history(service_name);
CREATE INDEX IF NOT EXISTS idx_status_history_checked_at ON status_history(checked_at);
CREATE INDEX IF NOT EXISTS idx_status_history_service_time ON status_history(service_name, checked_at DESC);

-- Create function to clean old history (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_status_history()
RETURNS void AS $$
BEGIN
  DELETE FROM status_history 
  WHERE checked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-status-history', '0 2 * * *', 'SELECT cleanup_old_status_history()');
