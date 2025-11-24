-- Maintenance page content table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'maintenance_content')
BEGIN
    CREATE TABLE maintenance_content (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(500) NOT NULL DEFAULT 'Brilliant ideas take time to be roasted',
        subtitle NVARCHAR(500) NOT NULL DEFAULT 'Roastify is coming soon',
        message NVARCHAR(MAX) NOT NULL DEFAULT 'We''re crafting something extraordinary. Great things take time, and we''re roasting the perfect experience for you.',
        launch_date DATE NULL,
        is_active BIT DEFAULT 0,
        updated_by INT FOREIGN KEY REFERENCES users(id),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    
    -- Insert default content
    INSERT INTO maintenance_content (title, subtitle, message, is_active)
    VALUES (
        'Brilliant ideas take time to be roasted',
        'Roastify is coming soon',
        'We''re crafting something extraordinary. Great things take time, and we''re roasting the perfect experience for you.',
        0
    );
    
    PRINT 'Maintenance table created successfully';
END
ELSE
BEGIN
    PRINT 'Maintenance table already exists';
END
