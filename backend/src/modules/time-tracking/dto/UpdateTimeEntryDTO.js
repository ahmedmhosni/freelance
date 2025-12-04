/**
 * Update TimeEntry Data Transfer Object
 * Defines the structure for updating an existing time entry
 */
class UpdateTimeEntryDTO {
  constructor(data) {
    if (data.taskId !== undefined) this.taskId = data.taskId;
    if (data.task_id !== undefined) this.taskId = data.task_id;
    if (data.projectId !== undefined) this.projectId = data.projectId;
    if (data.project_id !== undefined) this.projectId = data.project_id;
    if (data.description !== undefined) this.description = data.description;
    if (data.startTime !== undefined) this.startTime = data.startTime;
    if (data.start_time !== undefined) this.startTime = data.start_time;
    if (data.endTime !== undefined) this.endTime = data.endTime;
    if (data.end_time !== undefined) this.endTime = data.end_time;
    if (data.duration !== undefined) this.duration = data.duration;
    if (data.isBillable !== undefined) this.isBillable = data.isBillable;
    if (data.is_billable !== undefined) this.isBillable = data.is_billable;
  }
}

module.exports = UpdateTimeEntryDTO;
