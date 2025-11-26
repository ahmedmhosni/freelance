-- ============================================
-- QUICK FIX: ADD MAINTENANCE_CONTENT TABLE
-- ============================================
-- Run this directly in Azure Portal Query Editor
-- https://portal.azure.com -> Your PostgreSQL Database -> Query editor

-- Step 1: Drop old maintenance table
DROP TABLE IF EXISTS maintenance CASCADE;

-- Step 2: Create maintenance_content table
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

-- Step 3: Insert default content
INSERT INTO maintenance_content (title, subtitle, message, is_active, updated_at)
VALUES (
    'Brilliant ideas take time to be roasted',
    'Roastify is coming soon',
    'We are crafting something extraordinary. Great things take time, and we are roasting the perfect experience for you.',
    FALSE,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Step 4: Create trigger
CREATE TRIGGER update_maintenance_content_updated_at
    BEFORE UPDATE ON maintenance_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Verify
SELECT * FROM maintenance_content;
