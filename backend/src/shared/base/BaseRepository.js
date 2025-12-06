/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 */
class BaseRepository {
  constructor(database, tableName) {
    if (!database) {
      throw new Error('Database instance is required');
    }
    if (!tableName) {
      throw new Error('Table name is required');
    }

    this.db = database;
    this.tableName = tableName;
  }

  /**
   * Convert camelCase to snake_case
   * @param {string} str - camelCase string
   * @returns {string} snake_case string
   */
  toSnakeCase(str) {
    // If already in snake_case (no uppercase letters), return as is
    if (!/[A-Z]/.test(str)) {
      return str;
    }
    // Convert camelCase to snake_case
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Find a record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<Object|null>} Record or null if not found
   */
  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    return await this.db.queryOne(sql, [id]);
  }

  /**
   * Find all records with optional filtering and pagination
   * @param {Object} filters - Filter conditions
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} Array of records
   */
  async findAll(filters = {}, options = {}) {
    const { limit, offset, orderBy = 'id', order = 'ASC' } = options;
    
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];
    const whereClauses = [];

    // Build WHERE clause from filters
    let paramIndex = 1;
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        whereClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Add ORDER BY
    sql += ` ORDER BY ${orderBy} ${order}`;

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

    return await this.db.queryMany(sql, params);
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    // Convert all keys to snake_case and deduplicate
    const snakeCaseData = {};
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = this.toSnakeCase(key);
      // Only set if not already set (prefer first occurrence)
      if (!(snakeKey in snakeCaseData)) {
        snakeCaseData[snakeKey] = value;
      }
    }
    
    const keys = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
    
    const columns = keys.join(', ');
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    return await this.db.queryOne(sql, values);
  }

  /**
   * Update a record by ID
   * @param {number|string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object|null>} Updated record or null if not found
   */
  async update(id, data) {
    // Convert all keys to snake_case and deduplicate
    const snakeCaseData = {};
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = this.toSnakeCase(key);
      // Only set if not already set (prefer first occurrence)
      if (!(snakeKey in snakeCaseData)) {
        snakeCaseData[snakeKey] = value;
      }
    }
    
    const keys = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
    
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    
    const sql = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    return await this.db.queryOne(sql, [id, ...values]);
  }

  /**
   * Delete a record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const rowCount = await this.db.execute(sql, [id]);
    return rowCount > 0;
  }

  /**
   * Count records with optional filtering
   * @param {Object} filters - Filter conditions
   * @returns {Promise<number>} Count of records
   */
  async count(filters = {}) {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];
    const whereClauses = [];

    // Build WHERE clause from filters
    let paramIndex = 1;
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        whereClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const result = await this.db.queryOne(sql, params);
    return parseInt(result.count, 10);
  }

  /**
   * Check if a record exists by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    const sql = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = $1) as exists`;
    const result = await this.db.queryOne(sql, [id]);
    return result.exists;
  }

  /**
   * Execute a custom query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(sql, params = []) {
    return await this.db.queryMany(sql, params);
  }

  /**
   * Execute a custom query and return single result
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>} Single result or null
   */
  async queryOne(sql, params = []) {
    return await this.db.queryOne(sql, params);
  }
}

module.exports = BaseRepository;
