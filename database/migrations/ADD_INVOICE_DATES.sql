-- Add sent_date, paid_date, and updated_at columns to invoices table

-- Add sent_date column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'sent_date')
BEGIN
    ALTER TABLE invoices ADD sent_date DATETIME NULL;
    PRINT 'Added sent_date column';
END

-- Add paid_date column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'paid_date')
BEGIN
    ALTER TABLE invoices ADD paid_date DATETIME NULL;
    PRINT 'Added paid_date column';
END

-- Add updated_at column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'updated_at')
BEGIN
    ALTER TABLE invoices ADD updated_at DATETIME DEFAULT GETDATE();
    PRINT 'Added updated_at column';
END

-- Add trigger to auto-update sent_date when status changes to 'sent'
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_invoice_sent_date')
    DROP TRIGGER trg_invoice_sent_date;
GO

CREATE TRIGGER trg_invoice_sent_date
ON invoices
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE i
    SET sent_date = GETDATE()
    FROM invoices i
    INNER JOIN inserted ins ON i.id = ins.id
    INNER JOIN deleted del ON i.id = del.id
    WHERE ins.status = 'sent' 
      AND del.status != 'sent'
      AND i.sent_date IS NULL;
END
GO

-- Add trigger to auto-update paid_date when status changes to 'paid'
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_invoice_paid_date')
    DROP TRIGGER trg_invoice_paid_date;
GO

CREATE TRIGGER trg_invoice_paid_date
ON invoices
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE i
    SET paid_date = GETDATE()
    FROM invoices i
    INNER JOIN inserted ins ON i.id = ins.id
    INNER JOIN deleted del ON i.id = del.id
    WHERE ins.status = 'paid' 
      AND del.status != 'paid'
      AND i.paid_date IS NULL;
END
GO

PRINT 'Invoice dates migration completed successfully!';
