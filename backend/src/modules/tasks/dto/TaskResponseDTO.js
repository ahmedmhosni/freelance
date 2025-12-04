/**
 * Data Transfer Object for task API responses
 */

class TaskResponseDTO {
  /**
   * @param {Object} task - Task domain model or data
   */
  constructor(task) {
    this.id = task.id;
    this.userId = task.userId || task.user_id;
    this.projectId = task.projectId || task.project_id;
    this.title = task.title;
    this.description = task.description;
    this.status = task.status;
    this.priority = task.priority;
    this.dueDate = task.dueDate || task.due_date;
    this.comments = task.comments;
    this.createdAt = task.createdAt || task.created_at;
    this.updatedAt = task.updatedAt || task.updated_at;
    
    // Include project name if available
    if (task.projectName || task.project_name) {
      this.projectName = task.projectName || task.project_name;
    }
    
    // Include client ID if available
    if (task.clientId || task.client_id) {
      this.clientId = task.clientId || task.client_id;
    }
    
    // Include computed properties if available
    if (typeof task.isOverdue === 'function') {
      this.isOverdue = task.isOverdue();
    } else if (task.isOverdue !== undefined) {
      this.isOverdue = task.isOverdue;
    }
    
    if (typeof task.isHighPriority === 'function') {
      this.isHighPriority = task.isHighPriority();
    } else if (task.isHighPriority !== undefined) {
      this.isHighPriority = task.isHighPriority;
    }
  }
}

module.exports = TaskResponseDTO;
