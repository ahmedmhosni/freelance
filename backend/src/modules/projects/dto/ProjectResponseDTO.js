/**
 * Data Transfer Object for project API responses
 */

class ProjectResponseDTO {
  /**
   * @param {Object} project - Project domain model or data
   */
  constructor(project) {
    this.id = project.id;
    this.userId = project.userId || project.user_id;
    this.clientId = project.clientId || project.client_id;
    this.name = project.name;
    this.description = project.description;
    this.status = project.status;
    this.startDate = project.startDate || project.start_date;
    this.endDate = project.endDate || project.end_date;
    this.createdAt = project.createdAt || project.created_at;
    this.updatedAt = project.updatedAt || project.updated_at;
    
    // Include client name if available
    if (project.clientName || project.client_name) {
      this.clientName = project.clientName || project.client_name;
    }
    
    // Include computed properties if available
    if (typeof project.isOverdue === 'function') {
      this.isOverdue = project.isOverdue();
    } else if (project.isOverdue !== undefined) {
      this.isOverdue = project.isOverdue;
    }
  }
}

module.exports = ProjectResponseDTO;
