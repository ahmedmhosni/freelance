/**
 * Time Tracking Report Domain Model
 */
class TimeTrackingReport {
  constructor(data) {
    this.taskId = data.task_id || data.taskId;
    this.taskTitle = data.task_title || data.taskTitle;
    this.projectId = data.project_id || data.projectId;
    this.projectName = data.project_name || data.projectName;
    this.clientId = data.client_id || data.clientId;
    this.clientName = data.client_name || data.clientName;
    this.sessionCount = data.session_count || data.sessionCount || 0;
    this.totalMinutes = data.total_minutes || data.totalMinutes || 0;
    this.totalHours = data.total_hours || data.totalHours || 0;
    this.taskCount = data.task_count || data.taskCount;
    this.projectCount = data.project_count || data.projectCount;
  }

  toJSON() {
    const result = {
      sessionCount: this.sessionCount,
      totalMinutes: this.totalMinutes,
      totalHours: this.totalHours
    };

    if (this.taskId !== undefined) {
      result.taskId = this.taskId;
      result.taskTitle = this.taskTitle;
    }

    if (this.projectId !== undefined) {
      result.projectId = this.projectId;
      result.projectName = this.projectName;
    }

    if (this.clientId !== undefined) {
      result.clientId = this.clientId;
      result.clientName = this.clientName;
    }

    if (this.taskCount !== undefined) {
      result.taskCount = this.taskCount;
    }

    if (this.projectCount !== undefined) {
      result.projectCount = this.projectCount;
    }

    return result;
  }
}

module.exports = TimeTrackingReport;
