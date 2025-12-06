/**
 * Migration script to update task status values
 * Converts old status values to new backend-approved values
 * 
 * Old -> New:
 * 'todo' -> 'pending'
 * 'review' -> 'in-progress'
 */

const { query, closePool } = require('./src/db/postgresql');

async function migrateTaskStatuses() {
  try {
    console.log('Starting task status migration...');
    console.log('');
    
    // Start transaction
    await query('BEGIN');
    
    // Update 'todo' to 'pending'
    const todoResult = await query(
      `UPDATE tasks SET status = 'pending' WHERE status = 'todo'`
    );
    console.log(`✓ Updated ${todoResult.rowCount} tasks from 'todo' to 'pending'`);
    
    // Update 'review' to 'in-progress'
    const reviewResult = await query(
      `UPDATE tasks SET status = 'in-progress' WHERE status = 'review'`
    );
    console.log(`✓ Updated ${reviewResult.rowCount} tasks from 'review' to 'in-progress'`);
    
    // Commit transaction
    await query('COMMIT');
    
    console.log('');
    console.log('✓ Migration completed successfully!');
    console.log('');
    
    // Show current status distribution
    const statusCount = await query(
      `SELECT status, COUNT(*) as count FROM tasks GROUP BY status ORDER BY status`
    );
    
    if (statusCount.rows && statusCount.rows.length > 0) {
      console.log('Current status distribution:');
      statusCount.rows.forEach(row => {
        console.log(`  ${row.status}: ${row.count}`);
      });
    } else {
      console.log('No tasks found in database.');
    }
    
  } catch (error) {
    try {
      await query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run migration
migrateTaskStatuses()
  .then(() => {
    console.log('');
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('Migration script failed:', error);
    process.exit(1);
  });
