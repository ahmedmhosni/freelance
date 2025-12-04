/**
 * Base Service Class
 * Provides common business logic patterns for all services
 */
class BaseService {
  constructor(repository) {
    if (!repository) {
      throw new Error('Repository instance is required');
    }
    this.repository = repository;
  }

  /**
   * Get a record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<Object>} Record
   * @throws {Error} If record not found
   */
  async getById(id) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new Error(`Record with ID ${id} not found`);
    }
    return record;
  }

  /**
   * Get all records with optional filtering and pagination
   * @param {Object} filters - Filter conditions
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  async getAll(filters = {}, options = {}) {
    return await this.repository.findAll(filters, options);
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    // Validate before create (override in subclass)
    await this.validateCreate(data);
    
    return await this.repository.create(data);
  }

  /**
   * Update a record by ID
   * @param {number|string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   * @throws {Error} If record not found
   */
  async update(id, data) {
    // Validate before update (override in subclass)
    await this.validateUpdate(id, data);
    
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new Error(`Record with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Delete a record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {Error} If record not found
   */
  async delete(id) {
    // Validate before delete (override in subclass)
    await this.validateDelete(id);
    
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Record with ID ${id} not found`);
    }
    return true;
  }

  /**
   * Count records with optional filtering
   * @param {Object} filters - Filter conditions
   * @returns {Promise<number>} Count of records
   */
  async count(filters = {}) {
    return await this.repository.count(filters);
  }

  /**
   * Check if a record exists by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    return await this.repository.exists(id);
  }

  /**
   * Validation hook for create operations
   * Override in subclass to add custom validation
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  async validateCreate(data) {
    // Override in subclass
  }

  /**
   * Validation hook for update operations
   * Override in subclass to add custom validation
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  async validateUpdate(id, data) {
    // Override in subclass
  }

  /**
   * Validation hook for delete operations
   * Override in subclass to add custom validation
   * @param {number|string} id - Record ID
   * @throws {Error} If validation fails
   */
  async validateDelete(id) {
    // Override in subclass
  }
}

module.exports = BaseService;
