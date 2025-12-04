const express = require('express');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Notification Controller
 * Handles HTTP requests for notifications
 */
class NotificationController {
  constructor(notificationService) {
    this.notificationService = notificationService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Get user notifications
    this.router.get('/', this.getUserNotifications.bind(this));

    // Get notification count
    this.router.get('/count', this.getNotificationCount.bind(this));
  }

  /**
   * Get user notifications
   * GET /api/v2/notifications
   */
  async getUserNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const notifications = await this.notificationService.getUserNotifications(userId);
      res.json(notifications.map(n => n.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification count
   * GET /api/v2/notifications/count
   */
  async getNotificationCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
