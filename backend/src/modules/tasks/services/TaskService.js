const BaseService = require('../../../shared/base/BaseService');
const { ValidationError, NotFoundError } = require('../../../core/errors');

/**
 * Task Service
 * Handles business logic for task operations
 */
class TaskService extends BaseService {
  /**
   * @param {TaskRepository} taskRepository
   * @param {ProjectRepository} projectRepository - Optional, for validating project relationships
   */
  constructor(taskRepository, projectRepository = null) {
    super(taskRepository);
    this.projectRepository = projectRepository;
  }

  /**
   * Get all tasks for a user
   * @param {number} userId - User ID
   * @param {Object} filters - Filters (projectId, status, priority, clientId)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of tasks
   */
  async getAllForUser(userId, filters = {}, options = {}) {
    return await this.repository.findByUserId(userId, filters, options);
  }

  /**
   * Get a task by ID for a specific user
   * @param {number} id - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Task
   * @throws {NotFoundError} If task not found or doesn't belong to user
   */
  async getByIdForUser(id, userId) {
    const task = await this.repository.findByIdAndUserId(id, userId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }
    return task;
  }

  /**
   * Get all tasks for a specific project
   * @param {number} projectId - Project ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getByProjectId(projectId, userId) {
    return await this.repository.findByProjectId(projectId, userId);
  }

  /**
   * Get tasks by status
   * @param {string} status - Task status
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getByStatus(status, userId) {
    return await this.repository.findByStatus(status, userId);
  }

  /**
   * Get tasks by priority
   * @param {string} priority - Task priority
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getByPriority(priority, userId) {
    return await this.repository.findByPriority(priority, userId);
  }

  /**
   * Get overdue tasks
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of overdue tasks
   */
  async getOverdue(userId) {
    return await this.repository.findOverdue(userId);
  }

  /**
   * Get tasks due soon
   * @param {number} userId - User ID
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Array>} Array of tasks due soon
   */
  async getDueSoon(userId, days = 7) {
    return await this.repository.findDueSoon(userId, days);
  }

  /**
   * Create a new task
   * @param {Object} data - Task data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created task
   */
  async createForUser(data, userId) {
    // Add user ID to data
    const taskData = {
      ...data,
      user_id: userId
    };

    // Validate
    await this.validateCreate(taskData);

    return await this.repository.create(taskData);
  }

  /**
   * Update a task
   * @param {number} id - Task ID
   * @param {Object} data - Updated data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated task
   * @throws {NotFoundError} If task not found or doesn't belong to user
   */
  async updateForUser(id, data, userId) {
    // Check if task exists and belongs to user
    const existingTask = await this.repository.findByIdAndUserId(id, userId);
    if (!existingTask) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    // Validate status transition if status is being changed
    if (data.status && data.status !== existingTask.status) {
      if (!existingTask.canTransitionTo(data.status)) {
        throw new ValidationError(`Cannot transition from ${existingTask.status} to ${data.status}`);
      }
    }

    // Validate
    await this.validateUpdate(id, data);

    return await this.repository.update(id, data);
  }

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If task not found or doesn't belong to user
   */
  async deleteForUser(id, userId) {
    // Check if task exists and belongs to user
    const existingTask = await this.repository.findByIdAndUserId(id, userId);
    if (!existingTask) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    // Validate before delete
    await this.validateDelete(id);

    return await this.repository.delete(id);
  }

  /**
   * Get task statistics by status
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Status counts
   */
  async getStatusCounts(userId) {
    return await this.repository.countByStatus(userId);
  }

  /**
   * Get task statistics by priority
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Priority counts
   */
  async getPriorityCounts(userId) {
    return await this.repository.countByPriority(userId);
  }

  /**
   * Search tasks
   * @param {string} searchTerm - Search term
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of matching tasks
   */
  async search(searchTerm, userId) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term is required');
    }
    return await this.repository.search(searchTerm, userId);
  }

  /**
   * Validate task data before creation
   * @param {Object} data - Task data
   * @throws {ValidationError} If validation fails
   */
  async validateCreate(data) {
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Task title is required');
    }

    if (data.title.length > 255) {
      throw new ValidationError('Task title must be 255 characters or less');
    }

    const validStatuses = ['pending', 'in-progress', 'done', 'completed', 'cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      throw new ValidationError(`Priority must be one of: ${validPriorities.join(', ')}`);
    }

    // Validate due date
    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate.getTime())) {
        throw new ValidationError('Invalid due date format');
      }
    }

    // Validate project exists if projectRepository is available
    if (data.project_id && this.projectRepository) {
      const projectExists = await this.projectRepository.exists(data.project_id);
      if (!projectExists) {
        throw new ValidationError(`Project with ID ${data.project_id} not found`);
      }
    }
  }

  /**
   * Validate task data before update
   * @param {number} id - Task ID
   * @param {Object} data - Updated data
   * @throws {ValidationError} If validation fails
   */
  async validateUpdate(id, data) {
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new ValidationError('Task title cannot be empty');
      }

      if (data.title.length > 255) {
        throw new ValidationError('Task title must be 255 characters or less');
      }
    }

    if (data.status) {
      const validStatuses = ['pending', 'in-progress', 'done', 'completed', 'cancelled'];
      if (!validStatuses.includes(data.status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    if (data.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(data.priority)) {
        throw new ValidationError(`Priority must be one of: ${validPriorities.join(', ')}`);
      }
    }

    // Validate due date
    if (data.due_date !== undefined && data.due_date) {
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate.getTime())) {
        throw new ValidationError('Invalid due date format');
      }
    }

    // Validate project exists if projectRepository is available
    if (data.project_id && this.projectRepository) {
      const projectExists = await this.projectRepository.exists(data.project_id);
      if (!projectExists) {
        throw new ValidationError(`Project with ID ${data.project_id} not found`);
      }
    }
  }

  /**
   * Validate before deleting a task
   * @param {number} id - Task ID
   * @throws {ValidationError} If validation fails
   */
  async validateDelete(id) {
    // Could add logic here to check if task has time entries
    // and prevent deletion or cascade delete
    // For now, we'll allow deletion
  }
}

module.exports = TaskService;
