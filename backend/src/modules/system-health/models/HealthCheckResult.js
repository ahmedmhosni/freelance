/**
 * Health Check Result Model
 * Represents the structure and validation for health check results
 */

class HealthCheckResult {
  constructor(data = {}) {
    this.id = data.id || null;
    this.timestamp = data.timestamp || new Date();
    this.environment = data.environment || 'development';
    this.overallStatus = data.overall_status || data.overallStatus || 'unknown';
    this.checks = data.checks || [];
    this.summary = data.summary || {};
    this.duration = data.duration || 0;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  /**
   * Validate health check result data
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  static validate(data) {
    const errors = [];

    // Required fields
    if (!data.timestamp) {
      errors.push('timestamp is required');
    }

    if (!data.environment) {
      errors.push('environment is required');
    }

    if (!data.overall_status && !data.overallStatus) {
      errors.push('overall_status is required');
    }

    // Validate overall status values
    const validStatuses = ['pass', 'fail', 'warning', 'unknown'];
    const status = data.overall_status || data.overallStatus;
    if (status && !validStatuses.includes(status)) {
      errors.push(`overall_status must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate environment values
    const validEnvironments = ['development', 'staging', 'production', 'test'];
    if (data.environment && !validEnvironments.includes(data.environment)) {
      errors.push(`environment must be one of: ${validEnvironments.join(', ')}`);
    }

    // Validate checks array
    if (data.checks && !Array.isArray(data.checks)) {
      errors.push('checks must be an array');
    }

    // Validate summary object
    if (data.summary && typeof data.summary !== 'object') {
      errors.push('summary must be an object');
    }

    // Validate duration
    if (data.duration !== undefined && (typeof data.duration !== 'number' || data.duration < 0)) {
      errors.push('duration must be a non-negative number');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Create a new HealthCheckResult instance with validation
   * @param {Object} data - Health check result data
   * @returns {HealthCheckResult} New instance
   */
  static create(data) {
    this.validate(data);
    return new HealthCheckResult(data);
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDatabase() {
    return {
      timestamp: this.timestamp,
      environment: this.environment,
      overall_status: this.overallStatus,
      checks: typeof this.checks === 'string' ? this.checks : JSON.stringify(this.checks),
      summary: typeof this.summary === 'string' ? this.summary : JSON.stringify(this.summary),
      duration: this.duration
    };
  }

  /**
   * Convert from database format
   * @param {Object} dbData - Database row data
   * @returns {HealthCheckResult} New instance
   */
  static fromDatabase(dbData) {
    const data = { ...dbData };
    
    // Parse JSON fields if they're strings
    if (typeof data.checks === 'string') {
      try {
        data.checks = JSON.parse(data.checks);
      } catch (error) {
        data.checks = [];
      }
    }

    if (typeof data.summary === 'string') {
      try {
        data.summary = JSON.parse(data.summary);
      } catch (error) {
        data.summary = {};
      }
    }

    return new HealthCheckResult(data);
  }

  /**
   * Get summary statistics
   * @returns {Object} Summary statistics
   */
  getSummary() {
    if (this.summary && typeof this.summary === 'object') {
      return this.summary;
    }

    // Calculate summary from checks if not provided
    if (Array.isArray(this.checks)) {
      return {
        total: this.checks.length,
        passed: this.checks.filter(c => c.status === 'pass').length,
        failed: this.checks.filter(c => c.status === 'fail').length,
        warnings: this.checks.filter(c => c.status === 'warning').length
      };
    }

    return {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  /**
   * Check if the health check passed
   * @returns {boolean} True if passed
   */
  isPassed() {
    return this.overallStatus === 'pass';
  }

  /**
   * Check if the health check failed
   * @returns {boolean} True if failed
   */
  isFailed() {
    return this.overallStatus === 'fail';
  }

  /**
   * Check if the health check has warnings
   * @returns {boolean} True if has warnings
   */
  hasWarnings() {
    return this.overallStatus === 'warning';
  }

  /**
   * Get failed checks
   * @returns {Array} Array of failed checks
   */
  getFailedChecks() {
    if (!Array.isArray(this.checks)) {
      return [];
    }
    return this.checks.filter(check => check.status === 'fail');
  }

  /**
   * Get warning checks
   * @returns {Array} Array of warning checks
   */
  getWarningChecks() {
    if (!Array.isArray(this.checks)) {
      return [];
    }
    return this.checks.filter(check => check.status === 'warning');
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON object
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      environment: this.environment,
      overallStatus: this.overallStatus,
      checks: this.checks,
      summary: this.getSummary(),
      duration: this.duration,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = HealthCheckResult;