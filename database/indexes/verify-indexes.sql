-- ============================================
-- Verify Performance Indexes Installation
-- Run this in Azure Query Editor to confirm
-- ============================================

USE roastifydbazure;
GO

PRINT '============================================';
PRINT 'Verifying Performance Indexes Installation';
PRINT '============================================';
PRINT '';

-- Get all indexes we created
SELECT 
    OBJECT_NAME(i.object_id) as table_name,
    i.name as index_name,
    i.type_desc as index_type,
    COL_NAME(ic.object_id, ic.column_id) as column_name,
    i.is_unique,
    i.fill_factor
FROM sys.indexes i
INNER JOIN sys.index_columns ic 
    ON i.object_id = ic.object_id 
    AND i.index_id = ic.index_id
WHERE i.name LIKE 'idx_%'
    AND i.name NOT LIKE 'idx_clients_user_id'  -- Exclude original indexes
    AND i.name NOT LIKE 'idx_projects_user_id'
    AND i.name NOT LIKE 'idx_projects_client_id'
    AND i.name NOT LIKE 'idx_tasks_user_id'
    AND i.name NOT LIKE 'idx_tasks_project_id'
    AND i.name NOT LIKE 'idx_invoices_user_id'
    AND i.name NOT LIKE 'idx_invoices_client_id'
    AND i.name NOT LIKE 'idx_time_entries_user_id'
    AND i.name NOT LIKE 'idx_time_entries_project_id'
    AND i.name NOT LIKE 'idx_file_metadata_user_id'
ORDER BY table_name, index_name;

PRINT '';
PRINT '============================================';
PRINT 'Index Count by Table';
PRINT '============================================';
PRINT '';

-- Count indexes per table
SELECT 
    OBJECT_NAME(object_id) as table_name,
    COUNT(*) as index_count
FROM sys.indexes
WHERE name LIKE 'idx_%'
    AND OBJECT_NAME(object_id) IN ('users', 'clients', 'projects', 'tasks', 'invoices', 'time_entries', 'file_metadata', 'activity_logs')
GROUP BY OBJECT_NAME(object_id)
ORDER BY table_name;

PRINT '';
PRINT '============================================';
PRINT 'Expected Indexes Summary';
PRINT '============================================';
PRINT '';
PRINT 'Users table: 4 new indexes';
PRINT '  - idx_users_email';
PRINT '  - idx_users_verification_token';
PRINT '  - idx_users_verification_code';
PRINT '  - idx_users_password_reset_token';
PRINT '';
PRINT 'Clients table: 2 new indexes';
PRINT '  - idx_clients_email';
PRINT '  - idx_clients_search';
PRINT '';
PRINT 'Projects table: 2 new indexes';
PRINT '  - idx_projects_status';
PRINT '  - idx_projects_deadline';
PRINT '';
PRINT 'Tasks table: 4 new indexes';
PRINT '  - idx_tasks_status';
PRINT '  - idx_tasks_priority';
PRINT '  - idx_tasks_due_date';
PRINT '  - idx_tasks_calendar';
PRINT '';
PRINT 'Invoices table: 4 new indexes';
PRINT '  - idx_invoices_status';
PRINT '  - idx_invoices_due_date';
PRINT '  - idx_invoices_invoice_number';
PRINT '  - idx_invoices_revenue';
PRINT '';
PRINT 'Time Entries table: 3 new indexes';
PRINT '  - idx_time_entries_task_id';
PRINT '  - idx_time_entries_date';
PRINT '  - idx_time_entries_running';
PRINT '';
PRINT 'File Metadata table: 2 new indexes';
PRINT '  - idx_file_metadata_project';
PRINT '  - idx_file_metadata_provider';
PRINT '';
PRINT 'Activity Logs table: 2 new indexes';
PRINT '  - idx_activity_logs_user';
PRINT '  - idx_activity_logs_entity';
PRINT '';
PRINT 'Total: 23 new performance indexes';
PRINT '';
PRINT '============================================';
PRINT '✅ Verification Complete!';
PRINT '============================================';

GO
