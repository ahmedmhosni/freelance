-- Azure Database Schema Fix
-- Run this in Azure Portal Query Editor or Azure Cloud Shell
-- Database: roastifydb

-- ============================================
-- 1. FIX USERS TABLE
-- ============================================

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Verify users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- 2. FIX TIME_ENTRIES TABLE
-- ============================================

-- Add missing columns to time_entries table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'time_entries') THEN
        ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- ============================================
-- 3. FIX TASKS TABLE (camelCase to snake_case)
-- ============================================

-- Check if tasks table has camelCase columns and needs fixing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'userid') THEN
        -- Rename userid to user_id
        ALTER TABLE tasks RENAME COLUMN userid TO user_id;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'projectid') THEN
        -- Rename projectid to project_id
        ALTER TABLE tasks RENAME COLUMN projectid TO project_id;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'createdat') THEN
        -- Rename createdat to created_at
        ALTER TABLE tasks RENAME COLUMN createdat TO created_at;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'updatedat') THEN
        -- Rename updatedat to updated_at
        ALTER TABLE tasks RENAME COLUMN updatedat TO updated_at;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'duedate') THEN
        -- Rename duedate to due_date
        ALTER TABLE tasks RENAME COLUMN duedate TO due_date;
    END IF;
END $$;

-- ============================================
-- 4. FIX INVOICES TABLE
-- ============================================

-- Check for duplicate invoice_number columns
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'invoicenumber') THEN
        -- Drop the camelCase version if both exist
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'invoice_number') THEN
            ALTER TABLE invoices DROP COLUMN IF EXISTS invoicenumber;
        ELSE
            -- Rename if only camelCase exists
            ALTER TABLE invoices RENAME COLUMN invoicenumber TO invoice_number;
        END IF;
    END IF;
END $$;

-- ============================================
-- 5. FIX PROJECTS TABLE
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'clientid') THEN
            ALTER TABLE projects RENAME COLUMN clientid TO client_id;
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'userid') THEN
            ALTER TABLE projects RENAME COLUMN userid TO user_id;
        END IF;
    END IF;
END $$;

-- ============================================
-- 6. FIX CLIENTS TABLE
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'userid') THEN
            ALTER TABLE clients RENAME COLUMN userid TO user_id;
        END IF;
    END IF;
END $$;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Check all tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check users table specifically
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('last_login_at', 'last_activity_at', 'login_count', 'email', 'password')
ORDER BY column_name;

-- Check for any remaining camelCase columns in all tables
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name ~ '[A-Z]' OR  -- Contains uppercase
    column_name LIKE '%Id' OR
    column_name LIKE '%At' OR
    column_name LIKE '%Date'
)
ORDER BY table_name, column_name;

-- ============================================
-- 8. UPDATE EXISTING DATA
-- ============================================

-- Initialize login_count for existing users
UPDATE users SET login_count = 0 WHERE login_count IS NULL;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Schema fix completed successfully!' as status;
