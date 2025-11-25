-- Add User Profile Fields Migration
-- Local Database: FreelancerDB

USE FreelancerDB;
GO

PRINT 'Adding user profile fields...';
GO

-- Add username (unique, for public profile URL)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'username')
BEGIN
    ALTER TABLE users ADD username NVARCHAR(50) NULL;
    PRINT '✓ Added username column';
END
ELSE
    PRINT '⏭ username column already exists';
GO

-- Add unique constraint on username
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_users_username' AND object_id = OBJECT_ID('users'))
BEGIN
    ALTER TABLE users ADD CONSTRAINT UQ_users_username UNIQUE (username);
    PRINT '✓ Added unique constraint on username';
END
ELSE
    PRINT '⏭ Unique constraint on username already exists';
GO

-- Add job title
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'job_title')
BEGIN
    ALTER TABLE users ADD job_title NVARCHAR(100) NULL;
    PRINT '✓ Added job_title column';
END
ELSE
    PRINT '⏭ job_title column already exists';
GO

-- Add bio
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'bio')
BEGIN
    ALTER TABLE users ADD bio NVARCHAR(500) NULL;
    PRINT '✓ Added bio column';
END
ELSE
    PRINT '⏭ bio column already exists';
GO

-- Add profile picture URL
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_picture')
BEGIN
    ALTER TABLE users ADD profile_picture NVARCHAR(500) NULL;
    PRINT '✓ Added profile_picture column';
END
ELSE
    PRINT '⏭ profile_picture column already exists';
GO

-- Add location
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'location')
BEGIN
    ALTER TABLE users ADD location NVARCHAR(100) NULL;
    PRINT '✓ Added location column';
END
ELSE
    PRINT '⏭ location column already exists';
GO

-- Add website
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'website')
BEGIN
    ALTER TABLE users ADD website NVARCHAR(255) NULL;
    PRINT '✓ Added website column';
END
ELSE
    PRINT '⏭ website column already exists';
GO

-- Add social media links
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'linkedin')
BEGIN
    ALTER TABLE users ADD linkedin NVARCHAR(255) NULL;
    PRINT '✓ Added linkedin column';
END
ELSE
    PRINT '⏭ linkedin column already exists';
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'behance')
BEGIN
    ALTER TABLE users ADD behance NVARCHAR(255) NULL;
    PRINT '✓ Added behance column';
END
ELSE
    PRINT '⏭ behance column already exists';
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'instagram')
BEGIN
    ALTER TABLE users ADD instagram NVARCHAR(255) NULL;
    PRINT '✓ Added instagram column';
END
ELSE
    PRINT '⏭ instagram column already exists';
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'facebook')
BEGIN
    ALTER TABLE users ADD facebook NVARCHAR(255) NULL;
    PRINT '✓ Added facebook column';
END
ELSE
    PRINT '⏭ facebook column already exists';
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'twitter')
BEGIN
    ALTER TABLE users ADD twitter NVARCHAR(255) NULL;
    PRINT '✓ Added twitter column';
END
ELSE
    PRINT '⏭ twitter column already exists';
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'github')
BEGIN
    ALTER TABLE users ADD github NVARCHAR(255) NULL;
    PRINT '✓ Added github column';
END
ELSE
    PRINT '⏭ github column already exists';
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'dribbble')
BEGIN
    ALTER TABLE users ADD dribbble NVARCHAR(255) NULL;
    PRINT '✓ Added dribbble column';
END
ELSE
    PRINT '⏭ dribbble column already exists';
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'portfolio')
BEGIN
    ALTER TABLE users ADD portfolio NVARCHAR(255) NULL;
    PRINT '✓ Added portfolio column';
END
ELSE
    PRINT '⏭ portfolio column already exists';
GO

-- Add profile visibility setting
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_visibility')
BEGIN
    ALTER TABLE users ADD profile_visibility NVARCHAR(20) DEFAULT 'public';
    PRINT '✓ Added profile_visibility column';
END
ELSE
    PRINT '⏭ profile_visibility column already exists';
GO

-- Create index on username for fast lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_username' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE NONCLUSTERED INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
    PRINT '✓ Created index on username';
END
ELSE
    PRINT '⏭ Index on username already exists';
GO

PRINT '';
PRINT '============================================';
PRINT '✅ User Profile Fields Migration Complete!';
PRINT '============================================';
PRINT '';
PRINT 'Added fields:';
PRINT '  ✓ username (unique)';
PRINT '  ✓ job_title';
PRINT '  ✓ bio';
PRINT '  ✓ profile_picture';
PRINT '  ✓ location';
PRINT '  ✓ website';
PRINT '  ✓ linkedin';
PRINT '  ✓ behance';
PRINT '  ✓ instagram';
PRINT '  ✓ facebook';
PRINT '  ✓ twitter';
PRINT '  ✓ github';
PRINT '  ✓ dribbble';
PRINT '  ✓ portfolio';
PRINT '  ✓ profile_visibility';
PRINT '';
PRINT 'Next steps:';
PRINT '  1. Verify changes: SELECT TOP 1 * FROM users';
PRINT '  2. Test profile updates';
PRINT '  3. Apply to Azure when ready';
PRINT '';
GO
