-- ============================================
-- APPLY THIS MIGRATION TO AZURE SQL DATABASE
-- ============================================
-- Run this in Azure Portal > SQL Database > Query Editor
-- Database: roastifydbazure
-- Server: roastify-db-server.database.windows.net
-- ============================================

-- STEP 1: Check if profile fields already exist
-- (Run this first to see if migration is needed)
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  CHARACTER_MAXIMUM_LENGTH,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME IN (
  'username', 'job_title', 'bio', 'profile_picture', 'location', 
  'website', 'linkedin', 'behance', 'instagram', 'facebook', 
  'twitter', 'github', 'dribbble', 'portfolio', 'profile_visibility'
)
ORDER BY COLUMN_NAME;

-- If the above query returns 0 rows, proceed with STEP 2
-- If it returns 15 rows, migration is already applied - SKIP STEP 2

-- ============================================
-- STEP 2: Apply Migration (only if needed)
-- ============================================

-- Add profile fields to users table
ALTER TABLE users ADD username NVARCHAR(100) NULL;
ALTER TABLE users ADD job_title NVARCHAR(255) NULL;
ALTER TABLE users ADD bio NVARCHAR(MAX) NULL;
ALTER TABLE users ADD profile_picture NVARCHAR(500) NULL;
ALTER TABLE users ADD location NVARCHAR(255) NULL;
ALTER TABLE users ADD website NVARCHAR(500) NULL;
ALTER TABLE users ADD linkedin NVARCHAR(500) NULL;
ALTER TABLE users ADD behance NVARCHAR(500) NULL;
ALTER TABLE users ADD instagram NVARCHAR(500) NULL;
ALTER TABLE users ADD facebook NVARCHAR(500) NULL;
ALTER TABLE users ADD twitter NVARCHAR(500) NULL;
ALTER TABLE users ADD github NVARCHAR(500) NULL;
ALTER TABLE users ADD dribbble NVARCHAR(500) NULL;
ALTER TABLE users ADD portfolio NVARCHAR(500) NULL;
ALTER TABLE users ADD profile_visibility NVARCHAR(50) DEFAULT 'public';

-- Create unique index for username (allows multiple NULLs)
CREATE UNIQUE NONCLUSTERED INDEX idx_users_username_unique 
ON users(username) 
WHERE username IS NOT NULL;

-- ============================================
-- STEP 3: Verify Migration
-- ============================================

-- Check total columns in users table
SELECT COUNT(*) as total_columns
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users';
-- Expected: 22 columns (7 original + 15 profile fields)

-- View all columns
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  CHARACTER_MAXIMUM_LENGTH,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

-- Check if unique index was created
SELECT 
  i.name AS index_name,
  i.type_desc AS index_type,
  i.is_unique,
  c.name AS column_name
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('users')
AND i.name = 'idx_users_username_unique';

-- ============================================
-- STEP 4: Test Profile Fields (Optional)
-- ============================================

-- View current user data
SELECT 
  id,
  name,
  email,
  username,
  job_title,
  profile_picture,
  profile_visibility,
  created_at
FROM users;

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================
-- Next steps:
-- 1. Wait for GitHub Actions to deploy frontend/backend
-- 2. Test the avatar picker on the Profile page
-- 3. Verify avatars are saved correctly
-- ============================================
