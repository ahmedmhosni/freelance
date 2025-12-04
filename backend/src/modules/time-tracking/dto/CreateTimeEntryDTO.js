/**
 * Create TimeEntry Data Transfer Object
 * Defines the structure for creating a new time entry
 */
class CreateTimeEntryDTO {
  constructor(data) {
    this.taskId = data.taskId || data.task_id;
    this.projectId = data.projectId || data.project_id || null;
    this.description = data.description || null;
    this.startTime = data.startTime || data.start_time || new Date();
    this.endTime = data.endTime || data.end_time || null;
    this.duration = data.duration || null;
    this.isBillable = data.isBillable !== undefined ? data.isBillable : (data.is_billable || false);
  }
}

module.exports = CreateTimeEntryDTO;
