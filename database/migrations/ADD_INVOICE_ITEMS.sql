-- Add invoice items table for detailed line items
-- This allows multiple items per invoice with project/task tracking

-- Check if invoice_items table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'invoice_items')
BEGIN
    CREATE TABLE invoice_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        invoice_id INT NOT NULL,
        project_id INT NULL,
        task_id INT NULL,
        description NVARCHAR(500) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        hours_worked DECIMAL(10, 2) NULL,
        rate_per_hour DECIMAL(10, 2) NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    );
    
    PRINT 'invoice_items table created successfully';
END
ELSE
BEGIN
    PRINT 'invoice_items table already exists';
END
GO

-- Add indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_invoice_items_invoice_id')
BEGIN
    CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
    PRINT 'Index idx_invoice_items_invoice_id created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_invoice_items_project_id')
BEGIN
    CREATE INDEX idx_invoice_items_project_id ON invoice_items(project_id);
    PRINT 'Index idx_invoice_items_project_id created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_invoice_items_task_id')
BEGIN
    CREATE INDEX idx_invoice_items_task_id ON invoice_items(task_id);
    PRINT 'Index idx_invoice_items_task_id created';
END
GO

PRINT 'Invoice items migration completed successfully!';
