-- Check users table schema
SET NOCOUNT ON;

PRINT '========================================';
PRINT 'USERS TABLE SCHEMA CHECK';
PRINT '========================================';
PRINT '';

-- Get all columns from users table
SELECT 
    COLUMN_NAME as [Column Name],
    DATA_TYPE as [Data Type],
    CHARACTER_MAXIMUM_LENGTH as [Max Length],
    IS_NULLABLE as [Nullable],
    COLUMN_DEFAULT as [Default]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '========================================';
PRINT 'EMAIL VERIFICATION COLUMNS';
PRINT '========================================';
PRINT '';

-- Check specific email verification columns
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verified')
        THEN 'EXISTS' ELSE 'MISSING' 
    END as email_verified,
    CASE 
        WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_token')
        THEN 'EXISTS' ELSE 'MISSING' 
    END as email_verification_token,
    CASE 
        WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_code')
        THEN 'EXISTS' ELSE 'MISSING' 
    END as email_verification_code,
    CASE 
        WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_expires')
        THEN 'EXISTS' ELSE 'MISSING' 
    END as email_verification_expires,
    CASE 
        WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'password_reset_token')
        THEN 'EXISTS' ELSE 'MISSING' 
    END as password_reset_token,
    CASE 
        WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'password_reset_expires')
        THEN 'EXISTS' ELSE 'MISSING' 
    END as password_reset_expires;

PRINT '';
PRINT '========================================';
PRINT 'SAMPLE USER DATA';
PRINT '========================================';
PRINT '';

-- Get sample user (first user)
SELECT TOP 1 
    id,
    name,
    email,
    role,
    created_at
FROM users
ORDER BY id;
