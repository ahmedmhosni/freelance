-- Sync Azure Database with Local Database
-- This script adds missing columns and updates schema to match local

SET QUOTED_IDENTIFIER ON;
GO

PRINT '========================================';
PRINT 'Starting Azure Database Sync';
PRINT '========================================';
PRINT '';

-- ============================================
-- 1. INVOICES TABLE - Add missing columns
-- ============================================
PRINT 'Syncing invoices table...';

-- Add issue_date if missing
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'issue_date')
BEGIN
    ALTER TABLE invoices ADD issue_date DATE NULL;
    PRINT '  ✓ Added issue_date column';
END
GO

-- Set defaults for issue_date
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'issue_date')
BEGIN
    UPDATE invoices SET issue_date = CAST(created_at AS DATE) WHERE issue_date IS NULL;
    ALTER TABLE invoices ALTER COLUMN issue_date DATE NOT NULL;
    PRINT '  ✓ Set default values for issue_date';
END
GO

-- Add tax column if missing
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'tax')
BEGIN
    ALTER TABLE invoices ADD tax DECIMAL(10, 2) NULL DEFAULT 0;
    PRINT '  ✓ Added tax column';
END

-- Add total column if missing
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'total')
BEGIN
    ALTER TABLE invoices ADD total DECIMAL(10, 2) NULL;
    PRINT '  ✓ Added total column';
END
GO

-- Set defaults for total
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'total')
BEGIN
    UPDATE invoices SET total = amount WHERE total IS NULL;
    ALTER TABLE invoices ALTER COLUMN total DECIMAL(10, 2) NOT NULL;
    PRINT '  ✓ Set default values for total';
END
GO

-- Update sent_date and paid_date to DATETIME (from DATE)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'sent_date' AND DATA_TYPE = 'date')
BEGIN
    ALTER TABLE invoices ALTER COLUMN sent_date DATETIME NULL;
    PRINT '  ✓ Updated sent_date to DATETIME';
END

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'paid_date' AND DATA_TYPE = 'date')
BEGIN
    ALTER TABLE invoices ALTER COLUMN paid_date DATETIME NULL;
    PRINT '  ✓ Updated paid_date to DATETIME';
END

-- Update updated_at to DATETIME (from DATETIME2)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'updated_at' AND DATA_TYPE = 'datetime2')
BEGIN
    ALTER TABLE invoices ALTER COLUMN updated_at DATETIME NULL;
    PRINT '  ✓ Updated updated_at to DATETIME';
END

PRINT '';

-- ============================================
-- 2. PROJECTS TABLE - Add missing columns
-- ============================================
PRINT 'Syncing projects table...';

-- Rename title to name if needed
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'title')
AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'name')
BEGIN
    EXEC sp_rename 'projects.title', 'name', 'COLUMN';
    PRINT '  ✓ Renamed title to name';
END

-- Add budget column if missing
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'budget')
BEGIN
    ALTER TABLE projects ADD budget DECIMAL(10, 2) NULL;
    PRINT '  ✓ Added budget column';
END

-- Add start_date column if missing
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'start_date')
BEGIN
    ALTER TABLE projects ADD start_date DATE NULL;
    PRINT '  ✓ Added start_date column';
END

-- Add end_date column if missing (rename from deadline if exists)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'deadline')
AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'end_date')
BEGIN
    EXEC sp_rename 'projects.deadline', 'end_date', 'COLUMN';
    PRINT '  ✓ Renamed deadline to end_date';
END
ELSE IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'end_date')
BEGIN
    ALTER TABLE projects ADD end_date DATE NULL;
    PRINT '  ✓ Added end_date column';
END

PRINT '';

-- ============================================
-- 3. TASKS TABLE - Add missing columns
-- ============================================
PRINT 'Syncing tasks table...';

-- Add assigned_to column if missing
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'assigned_to')
BEGIN
    ALTER TABLE tasks ADD assigned_to INT NULL;
    PRINT '  ✓ Added assigned_to column';
END

PRINT '';

-- ============================================
-- 4. USERS TABLE - Ensure all profile fields exist
-- ============================================
PRINT 'Syncing users table...';

-- Add is_active if missing
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active')
BEGIN
    ALTER TABLE users ADD is_active BIT NULL DEFAULT 1;
    PRINT '  ✓ Added is_active column';
END
GO

-- Set defaults for is_active
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active')
BEGIN
    UPDATE users SET is_active = 1 WHERE is_active IS NULL;
    PRINT '  ✓ Set default values for is_active';
END
GO

-- Update theme column type if needed
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'theme' AND DATA_TYPE = 'nvarchar')
BEGIN
    ALTER TABLE users ALTER COLUMN theme VARCHAR(10) NULL;
    PRINT '  ✓ Updated theme column type';
END

PRINT '';

-- ============================================
-- 5. Add missing tables
-- ============================================
PRINT 'Checking for missing tables...';

-- Add notifications table if missing
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

-- Add files table if missing (rename from file_metadata if exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'file_metadata')
AND NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'files')
BEGIN
    EXEC sp_rename 'file_metadata', 'files';
    PRINT '  ✓ Renamed file_metadata to files';
END

PRINT '';

-- ============================================
-- Summary
-- ============================================
PRINT '========================================';
PRINT 'Azure Database Sync Complete!';
PRINT '========================================';
PRINT 'Changes applied:';
PRINT '- Invoices: Added issue_date, tax, total columns';
PRINT '- Projects: Renamed/added columns to match local';
PRINT '- Tasks: Added assigned_to column';
PRINT '- Users: Ensured all profile fields exist';
PRINT '- Tables: Checked and synced all tables';
PRINT '========================================';
