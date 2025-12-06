const BaseRepository = require('../../../shared/base/BaseRepository');
const TimeEntry = require('../models/TimeEntry');

/**
 * TimeEntry Repository
 * Handles all data access operations for time tracking entries
 */
class TimeEntryRepository extends BaseRepository {
  constructor(database) {
    super(database, 'time_entries');
  }

  /**
   * Find all time entries for a specific user
   * @param {number} userId - User ID
   * @param {Object} filters - Additional filters (taskId, projectId, startDate, endDate)
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array<TimeEntry>>} Array of TimeEntry instances
   */
  async findByUserId(userId, filters = {}, options = {}) {
    const { taskId, projectId, startDate, endDate } = filters;
    const { limit, offset, orderBy = 'start_time', order = 'DESC' } = options;
    
    let sql = `
      SELECT te.*, 
             t.title as task_title,
             p.name as project_name
      FROM ${this.tableName} te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    // Add task filter
    if (taskId) {
      sql += ` AND te.task_id = $${paramIndex}`;
      params.push(taskId);
      paramIndex++;
    }
    
    // Add project filter
    if (projectId) {
      sql += ` AND te.project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }
    
    // Add date range filter
    if (startDate) {
      sql += ` AND te.start_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      sql += ` AND te.start_time <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Add ordering
    sql += ` ORDER BY te.${orderBy} ${order}`;
    
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
    return rows.map(row => new TimeEntry(row));
  }

  /**
   * Find a time entry by ID and user ID (for authorization)
   * @param {number} id - Time entry ID
   * @param {number} userId - User ID
   * @returns {Promise<TimeEntry|null>} TimeEntry instance or null
   */
  async findByIdAndUserId(id, userId) {
    const sql = `
      SELECT te.*, 
             t.title as task_title,
             p.name as project_name
      FROM ${this.tableName} te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.id = $1 AND te.user_id = $2
    `;
    
    const row = await this.db.queryOne(sql, [id, userId]);
    return row ? new TimeEntry(row) : null;
  }

  /**
   * Find all time entries for a specific task
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Array<TimeEntry>>} Array of TimeEntry instances
   */
  async findByTaskId(taskId, userId) {
    const sql = `
      SELECT te.*, 
             t.title as task_title,
             p.name as project_name
      FROM ${this.tableName} te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.task_id = $1 AND te.user_id = $2
      ORDER BY te.start_time DESC
    `;
    
    const rows = await this.db.queryMany(sql, [taskId, userId]);
    return rows.map(row => new TimeEntry(row));
  }

  /**
   * Find time entries within a date range
   * @param {number} userId - User ID
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array<TimeEntry>>} Array of TimeEntry instances
   */
  async findByDateRange(userId, startDate, endDate) {
    const sql = `
      SELECT te.*, 
             t.title as task_title,
             p.name as project_name
      FROM ${this.tableName} te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.user_id = $1 
        AND te.start_time >= $2 
        AND te.start_time <= $3
      ORDER BY te.start_time DESC
    `;
    
    const rows = await this.db.queryMany(sql, [userId, startDate, endDate]);
    return rows.map(row => new TimeEntry(row));
  }

  /**
   * Find currently running timers for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array<TimeEntry>>} Array of running TimeEntry instances
   */
  async findRunningTimers(userId) {
    const sql = `
      SELECT te.*, 
             t.title as task_title,
             p.name as project_name
      FROM ${this.tableName} te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.user_id = $1 
        AND te.end_time IS NULL
      ORDER BY te.start_time DESC
    `;
    
    const rows = await this.db.queryMany(sql, [userId]);
    return rows.map(row => new TimeEntry(row));
  }

  /**
   * Calculate total duration for a user within a date range
   * @param {number} userId - User ID
   * @param {Date|string} startDate - Start date (optional)
   * @param {Date|string} endDate - End date (optional)
   * @returns {Promise<number>} Total duration in minutes
   */
  async calculateTotalDuration(userId, startDate = null, endDate = null) {
    let sql = `
      SELECT COALESCE(SUM(duration), 0) as total_duration
      FROM ${this.tableName}
      WHERE user_id = $1 AND end_time IS NOT NULL
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (startDate) {
      sql += ` AND start_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      sql += ` AND start_time <= $${paramIndex}`;
      params.push(endDate);
    }
    
    const result = await this.db.queryOne(sql, params);
    return parseInt(result.total_duration, 10) || 0;
  }

  /**
   * Calculate total duration by task
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<number>} Total duration in minutes
   */
  async calculateDurationByTask(taskId, userId) {
    const sql = `
      SELECT COALESCE(SUM(duration), 0) as total_duration
      FROM ${this.tableName}
      WHERE task_id = $1 AND user_id = $2 AND end_time IS NOT NULL
    `;
    
    const result = await this.db.queryOne(sql, [taskId, userId]);
    return parseInt(result.total_duration, 10) || 0;
  }

  /**
   * Calculate total duration by project
   * @param {number} projectId - Project ID
   * @param {number} userId - User ID
   * @returns {Promise<number>} Total duration in minutes
   */
  async calculateDurationByProject(projectId, userId) {
    const sql = `
      SELECT COALESCE(SUM(duration), 0) as total_duration
      FROM ${this.tableName}
      WHERE project_id = $1 AND user_id = $2 AND end_time IS NOT NULL
    `;
    
    const result = await this.db.queryOne(sql, [projectId, userId]);
    return parseInt(result.total_duration, 10) || 0;
  }

  /**
   * Get time entries grouped by date
   * @param {number} userId - User ID
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array>} Array of objects with date and total duration
   */
  async getDurationByDate(userId, startDate, endDate) {
    const sql = `
      SELECT 
        DATE(start_time) as date,
        COALESCE(SUM(duration), 0) as total_duration,
        COUNT(*) as entry_count
      FROM ${this.tableName}
      WHERE user_id = $1 
        AND start_time >= $2 
        AND start_time <= $3
        AND end_time IS NOT NULL
      GROUP BY DATE(start_time)
      ORDER BY date DESC
    `;
    
    const rows = await this.db.queryMany(sql, [userId, startDate, endDate]);
    return rows.map(row => ({
      date: row.date,
      totalDuration: parseInt(row.total_duration, 10),
      entryCount: parseInt(row.entry_count, 10)
    }));
  }

  /**
   * Get time entries grouped by task, project, or client
   * @param {number} userId - User ID
   * @param {string} groupBy - Group by field (task, project, client)
   * @param {Date|string} startDate - Start date (optional)
   * @param {Date|string} endDate - End date (optional)
   * @returns {Promise<Array>} Array of grouped time tracking data
   */
  async getGroupedData(userId, groupBy, startDate = null, endDate = null) {
    let selectFields = '';
    let groupFields = '';
    
    if (groupBy === 'task') {
      selectFields = `
        te.task_id,
        t.title as task_title,
        p.name as project_name,
        c.name as client_name,
      `;
      groupFields = 'te.task_id, t.title, p.name, c.name';
    } else if (groupBy === 'project') {
      selectFields = `
        te.project_id,
        p.name as project_name,
        c.name as client_name,
      `;
      groupFields = 'te.project_id, p.name, c.name';
    } else if (groupBy === 'client') {
      selectFields = `
        c.id as client_id,
        c.name as client_name,
      `;
      groupFields = 'c.id, c.name';
    } else {
      throw new Error('group_by must be task, project, or client');
    }
    
    let sql = `
      SELECT 
        ${selectFields}
        COUNT(te.id) as session_count,
        COALESCE(SUM(te.duration), 0) as total_minutes,
        ROUND(COALESCE(SUM(te.duration), 0) / 60.0, 2) as total_hours
      FROM ${this.tableName} te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE te.user_id = $1 AND te.end_time IS NOT NULL
    `;
    
    const params = [userId];
    let paramIndex = 2;

    if (startDate && endDate) {
      sql += ` AND te.start_time::date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    sql += ` GROUP BY ${groupFields} ORDER BY total_minutes DESC`;
    
    const rows = await this.db.queryMany(sql, params);
    return rows;
  }

  /**
   * Create a new time entry
   * @param {Object} data - Time entry data
   * @returns {Promise<TimeEntry>} Created TimeEntry instance
   */
  async create(data) {
    const row = await super.create(data);
    return new TimeEntry(row);
  }

  /**
   * Update a time entry
   * @param {number} id - Time entry ID
   * @param {Object} data - Updated data
   * @returns {Promise<TimeEntry|null>} Updated TimeEntry instance or null
   */
  async update(id, data) {
    // Add updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date()
    };
    
    const row = await super.update(id, updateData);
    return row ? new TimeEntry(row) : null;
  }

  /**
   * Stop a running timer
   * @param {number} id - Time entry ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<TimeEntry|null>} Updated TimeEntry instance or null
   */
  async stopTimer(id, userId) {
    const endTime = new Date();
    
    // Calculate duration using PostgreSQL
    const sql = `
      UPDATE ${this.tableName}
      SET 
        end_time = $1,
        duration = EXTRACT(EPOCH FROM ($1 - start_time)) / 60
      WHERE id = $2 AND user_id = $3 AND end_time IS NULL
      RETURNING *
    `;
    
    const row = await this.db.queryOne(sql, [endTime, id, userId]);
    return row ? new TimeEntry(row) : null;
  }
}

module.exports = TimeEntryRepository;
