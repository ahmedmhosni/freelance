/**
 * Build Validation Controller
 * Handles HTTP requests for build validation and analysis
 */

const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const { authenticateToken } = require('../../../middleware/auth');

class BuildController extends BaseController {
  constructor(buildValidationService) {
    // Pass null as service since we're not using the default CRUD operations
    super(null);
    this.buildValidationService = buildValidationService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  /**
   * Initialize build validation routes
   */
  initializeRoutes() {
    // All routes require authentication
    this.router.post('/validate', authenticateToken, this.validateBuild.bind(this));
    this.router.get('/status', authenticateToken, this.getBuildStatus.bind(this));
    this.router.get('/history', authenticateToken, this.getBuildHistory.bind(this));
    this.router.post('/clean', authenticateToken, this.cleanBuildArtifacts.bind(this));
    this.router.post('/analyze', authenticateToken, this.analyzeBundleSize.bind(this));
    this.router.post('/production-check', authenticateToken, this.checkProductionReadiness.bind(this));
  }

  /**
   * POST /api/system-health/build/validate
   * Validate frontend build process
   */
  async validateBuild(req, res, next) {
    try {
      const { projectPath, buildPath, options = {} } = req.body;

      // Validate input
      if (projectPath && typeof projectPath !== 'string') {
        return this.sendError(res, 'Project path must be a string', 400);
      }

      if (buildPath && typeof buildPath !== 'string') {
        return this.sendError(res, 'Build path must be a string', 400);
      }

      // Run comprehensive build validation
      const results = [];

      // 1. Clean build artifacts
      const cleanResult = await this.buildValidationService.cleanBuildArtifacts(buildPath);
      results.push(cleanResult);

      // 2. Validate build process
      const buildResult = await this.buildValidationService.validateBuildProcess(projectPath);
      results.push(buildResult);

      // 3. Check build output
      const outputResult = await this.buildValidationService.checkBuildOutput(buildPath);
      results.push(outputResult);

      // 4. Analyze bundle size
      const bundleResult = await this.buildValidationService.analyzeBundleSize();
      results.push(bundleResult);

      // 5. Check production readiness
      const prodResult = await this.buildValidationService.validateProductionReadiness();
      results.push(prodResult);

      // Generate comprehensive report
      const report = this.buildValidationService.generateBuildReport(results);

      // Save results to database
      try {
        await this.buildValidationService.saveBuildResult(report);
      } catch (saveError) {
        // Log but don't fail the request
        console.warn('Failed to save build result:', saveError.message);
      }

      this.sendSuccess(res, {
        report,
        results,
        summary: {
          total: results.length,
          passed: results.filter(r => r.status === 'pass').length,
          failed: results.filter(r => r.status === 'fail').length,
          warnings: results.filter(r => r.status === 'warning').length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/system-health/build/status
   * Get current build status
   */
  async getBuildStatus(req, res, next) {
    try {
      const { projectPath, buildPath } = req.query;

      // Quick status check without full validation
      const results = [];

      // Check if build output exists
      const outputResult = await this.buildValidationService.checkBuildOutput(buildPath);
      results.push(outputResult);

      // Quick bundle analysis
      const bundleResult = await this.buildValidationService.analyzeBundleSize();
      results.push(bundleResult);

      const overallStatus = results.some(r => r.status === 'fail') ? 'fail' :
                           results.some(r => r.status === 'warning') ? 'warning' : 'pass';

      this.sendSuccess(res, {
        status: overallStatus,
        results,
        timestamp: new Date(),
        summary: {
          total: results.length,
          passed: results.filter(r => r.status === 'pass').length,
          failed: results.filter(r => r.status === 'fail').length,
          warnings: results.filter(r => r.status === 'warning').length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/system-health/build/history
   * Get build validation history
   */
  async getBuildHistory(req, res, next) {
    try {
      const { limit = 10, offset = 0, status } = req.query;

      // This would typically query the database for build history
      // For now, return a placeholder response
      const filters = {};
      if (status) {
        filters.status = status;
      }

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy: 'timestamp',
        order: 'DESC'
      };

      // If repository is available, query build history
      let history = [];
      let total = 0;

      if (this.buildValidationService.repository) {
        try {
          history = await this.buildValidationService.getAll(filters, options);
          total = await this.buildValidationService.count(filters);
        } catch (error) {
          // If repository methods don't exist, return empty history
          console.warn('Build history not available:', error.message);
        }
      }

      this.sendSuccess(res, {
        history,
        pagination: {
          total,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/system-health/build/clean
   * Clean build artifacts
   */
  async cleanBuildArtifacts(req, res, next) {
    try {
      const { buildPath } = req.body;

      if (buildPath && typeof buildPath !== 'string') {
        return this.sendError(res, 'Build path must be a string', 400);
      }

      const result = await this.buildValidationService.cleanBuildArtifacts(buildPath);

      this.sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/system-health/build/analyze
   * Analyze bundle size and performance
   */
  async analyzeBundleSize(req, res, next) {
    try {
      const { assets, buildPath } = req.body;

      if (assets && !Array.isArray(assets)) {
        return this.sendError(res, 'Assets must be an array', 400);
      }

      if (buildPath && typeof buildPath !== 'string') {
        return this.sendError(res, 'Build path must be a string', 400);
      }

      const result = await this.buildValidationService.analyzeBundleSize(assets);

      this.sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/system-health/build/production-check
   * Check production readiness
   */
  async checkProductionReadiness(req, res, next) {
    try {
      const { buildArtifacts, buildPath } = req.body;

      if (buildArtifacts && !Array.isArray(buildArtifacts)) {
        return this.sendError(res, 'Build artifacts must be an array', 400);
      }

      if (buildPath && typeof buildPath !== 'string') {
        return this.sendError(res, 'Build path must be a string', 400);
      }

      const result = await this.buildValidationService.validateProductionReadiness(buildArtifacts);

      this.sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Override the default _setupRoutes to prevent default CRUD routes
   * @private
   */
  _setupRoutes() {
    // Don't setup default CRUD routes
  }
}

module.exports = BuildController;