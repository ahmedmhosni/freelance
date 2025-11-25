-- Verify Quotes in Azure SQL Database
-- Run this to check if everything is set up correctly

-- Check if quotes table exists
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'quotes';

-- Count total quotes
SELECT COUNT(*) as total_quotes FROM quotes;

-- Count active quotes
SELECT COUNT(*) as active_quotes FROM quotes WHERE is_active = 1;

-- Show all quotes
SELECT 
    id,
    LEFT(text, 60) + '...' as quote_preview,
    author,
    is_active,
    created_at
FROM quotes
ORDER BY id;

-- Test random quote selection (what the login page will use)
SELECT TOP 1 
    text,
    author
FROM quotes 
WHERE is_active = 1 
ORDER BY NEWID();
