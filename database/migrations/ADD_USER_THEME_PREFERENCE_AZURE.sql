-- Add theme preference column to users table
-- Azure SQL version

-- Check if column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'theme'
)
BEGIN
    ALTER TABLE users ADD theme NVARCHAR(10) DEFAULT 'light';
    PRINT 'Theme column added successfully';
END
ELSE
BEGIN
    PRINT 'Theme column already exists';
END
GO

-- Create index for faster queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_theme' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE NONCLUSTERED INDEX idx_users_theme ON users(theme);
    PRINT 'Index created successfully';
END
ELSE
BEGIN
    PRINT 'Index already exists';
END
GO

-- Verify the column was added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'theme';
GO
