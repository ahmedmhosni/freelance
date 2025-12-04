const BaseRepository = require('../../../shared/base/BaseRepository');
const Client = require('../models/Client');

/**
 * Client Repository
 * Handles all database operations for clients
 */
class ClientRepository extends BaseRepository {
  constructor(database) {
    super(database, 'clients');
  }

  /**
   * Find client by ID and user ID
   * @param {number} id - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<Client|null>}
   */
  async findByIdAndUserId(id, userId) {
    const row = await this.db.queryOne(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return Client.fromDatabase(row);
  }

  /**
   * Find all clients for a user
   * @param {number} userId - User ID
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array<Client>>}
   */
  async findByUserId(userId, options = {}) {
    const { limit, offset, orderBy = 'created_at DESC' } = options;
    
    let query = `SELECT * FROM ${this.tableName} WHERE user_id = $1 ORDER BY ${orderBy}`;
    const params = [userId];

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    const rows = await this.db.queryMany(query, params);
    return Client.fromDatabaseArray(rows);
  }

  /**
   * Search clients by name, email, or company
   * @param {number} userId - User ID
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array<Client>>}
   */
  async search(userId, searchTerm, options = {}) {
    const { limit, offset, orderBy = 'created_at DESC' } = options;
    const searchPattern = `%${searchTerm}%`;

    let query = `
      SELECT * FROM ${this.tableName} 
      WHERE user_id = $1 
      AND (name ILIKE $2 OR email ILIKE $2 OR company ILIKE $2)
      ORDER BY ${orderBy}
    `;
    const params = [userId, searchPattern];

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    const rows = await this.db.queryMany(query, params);
    return Client.fromDatabaseArray(rows);
  }

  /**
   * Count clients for a user
   * @param {number} userId - User ID
   * @param {string} searchTerm - Optional search term
   * @returns {Promise<number>}
   */
  async countByUserId(userId, searchTerm = null) {
    let query = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE user_id = $1`;
    const params = [userId];

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query += ' AND (name ILIKE $2 OR email ILIKE $2 OR company ILIKE $2)';
      params.push(searchPattern);
    }

    const result = await this.db.queryOne(query, params);
    return parseInt(result.total);
  }

  /**
   * Create a new client
   * @param {Object} clientData - Client data
   * @returns {Promise<Client>}
   */
  async create(clientData) {
    const row = await this.db.queryOne(
      `INSERT INTO ${this.tableName} 
       (user_id, name, email, phone, company, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        clientData.userId,
        clientData.name,
        clientData.email || null,
        clientData.phone || null,
        clientData.company || null,
        clientData.notes || null
      ]
    );
    return Client.fromDatabase(row);
  }

  /**
   * Update a client
   * @param {number} id - Client ID
   * @param {number} userId - User ID
   * @param {Object} clientData - Client data to update
   * @returns {Promise<Client|null>}
   */
  async update(id, userId, clientData) {
    const row = await this.db.queryOne(
      `UPDATE ${this.tableName} 
       SET name = $1, email = $2, phone = $3, company = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        clientData.name,
        clientData.email || null,
        clientData.phone || null,
        clientData.company || null,
        clientData.notes || null,
        id,
        userId
      ]
    );
    return Client.fromDatabase(row);
  }

  /**
   * Delete a client
   * @param {number} id - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id, userId) {
    const rowCount = await this.db.execute(
      `DELETE FROM ${this.tableName} WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rowCount > 0;
  }

  /**
   * Check if client exists for user
   * @param {number} id - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>}
   */
  async existsForUser(id, userId) {
    const result = await this.db.queryOne(
      `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = $1 AND user_id = $2) as exists`,
      [id, userId]
    );
    return result.exists;
  }

  /**
   * Find client by email for user
   * @param {string} email - Email address
   * @param {number} userId - User ID
   * @returns {Promise<Client|null>}
   */
  async findByEmail(email, userId) {
    const row = await this.db.queryOne(
      `SELECT * FROM ${this.tableName} WHERE email = $1 AND user_id = $2`,
      [email, userId]
    );
    return Client.fromDatabase(row);
  }
}

module.exports = ClientRepository;
