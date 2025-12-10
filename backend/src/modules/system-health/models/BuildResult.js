/**
 * Build Result Model
 * Represents the structure and validation for frontend build results
 */

class BuildResult {
  constructor(data = {}) {
    this.id = data.id || null;
    this.timestamp = data.timestamp || new Date();
    this.buildPath = data.build_path || data.buildPath || '';
    this.status = data.status || 'unknown';
    this.assets = data.assets || [];
    this.bundleSize = data.bundle_size || data.bundleSize || {};
    this.warnings = data.warnings || [];
    this.errors = data.errors || [];
    this.duration = data.duration || 0;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  /**
   * Validate build result data
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  static validate(data) {
    const errors = [];

    // Required fields
    if (!data.timestamp) {
      errors.push('timestamp is required');
    }

    if (!data.build_path && !data.buildPath) {
      errors.push('build_path is required');
    }

    if (!data.status) {
      errors.push('status is required');
    }

    // Validate status values
    const validStatuses = ['success', 'failure', 'warning', 'unknown'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate assets array
    if (data.assets && !Array.isArray(data.assets)) {
      errors.push('assets must be an array');
    }

    // Validate bundle size object
    if (data.bundle_size && typeof data.bundle_size !== 'object') {
      errors.push('bundle_size must be an object');
    }

    if (data.bundleSize && typeof data.bundleSize !== 'object') {
      errors.push('bundleSize must be an object');
    }

    // Validate warnings array
    if (data.warnings && !Array.isArray(data.warnings)) {
      errors.push('warnings must be an array');
    }

    // Validate errors array
    if (data.errors && !Array.isArray(data.errors)) {
      errors.push('errors must be an array');
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
   * Create a new BuildResult instance with validation
   * @param {Object} data - Build result data
   * @returns {BuildResult} New instance
   */
  static create(data) {
    this.validate(data);
    return new BuildResult(data);
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDatabase() {
    return {
      timestamp: this.timestamp,
      build_path: this.buildPath,
      status: this.status,
      assets: typeof this.assets === 'string' ? this.assets : JSON.stringify(this.assets),
      bundle_size: typeof this.bundleSize === 'string' ? this.bundleSize : JSON.stringify(this.bundleSize),
      warnings: typeof this.warnings === 'string' ? this.warnings : JSON.stringify(this.warnings),
      errors: typeof this.errors === 'string' ? this.errors : JSON.stringify(this.errors),
      duration: this.duration
    };
  }

  /**
   * Convert from database format
   * @param {Object} dbData - Database row data
   * @returns {BuildResult} New instance
   */
  static fromDatabase(dbData) {
    const data = { ...dbData };
    
    // Parse JSON fields if they're strings
    const jsonFields = ['assets', 'bundle_size', 'warnings', 'errors'];
    
    jsonFields.forEach(field => {
      if (typeof data[field] === 'string') {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (error) {
          data[field] = Array.isArray(data[field]) ? [] : {};
        }
      }
    });

    return new BuildResult(data);
  }

  /**
   * Check if the build was successful
   * @returns {boolean} True if successful
   */
  isSuccessful() {
    return this.status === 'success';
  }

  /**
   * Check if the build failed
   * @returns {boolean} True if failed
   */
  isFailed() {
    return this.status === 'failure';
  }

  /**
   * Check if the build has warnings
   * @returns {boolean} True if has warnings
   */
  hasWarnings() {
    return this.status === 'warning' || (Array.isArray(this.warnings) && this.warnings.length > 0);
  }

  /**
   * Check if the build has errors
   * @returns {boolean} True if has errors
   */
  hasErrors() {
    return Array.isArray(this.errors) && this.errors.length > 0;
  }

  /**
   * Get total bundle size in bytes
   * @returns {number} Total size in bytes
   */
  getTotalBundleSize() {
    if (typeof this.bundleSize === 'object' && this.bundleSize.total) {
      return this.bundleSize.total;
    }

    // Calculate from assets if bundle size not provided
    if (Array.isArray(this.assets)) {
      return this.assets.reduce((total, asset) => total + (asset.size || 0), 0);
    }

    return 0;
  }

  /**
   * Get bundle size in human readable format
   * @returns {string} Formatted size
   */
  getFormattedBundleSize() {
    const bytes = this.getTotalBundleSize();
    
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if bundle size exceeds threshold
   * @param {number} thresholdMB - Threshold in megabytes
   * @returns {boolean} True if exceeds threshold
   */
  exceedsSizeThreshold(thresholdMB = 10) {
    const sizeMB = this.getTotalBundleSize() / (1024 * 1024);
    return sizeMB > thresholdMB;
  }

  /**
   * Get asset count by type
   * @returns {Object} Asset counts by type
   */
  getAssetCounts() {
    if (!Array.isArray(this.assets)) {
      return {};
    }

    return this.assets.reduce((counts, asset) => {
      const type = asset.type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});
  }

  /**
   * Get build summary
   * @returns {Object} Build summary
   */
  getSummary() {
    return {
      status: this.status,
      duration: this.duration,
      totalSize: this.getFormattedBundleSize(),
      assetCount: Array.isArray(this.assets) ? this.assets.length : 0,
      warningCount: Array.isArray(this.warnings) ? this.warnings.length : 0,
      errorCount: Array.isArray(this.errors) ? this.errors.length : 0,
      assetCounts: this.getAssetCounts()
    };
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON object
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      buildPath: this.buildPath,
      status: this.status,
      assets: this.assets,
      bundleSize: this.bundleSize,
      warnings: this.warnings,
      errors: this.errors,
      duration: this.duration,
      summary: this.getSummary(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = BuildResult;