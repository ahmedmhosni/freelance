-- Add Maintenance Content Table to Azure SQL Database
-- Run this in Azure Portal Query Editor

-- Step 1: Check if maintenance_content table exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'maintenance_content')
BEGIN
    PRINT 'Creating maintenance_content table...';
    
    -- Step 2: Create the maintenance_content table
    CREATE TABLE maintenance_content (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(500) NOT NULL DEFAULT 'Brilliant ideas take time to be roasted',
        subtitle NVARCHAR(500) NOT NULL DEFAULT 'Roastify is coming soon',
        message NVARCHAR(MAX) NOT NULL DEFAULT 'We''re crafting something extraordinary. Great things take time, and we''re roasting the perfect experience for you.',
        launch_date DATE NULL,
        is_active BIT DEFAULT 0,
        updated_by INT NULL,
        updated_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_maintenance_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
    );
    
    PRINT 'Maintenance_content table created successfully';
    
    -- Step 3: Insert default maintenance content
    INSERT INTO maintenance_content (title, subtitle, message, is_active, updated_at)
    VALUES (
        'Brilliant ideas take time to be roasted',
        'Roastify is coming soon',
        'We''re crafting something extraordinary. Great things take time, and we''re roasting the perfect experience for you.',
        0,
        GETDATE()
    );
    
    PRINT 'Default maintenance content inserted';
END
ELSE
BEGIN
    PRINT 'Maintenance_content table already exists';
END
GO

-- Step 4: Verify the table was created
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'maintenance_content';
GO

-- Step 5: Verify the data was inserted
SELECT 
    id,
    LEFT(title, 50) + '...' as title_preview,
    LEFT(subtitle, 50) + '...' as subtitle_preview,
    is_active,
    updated_at
FROM maintenance_content;
GO

-- Step 6: Check table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'maintenance_content'
ORDER BY ORDINAL_POSITION;
GO

PRINT 'Migration completed successfully!';
PRINT 'Maintenance table is ready to use.';
