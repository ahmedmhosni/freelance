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
