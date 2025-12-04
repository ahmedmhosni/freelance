/**
 * TimeEntry Response Data Transfer Object
 * Defines the structure for time entry API responses
 */
class TimeEntryResponseDTO {
  constructor(timeEntry) {
    this.id = timeEntry.id;
    this.userId = timeEntry.userId || timeEntry.user_id;
    this.taskId = timeEntry.taskId || timeEntry.task_id;
    this.projectId = timeEntry.projectId || timeEntry.project_id;
    this.description = timeEntry.description;
    this.startTime = timeEntry.startTime || timeEntry.start_time;
    this.endTime = timeEntry.endTime || timeEntry.end_time;
    this.duration = timeEntry.duration || (timeEntry.calculateDuration ? timeEntry.calculateDuration() : null);
    this.durationHours = timeEntry.calculateDurationHours ? timeEntry.calculateDurationHours() : null;
    this.isBillable = timeEntry.isBillable || timeEntry.is_billable;
    this.isRunning = timeEntry.isRunning ? timeEntry.isRunning() : false;
    this.createdAt = timeEntry.createdAt || timeEntry.created_at;
    this.updatedAt = timeEntry.updatedAt || timeEntry.updated_at;
    
    // Include relationship data if available
    if (timeEntry.taskTitle || timeEntry.task_title) {
      this.taskTitle = timeEntry.taskTitle || timeEntry.task_title;
    }
    if (timeEntry.projectName || timeEntry.project_name) {
      this.projectName = timeEntry.projectName || timeEntry.project_name;
    }
  }
}

module.exports = TimeEntryResponseDTO;
