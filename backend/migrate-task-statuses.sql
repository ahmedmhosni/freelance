-- Migration script to update task status values
-- Converts old status values to new backend-approved values
-- 
-- Old -> New:
-- 'todo' -> 'pending'
-- 'review' -> 'in-progress'

-- Start transaction
BEGIN;

-- Update 'todo' to 'pending'
UPDATE tasks SET status = 'pending' WHERE status = 'todo';

-- Update 'review' to 'in-progress'
UPDATE tasks SET status = 'in-progress' WHERE status = 'review';

-- Show current status distribution
SELECT status, COUNT(*) as count 
FROM tasks 
GROUP BY status 
ORDER BY status;

-- Commit transaction
COMMIT;

-- Verify the migration
SELECT 'Migration completed successfully!' as message;
SELECT status, COUNT(*) as count 
FROM tasks 
GROUP BY status 
ORDER BY status;
