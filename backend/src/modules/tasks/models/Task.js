/**
 * Task Domain Model
 * 
 * Represents a task entity with business logic and validation.
 * Tasks are associated with projects and can have various statuses and priorities.
 */

class Task {
  /**
   * @param {Object} data - Task data from database or DTO
   */
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.projectId = data.project_id || data.projectId;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status || 'pending';
    this.priority = data.priority || 'medium';
    this.dueDate = data.due_date || data.dueDate;
    this.comments = data.comments;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    
    // Relationships (populated when joined)
    this.projectName = data.project_name || data.projectName;
    this.clientId = data.client_id || data.clientId;
  }

  /**
   * Validates the task data
   * @returns {boolean} True if valid
   */
  isValid() {
    if (!this.title || this.title.trim().length === 0) {
      return false;
    }
    
    const validStatuses = ['pending', 'in-progress', 'done', 'completed', 'cancelled'];
    if (!validStatuses.includes(this.status)) {
      return false;
    }
    
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(this.priority)) {
      return false;
    }
    
    return true;
  }

  /**
   * Checks if the task is pending
   * @returns {boolean}
   */
  isPending() {
    return this.status === 'pending';
  }

  /**
   * Checks if the task is in progress
   * @returns {boolean}
   */
  isInProgress() {
    return this.status === 'in-progress';
  }

  /**
   * Checks if the task is completed
   * @returns {boolean}
   */
  isCompleted() {
    return this.status === 'done' || this.status === 'completed';
  }

  /**
   * Checks if the task is cancelled
   * @returns {boolean}
   */
  isCancelled() {
    return this.status === 'cancelled';
  }

  /**
   * Checks if the task is overdue (has due date in the past and not completed)
   * @returns {boolean}
   */
  isOverdue() {
    if (!this.dueDate || this.isCompleted() || this.isCancelled()) {
      return false;
    }
    
    const now = new Date();
    const due = new Date(this.dueDate);
    return due < now;
  }

  /**
   * Checks if the task is high priority
   * @returns {boolean}
   */
  isHighPriority() {
    return this.priority === 'high' || this.priority === 'urgent';
  }

  /**
   * Validates status transition
   * @param {string} newStatus - New status to transition to
   * @returns {boolean} True if transition is valid
   */
  canTransitionTo(newStatus) {
    const validStatuses = ['pending', 'in-progress', 'done', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return false;
    }
    
    // Can't transition from completed/cancelled to other states
    if ((this.status === 'completed' || this.status === 'done') && newStatus !== 'in-progress') {
      return false;
    }
    
    if (this.status === 'cancelled' && newStatus !== 'pending') {
      return false;
    }
    
    return true;
  }

  /**
   * Converts the task to a JSON representation
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate,
      comments: this.comments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      projectName: this.projectName,
      clientId: this.clientId,
      isOverdue: this.isOverdue(),
      isHighPriority: this.isHighPriority()
    };
  }
}

module.exports = Task;
