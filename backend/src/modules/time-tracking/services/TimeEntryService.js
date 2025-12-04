const BaseService = require('../../../shared/base/BaseService');
const { ValidationError, NotFoundError } = require('../../../core/errors');

/**
 * TimeEntry Service
 * Handles business logic for time tracking operations
 */
class TimeEntryService extends BaseService {
  /**
   * @param {TimeEntryRepository} timeEntryRepository
   * @param {TaskRepository} taskRepository - Optional, for validating task relationships
   */
  constructor(timeEntryRepository, taskRepository = null) {
    super(timeEntryRepository);
    this.taskRepository = taskRepository;
  }

  /**
   * Get all time entries for a user
   * @param {number} userId - User ID
   * @param {Object} filters - Filters (taskId, projectId, startDate, endDate)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of time entries
   */
  async getAllForUser(userId, filters = {}, options = {}) {
    return await this.repository.findByUserId(userId, filters, options);
  }

  /**
   * Get a time entry by ID for a specific user
   * @param {number} id - Time entry ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Time entry
   * @throws {NotFoundError} If time entry not found or doesn't belong to user
   */
  async getByIdForUser(id, userId) {
    const timeEntry = await this.repository.findByIdAndUserId(id, userId);
    if (!timeEntry) {
      throw new NotFoundError(`Time entry with ID ${id} not found`);
    }
    return timeEntry;
  }

  /**
   * Get all time entries for a specific task
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of time entries
   */
  async getByTaskId(taskId, userId) {
    return await this.repository.findByTaskId(taskId, userId);
  }

  /**
   * Get time entries within a date range
   * @param {number} userId - User ID
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array>} Array of time entries
   */
  async getByDateRange(userId, startDate, endDate) {
    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    if (end < start) {
      throw new ValidationError('End date must be after start date');
    }

    return await this.repository.findByDateRange(userId, startDate, endDate);
  }

  /**
   * Get currently running timers for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of running time entries
   */
  async getRunningTimers(userId) {
    return await this.repository.findRunningTimers(userId);
  }

  /**
   * Start a new timer
   * @param {Object} data - Time entry data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created time entry
   */
  async startTimer(data, userId) {
    // Check if there's already a running timer
    const runningTimers = await this.repository.findRunningTimers(userId);
    if (runningTimers.length > 0) {
      throw new ValidationError('You already have a running timer. Please stop it before starting a new one.');
    }

    // Add user ID and start time
    const timeEntryData = {
      ...data,
      user_id: userId,
      start_time: new Date(),
      end_time: null,
      duration: null
    };

    // Validate
    await this.validateCreate(timeEntryData);

    return await this.repository.create(timeEntryData);
  }

  /**
   * Stop a running timer
   * @param {number} id - Time entry ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated time entry
   * @throws {NotFoundError} If time entry not found or doesn't belong to user
   * @throws {ValidationError} If timer is not running
   */
  async stopTimer(id, userId) {
    // Check if time entry exists and belongs to user
    const existingEntry = await this.repository.findByIdAndUserId(id, userId);
    if (!existingEntry) {
      throw new NotFoundError(`Time entry with ID ${id} not found`);
    }

    // Check if timer is running
    if (!existingEntry.isRunning()) {
      throw new ValidationError('Timer is not running');
    }

    // Stop the timer using repository method
    const stoppedEntry = await this.repository.stopTimer(id, userId);
    if (!stoppedEntry) {
      throw new NotFoundError(`Time entry with ID ${id} not found or already stopped`);
    }

    return stoppedEntry;
  }

  /**
   * Create a new time entry (manual entry with start and end time)
   * @param {Object} data - Time entry data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created time entry
   */
  async createForUser(data, userId) {
    // Calculate duration if both start and end times are provided
    let duration = null;
    if (data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      duration = Math.floor((end - start) / 1000 / 60); // Duration in minutes
    }

    // Add user ID and calculated duration
    const timeEntryData = {
      ...data,
      user_id: userId,
      duration
    };

    // Validate
    await this.validateCreate(timeEntryData);

    return await this.repository.create(timeEntryData);
  }

  /**
   * Update a time entry
   * @param {number} id - Time entry ID
   * @param {Object} data - Updated data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated time entry
   * @throws {NotFoundError} If time entry not found or doesn't belong to user
   * @throws {ValidationError} If trying to update a running timer
   */
  async updateForUser(id, data, userId) {
    // Check if time entry exists and belongs to user
    const existingEntry = await this.repository.findByIdAndUserId(id, userId);
    if (!existingEntry) {
      throw new NotFoundError(`Time entry with ID ${id} not found`);
    }

    // Don't allow updating a running timer (except to stop it)
    if (existingEntry.isRunning() && !data.end_time) {
      throw new ValidationError('Cannot update a running timer. Stop it first or provide an end time.');
    }

    // Recalculate duration if start or end time is being updated
    let updateData = { ...data };
    if (data.start_time || data.end_time) {
      const startTime = data.start_time ? new Date(data.start_time) : new Date(existingEntry.startTime);
      const endTime = data.end_time ? new Date(data.end_time) : (existingEntry.endTime ? new Date(existingEntry.endTime) : null);
      
      if (endTime) {
        updateData.duration = Math.floor((endTime - startTime) / 1000 / 60);
      }
    }

    // Validate
    await this.validateUpdate(id, updateData);

    return await this.repository.update(id, updateData);
  }

  /**
   * Delete a time entry
   * @param {number} id - Time entry ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If time entry not found or doesn't belong to user
   */
  async deleteForUser(id, userId) {
    // Check if time entry exists and belongs to user
    const existingEntry = await this.repository.findByIdAndUserId(id, userId);
    if (!existingEntry) {
      throw new NotFoundError(`Time entry with ID ${id} not found`);
    }

    // Validate before delete
    await this.validateDelete(id);

    return await this.repository.delete(id);
  }

  /**
   * Calculate total duration for a user
   * @param {number} userId - User ID
   * @param {Date|string} startDate - Start date (optional)
   * @param {Date|string} endDate - End date (optional)
   * @returns {Promise<Object>} Total duration in minutes and hours
   */
  async getTotalDuration(userId, startDate = null, endDate = null) {
    const totalMinutes = await this.repository.calculateTotalDuration(userId, startDate, endDate);
    return {
      minutes: totalMinutes,
      hours: (totalMinutes / 60).toFixed(2)
    };
  }

  /**
   * Calculate total duration for a task
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Total duration in minutes and hours
   */
  async getDurationByTask(taskId, userId) {
    const totalMinutes = await this.repository.calculateDurationByTask(taskId, userId);
    return {
      minutes: totalMinutes,
      hours: (totalMinutes / 60).toFixed(2)
    };
  }

  /**
   * Calculate total duration for a project
   * @param {number} projectId - Project ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Total duration in minutes and hours
   */
  async getDurationByProject(projectId, userId) {
    const totalMinutes = await this.repository.calculateDurationByProject(projectId, userId);
    return {
      minutes: totalMinutes,
      hours: (totalMinutes / 60).toFixed(2)
    };
  }

  /**
   * Get duration grouped by date
   * @param {number} userId - User ID
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array>} Array of objects with date and duration
   */
  async getDurationByDate(userId, startDate, endDate) {
    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    if (end < start) {
      throw new ValidationError('End date must be after start date');
    }

    return await this.repository.getDurationByDate(userId, startDate, endDate);
  }

  /**
   * Validate time entry data before creation
   * @param {Object} data - Time entry data
   * @throws {ValidationError} If validation fails
   */
  async validateCreate(data) {
    if (!data.start_time) {
      throw new ValidationError('Start time is required');
    }

    const startTime = new Date(data.start_time);
    if (isNaN(startTime.getTime())) {
      throw new ValidationError('Invalid start time format');
    }

    // Validate end time if provided
    if (data.end_time) {
      const endTime = new Date(data.end_time);
      if (isNaN(endTime.getTime())) {
        throw new ValidationError('Invalid end time format');
      }

      if (endTime <= startTime) {
        throw new ValidationError('End time must be after start time');
      }
    }

    // Validate task exists if taskRepository is available
    if (data.task_id && this.taskRepository) {
      const taskExists = await this.taskRepository.exists(data.task_id);
      if (!taskExists) {
        throw new ValidationError(`Task with ID ${data.task_id} not found`);
      }
    }

    // Validate description length if provided
    if (data.description && data.description.length > 1000) {
      throw new ValidationError('Description must be 1000 characters or less');
    }
  }

  /**
   * Validate time entry data before update
   * @param {number} id - Time entry ID
   * @param {Object} data - Updated data
   * @throws {ValidationError} If validation fails
   */
  async validateUpdate(id, data) {
    // Validate start time if provided
    if (data.start_time) {
      const startTime = new Date(data.start_time);
      if (isNaN(startTime.getTime())) {
        throw new ValidationError('Invalid start time format');
      }
    }

    // Validate end time if provided
    if (data.end_time) {
      const endTime = new Date(data.end_time);
      if (isNaN(endTime.getTime())) {
        throw new ValidationError('Invalid end time format');
      }

      // If both start and end are being updated, validate the relationship
      if (data.start_time) {
        const startTime = new Date(data.start_time);
        if (endTime <= startTime) {
          throw new ValidationError('End time must be after start time');
        }
      }
    }

    // Validate task exists if taskRepository is available
    if (data.task_id && this.taskRepository) {
      const taskExists = await this.taskRepository.exists(data.task_id);
      if (!taskExists) {
        throw new ValidationError(`Task with ID ${data.task_id} not found`);
      }
    }

    // Validate description length if provided
    if (data.description !== undefined && data.description && data.description.length > 1000) {
      throw new ValidationError('Description must be 1000 characters or less');
    }
  }

  /**
   * Validate before deleting a time entry
   * @param {number} id - Time entry ID
   * @throws {ValidationError} If validation fails
   */
  async validateDelete(id) {
    // Could add logic here to prevent deletion of billed time entries
    // For now, we'll allow deletion
  }
}

module.exports = TimeEntryService;
