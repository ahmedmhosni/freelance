-- Add Quotes Table and Default Data to Azure SQL Database
-- Run this in Azure Portal Query Editor

-- Step 1: Check if quotes table exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'quotes')
BEGIN
    PRINT 'Creating quotes table...';
    
    CREATE TABLE quotes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        text NVARCHAR(MAX) NOT NULL,
        author NVARCHAR(255),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE()
    );
    
    PRINT 'Quotes table created successfully';
END
ELSE
BEGIN
    PRINT 'Quotes table already exists';
END
GO

-- Step 2: Check if quotes exist, if not insert default quotes
IF NOT EXISTS (SELECT * FROM quotes)
BEGIN
    PRINT 'Inserting default quotes...';
    
    INSERT INTO quotes (text, author, is_active) VALUES
    ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 1),
    ('The only way to do great work is to love what you do.', 'Steve Jobs', 1),
    ('Productivity is never an accident. It is always the result of a commitment to excellence.', 'Paul J. Meyer', 1),
    ('Focus on being productive instead of busy.', 'Tim Ferriss', 1),
    ('The key is not to prioritize what''s on your schedule, but to schedule your priorities.', 'Stephen Covey', 1),
    ('Don''t watch the clock; do what it does. Keep going.', 'Sam Levenson', 1),
    ('The way to get started is to quit talking and begin doing.', 'Walt Disney', 1),
    ('Your time is limited, don''t waste it living someone else''s life.', 'Steve Jobs', 1),
    ('The future depends on what you do today.', 'Mahatma Gandhi', 1),
    ('Quality is not an act, it is a habit.', 'Aristotle', 1);
    
    PRINT 'Default quotes inserted successfully';
END
ELSE
BEGIN
    PRINT 'Quotes already exist, skipping insertion';
END
GO

-- Step 3: Verify the quotes
SELECT COUNT(*) as total_quotes FROM quotes;
SELECT TOP 5 id, LEFT(text, 50) + '...' as text_preview, author, is_active FROM quotes;
GO

PRINT 'Migration completed successfully!';
