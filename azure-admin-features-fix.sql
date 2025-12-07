-- Azure Admin Features Fix
-- Run this in pgAdmin to add missing admin functionality

-- ============================================
-- 1. ADD MISSING COLUMNS TO USERS TABLE
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);

-- ============================================
-- 2. CREATE ACTIVITY_LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- ============================================
-- 3. CREATE GET_INACTIVE_USERS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_inactive_users(days_inactive INTEGER)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP,
    login_count INTEGER,
    days_since_login INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.last_login_at,
        u.created_at,
        COALESCE(u.login_count, 0) as login_count,
        CASE 
            WHEN u.last_login_at IS NULL THEN 
                EXTRACT(DAY FROM (NOW() - u.created_at))::INTEGER
            ELSE 
                EXTRACT(DAY FROM (NOW() - u.last_login_at))::INTEGER
        END as days_since_login
    FROM users u
    WHERE u.deleted_at IS NULL
    AND u.role != 'admin'
    AND (
        u.last_login_at IS NULL 
        OR u.last_login_at < NOW() - (days_inactive || ' days')::INTERVAL
    )
    ORDER BY days_since_login DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE ADMIN REPORTS TABLE (if needed)
-- ============================================

CREATE TABLE IF NOT EXISTS admin_reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    generated_by INTEGER REFERENCES users(id),
    parameters JSONB,
    result_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_reports_type ON admin_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_admin_reports_created_at ON admin_reports(created_at);

-- ============================================
-- 5. ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- ============================================
-- 6. VERIFICATION
-- ============================================

-- Check users table columns
SELECT 'Users table columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('deleted_at', 'deletion_reason', 'last_login_at', 'login_count')
ORDER BY column_name;

-- Check activity_logs table
SELECT 'Activity logs table:' as info;
SELECT 
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_logs') as exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'activity_logs') as column_count;

-- Check function exists
SELECT 'get_inactive_users function:' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'get_inactive_users';

-- Test the function
SELECT 'Testing get_inactive_users function:' as info;
SELECT COUNT(*) as inactive_users_count
FROM get_inactive_users(90);

SELECT '✓ Admin features fix completed successfully!' as status;
