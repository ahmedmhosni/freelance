-- Add theme preference column to users table
-- SQL Server version (Local SQL Server Express)

-- Check if column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'theme'
)
BEGIN
    ALTER TABLE users ADD theme VARCHAR(10) DEFAULT 'light';
END
GO

-- Create index for faster queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_theme' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE NONCLUSTERED INDEX idx_users_theme ON users(theme);
END
GO

PRINT 'Theme column added successfully to users table';
