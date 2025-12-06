/**
 * DatabaseVerifier
 * 
 * Verifies database connectivity, schema, and operations.
 * Tests CRUD operations, transactions, and data integrity.
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

class DatabaseVerifier {
  /**
   * Creates a new DatabaseVerifier instance
   * @param {Object} config - Database configuration
   */
  constructor(config) {
    this.config = config;
    this.pool = null;
    this.testTablePrefix = 'audit_test_';
  }

  /**
   * Verifies database connection
   * @returns {Promise<Object>} Connection result with status and latency
   */
  async verifyConnection() {
    const startTime = Date.now();
    
    try {
      // Create connection pool if not exists
      if (!this.pool) {
        this.pool = new Pool({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        });

        // Handle pool errors
        this.pool.on('error', (err) => {
          logger.error('Database pool error:', err);
        });
      }

      // Test connection with simple query
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      const latency = Date.now() - startTime;

      logger.info(`Database connection verified (latency: ${latency}ms)`);

      return {
        connected: true,
        latency,
        timestamp: new Date().toISOString(),
        database: this.config.database,
        host: this.config.host
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      logger.error('Database connection failed:', error.message);

      return {
        connected: false,
        latency,
        timestamp: new Date().toISOString(),
        error: error.message,
        code: error.code,
        database: this.config.database,
        host: this.config.host
      };
    }
  }

  /**
   * Verifies all required tables exist in the database
   * @returns {Promise<Object>} Table verification result
   */
  async verifyTables() {
    try {
      if (!this.pool) {
        throw new Error('Database connection not established. Call verifyConnection() first.');
      }

      // Expected tables in the system
      const expectedTables = [
        'users',
        'clients',
        'projects',
        'tasks',
        'time_entries',
        'invoices',
        'invoice_items',
        'notifications',
        'files',
        'quotes',
        'maintenance_content'
      ];

      // Query to get all tables in the database
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;

      const result = await this.pool.query(query);
      const actualTables = result.rows.map(row => row.table_name);

      // Find missing and extra tables
      const missing = expectedTables.filter(table => !actualTables.includes(table));
      const extra = actualTables.filter(table => 
        !expectedTables.includes(table) && 
        !table.startsWith(this.testTablePrefix)
      );

      const allTablesExist = missing.length === 0;

      logger.info(`Table verification: ${actualTables.length} tables found, ${missing.length} missing`);

      return {
        success: allTablesExist,
        tables: actualTables,
        expected: expectedTables,
        missing,
        extra,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Table verification failed:', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Tests CRUD operations on a specific table
   * @param {string} tableName - Name of the table to test
   * @param {Object} testData - Test data to insert
   * @returns {Promise<Object>} CRUD test results
   */
  async verifyCRUD(tableName, testData) {
    const results = {
      table: tableName,
      insert: { success: false, error: null },
      select: { success: false, error: null },
      update: { success: false, error: null },
      delete: { success: false, error: null },
      timestamp: new Date().toISOString()
    };

    let insertedId = null;

    try {
      if (!this.pool) {
        throw new Error('Database connection not established. Call verifyConnection() first.');
      }

      // Test INSERT
      try {
        const columns = Object.keys(testData);
        const values = Object.values(testData);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const insertQuery = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
          RETURNING id
        `;

        const insertResult = await this.pool.query(insertQuery, values);
        insertedId = insertResult.rows[0].id;
        results.insert.success = true;
        results.insert.insertedId = insertedId;
        
        logger.debug(`INSERT test passed for ${tableName} (id: ${insertedId})`);
      } catch (error) {
        results.insert.error = error.message;
        logger.error(`INSERT test failed for ${tableName}:`, error.message);
        return results; // Can't continue without insert
      }

      // Test SELECT
      try {
        const selectQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
        const selectResult = await this.pool.query(selectQuery, [insertedId]);
        
        if (selectResult.rows.length === 1) {
          results.select.success = true;
          results.select.data = selectResult.rows[0];
          logger.debug(`SELECT test passed for ${tableName}`);
        } else {
          results.select.error = 'Record not found after insert';
        }
      } catch (error) {
        results.select.error = error.message;
        logger.error(`SELECT test failed for ${tableName}:`, error.message);
      }

      // Test UPDATE
      try {
        // Update the first column that's not 'id'
        const updateColumn = Object.keys(testData)[0];
        const updateValue = `${testData[updateColumn]}_updated`;
        
        const updateQuery = `
          UPDATE ${tableName} 
          SET ${updateColumn} = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `;

        const updateResult = await this.pool.query(updateQuery, [updateValue, insertedId]);
        
        if (updateResult.rows.length === 1) {
          results.update.success = true;
          results.update.data = updateResult.rows[0];
          logger.debug(`UPDATE test passed for ${tableName}`);
        } else {
          results.update.error = 'Update did not return updated record';
        }
      } catch (error) {
        results.update.error = error.message;
        logger.error(`UPDATE test failed for ${tableName}:`, error.message);
      }

      // Test DELETE
      try {
        const deleteQuery = `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`;
        const deleteResult = await this.pool.query(deleteQuery, [insertedId]);
        
        if (deleteResult.rows.length === 1) {
          results.delete.success = true;
          results.delete.deletedId = deleteResult.rows[0].id;
          
          // Verify deletion
          const verifyQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
          const verifyResult = await this.pool.query(verifyQuery, [insertedId]);
          
          if (verifyResult.rows.length === 0) {
            logger.debug(`DELETE test passed for ${tableName}`);
          } else {
            results.delete.success = false;
            results.delete.error = 'Record still exists after delete';
          }
        } else {
          results.delete.error = 'Delete did not return deleted record';
        }
      } catch (error) {
        results.delete.error = error.message;
        logger.error(`DELETE test failed for ${tableName}:`, error.message);
      }

    } catch (error) {
      logger.error(`CRUD verification failed for ${tableName}:`, error.message);
      results.error = error.message;
    }

    return results;
  }

  /**
   * Verifies query operations (filtering, sorting, pagination)
   * @param {string} tableName - Name of the table to test
   * @param {Array<Object>} testRecords - Array of test records to insert
   * @returns {Promise<Object>} Query verification results
   */
  async verifyQuery(tableName, testRecords) {
    const results = {
      table: tableName,
      filtering: { success: false, error: null },
      sorting: { success: false, error: null },
      pagination: { success: false, error: null },
      timestamp: new Date().toISOString()
    };

    const insertedIds = [];

    try {
      if (!this.pool) {
        throw new Error('Database connection not established. Call verifyConnection() first.');
      }

      // Insert test records
      for (const record of testRecords) {
        const columns = Object.keys(record);
        const values = Object.values(record);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const insertQuery = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
          RETURNING id
        `;

        const result = await this.pool.query(insertQuery, values);
        insertedIds.push(result.rows[0].id);
      }

      logger.debug(`Inserted ${insertedIds.length} test records for query verification`);

      // Test FILTERING
      try {
        const firstColumn = Object.keys(testRecords[0])[0];
        const filterValue = testRecords[0][firstColumn];
        
        const filterQuery = `
          SELECT * FROM ${tableName} 
          WHERE ${firstColumn} = $1 AND id = ANY($2::int[])
        `;

        const filterResult = await this.pool.query(filterQuery, [filterValue, insertedIds]);
        
        // Verify all results match the filter
        const allMatch = filterResult.rows.every(row => row[firstColumn] === filterValue);
        
        if (allMatch) {
          results.filtering.success = true;
          results.filtering.recordsFound = filterResult.rows.length;
          logger.debug(`FILTERING test passed for ${tableName}`);
        } else {
          results.filtering.error = 'Some records did not match filter criteria';
        }
      } catch (error) {
        results.filtering.error = error.message;
        logger.error(`FILTERING test failed for ${tableName}:`, error.message);
      }

      // Test SORTING
      try {
        const sortColumn = 'id';
        
        const sortQuery = `
          SELECT * FROM ${tableName} 
          WHERE id = ANY($1::int[])
          ORDER BY ${sortColumn} ASC
        `;

        const sortResult = await this.pool.query(sortQuery, [insertedIds]);
        
        // Verify results are sorted
        let isSorted = true;
        for (let i = 1; i < sortResult.rows.length; i++) {
          if (sortResult.rows[i][sortColumn] < sortResult.rows[i - 1][sortColumn]) {
            isSorted = false;
            break;
          }
        }
        
        if (isSorted) {
          results.sorting.success = true;
          results.sorting.recordsReturned = sortResult.rows.length;
          logger.debug(`SORTING test passed for ${tableName}`);
        } else {
          results.sorting.error = 'Results were not properly sorted';
        }
      } catch (error) {
        results.sorting.error = error.message;
        logger.error(`SORTING test failed for ${tableName}:`, error.message);
      }

      // Test PAGINATION
      try {
        const limit = 2;
        const offset = 1;
        
        const paginationQuery = `
          SELECT * FROM ${tableName} 
          WHERE id = ANY($1::int[])
          ORDER BY id ASC
          LIMIT $2 OFFSET $3
        `;

        const paginationResult = await this.pool.query(paginationQuery, [insertedIds, limit, offset]);
        
        // Verify correct number of records returned
        if (paginationResult.rows.length <= limit) {
          results.pagination.success = true;
          results.pagination.limit = limit;
          results.pagination.offset = offset;
          results.pagination.recordsReturned = paginationResult.rows.length;
          logger.debug(`PAGINATION test passed for ${tableName}`);
        } else {
          results.pagination.error = `Expected at most ${limit} records, got ${paginationResult.rows.length}`;
        }
      } catch (error) {
        results.pagination.error = error.message;
        logger.error(`PAGINATION test failed for ${tableName}:`, error.message);
      }

    } catch (error) {
      logger.error(`Query verification failed for ${tableName}:`, error.message);
      results.error = error.message;
    } finally {
      // Cleanup: Delete test records
      if (insertedIds.length > 0) {
        try {
          const deleteQuery = `DELETE FROM ${tableName} WHERE id = ANY($1::int[])`;
          await this.pool.query(deleteQuery, [insertedIds]);
          logger.debug(`Cleaned up ${insertedIds.length} test records`);
        } catch (error) {
          logger.error(`Failed to cleanup test records:`, error.message);
        }
      }
    }

    return results;
  }

  /**
   * Verifies transaction handling (commit and rollback)
   * @param {string} tableName - Name of the table to test
   * @param {Object} testData - Test data to insert
   * @returns {Promise<Object>} Transaction verification results
   */
  async verifyTransaction(tableName, testData) {
    const results = {
      table: tableName,
      commit: { success: false, error: null },
      rollback: { success: false, error: null },
      timestamp: new Date().toISOString()
    };

    try {
      if (!this.pool) {
        throw new Error('Database connection not established. Call verifyConnection() first.');
      }

      // Test COMMIT
      try {
        const client = await this.pool.connect();
        let insertedId = null;

        try {
          await client.query('BEGIN');

          const columns = Object.keys(testData);
          const values = Object.values(testData);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertQuery = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING id
          `;

          const insertResult = await client.query(insertQuery, values);
          insertedId = insertResult.rows[0].id;

          await client.query('COMMIT');

          // Verify record exists after commit
          const verifyQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
          const verifyResult = await client.query(verifyQuery, [insertedId]);

          if (verifyResult.rows.length === 1) {
            results.commit.success = true;
            results.commit.insertedId = insertedId;
            logger.debug(`COMMIT test passed for ${tableName}`);

            // Cleanup
            await client.query(`DELETE FROM ${tableName} WHERE id = $1`, [insertedId]);
          } else {
            results.commit.error = 'Record not found after commit';
          }
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      } catch (error) {
        results.commit.error = error.message;
        logger.error(`COMMIT test failed for ${tableName}:`, error.message);
      }

      // Test ROLLBACK
      try {
        const client = await this.pool.connect();
        let insertedId = null;

        try {
          await client.query('BEGIN');

          const columns = Object.keys(testData);
          const values = Object.values(testData);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertQuery = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING id
          `;

          const insertResult = await client.query(insertQuery, values);
          insertedId = insertResult.rows[0].id;

          // Intentionally rollback
          await client.query('ROLLBACK');

          // Verify record does NOT exist after rollback
          const verifyQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
          const verifyResult = await client.query(verifyQuery, [insertedId]);

          if (verifyResult.rows.length === 0) {
            results.rollback.success = true;
            results.rollback.rolledBackId = insertedId;
            logger.debug(`ROLLBACK test passed for ${tableName}`);
          } else {
            results.rollback.error = 'Record still exists after rollback';
          }
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      } catch (error) {
        results.rollback.error = error.message;
        logger.error(`ROLLBACK test failed for ${tableName}:`, error.message);
      }

    } catch (error) {
      logger.error(`Transaction verification failed for ${tableName}:`, error.message);
      results.error = error.message;
    }

    return results;
  }

  /**
   * Closes the database connection pool
   * @returns {Promise<void>}
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Database connection pool closed');
    }
  }
}

module.exports = DatabaseVerifier;
