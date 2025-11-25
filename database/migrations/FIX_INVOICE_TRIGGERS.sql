-- Fix invoice triggers to prevent infinite recursion
-- Drop the problematic triggers that cause nesting level exceeded error

-- Drop sent_date trigger
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_invoice_sent_date')
BEGIN
    DROP TRIGGER trg_invoice_sent_date;
    PRINT 'Dropped trg_invoice_sent_date trigger';
END
GO

-- Drop paid_date trigger
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_invoice_paid_date')
BEGIN
    DROP TRIGGER trg_invoice_paid_date;
    PRINT 'Dropped trg_invoice_paid_date trigger';
END
GO

PRINT 'Invoice triggers removed successfully!';
PRINT 'Note: sent_date and paid_date will now be managed by the application code.';
