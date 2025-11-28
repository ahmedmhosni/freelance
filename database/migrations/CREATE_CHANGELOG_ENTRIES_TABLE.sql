-- Create changelog_entries table for git commit tracking and manual entries
CREATE TABLE IF NOT EXISTS changelog_entries (
  id SERIAL PRIMARY KEY,
  commit_hash VARCHAR(100) UNIQUE,
  version VARCHAR(50),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'feature', 'improvement', 'fix', 'design', 'security'
  is_visible BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  commit_date DATE,
  edited_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_changelog_entries_visible ON changelog_entries(is_visible, commit_date DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_entries_category ON changelog_entries(category);
CREATE INDEX IF NOT EXISTS idx_changelog_entries_version ON changelog_entries(version);
CREATE INDEX IF NOT EXISTS idx_changelog_entries_commit_hash ON changelog_entries(commit_hash);
CREATE INDEX IF NOT EXISTS idx_changelog_entries_featured ON changelog_entries(is_featured, commit_date DESC);
