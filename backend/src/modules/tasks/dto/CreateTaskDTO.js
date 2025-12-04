/**
 * Data Transfer Object for creating a new task
 */

class CreateTaskDTO {
  /**
   * @param {Object} data - Request body data
   */
  constructor(data) {
    this.projectId = data.project_id || data.projectId || null;
    this.title = data.title;
    this.description = data.description || null;
    this.status = data.status || 'pending';
    this.priority = data.priority || 'medium';
    this.dueDate = data.due_date || data.dueDate || null;
    this.comments = data.comments || null;
  }
}

module.exports = CreateTaskDTO;
