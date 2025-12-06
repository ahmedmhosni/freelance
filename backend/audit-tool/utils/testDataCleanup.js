/**
 * Test Data Cleanup
 * 
 * Handles cleanup of test data after verification runs.
 * Provides graceful error handling and verification of cleanup success.
 */

const logger = require('./logger');

/**
 * Cleans up test data for a specific user
 * @param {Object} pool - Database connection pool
 * @param {number} userId - User ID to clean up
 * @returns {Promise<Object>} Cleanup result
 */
async function cleanupUserData(pool, userId) {
  const result = {
    userId,
    success: false,
    deletedRecords: {
      timeEntries: 0,
      invoiceItems: 0,
      invoices: 0,
      tasks: 0,
      projects: 0,
      clients: 0,
      notifications: 0,
      quotes: 0,
      files: 0,
      user: 0
    },
    errors: [],
    timestamp: new Date().toISOString()
  };

  try {
    logger.debug(`Starting cleanup for user ${userId}`);

    // Delete in order of dependencies (child records first)
    
    // 1. Delete time entries
    try {
      const timeEntriesResult = await pool.query(
        'DELETE FROM time_entries WHERE user_id = $1',
        [userId]
      );
      result.deletedRecords.timeEntries = timeEntriesResult.rowCount;
      logger.debug(`Deleted ${timeEntriesResult.rowCount} time entries`);
    } catch (error) {
      result.errors.push(`Time entries cleanup failed: ${error.message}`);
      logger.error(`Failed to delete time entries for user ${userId}:`, error.message);
    }

    // 2. Delete invoice items (must be before invoices)
    try {
      const invoiceItemsResult = await pool.query(
        'DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = $1)',
        [userId]
      );
      result.deletedRecords.invoiceItems = invoiceItemsResult.rowCount;
      logger.debug(`Deleted ${invoiceItemsResult.rowCount} invoice items`);
    } catch (error) {
      result.errors.push(`Invoice items cleanup failed: ${error.message}`);
      logger.error(`Failed to delete invoice items for user ${userId}:`, error.message);
    }

    // 3. Delete invoices
    try {
      const invoicesResult = await pool.query(
        'DELETE FROM invoices WHERE user_id = $1',
        [userId]
      );
      result.deletedRecords.invoices = invoicesResult.rowCount;
      logger.debug(`Deleted ${invoicesResult.rowCount} invoices`);
    } catch (error) {
      result.errors.push(`Invoices cleanup failed: ${error.message}`);
      logger.error(`Failed to delete invoices for user ${userId}:`, error.message);
    }

    // 4. Delete tasks
    try {
      const tasksResult = await pool.query(
        'DELETE FROM tasks WHERE user_id = $1',
        [userId]
      );
      result.deletedRecords.tasks = tasksResult.rowCount;
      logger.debug(`Deleted ${tasksResult.rowCount} tasks`);
    } catch (error) {
      result.errors.push(`Tasks cleanup failed: ${error.message}`);
      logger.error(`Failed to delete tasks for user ${userId}:`, error.message);
    }

    // 5. Delete projects
    try {
      const projectsResult = await pool.query(
        'DELETE FROM projects WHERE user_id = $1',
        [userId]
      );
      result.deletedRecords.projects = projectsResult.rowCount;
      logger.debug(`Deleted ${projectsResult.rowCount} projects`);
    } catch (error) {
      result.errors.push(`Projects cleanup failed: ${error.message}`);
      logger.error(`Failed to delete projects for user ${userId}:`, error.message);
    }

    // 6. Delete clients
    try {
      const clientsResult = await pool.query(
        'DELETE FROM clients WHERE user_id = $1',
        [userId]
      );
      result.deletedRecords.clients = clientsResult.rowCount;
      logger.debug(`Deleted ${clientsResult.rowCount} clients`);
    } catch (error) {
      result.errors.push(`Clients cleanup failed: ${error.message}`);
      logger.error(`Failed to delete clients for user ${userId}:`, error.message);
    }

    // 7. Delete notifications
    try {
      const notificationsResult = await pool.query(
        'DELETE FROM notifications WHERE user_id = $1',
        [userId]
      );
      result.deletedRecords.notifications = notificationsResult.rowCount;
      logger.debug(`Deleted ${notificationsResult.rowCount} notifications`);
    } catch (error) {
      result.errors.push(`Notifications cleanup failed: ${error.message}`);
      logger.error(`Failed to delete notifications for user ${userId}:`, error.message);
    }

    // 8. Delete quotes
    try {
      const quotesResult = await pool.query(
        'DELETE FROM quotes WHERE user_id = $1',
        [userId]
      );
      result.deletedRecords.quotes = quotesResult.rowCount;
      logger.debug(`Deleted ${quotesResult.rowCount} quotes`);
    } catch (error) {
      result.errors.push(`Quotes cleanup failed: ${error.message}`);
      logger.error(`Failed to delete quotes for user ${userId}:`, error.message);
    }

    // 9. Delete files
    try {
      const filesResult = await pool.query(
        'DELETE FROM files WHERE user_id = $1',
        [userId]
      );
      result.deletedRecords.files = filesResult.rowCount;
      logger.debug(`Deleted ${filesResult.rowCount} files`);
    } catch (error) {
      result.errors.push(`Files cleanup failed: ${error.message}`);
      logger.error(`Failed to delete files for user ${userId}:`, error.message);
    }

    // 10. Delete user (last)
    try {
      const userResult = await pool.query(
        'DELETE FROM users WHERE id = $1',
        [userId]
      );
      result.deletedRecords.user = userResult.rowCount;
      logger.debug(`Deleted user ${userId}`);
    } catch (error) {
      result.errors.push(`User cleanup failed: ${error.message}`);
      logger.error(`Failed to delete user ${userId}:`, error.message);
    }

    // Verify cleanup was successful
    const verificationResult = await verifyCleanup(pool, userId);
    result.verified = verificationResult.success;
    result.remainingRecords = verificationResult.remainingRecords;

    // Consider cleanup successful if no errors occurred and verification passed
    result.success = result.errors.length === 0 && result.verified;

    if (result.success) {
      logger.info(`Successfully cleaned up all data for user ${userId}`);
    } else {
      logger.warn(`Cleanup for user ${userId} completed with ${result.errors.length} errors`);
    }

  } catch (error) {
    result.errors.push(`Cleanup failed: ${error.message}`);
    logger.error(`Cleanup failed for user ${userId}:`, error.message);
  }

  return result;
}

/**
 * Cleans up test data by record IDs
 * @param {Object} pool - Database connection pool
 * @param {Object} recordIds - Object containing arrays of IDs to delete
 * @returns {Promise<Object>} Cleanup result
 */
async function cleanupByRecordIds(pool, recordIds) {
  const result = {
    success: false,
    deletedRecords: {
      timeEntries: 0,
      invoiceItems: 0,
      invoices: 0,
      tasks: 0,
      projects: 0,
      clients: 0,
      notifications: 0,
      quotes: 0,
      files: 0
    },
    errors: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Delete time entries
    if (recordIds.timeEntries && recordIds.timeEntries.length > 0) {
      try {
        const timeEntriesResult = await pool.query(
          'DELETE FROM time_entries WHERE id = ANY($1::int[])',
          [recordIds.timeEntries]
        );
        result.deletedRecords.timeEntries = timeEntriesResult.rowCount;
      } catch (error) {
        result.errors.push(`Time entries cleanup failed: ${error.message}`);
      }
    }

    // Delete invoice items
    if (recordIds.invoiceItems && recordIds.invoiceItems.length > 0) {
      try {
        const invoiceItemsResult = await pool.query(
          'DELETE FROM invoice_items WHERE id = ANY($1::int[])',
          [recordIds.invoiceItems]
        );
        result.deletedRecords.invoiceItems = invoiceItemsResult.rowCount;
      } catch (error) {
        result.errors.push(`Invoice items cleanup failed: ${error.message}`);
      }
    }

    // Delete invoices
    if (recordIds.invoices && recordIds.invoices.length > 0) {
      try {
        const invoicesResult = await pool.query(
          'DELETE FROM invoices WHERE id = ANY($1::int[])',
          [recordIds.invoices]
        );
        result.deletedRecords.invoices = invoicesResult.rowCount;
      } catch (error) {
        result.errors.push(`Invoices cleanup failed: ${error.message}`);
      }
    }

    // Delete tasks
    if (recordIds.tasks && recordIds.tasks.length > 0) {
      try {
        const tasksResult = await pool.query(
          'DELETE FROM tasks WHERE id = ANY($1::int[])',
          [recordIds.tasks]
        );
        result.deletedRecords.tasks = tasksResult.rowCount;
      } catch (error) {
        result.errors.push(`Tasks cleanup failed: ${error.message}`);
      }
    }

    // Delete projects
    if (recordIds.projects && recordIds.projects.length > 0) {
      try {
        const projectsResult = await pool.query(
          'DELETE FROM projects WHERE id = ANY($1::int[])',
          [recordIds.projects]
        );
        result.deletedRecords.projects = projectsResult.rowCount;
      } catch (error) {
        result.errors.push(`Projects cleanup failed: ${error.message}`);
      }
    }

    // Delete clients
    if (recordIds.clients && recordIds.clients.length > 0) {
      try {
        const clientsResult = await pool.query(
          'DELETE FROM clients WHERE id = ANY($1::int[])',
          [recordIds.clients]
        );
        result.deletedRecords.clients = clientsResult.rowCount;
      } catch (error) {
        result.errors.push(`Clients cleanup failed: ${error.message}`);
      }
    }

    // Delete notifications
    if (recordIds.notifications && recordIds.notifications.length > 0) {
      try {
        const notificationsResult = await pool.query(
          'DELETE FROM notifications WHERE id = ANY($1::int[])',
          [recordIds.notifications]
        );
        result.deletedRecords.notifications = notificationsResult.rowCount;
      } catch (error) {
        result.errors.push(`Notifications cleanup failed: ${error.message}`);
      }
    }

    // Delete quotes
    if (recordIds.quotes && recordIds.quotes.length > 0) {
      try {
        const quotesResult = await pool.query(
          'DELETE FROM quotes WHERE id = ANY($1::int[])',
          [recordIds.quotes]
        );
        result.deletedRecords.quotes = quotesResult.rowCount;
      } catch (error) {
        result.errors.push(`Quotes cleanup failed: ${error.message}`);
      }
    }

    // Delete files
    if (recordIds.files && recordIds.files.length > 0) {
      try {
        const filesResult = await pool.query(
          'DELETE FROM files WHERE id = ANY($1::int[])',
          [recordIds.files]
        );
        result.deletedRecords.files = filesResult.rowCount;
      } catch (error) {
        result.errors.push(`Files cleanup failed: ${error.message}`);
      }
    }

    result.success = result.errors.length === 0;

    if (result.success) {
      logger.info('Successfully cleaned up test data by record IDs');
    } else {
      logger.warn(`Cleanup by record IDs completed with ${result.errors.length} errors`);
    }

  } catch (error) {
    result.errors.push(`Cleanup failed: ${error.message}`);
    logger.error('Cleanup by record IDs failed:', error.message);
  }

  return result;
}

/**
 * Verifies that cleanup was successful
 * @param {Object} pool - Database connection pool
 * @param {number} userId - User ID to verify
 * @returns {Promise<Object>} Verification result
 */
async function verifyCleanup(pool, userId) {
  const result = {
    success: false,
    remainingRecords: {
      timeEntries: 0,
      invoices: 0,
      tasks: 0,
      projects: 0,
      clients: 0,
      notifications: 0,
      quotes: 0,
      files: 0,
      user: 0
    },
    timestamp: new Date().toISOString()
  };

  try {
    // Check for remaining records
    const timeEntriesCount = await pool.query(
      'SELECT COUNT(*) FROM time_entries WHERE user_id = $1',
      [userId]
    );
    result.remainingRecords.timeEntries = parseInt(timeEntriesCount.rows[0].count);

    const invoicesCount = await pool.query(
      'SELECT COUNT(*) FROM invoices WHERE user_id = $1',
      [userId]
    );
    result.remainingRecords.invoices = parseInt(invoicesCount.rows[0].count);

    const tasksCount = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE user_id = $1',
      [userId]
    );
    result.remainingRecords.tasks = parseInt(tasksCount.rows[0].count);

    const projectsCount = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE user_id = $1',
      [userId]
    );
    result.remainingRecords.projects = parseInt(projectsCount.rows[0].count);

    const clientsCount = await pool.query(
      'SELECT COUNT(*) FROM clients WHERE user_id = $1',
      [userId]
    );
    result.remainingRecords.clients = parseInt(clientsCount.rows[0].count);

    const notificationsCount = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
      [userId]
    );
    result.remainingRecords.notifications = parseInt(notificationsCount.rows[0].count);

    const quotesCount = await pool.query(
      'SELECT COUNT(*) FROM quotes WHERE user_id = $1',
      [userId]
    );
    result.remainingRecords.quotes = parseInt(quotesCount.rows[0].count);

    const filesCount = await pool.query(
      'SELECT COUNT(*) FROM files WHERE user_id = $1',
      [userId]
    );
    result.remainingRecords.files = parseInt(filesCount.rows[0].count);

    const userCount = await pool.query(
      'SELECT COUNT(*) FROM users WHERE id = $1',
      [userId]
    );
    result.remainingRecords.user = parseInt(userCount.rows[0].count);

    // Calculate total remaining records
    const totalRemaining = Object.values(result.remainingRecords).reduce((sum, count) => sum + count, 0);
    result.success = totalRemaining === 0;

    if (result.success) {
      logger.debug(`Cleanup verification passed for user ${userId}`);
    } else {
      logger.warn(`Cleanup verification found ${totalRemaining} remaining records for user ${userId}`);
    }

  } catch (error) {
    logger.error(`Cleanup verification failed for user ${userId}:`, error.message);
    result.error = error.message;
  }

  return result;
}

/**
 * Cleans up all test data (users with test emails)
 * @param {Object} pool - Database connection pool
 * @returns {Promise<Object>} Cleanup result
 */
async function cleanupAllTestData(pool) {
  const result = {
    success: false,
    cleanedUsers: 0,
    errors: [],
    timestamp: new Date().toISOString()
  };

  try {
    logger.info('Starting cleanup of all test data');

    // Find all test users (emails containing 'test-' or '@example.com')
    const testUsersResult = await pool.query(
      `SELECT id FROM users 
       WHERE email LIKE '%test-%' 
       OR email LIKE '%@example.com'
       OR email LIKE '%@test.com'`
    );

    const testUserIds = testUsersResult.rows.map(row => row.id);
    logger.info(`Found ${testUserIds.length} test users to clean up`);

    // Clean up each test user
    for (const userId of testUserIds) {
      const cleanupResult = await cleanupUserData(pool, userId);
      
      if (cleanupResult.success) {
        result.cleanedUsers++;
      } else {
        result.errors.push(...cleanupResult.errors);
      }
    }

    result.success = result.errors.length === 0;

    if (result.success) {
      logger.info(`Successfully cleaned up ${result.cleanedUsers} test users`);
    } else {
      logger.warn(`Cleaned up ${result.cleanedUsers} test users with ${result.errors.length} errors`);
    }

  } catch (error) {
    result.errors.push(`Cleanup all test data failed: ${error.message}`);
    logger.error('Cleanup all test data failed:', error.message);
  }

  return result;
}

module.exports = {
  cleanupUserData,
  cleanupByRecordIds,
  verifyCleanup,
  cleanupAllTestData
};
