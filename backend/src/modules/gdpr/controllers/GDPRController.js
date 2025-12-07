const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const { authenticateToken } = require('../../../middleware/auth');
const logger = require('../../../core/logger');

/**
 * GDPR Controller
 * Handles data privacy and GDPR compliance requests
 */
class GDPRController extends BaseController {
  constructor(gdprService) {
    super(gdprService);
    this.gdprService = gdprService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Routes
    this.router.post('/export', this.requestDataExport.bind(this));
    this.router.post('/delete-account', this.deleteAccount.bind(this));
    this.router.get('/exports', this.getExportRequests.bind(this));
  }

  /**
   * Request data export
   * POST /api/gdpr/export
   */
  async requestDataExport(req, res, next) {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      const correlationId = req.correlationId;

      logger.info('Data export requested', {
        correlationId,
        userId
      });

      const result = await this.gdprService.requestDataExport(userId, userEmail);

      logger.info('Data export request created', {
        correlationId,
        userId,
        requestId: result.id
      });

      res.json({
        success: true,
        message: 'Data export requested successfully. You will receive an email with a download link within 15-30 minutes.',
        request_id: result.id,
        status: result.status
      });
    } catch (error) {
      // Handle rate limiting error
      if (error.message.includes('24 hours')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Delete account
   * POST /api/gdpr/delete-account
   */
  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;
      const correlationId = req.correlationId;
      const { password, reason } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required'
        });
      }

      logger.info('Account deletion requested', {
        correlationId,
        userId,
        hasReason: !!reason
      });

      await this.gdprService.deleteAccount(userId, password, reason);

      logger.info('Account deleted successfully', {
        correlationId,
        userId
      });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      // Handle invalid password error
      if (error.statusCode === 401) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Get export requests history
   * GET /api/gdpr/exports
   */
  async getExportRequests(req, res, next) {
    try {
      const userId = req.user.id;
      const correlationId = req.correlationId;

      logger.info('Fetching export requests', {
        correlationId,
        userId
      });

      const requests = await this.gdprService.getExportRequests(userId);

      logger.info('Export requests fetched successfully', {
        correlationId,
        userId,
        count: requests.length
      });

      res.json({
        success: true,
        requests
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GDPRController;
