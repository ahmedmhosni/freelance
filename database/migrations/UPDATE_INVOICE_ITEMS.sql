-- Update invoice_items table to add missing columns

-- Add project_id column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'project_id')
BEGIN
    ALTER TABLE invoice_items ADD project_id INT NULL;
    ALTER TABLE invoice_items ADD CONSTRAINT FK_invoice_items_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
    PRINT 'Added project_id column';
END

-- Add task_id column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'task_id')
BEGIN
    ALTER TABLE invoice_items ADD task_id INT NULL;
    ALTER TABLE invoice_items ADD CONSTRAINT FK_invoice_items_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE NO ACTION;
    PRINT 'Added task_id column';
END

-- Add unit_price column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'unit_price')
BEGIN
    ALTER TABLE invoice_items ADD unit_price DECIMAL(10, 2) NULL;
    PRINT 'Added unit_price column';
END

-- Add hours_worked column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'hours_worked')
BEGIN
    ALTER TABLE invoice_items ADD hours_worked DECIMAL(10, 2) NULL;
    PRINT 'Added hours_worked column';
END

-- Add rate_per_hour column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'rate_per_hour')
BEGIN
    ALTER TABLE invoice_items ADD rate_per_hour DECIMAL(10, 2) NULL;
    PRINT 'Added rate_per_hour column';
END

-- Add created_at column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'created_at')
BEGIN
    ALTER TABLE invoice_items ADD created_at DATETIME DEFAULT GETDATE();
    PRINT 'Added created_at column';
END

-- Rename 'rate' to 'unit_price' if needed (for backward compatibility)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'rate')
AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'unit_price')
BEGIN
    EXEC sp_rename 'invoice_items.rate', 'unit_price', 'COLUMN';
    PRINT 'Renamed rate to unit_price';
END

PRINT 'Invoice items table updated successfully!';
GO
