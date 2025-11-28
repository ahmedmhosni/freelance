-- Add is_used and used_at columns to version_names table
ALTER TABLE version_names 
ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_version_names_used ON version_names(is_used, name_type);

-- Mark names as used if they're already assigned to versions
UPDATE version_names vn
SET is_used = TRUE, used_at = CURRENT_TIMESTAMP
WHERE EXISTS (
  SELECT 1 FROM versions v 
  WHERE v.version_name = vn.name 
  AND v.is_major_release = (vn.name_type = 'major')
);
