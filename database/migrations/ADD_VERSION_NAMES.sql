-- Add version name and major release flag
ALTER TABLE versions 
ADD COLUMN IF NOT EXISTS version_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_major_release BOOLEAN DEFAULT FALSE;

-- Create index for major releases
CREATE INDEX IF NOT EXISTS idx_versions_major ON versions(is_major_release, release_date DESC);
