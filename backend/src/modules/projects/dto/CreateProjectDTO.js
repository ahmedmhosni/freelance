/**
 * Data Transfer Object for creating a new project
 */

class CreateProjectDTO {
  /**
   * @param {Object} data - Request body data
   */
  constructor(data) {
    this.clientId = data.client_id || data.clientId || null;
    this.name = data.name;
    this.description = data.description || null;
    this.status = data.status || 'active';
    this.startDate = data.start_date || data.startDate || null;
    this.endDate = data.end_date || data.endDate || null;
  }
}

module.exports = CreateProjectDTO;
