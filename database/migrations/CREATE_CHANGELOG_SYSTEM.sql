-- Versions table - one entry per version release
CREATE TABLE IF NOT EXISTS versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL UNIQUE,
  release_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Changelog items table - multiple items per version
CREATE TABLE IF NOT EXISTS changelog_items (
  id SERIAL PRIMARY KEY,
  version_id INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'feature', 'improvement', 'fix', 'design', 'security'
  title VARCHAR(500) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_versions_published ON versions(is_published, release_date DESC);
CREATE INDEX IF NOT EXISTS idx_versions_version ON versions(version);
CREATE INDEX IF NOT EXISTS idx_changelog_items_version ON changelog_items(version_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_changelog_items_category ON changelog_items(category);
