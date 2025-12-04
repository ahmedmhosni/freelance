const UserStats = require('../models/UserStats');
const { NotFoundError, ForbiddenError } = require('../../../core/errors');

/**
 * Admin Service
 * Handles administrative operations
 */
class AdminService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Get all users
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    const users = await this.db.queryMany(`
      SELECT 
        id, name, email, role, email_verified, created_at,
        last_login_at, last_activity_at, login_count, last_login_ip
      FROM users 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    return users;
  }

  /**
   * Get user by ID with statistics
   * @param {number} userId - User ID
   * @returns {Promise<{user: Object, stats: UserStats}>}
   */
  async getUserWithStats(userId) {
    // Get user
    const user = await this.db.queryOne(
      'SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get stats
    const statsData = await this.db.queryOne(`
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE user_id = $1) as clients_count,
        (SELECT COUNT(*) FROM projects WHERE user_id = $1) as projects_count,
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1) as tasks_count,
        (SELECT COUNT(*) FROM invoices WHERE user_id = $1) as invoices_count
    `, [userId]);

    const stats = new UserStats({
      userId,
      clients_count: parseInt(statsData.clients_count),
      projects_count: parseInt(statsData.projects_count),
      tasks_count: parseInt(statsData.tasks_count),
      invoices_count: parseInt(statsData.invoices_count)
    });

    return { user, stats };
  }

  /**
   * Update user role
   * @param {number} userId - User ID
   * @param {string} role - New role
   * @returns {Promise<void>}
   */
  async updateUserRole(userId, role) {
    const validRoles = ['freelancer', 'admin', 'client'];
    if (!validRoles.includes(role)) {
      throw new ForbiddenError('Invalid role');
    }

    await this.db.execute(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, userId]
    );
  }

  /**
   * Update user verification status
   * @param {number} userId - User ID
   * @param {boolean} emailVerified - Verification status
   * @returns {Promise<void>}
   */
  async updateUserVerification(userId, emailVerified) {
    await this.db.execute(
      'UPDATE users SET email_verified = $1 WHERE id = $2',
      [emailVerified, userId]
    );
  }

  /**
   * Delete user (soft delete)
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    await this.db.execute(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>}
   */
  async getSystemStats() {
    const stats = await this.db.queryOne(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM users WHERE email_verified = true AND deleted_at IS NULL) as verified_users,
        (SELECT COUNT(*) FROM clients) as total_clients,
        (SELECT COUNT(*) FROM projects) as total_projects,
        (SELECT COUNT(*) FROM tasks) as total_tasks,
        (SELECT COUNT(*) FROM invoices) as total_invoices,
        (SELECT COUNT(*) FROM time_entries) as total_time_entries
    `);

    return {
      users: {
        total: parseInt(stats.total_users),
        verified: parseInt(stats.verified_users)
      },
      clients: parseInt(stats.total_clients),
      projects: parseInt(stats.total_projects),
      tasks: parseInt(stats.total_tasks),
      invoices: parseInt(stats.total_invoices),
      timeEntries: parseInt(stats.total_time_entries)
    };
  }
}

module.exports = AdminService;
