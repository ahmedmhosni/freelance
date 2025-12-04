/**
 * TimeEntry Domain Model
 * 
 * Represents a time tracking entry with business logic and validation.
 */

class TimeEntry {
  /**
   * @param {Object} data - TimeEntry data from database or DTO
   */
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.taskId = data.task_id || data.taskId;
    this.projectId = data.project_id || data.projectId;
    this.description = data.description;
    this.startTime = data.start_time || data.startTime;
    this.endTime = data.end_time || data.endTime;
    this.duration = data.duration ? parseInt(data.duration) : null; // Duration in minutes
    this.isBillable = data.is_billable !== undefined ? data.is_billable : (data.isBillable || false);
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    
    // Relationships (populated when joined)
    this.taskTitle = data.task_title || data.taskTitle;
    this.projectName = data.project_name || data.projectName;
  }

  /**
   * Validates the time entry data
   * @returns {boolean} True if valid
   */
  isValid() {
    if (!this.startTime) {
      return false;
    }
    
    // If end time is set, it should be after start time
    if (this.endTime) {
      const start = new Date(this.startTime);
      const end = new Date(this.endTime);
      if (end <= start) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Checks if the timer is currently running
   * @returns {boolean}
   */
  isRunning() {
    return this.startTime && !this.endTime;
  }

  /**
   * Checks if the time entry is completed
   * @returns {boolean}
   */
  isCompleted() {
    return this.startTime && this.endTime;
  }

  /**
   * Calculate duration in minutes
   * @returns {number|null} Duration in minutes or null if not completed
   */
  calculateDuration() {
    if (!this.startTime || !this.endTime) {
      return null;
    }
    
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    const durationMs = end - start;
    return Math.floor(durationMs / 1000 / 60); // Convert to minutes
  }

  /**
   * Calculate duration in hours
   * @returns {number|null} Duration in hours or null if not completed
   */
  calculateDurationHours() {
    const minutes = this.calculateDuration();
    return minutes ? (minutes / 60).toFixed(2) : null;
  }

  /**
   * Stop the timer
   * @returns {Date} End time
   */
  stopTimer() {
    if (!this.isRunning()) {
      throw new Error('Timer is not running');
    }
    
    this.endTime = new Date();
    this.duration = this.calculateDuration();
    return this.endTime;
  }

  /**
   * Converts the time entry to a JSON representation
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      taskId: this.taskId,
      projectId: this.projectId,
      description: this.description,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration || this.calculateDuration(),
      durationHours: this.calculateDurationHours(),
      isBillable: this.isBillable,
      isRunning: this.isRunning(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      taskTitle: this.taskTitle,
      projectName: this.projectName
    };
  }
}

module.exports = TimeEntry;
