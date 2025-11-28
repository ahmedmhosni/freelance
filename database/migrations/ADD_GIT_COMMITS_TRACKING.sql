-- Add table to track git commits for changelog
CREATE TABLE IF NOT EXISTS git_commits (
  id SERIAL PRIMARY KEY,
  commit_hash VARCHAR(100) UNIQUE NOT NULL,
  commit_message TEXT NOT NULL,
  commit_date TIMESTAMP NOT NULL,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  is_processed BOOLEAN DEFAULT FALSE,
  version_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE SET NULL
);

-- Add last_synced_commit to track where we are
CREATE TABLE IF NOT EXISTS git_sync_status (
  id SERIAL PRIMARY KEY,
  last_synced_commit VARCHAR(100),
  last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial sync status
INSERT INTO git_sync_status (id, last_synced_commit) 
VALUES (1, NULL) 
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_git_commits_processed ON git_commits(is_processed, commit_date DESC);
CREATE INDEX IF NOT EXISTS idx_git_commits_version ON git_commits(version_id);
CREATE INDEX IF NOT EXISTS idx_git_commits_hash ON git_commits(commit_hash);
