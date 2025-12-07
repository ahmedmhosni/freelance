/**
 * Data Export Request Model
 */
class DataExportRequest {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.status = data.status || 'pending'; // pending, processing, completed, failed
    this.export_url = data.export_url;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
    this.completed_at = data.completed_at;
  }

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      export_url: this.export_url,
      expires_at: this.expires_at,
      created_at: this.created_at,
      completed_at: this.completed_at
    };
  }
}

module.exports = DataExportRequest;
