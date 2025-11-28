-- Create changelog table for manual changelog entries
CREATE TABLE IF NOT EXISTS changelog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'feature', 'improvement', 'fix', 'design', 'security'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT 0,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_changelog_published ON changelog(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_version ON changelog(version);
CREATE INDEX IF NOT EXISTS idx_changelog_type ON changelog(type);
