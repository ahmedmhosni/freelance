/**
 * Project Report Domain Model
 */
class ProjectReport {
  constructor(data) {
    this.totalProjects = data.totalProjects || 0;
    this.byStatus = data.byStatus || {
      active: 0,
      completed: 0,
      'on-hold': 0,
      cancelled: 0
    };
    this.totalTasks = data.totalTasks || 0;
    this.tasksByStatus = data.tasksByStatus || {
      todo: 0,
      'in-progress': 0,
      review: 0,
      done: 0
    };
    this.projects = data.projects || [];
  }

  toJSON() {
    return {
      totalProjects: this.totalProjects,
      byStatus: this.byStatus,
      totalTasks: this.totalTasks,
      tasksByStatus: this.tasksByStatus,
      projects: this.projects
    };
  }
}

module.exports = ProjectReport;
