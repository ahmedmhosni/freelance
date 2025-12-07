const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const { authenticateToken } = require('../../../middleware/auth');
const logger = require('../../../core/logger');

/**
 * User Preferences Controller
 * Handles HTTP requests for user preferences
 */
class UserPreferencesController extends BaseController {
  constructor(userPreferencesService) {
    super(userPreferencesService);
    this.userPreferencesService = userPreferencesService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Routes
    this.router.get('/preferences', this.getPreferences.bind(this));
    this.router.put('/preferences', this.updatePreferences.bind(this));
    this.router.get('/preferences/email', this.getEmailPreferences.bind(this));
    this.router.put('/preferences/email', this.updateEmailPreferences.bind(this));
  }

  /**
   * Get user preferences
   * GET /api/user/preferences
   */
  async getPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const correlationId = req.correlationId;

      logger.info('Fetching user preferences', {
        correlationId,
        userId
      });

      const preferences = await this.userPreferencesService.getPreferences(userId);

      logger.info('User preferences fetched successfully', {
        correlationId,
        userId
      });

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user preferences
   * PUT /api/user/preferences
   */
  async updatePreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const correlationId = req.correlationId;
      const preferencesData = req.body;

      logger.info('Updating user preferences', {
        correlationId,
        userId
      });

      const preferences = await this.userPreferencesService.updatePreferences(userId, preferencesData);

      logger.info('User preferences updated successfully', {
        correlationId,
        userId
      });

      res.json({
        success: true,
        data: preferences,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get email preferences
   * GET /api/user/preferences/email
   */
  async getEmailPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const correlationId = req.correlationId;

      logger.info('Fetching email preferences', {
        correlationId,
        userId
      });

      const preferences = await this.userPreferencesService.getEmailPreferences(userId);

      logger.info('Email preferences fetched successfully', {
        correlationId,
        userId
      });

      res.json({
        success: true,
        preferences
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update email preferences
   * PUT /api/user/preferences/email
   */
  async updateEmailPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const correlationId = req.correlationId;
      const emailPrefs = req.body;

      logger.info('Updating email preferences', {
        correlationId,
        userId
      });

      const preferences = await this.userPreferencesService.updateEmailPreferences(userId, emailPrefs);

      logger.info('Email preferences updated successfully', {
        correlationId,
        userId
      });

      res.json({
        success: true,
        preferences,
        message: 'Email preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserPreferencesController;
