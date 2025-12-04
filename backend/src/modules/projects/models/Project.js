/**
 * Project Domain Model
 * 
 * Represents a project entity with business logic and validation.
 * Projects are associated with clients and can have multiple tasks.
 */

class Project {
  /**
   * @param {Object} data - Project data from database or DTO
   */
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.clientId = data.client_id || data.clientId;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status || 'active';
    this.startDate = data.start_date || data.startDate;
    this.endDate = data.end_date || data.endDate;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    
    // Relationships (populated when joined)
    this.clientName = data.client_name || data.clientName;
  }

  /**
   * Validates the project data
   * @returns {boolean} True if valid
   */
  isValid() {
    if (!this.name || this.name.trim().length === 0) {
      return false;
    }
    
    const validStatuses = ['active', 'completed', 'on-hold', 'cancelled'];
    if (!validStatuses.includes(this.status)) {
      return false;
    }
    
    // If both dates exist, start date should be before or equal to end date
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      if (start > end) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Checks if the project is active
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Checks if the project is completed
   * @returns {boolean}
   */
  isCompleted() {
    return this.status === 'completed';
  }

  /**
   * Checks if the project is overdue (has end date in the past and not completed)
   * @returns {boolean}
   */
  isOverdue() {
    if (!this.endDate || this.isCompleted()) {
      return false;
    }
    
    const now = new Date();
    const end = new Date(this.endDate);
    return end < now;
  }

  /**
   * Converts the project to a JSON representation
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      clientId: this.clientId,
      name: this.name,
      description: this.description,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      clientName: this.clientName,
      isOverdue: this.isOverdue()
    };
  }
}

module.exports = Project;
