const BaseRepository = require('../../../shared/base/BaseRepository');
const Task = require('../models/Task');

/**
 * Task Repository
 * Handles all data access operations for tasks
 */
class TaskRepository extends BaseRepository {
  constructor(database) {
    super(database, 'tasks');
  }

  /**
   * Find all tasks for a specific user
   * @param {number} userId - User ID
   * @param {Object} filters - Additional filters (projectId, status, priority, clientId)
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array<Task>>} Array of Task instances
   */
  async findByUserId(userId, filters = {}, options = {}) {
    const { projectId, status, priority, clientId } = filters;
    const { limit, offset, orderBy = 'due_date', order = 'ASC' } = options;
    
    let sql = `
      SELECT t.*, p.name as project_name, p.client_id
      FROM ${this.tableName} t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    // Add project filter
    if (projectId) {
      sql += ` AND t.project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }
    
    // Add status filter
    if (status) {
      sql += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Add priority filter
    if (priority) {
      sql += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    // Add client filter
    if (clientId) {
      sql += ` AND p.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }
    
    // Add ordering
    sql += ` ORDER BY t.${orderBy} ${order}`;
    
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
    return rows.map(row => new Task(row));
  }

  /**
   * Find a task by ID and user ID (for authorization)
   * @param {number} id - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Task|null>} Task instance or null
   */
  async findByIdAndUserId(id, userId) {
    const sql = `
      SELECT t.*, p.name as project_name, p.client_id
      FROM ${this.tableName} t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1 AND t.user_id = $2
    `;
    
    const row = await this.db.queryOne(sql, [id, userId]);
    return row ? new Task(row) : null;
  }

  /**
   * Find all tasks for a specific project
   * @param {number} projectId - Project ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Array<Task>>} Array of Task instances
   */
  async findByProjectId(projectId, userId) {
    const sql = `
      SELECT t.*, p.name as project_name, p.client_id
      FROM ${this.tableName} t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.project_id = $1 AND t.user_id = $2
      ORDER BY t.due_date ASC
    `;
    
    const rows = await this.db.queryMany(sql, [projectId, userId]);
    return rows.map(row => new Task(row));
  }

  /**
   * Find tasks by status
   * @param {string} status - Task status
   * @param {number} userId - User ID
   * @returns {Promise<Array<Task>>} Array of Task instances
   */
  async findByStatus(status, userId) {
    const sql = `
      SELECT t.*, p.name as project_name, p.client_id
      FROM ${this.tableName} t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.status = $1 AND t.user_id = $2
      ORDER BY t.due_date ASC
    `;
    
    const rows = await this.db.queryMany(sql, [status, userId]);
    return rows.map(row => new Task(row));
  }

  /**
   * Find tasks by priority
   * @param {string} priority - Task priority
   * @param {number} userId - User ID
   * @returns {Promise<Array<Task>>} Array of Task instances
   */
  async findByPriority(priority, userId) {
    const sql = `
      SELECT t.*, p.name as project_name, p.client_id
      FROM ${this.tableName} t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.priority = $1 AND t.user_id = $2
      ORDER BY t.due_date ASC
    `;
    
    const rows = await this.db.queryMany(sql, [priority, userId]);
    return rows.map(row => new Task(row));
  }

  /**
   * Find overdue tasks (due date in past and not completed)
   * @param {number} userId - User ID
   * @returns {Promise<Array<Task>>} Array of overdue Task instances
   */
  async findOverdue(userId) {
    const sql = `
      SELECT t.*, p.name as project_name, p.client_id
      FROM ${this.tableName} t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = $1 
        AND t.due_date < NOW()
        AND t.status NOT IN ('done', 'completed', 'cancelled')
      ORDER BY t.due_date ASC
    `;
    
    const rows = await this.db.queryMany(sql, [userId]);
    return rows.map(row => new Task(row));
  }

  /**
   * Find tasks due soon (within specified days)
   * @param {number} userId - User ID
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Array<Task>>} Array of Task instances
   */
  async findDueSoon(userId, days = 7) {
    const sql = `
      SELECT t.*, p.name as project_name, p.client_id
      FROM ${this.tableName} t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = $1 
        AND t.due_date BETWEEN NOW() AND NOW() + INTERVAL '${days} days'
        AND t.status NOT IN ('done', 'completed', 'cancelled')
      ORDER BY t.due_date ASC
    `;
    
    const rows = await this.db.queryMany(sql, [userId]);
    return rows.map(row => new Task(row));
  }

  /**
   * Create a new task
   * @param {Object} data - Task data
   * @returns {Promise<Task>} Created Task instance
   */
  async create(data) {
    const row = await super.create(data);
    return new Task(row);
  }

  /**
   * Update a task
   * @param {number} id - Task ID
   * @param {Object} data - Updated data
   * @returns {Promise<Task|null>} Updated Task instance or null
   */
  async update(id, data) {
    // Add updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date()
    };
    
    const row = await super.update(id, updateData);
    return row ? new Task(row) : null;
  }

  /**
   * Count tasks by status for a user
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
      pending: 0,
      'in-progress': 0,
      done: 0,
      completed: 0,
      cancelled: 0
    };
    
    rows.forEach(row => {
      counts[row.status] = parseInt(row.count, 10);
    });
    
    return counts;
  }

  /**
   * Count tasks by priority for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Object with counts by priority
   */
  async countByPriority(userId) {
    const sql = `
      SELECT 
        priority,
        COUNT(*) as count
      FROM ${this.tableName}
      WHERE user_id = $1
      GROUP BY priority
    `;
    
    const rows = await this.db.queryMany(sql, [userId]);
    
    // Convert to object format
    const counts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };
    
    rows.forEach(row => {
      counts[row.priority] = parseInt(row.count, 10);
    });
    
    return counts;
  }

  /**
   * Search tasks by title or description
   * @param {string} searchTerm - Search term
   * @param {number} userId - User ID
   * @returns {Promise<Array<Task>>} Array of matching Task instances
   */
  async search(searchTerm, userId) {
    const sql = `
      SELECT t.*, p.name as project_name, p.client_id
      FROM ${this.tableName} t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = $1 
        AND (
          t.title ILIKE $2 
          OR t.description ILIKE $2
        )
      ORDER BY t.due_date ASC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const rows = await this.db.queryMany(sql, [userId, searchPattern]);
    return rows.map(row => new Task(row));
  }
}

module.exports = TaskRepository;
