-- Simple changelog table for manual version entries
CREATE TABLE IF NOT EXISTS changelog (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'feature', 'improvement', 'fix', 'design', 'security'
  is_published BOOLEAN DEFAULT FALSE,
  release_date DATE NOT NULL,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_changelog_published ON changelog(is_published, release_date DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_version ON changelog(version);
CREATE INDEX IF NOT EXISTS idx_changelog_category ON changelog(category);
