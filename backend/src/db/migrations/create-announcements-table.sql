-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  media_url TEXT,
  media_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for featured announcements
CREATE INDEX IF NOT EXISTS idx_announcements_featured ON announcements(is_featured, created_at DESC);

-- Create index for created_at for sorting
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
