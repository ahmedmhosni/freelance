-- ============================================
-- ADD MAINTENANCE_CONTENT TABLE TO POSTGRESQL
-- ============================================
-- This migration adds the maintenance_content table
-- Run this on Azure PostgreSQL database

-- Drop old maintenance table if it exists
DROP TABLE IF EXISTS maintenance CASCADE;

-- Create maintenance_content table
CREATE TABLE IF NOT EXISTS maintenance_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL DEFAULT 'Brilliant ideas take time to be roasted',
    subtitle VARCHAR(500) NOT NULL DEFAULT 'Roastify is coming soon',
    message TEXT NOT NULL DEFAULT 'We are crafting something extraordinary. Great things take time, and we are roasting the perfect experience for you.',
    launch_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default maintenance content
INSERT INTO maintenance_content (title, subtitle, message, is_active, updated_at)
VALUES (
    'Brilliant ideas take time to be roasted',
    'Roastify is coming soon',
    'We are crafting something extraordinary. Great things take time, and we are roasting the perfect experience for you.',
    FALSE,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_maintenance_content_updated_at
    BEFORE UPDATE ON maintenance_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'maintenance_content';

-- Show table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'maintenance_content'
ORDER BY ordinal_position;
