/**
 * Data Transfer Object for updating an existing project
 */

class UpdateProjectDTO {
  /**
   * @param {Object} data - Request body data
   */
  constructor(data) {
    this.clientId = data.client_id !== undefined ? data.client_id : (data.clientId !== undefined ? data.clientId : undefined);
    this.name = data.name;
    this.description = data.description !== undefined ? data.description : undefined;
    this.status = data.status;
    this.startDate = data.start_date !== undefined ? data.start_date : (data.startDate !== undefined ? data.startDate : undefined);
    this.endDate = data.end_date !== undefined ? data.end_date : (data.endDate !== undefined ? data.endDate : undefined);
  }
}

module.exports = UpdateProjectDTO;
