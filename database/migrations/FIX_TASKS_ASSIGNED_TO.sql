-- Add assigned_to column to tasks table if missing
-- This fixes 500 errors on /api/tasks endpoint

SET NOCOUNT ON;

PRINT '========================================';
PRINT 'Fixing Tasks Table - Add assigned_to';
PRINT '========================================';
PRINT '';

-- Check if assigned_to column exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'assigned_to')
BEGIN
    PRINT 'Adding assigned_to column to tasks table...';
    ALTER TABLE tasks ADD assigned_to INT NULL;
    PRINT '✓ assigned_to column added successfully';
    PRINT '';
    
    -- Optionally add foreign key constraint
    IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
    BEGIN
        ALTER TABLE tasks ADD CONSTRAINT FK_tasks_assigned_to 
        FOREIGN KEY (assigned_to) REFERENCES users(id);
        PRINT '✓ Foreign key constraint added';
    END
END
ELSE
BEGIN
    PRINT '✓ assigned_to column already exists';
END

PRINT '';
PRINT '========================================';
PRINT 'Tasks Table Fix Complete!';
PRINT '========================================';
