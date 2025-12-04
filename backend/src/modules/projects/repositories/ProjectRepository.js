const BaseRepository = require('../../../shared/base/BaseRepository');
const Project = require('../models/Project');

/**
 * Project Repository
 * Handles all data access operations for projects
 */
class ProjectRepository extends BaseRepository {
  constructor(database) {
    super(database, 'projects');
  }

  /**
   * Find all projects for a specific user
   * @param {number} userId - User ID
   * @param {Object} filters - Additional filters (clientId, status)
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array<Project>>} Array of Project instances
   */
  async findByUserId(userId, filters = {}, options = {}) {
    const { clientId, status } = filters;
    const { limit, offset, orderBy = 'created_at', order = 'DESC' } = options;
    
    let sql = `
      SELECT p.*, c.name as client_name
      FROM ${this.tableName} p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    // Add client filter
    if (clientId) {
      sql += ` AND p.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }
    
    // Add status filter
    if (status) {
      sql += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Add ordering
    sql += ` ORDER BY p.${orderBy} ${order}`;
    
    // Add pagination
    if (limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(limit);
      paramIndex++;
    }
    
    if (offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(offset);
    }
    
    const rows = await this.db.queryMany(sql, params);
    return rows.map(row => new Project(row));
  }

  /**
   * Find a project by ID and user ID (for authorization)
   * @param {number} id - Project ID
   * @param {number} userId - User ID
   * @returns {Promise<Project|null>} Project instance or null
   */
  async findByIdAndUserId(id, userId) {
    const sql = `
      SELECT p.*, c.name as client_name
      FROM ${this.tableName} p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = $1 AND p.user_id = $2
    `;
    
    const row = await this.db.queryOne(sql, [id, userId]);
    return row ? new Project(row) : null;
  }

  /**
   * Find all projects for a specific client
   * @param {number} clientId - Client ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Array<Project>>} Array of Project instances
   */
  async findByClientId(clientId, userId) {
    const sql = `
      SELECT p.*, c.name as client_name
      FROM ${this.tableName} p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.client_id = $1 AND p.user_id = $2
      ORDER BY p.created_at DESC
    `;
    
    const rows = await this.db.queryMany(sql, [clientId, userId]);
    return rows.map(row => new Project(row));
  }

  /**
   * Find projects by status
   * @param {string} status - Project status
   * @param {number} userId - User ID
   * @returns {Promise<Array<Project>>} Array of Project instances
   */
  async findByStatus(status, userId) {
    const sql = `
      SELECT p.*, c.name as client_name
      FROM ${this.tableName} p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.status = $1 AND p.user_id = $2
      ORDER BY p.created_at DESC
    `;
    
    const rows = await this.db.queryMany(sql, [status, userId]);
    return rows.map(row => new Project(row));
  }

  /**
   * Find overdue projects (end date in past and not completed)
   * @param {number} userId - User ID
   * @returns {Promise<Array<Project>>} Array of overdue Project instances
   */
  async findOverdue(userId) {
    const sql = `
      SELECT p.*, c.name as client_name
      FROM ${this.tableName} p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.user_id = $1 
        AND p.end_date < NOW()
        AND p.status != 'completed'
      ORDER BY p.end_date ASC
    `;
    
    const rows = await this.db.queryMany(sql, [userId]);
    return rows.map(row => new Project(row));
  }

  /**
   * Create a new project
   * @param {Object} data - Project data
   * @returns {Promise<Project>} Created Project instance
   */
  async create(data) {
    const row = await super.create(data);
    return new Project(row);
  }

  /**
   * Update a project
   * @param {number} id - Project ID
   * @param {Object} data - Updated data
   * @returns {Promise<Project|null>} Updated Project instance or null
   */
  async update(id, data) {
    const row = await super.update(id, data);
    return row ? new Project(row) : null;
  }

  /**
   * Count projects by status for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Object with counts by status
   */
  async countByStatus(userId) {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count
      FROM ${this.tableName}
      WHERE user_id = $1
      GROUP BY status
    `;
    
    const rows = await this.db.queryMany(sql, [userId]);
    
    // Convert to object format
    const counts = {
      active: 0,
      completed: 0,
      'on-hold': 0,
      cancelled: 0
    };
    
    rows.forEach(row => {
      counts[row.status] = parseInt(row.count, 10);
    });
    
    return counts;
  }

  /**
   * Search projects by name or description
   * @param {string} searchTerm - Search term
   * @param {number} userId - User ID
   * @returns {Promise<Array<Project>>} Array of matching Project instances
   */
  async search(searchTerm, userId) {
    const sql = `
      SELECT p.*, c.name as client_name
      FROM ${this.tableName} p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.user_id = $1 
        AND (
          p.name ILIKE $2 
          OR p.description ILIKE $2
        )
      ORDER BY p.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const rows = await this.db.queryMany(sql, [userId, searchPattern]);
    return rows.map(row => new Project(row));
  }
}

module.exports = ProjectRepository;
