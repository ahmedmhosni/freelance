/**
 * User Statistics Domain Model
 */
class UserStats {
  constructor(data) {
    this.userId = data.userId || data.user_id;
    this.clientsCount = data.clientsCount || data.clients_count || 0;
    this.projectsCount = data.projectsCount || data.projects_count || 0;
    this.tasksCount = data.tasksCount || data.tasks_count || 0;
    this.invoicesCount = data.invoicesCount || data.invoices_count || 0;
  }

  toJSON() {
    return {
      userId: this.userId,
      clients: { count: this.clientsCount },
      projects: { count: this.projectsCount },
      tasks: { count: this.tasksCount },
      invoices: { count: this.invoicesCount }
    };
  }
}

module.exports = UserStats;
