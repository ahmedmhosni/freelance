/**
 * TimeEntry Response Data Transfer Object
 * Defines the structure for time entry API responses
 */
class TimeEntryResponseDTO {
  constructor(timeEntry) {
    this.id = timeEntry.id;
    this.user_id = timeEntry.userId || timeEntry.user_id;
    this.task_id = timeEntry.taskId || timeEntry.task_id;
    this.project_id = timeEntry.projectId || timeEntry.project_id;
    this.description = timeEntry.description;
    this.start_time = timeEntry.startTime || timeEntry.start_time;
    this.end_time = timeEntry.endTime || timeEntry.end_time;
    this.duration = timeEntry.duration || (timeEntry.calculateDuration ? timeEntry.calculateDuration() : null);
    this.duration_hours = timeEntry.calculateDurationHours ? timeEntry.calculateDurationHours() : null;
    this.is_billable = timeEntry.isBillable || timeEntry.is_billable;
    this.is_running = timeEntry.isRunning ? timeEntry.isRunning() : false;
    this.created_at = timeEntry.createdAt || timeEntry.created_at;
    
    // Include relationship data if available
    if (timeEntry.taskTitle || timeEntry.task_title) {
      this.task_title = timeEntry.taskTitle || timeEntry.task_title;
    }
    if (timeEntry.projectName || timeEntry.project_name) {
      this.project_name = timeEntry.projectName || timeEntry.project_name;
    }
  }
}

module.exports = TimeEntryResponseDTO;
