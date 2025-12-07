const BaseRepository = require('../../../shared/base/BaseRepository');
const DataExportRequest = require('../models/DataExportRequest');

/**
 * GDPR Repository
 * Handles data access for GDPR operations
 */
class GDPRRepository extends BaseRepository {
  constructor(database) {
    super(database, 'data_export_requests');
  }

  /**
   * Create data export request
   */
  async createExportRequest(userId) {
    const sql = `
      INSERT INTO data_export_requests (user_id, status, created_at)
      VALUES ($1, 'pending', NOW())
      RETURNING *
    `;
    
    const result = await this.db.queryOne(sql, [userId]);
    return new DataExportRequest(result);
  }

  /**
   * Get export requests for user
   */
  async getExportRequestsByUserId(userId) {
    const sql = `
      SELECT * FROM data_export_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const results = await this.db.queryMany(sql, [userId]);
    return results.map(r => new DataExportRequest(r));
  }

  /**
   * Check recent export requests (rate limiting)
   */
  async getRecentExportRequest(userId, hoursAgo = 24) {
    const sql = `
      SELECT * FROM data_export_requests
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '${hoursAgo} hours'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await this.db.queryOne(sql, [userId]);
    return result ? new DataExportRequest(result) : null;
  }

  /**
   * Get all user data for export
   */
  async getUserData(userId) {
    const data = {};

    // User profile
    const userSql = `SELECT * FROM users WHERE id = $1`;
    data.profile = await this.db.queryOne(userSql, [userId]);

    // Clients
    const clientsSql = `SELECT * FROM clients WHERE user_id = $1`;
    data.clients = await this.db.queryMany(clientsSql, [userId]);

    // Projects
    const projectsSql = `SELECT * FROM projects WHERE user_id = $1`;
    data.projects = await this.db.queryMany(projectsSql, [userId]);

    // Tasks
    const tasksSql = `SELECT * FROM tasks WHERE user_id = $1`;
    data.tasks = await this.db.queryMany(tasksSql, [userId]);

    // Invoices
    const invoicesSql = `SELECT * FROM invoices WHERE user_id = $1`;
    data.invoices = await this.db.queryMany(invoicesSql, [userId]);

    // Time entries
    const timeEntriesSql = `SELECT * FROM time_entries WHERE user_id = $1`;
    data.time_entries = await this.db.queryMany(timeEntriesSql, [userId]);

    // Preferences
    const prefsSql = `SELECT * FROM user_preferences WHERE user_id = $1`;
    data.preferences = await this.db.queryOne(prefsSql, [userId]);

    return data;
  }

  /**
   * Delete all user data (GDPR right to be forgotten)
   */
  async deleteUserData(userId) {
    await this.db.transaction(async (client) => {
      // Delete in correct order (respecting foreign keys)
      await client.execute('DELETE FROM time_entries WHERE user_id = $1', [userId]);
      await client.execute('DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = $1)', [userId]);
      await client.execute('DELETE FROM invoices WHERE user_id = $1', [userId]);
      await client.execute('DELETE FROM tasks WHERE user_id = $1', [userId]);
      await client.execute('DELETE FROM projects WHERE user_id = $1', [userId]);
      await client.execute('DELETE FROM clients WHERE user_id = $1', [userId]);
      await client.execute('DELETE FROM notifications WHERE user_id = $1', [userId]);
      await client.execute('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
      await client.execute('DELETE FROM data_export_requests WHERE user_id = $1', [userId]);
      await client.execute('DELETE FROM users WHERE id = $1', [userId]);
    });
  }
}

module.exports = GDPRRepository;
