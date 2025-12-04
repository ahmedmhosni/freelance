/**
 * Notification Repository
 * Handles data access for notifications
 */
class NotificationRepository {
  constructor(database) {
    this.db = database;
  }

  /**
   * Get upcoming tasks (due within specified days)
   * @param {number} userId - User ID
   * @param {number} daysAhead - Number of days to look ahead
   * @returns {Promise<Array>}
   */
  async getUpcomingTasks(userId, daysAhead = 7) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
        AND status != $2 
        AND due_date <= CURRENT_DATE + INTERVAL '${daysAhead} days'
      ORDER BY due_date ASC
    `;
    return await this.db.queryMany(query, [userId, 'done']);
  }

  /**
   * Get overdue invoices
   * @param {number} userId - User ID
   * @returns {Promise<Array>}
   */
  async getOverdueInvoices(userId) {
    const query = `
      SELECT * FROM invoices 
      WHERE user_id = $1 
        AND status = $2 
        AND due_date < CURRENT_DATE
      ORDER BY due_date ASC
    `;
    return await this.db.queryMany(query, [userId, 'sent']);
  }

  /**
   * Get overdue tasks
   * @param {number} userId - User ID
   * @returns {Promise<Array>}
   */
  async getOverdueTasks(userId) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
        AND status NOT IN ($2, $3)
        AND due_date < CURRENT_DATE
      ORDER BY due_date ASC
    `;
    return await this.db.queryMany(query, [userId, 'done', 'completed']);
  }

  /**
   * Get pending invoices (sent but not paid)
   * @param {number} userId - User ID
   * @returns {Promise<Array>}
   */
  async getPendingInvoices(userId) {
    const query = `
      SELECT * FROM invoices 
      WHERE user_id = $1 
        AND status = $2
      ORDER BY due_date ASC
    `;
    return await this.db.queryMany(query, [userId, 'sent']);
  }
}

module.exports = NotificationRepository;
