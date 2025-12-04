/**
 * Data Transfer Object for updating an existing task
 */

class UpdateTaskDTO {
  /**
   * @param {Object} data - Request body data
   */
  constructor(data) {
    this.projectId = data.project_id !== undefined ? data.project_id : (data.projectId !== undefined ? data.projectId : undefined);
    this.title = data.title;
    this.description = data.description !== undefined ? data.description : undefined;
    this.status = data.status;
    this.priority = data.priority;
    this.dueDate = data.due_date !== undefined ? data.due_date : (data.dueDate !== undefined ? data.dueDate : undefined);
    this.comments = data.comments !== undefined ? data.comments : undefined;
  }
}

module.exports = UpdateTaskDTO;
