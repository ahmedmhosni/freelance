/**
 * Client Domain Model
 * Represents a client entity with business logic
 */
class Client {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.name = data.name;
    this.email = data.email || null;
    this.phone = data.phone || null;
    this.company = data.company || null;
    this.notes = data.notes || null;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Validate client data
   * @returns {boolean} True if valid
   */
  isValid() {
    return this.name && this.name.trim().length > 0;
  }

  /**
   * Check if client has contact information
   * @returns {boolean}
   */
  hasContactInfo() {
    return !!(this.email || this.phone);
  }

  /**
   * Get display name (company name if available, otherwise client name)
   * @returns {string}
   */
  getDisplayName() {
    return this.company || this.name;
  }

  /**
   * Convert to JSON representation
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convert to database format (snake_case)
   * @returns {Object}
   */
  toDatabase() {
    return {
      id: this.id,
      user_id: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      notes: this.notes,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Create Client from database row
   * @param {Object} row - Database row
   * @returns {Client}
   */
  static fromDatabase(row) {
    if (!row) return null;
    return new Client(row);
  }

  /**
   * Create multiple Clients from database rows
   * @param {Array} rows - Database rows
   * @returns {Array<Client>}
   */
  static fromDatabaseArray(rows) {
    return rows.map(row => Client.fromDatabase(row));
  }
}

module.exports = Client;
