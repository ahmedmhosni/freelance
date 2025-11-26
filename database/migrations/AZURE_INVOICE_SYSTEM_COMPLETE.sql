-- Complete Invoice System Migration for Azure Database
-- Run this on Azure SQL Database to sync all invoice-related changes

-- ============================================
-- 1. Add invoice_items table if not exists
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'invoice_items')
BEGIN
    CREATE TABLE invoice_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        invoice_id INT NOT NULL,
        project_id INT NULL,
        task_id INT NULL,
        description NVARCHAR(500) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NULL,
        hours_worked DECIMAL(10, 2) NULL,
        rate_per_hour DECIMAL(10, 2) NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    );
    
    PRINT 'Created invoice_items table';
END
ELSE
BEGIN
    PRINT 'invoice_items table already exists';
END
GO

-- ============================================
-- 2. Add missing columns to invoice_items
-- ============================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'project_id')
BEGIN
    ALTER TABLE invoice_items ADD project_id INT NULL;
    ALTER TABLE invoice_items ADD CONSTRAINT FK_invoice_items_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
    PRINT 'Added project_id to invoice_items';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'task_id')
BEGIN
    ALTER TABLE invoice_items ADD task_id INT NULL;
    ALTER TABLE invoice_items ADD CONSTRAINT FK_invoice_items_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE NO ACTION;
    PRINT 'Added task_id to invoice_items';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'unit_price')
BEGIN
    ALTER TABLE invoice_items ADD unit_price DECIMAL(10, 2) NULL;
    PRINT 'Added unit_price to invoice_items';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'hours_worked')
BEGIN
    ALTER TABLE invoice_items ADD hours_worked DECIMAL(10, 2) NULL;
    PRINT 'Added hours_worked to invoice_items';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'rate_per_hour')
BEGIN
    ALTER TABLE invoice_items ADD rate_per_hour DECIMAL(10, 2) NULL;
    PRINT 'Added rate_per_hour to invoice_items';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'created_at')
BEGIN
    ALTER TABLE invoice_items ADD created_at DATETIME DEFAULT GETDATE();
    PRINT 'Added created_at to invoice_items';
END
GO

-- ============================================
-- 3. Fix rate column issue in invoice_items
-- ============================================
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'rate')
BEGIN
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'unit_price')
    BEGIN
        ALTER TABLE invoice_items DROP COLUMN rate;
        PRINT 'Dropped redundant rate column';
    END
    ELSE
    BEGIN
        EXEC sp_rename 'invoice_items.rate', 'unit_price', 'COLUMN';
        PRINT 'Renamed rate to unit_price';
    END
END
GO

-- ============================================
-- 4. Add date columns to invoices table
-- ============================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'sent_date')
BEGIN
    ALTER TABLE invoices ADD sent_date DATETIME NULL;
    PRINT 'Added sent_date to invoices';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'paid_date')
BEGIN
    ALTER TABLE invoices ADD paid_date DATETIME NULL;
    PRINT 'Added paid_date to invoices';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'updated_at')
BEGIN
    ALTER TABLE invoices ADD updated_at DATETIME DEFAULT GETDATE();
    PRINT 'Added updated_at to invoices';
END
GO

-- ============================================
-- 5. Remove problematic triggers (if they exist)
-- ============================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_invoice_sent_date')
BEGIN
    DROP TRIGGER trg_invoice_sent_date;
    PRINT 'Dropped trg_invoice_sent_date trigger';
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_invoice_paid_date')
BEGIN
    DROP TRIGGER trg_invoice_paid_date;
    PRINT 'Dropped trg_invoice_paid_date trigger';
END
GO

-- ============================================
-- 6. Add indexes for better performance
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_invoice_items_invoice_id' AND object_id = OBJECT_ID('invoice_items'))
BEGIN
    CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
    PRINT 'Created index on invoice_items.invoice_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_invoice_items_project_id' AND object_id = OBJECT_ID('invoice_items'))
BEGIN
    CREATE INDEX idx_invoice_items_project_id ON invoice_items(project_id);
    PRINT 'Created index on invoice_items.project_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_invoice_items_task_id' AND object_id = OBJECT_ID('invoice_items'))
BEGIN
    CREATE INDEX idx_invoice_items_task_id ON invoice_items(task_id);
    PRINT 'Created index on invoice_items.task_id';
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Invoice System Migration Complete!';
PRINT '========================================';
PRINT 'Summary:';
PRINT '- invoice_items table created/updated';
PRINT '- Date columns added to invoices';
PRINT '- Problematic triggers removed';
PRINT '- Indexes created for performance';
PRINT '- Date management now handled by application';
PRINT '========================================';
