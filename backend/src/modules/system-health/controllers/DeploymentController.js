/**
 * Deployment Controller
 * Handles HTTP requests for deployment operations
 */

const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const { authenticateToken } = require('../../../middleware/auth');

class DeploymentController extends BaseController {
  constructor(deploymentService) {
    // Pass null as service since we're not using the default CRUD operations
    super(null);
    this.deploymentService = deploymentService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  /**
   * Initialize deployment routes
   */
  initializeRoutes() {
    // All routes require authentication
    this.router.post('/prepare', authenticateToken, this.prepareDeployment.bind(this));
    this.router.post('/execute', authenticateToken, this.executeDeployment.bind(this));
    this.router.get('/status', authenticateToken, this.getDeploymentStatus.bind(this));
    this.router.post('/rollback', authenticateToken, this.rollbackDeployment.bind(this));
    this.router.get('/logs', authenticateToken, this.getDeploymentLogs.bind(this));
    this.router.get('/history', authenticateToken, this.getDeploymentHistory.bind(this));
    this.router.get('/stats', authenticateToken, this.getDeploymentStats.bind(this));
  }

  /**
   * POST /api/system-health/deploy/prepare
   * Prepare deployment for target environment
   */
  async prepareDeployment(req, res, next) {
    try {
      const { environment } = req.body;

      // Validate input
      if (!environment || typeof environment !== 'object') {
        return this.sendError(res, 'Environment configuration is required', 400);
      }

      if (!environment.name || typeof environment.name !== 'string') {
        return this.sendError(res, 'Environment name is required', 400);
      }

      // Prepare deployment
      const result = await this.deploymentService.prepareDeployment(environment);

      this.sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/system-health/deploy/execute
   * Execute deployment to target environment
   */
  async executeDeployment(req, res, next) {
    try {
      const { config, environment } = req.body;

      // Validate input
      if (!config || typeof config !== 'object') {
        return this.sendError(res, 'Deployment configuration is required', 400);
      }

      if (!environment || typeof environment !== 'string') {
        return this.sendError(res, 'Environment name is required', 400);
      }

      // Execute deployment
      const result = await this.deploymentService.deployToAzure(config);

      // Validate deployment
      const validation = await this.deploymentService.validateDeployment(result);

      // Notify deployment status
      await this.deploymentService.notifyDeploymentStatus(result);

      this.sendSuccess(res, {
        deployment: result,
        validation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/system-health/deploy/status
   * Get current deployment status
   */
  async getDeploymentStatus(req, res, next) {
    try {
      const { environment } = req.query;

      // Validate input
      if (!environment || typeof environment !== 'string') {
        return this.sendError(res, 'Environment name is required', 400);
      }

      // Get latest deployment
      let latestDeployment = null;
      if (this.deploymentService.deploymentLogRepository) {
        try {
          latestDeployment = await this.deploymentService.deploymentLogRepository.getLatestDeployment(environment);
        } catch (error) {
          console.warn('Failed to get latest deployment:', error.message);
        }
      }

      this.sendSuccess(res, {
        environment,
        latestDeployment,
        timestamp: new Date()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/system-health/deploy/rollback
   * Rollback deployment to previous version
   */
  async rollbackDeployment(req, res, next) {
    try {
      const { environment, version } = req.body;

      // Validate input
      if (!environment || typeof environment !== 'string') {
        return this.sendError(res, 'Environment name is required', 400);
      }

      if (!version || typeof version !== 'string') {
        return this.sendError(res, 'Version to rollback to is required', 400);
      }

      // Execute rollback
      const result = await this.deploymentService.rollbackDeployment(environment, version);

      // Notify rollback status
      await this.deploymentService.notifyDeploymentStatus({
        status: result.status,
        environment,
        version: result.rolledBackTo
      });

      this.sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/system-health/deploy/logs
   * Get deployment logs
   */
  async getDeploymentLogs(req, res, next) {
    try {
      const { environment, type, status, limit = 10, offset = 0 } = req.query;

      // Build filters
      const filters = {};
      if (environment) filters.environment = environment;
      if (type) filters.type = type;
      if (status) filters.status = status;

      // Get logs
      let logs = [];
      let total = 0;

      if (this.deploymentService.deploymentLogRepository) {
        try {
          logs = await this.deploymentService.deploymentLogRepository.findMany(
            filters,
            {
              limit: parseInt(limit),
              offset: parseInt(offset),
              orderBy: 'created_at',
              order: 'DESC'
            }
          );
          total = await this.deploymentService.deploymentLogRepository.count(filters);
        } catch (error) {
          console.warn('Failed to get deployment logs:', error.message);
        }
      }

      this.sendSuccess(res, {
        logs,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/system-health/deploy/history
   * Get deployment history for environment
   */
  async getDeploymentHistory(req, res, next) {
    try {
      const { environment, limit = 10 } = req.query;

      // Validate input
      if (!environment || typeof environment !== 'string') {
        return this.sendError(res, 'Environment name is required', 400);
      }

      // Get history
      let history = [];

      if (this.deploymentService.deploymentLogRepository) {
        try {
          history = await this.deploymentService.deploymentLogRepository.getDeploymentHistory(
            environment,
            parseInt(limit)
          );
        } catch (error) {
          console.warn('Failed to get deployment history:', error.message);
        }
      }

      this.sendSuccess(res, {
        environment,
        history,
        count: history.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/system-health/deploy/stats
   * Get deployment statistics
   */
  async getDeploymentStats(req, res, next) {
    try {
      const { environment } = req.query;

      // Validate input
      if (!environment || typeof environment !== 'string') {
        return this.sendError(res, 'Environment name is required', 400);
      }

      // Get statistics
      let stats = null;

      if (this.deploymentService.deploymentLogRepository) {
        try {
          stats = await this.deploymentService.deploymentLogRepository.getDeploymentStats(environment);
        } catch (error) {
          console.warn('Failed to get deployment stats:', error.message);
        }
      }

      this.sendSuccess(res, {
        environment,
        stats,
        timestamp: new Date()
      });
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

module.exports = DeploymentController;
