const BaseService = require('../../../shared/base/BaseService');
const { ValidationError, NotFoundError } = require('../../../core/errors');

/**
 * Project Service
 * Handles business logic for project operations
 */
class ProjectService extends BaseService {
  /**
   * @param {ProjectRepository} projectRepository
   * @param {ClientRepository} clientRepository - Optional, for validating client relationships
   */
  constructor(projectRepository, clientRepository = null) {
    super(projectRepository);
    this.clientRepository = clientRepository;
  }

  /**
   * Get all projects for a user
   * @param {number} userId - User ID
   * @param {Object} filters - Filters (clientId, status)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of projects
   */
  async getAllForUser(userId, filters = {}, options = {}) {
    return await this.repository.findByUserId(userId, filters, options);
  }

  /**
   * Get a project by ID for a specific user
   * @param {number} id - Project ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Project
   * @throws {NotFoundError} If project not found or doesn't belong to user
   */
  async getByIdForUser(id, userId) {
    const project = await this.repository.findByIdAndUserId(id, userId);
    if (!project) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }
    return project;
  }

  /**
   * Get all projects for a specific client
   * @param {number} clientId - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of projects
   */
  async getByClientId(clientId, userId) {
    return await this.repository.findByClientId(clientId, userId);
  }

  /**
   * Get projects by status
   * @param {string} status - Project status
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of projects
   */
  async getByStatus(status, userId) {
    return await this.repository.findByStatus(status, userId);
  }

  /**
   * Get overdue projects
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of overdue projects
   */
  async getOverdue(userId) {
    return await this.repository.findOverdue(userId);
  }

  /**
   * Create a new project
   * @param {Object} data - Project data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created project
   */
  async createForUser(data, userId) {
    // Add user ID to data
    const projectData = {
      ...data,
      user_id: userId
    };

    // Validate
    await this.validateCreate(projectData);

    return await this.repository.create(projectData);
  }

  /**
   * Update a project
   * @param {number} id - Project ID
   * @param {Object} data - Updated data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated project
   * @throws {NotFoundError} If project not found or doesn't belong to user
   */
  async updateForUser(id, data, userId) {
    // Check if project exists and belongs to user
    const existingProject = await this.repository.findByIdAndUserId(id, userId);
    if (!existingProject) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }

    // Validate
    await this.validateUpdate(id, data);

    return await this.repository.update(id, data);
  }

  /**
   * Delete a project
   * @param {number} id - Project ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If project not found or doesn't belong to user
   */
  async deleteForUser(id, userId) {
    // Check if project exists and belongs to user
    const existingProject = await this.repository.findByIdAndUserId(id, userId);
    if (!existingProject) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }

    // Validate before delete
    await this.validateDelete(id);

    return await this.repository.delete(id);
  }

  /**
   * Get project statistics by status
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Status counts
   */
  async getStatusCounts(userId) {
    return await this.repository.countByStatus(userId);
  }

  /**
   * Search projects
   * @param {string} searchTerm - Search term
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of matching projects
   */
  async search(searchTerm, userId) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term is required');
    }
    return await this.repository.search(searchTerm, userId);
  }

  /**
   * Validate project data before creation
   * @param {Object} data - Project data
   * @throws {ValidationError} If validation fails
   */
  async validateCreate(data) {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }

    if (data.name.length > 255) {
      throw new ValidationError('Project name must be 255 characters or less');
    }

    const validStatuses = ['active', 'completed', 'on-hold', 'cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate dates
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (isNaN(startDate.getTime())) {
        throw new ValidationError('Invalid start date format');
      }
      
      if (isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid end date format');
      }
      
      if (startDate > endDate) {
        throw new ValidationError('Start date must be before or equal to end date');
      }
    }

    // Validate client exists if clientRepository is available
    if (data.client_id && this.clientRepository) {
      const clientExists = await this.clientRepository.exists(data.client_id);
      if (!clientExists) {
        throw new ValidationError(`Client with ID ${data.client_id} not found`);
      }
    }
  }

  /**
   * Validate project data before update
   * @param {number} id - Project ID
   * @param {Object} data - Updated data
   * @throws {ValidationError} If validation fails
   */
  async validateUpdate(id, data) {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('Project name cannot be empty');
      }

      if (data.name.length > 255) {
        throw new ValidationError('Project name must be 255 characters or less');
      }
    }

    if (data.status) {
      const validStatuses = ['active', 'completed', 'on-hold', 'cancelled'];
      if (!validStatuses.includes(data.status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate dates if both are provided
    if (data.start_date !== undefined && data.end_date !== undefined) {
      if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        
        if (isNaN(startDate.getTime())) {
          throw new ValidationError('Invalid start date format');
        }
        
        if (isNaN(endDate.getTime())) {
          throw new ValidationError('Invalid end date format');
        }
        
        if (startDate > endDate) {
          throw new ValidationError('Start date must be before or equal to end date');
        }
      }
    }

    // Validate client exists if clientRepository is available
    if (data.client_id && this.clientRepository) {
      const clientExists = await this.clientRepository.exists(data.client_id);
      if (!clientExists) {
        throw new ValidationError(`Client with ID ${data.client_id} not found`);
      }
    }
  }

  /**
   * Validate before deleting a project
   * @param {number} id - Project ID
   * @throws {ValidationError} If validation fails
   */
  async validateDelete(id) {
    // Could add logic here to check if project has tasks
    // and prevent deletion or cascade delete
    // For now, we'll allow deletion
  }
}

module.exports = ProjectService;
