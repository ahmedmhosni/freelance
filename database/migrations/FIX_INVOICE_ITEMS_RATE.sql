-- Fix invoice_items table - handle the 'rate' column issue

-- If 'rate' column exists and is NOT NULL, make it nullable or drop it
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'rate')
BEGIN
    -- Check if unit_price exists
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoice_items' AND COLUMN_NAME = 'unit_price')
    BEGIN
        -- Both exist, drop 'rate' as we use 'unit_price'
        ALTER TABLE invoice_items DROP COLUMN rate;
        PRINT 'Dropped redundant rate column (using unit_price instead)';
    END
    ELSE
    BEGIN
        -- Rename rate to unit_price
        EXEC sp_rename 'invoice_items.rate', 'unit_price', 'COLUMN';
        PRINT 'Renamed rate to unit_price';
    END
END
ELSE
BEGIN
    PRINT 'No rate column found - schema is correct';
END
GO

-- Ensure unit_price allows NULL (for hourly items)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'invoice_items' 
           AND COLUMN_NAME = 'unit_price' 
           AND IS_NULLABLE = 'NO')
BEGIN
    ALTER TABLE invoice_items ALTER COLUMN unit_price DECIMAL(10, 2) NULL;
    PRINT 'Made unit_price nullable';
END
GO

PRINT 'Invoice items rate column fixed successfully!';
