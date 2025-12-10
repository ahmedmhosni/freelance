/**
 * Deployment Log Repository
 * Handles database operations for deployment logs
 */

const BaseRepository = require('../../../shared/base/BaseRepository');

class DeploymentLogRepository extends BaseRepository {
  constructor(database) {
    super(database, 'deployment_logs');
  }

  /**
   * Create a deployment log entry
   * @param {Object} deploymentData - Deployment log data
   * @returns {Promise<Object>} Created deployment log
   */
  async createDeploymentLog(deploymentData) {
    return await this.create(deploymentData);
  }

  /**
   * Find deployments by environment
   * @param {string} environment - Environment name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Deployment logs
   */
  async findDeploymentsByEnvironment(environment, options = {}) {
    return await this.findMany({ environment }, options);
  }

  /**
   * Get latest deployment for environment
   * @param {string} environment - Environment name
   * @returns {Promise<Object|null>} Latest deployment or null
   */
  async getLatestDeployment(environment) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE environment = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    return await this.db.queryOne(sql, [environment]);
  }

  /**
   * Get deployment by version
   * @param {string} version - Deployment version
   * @returns {Promise<Object|null>} Deployment or null
   */
  async getDeploymentByVersion(version) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE version = $1 
      LIMIT 1
    `;
    return await this.db.queryOne(sql, [version]);
  }

  /**
   * Find deployments by status
   * @param {string} status - Deployment status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Deployment logs
   */
  async findDeploymentsByStatus(status, options = {}) {
    return await this.findMany({ status }, options);
  }

  /**
   * Find deployments by type
   * @param {string} type - Deployment type (deployment, rollback, preparation)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Deployment logs
   */
  async findDeploymentsByType(type, options = {}) {
    return await this.findMany({ type }, options);
  }

  /**
   * Get deployment history for environment
   * @param {string} environment - Environment name
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Deployment history
   */
  async getDeploymentHistory(environment, limit = 10) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE environment = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    return await this.db.queryMany(sql, [environment, limit]);
  }

  /**
   * Count deployments by environment and status
   * @param {string} environment - Environment name
   * @param {string} status - Deployment status
   * @returns {Promise<number>} Count of deployments
   */
  async countByEnvironmentAndStatus(environment, status) {
    const sql = `
      SELECT COUNT(*) as count FROM ${this.tableName} 
      WHERE environment = $1 AND status = $2
    `;
    const result = await this.db.queryOne(sql, [environment, status]);
    return result?.count || 0;
  }

  /**
   * Get deployment statistics
   * @param {string} environment - Environment name
   * @returns {Promise<Object>} Deployment statistics
   */
  async getDeploymentStats(environment) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration
      FROM ${this.tableName}
      WHERE environment = $1
    `;
    return await this.db.queryOne(sql, [environment]);
  }

  /**
   * Find many deployments with filters
   * @param {Object} filters - Filter conditions
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Deployment logs
   */
  async findMany(filters = {}, options = {}) {
    const { limit = 10, offset = 0, orderBy = 'created_at', order = 'DESC' } = options;
    
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];
    const whereClauses = [];

    let paramIndex = 1;
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        whereClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    sql += ` ORDER BY ${orderBy} ${order}`;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    return await this.db.queryMany(sql, params);
  }
}

module.exports = DeploymentLogRepository;
