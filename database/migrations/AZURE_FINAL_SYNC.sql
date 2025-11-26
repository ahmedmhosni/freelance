-- Final Azure Database Sync - Handle remaining columns
SET QUOTED_IDENTIFIER ON;
GO

PRINT '========================================';
PRINT 'Final Azure Database Sync';
PRINT '========================================';
PRINT '';

-- ============================================
-- 1. Fix updated_at column (drop constraint first)
-- ============================================
PRINT 'Fixing updated_at column...';

-- Drop default constraint if exists
DECLARE @ConstraintName nvarchar(200)
SELECT @ConstraintName = Name FROM SYS.DEFAULT_CONSTRAINTS
WHERE PARENT_OBJECT_ID = OBJECT_ID('invoices')
AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns 
                        WHERE NAME = N'updated_at' 
                        AND object_id = OBJECT_ID(N'invoices'))

IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE invoices DROP CONSTRAINT ' + @ConstraintName)
    PRINT '  ✓ Dropped updated_at constraint';
END
GO

-- Now alter the column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'updated_at' AND DATA_TYPE = 'datetime2')
BEGIN
    ALTER TABLE invoices ALTER COLUMN updated_at DATETIME NULL;
    PRINT '  ✓ Updated updated_at to DATETIME';
END
GO

PRINT '';

-- ============================================
-- 2. Add is_active to users (already added, just set defaults)
-- ============================================
PRINT 'Setting defaults for users...';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active')
BEGIN
    UPDATE users SET is_active = 1 WHERE is_active IS NULL;
    PRINT '  ✓ Set is_active defaults';
END
GO

PRINT '';

-- ============================================
-- 3. Fix theme column (drop constraints first)
-- ============================================
PRINT 'Fixing theme column...';

-- Drop index if exists
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_theme' AND object_id = OBJECT_ID('users'))
BEGIN
    DROP INDEX idx_users_theme ON users;
    PRINT '  ✓ Dropped theme index';
END
GO

-- Drop default constraint if exists
DECLARE @ThemeConstraint nvarchar(200)
SELECT @ThemeConstraint = Name FROM SYS.DEFAULT_CONSTRAINTS
WHERE PARENT_OBJECT_ID = OBJECT_ID('users')
AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns 
                        WHERE NAME = N'theme' 
                        AND object_id = OBJECT_ID(N'users'))

IF @ThemeConstraint IS NOT NULL
BEGIN
    EXEC('ALTER TABLE users DROP CONSTRAINT ' + @ThemeConstraint)
    PRINT '  ✓ Dropped theme constraint';
END
GO

-- Now alter the column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'theme' AND DATA_TYPE = 'nvarchar')
BEGIN
    ALTER TABLE users ALTER COLUMN theme VARCHAR(10) NULL;
    PRINT '  ✓ Updated theme to VARCHAR(10)';
END
GO

-- Recreate index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_theme' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE INDEX idx_users_theme ON users(theme);
    PRINT '  ✓ Recreated theme index';
END
GO

PRINT '';

-- ============================================
-- 4. Verify critical columns exist
-- ============================================
PRINT 'Verifying critical columns...';

-- Check invoices
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'issue_date')
    PRINT '  ✓ invoices.issue_date exists';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'tax')
    PRINT '  ✓ invoices.tax exists';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'total')
    PRINT '  ✓ invoices.total exists';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'sent_date')
    PRINT '  ✓ invoices.sent_date exists';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'paid_date')
    PRINT '  ✓ invoices.paid_date exists';

-- Check invoice_items
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'invoice_items')
    PRINT '  ✓ invoice_items table exists';

-- Check users
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active')
    PRINT '  ✓ users.is_active exists';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'theme')
    PRINT '  ✓ users.theme exists';

PRINT '';

-- ============================================
-- 5. Add notifications table if missing
-- ============================================
PRINT 'Checking notifications table...';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
BEGIN
    CREATE TABLE notifications (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        type NVARCHAR(50) NOT NULL,
        message NVARCHAR(500) NOT NULL,
        related_id INT NULL,
        is_read BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    PRINT '  ✓ Created notifications table';
END
ELSE
BEGIN
    PRINT '  ✓ notifications table already exists';
END
GO

PRINT '';

-- ============================================
-- Summary
-- ============================================
PRINT '========================================';
PRINT 'Final Azure Sync Complete!';
PRINT '========================================';
PRINT 'Database is now fully synchronized';
PRINT '========================================';
