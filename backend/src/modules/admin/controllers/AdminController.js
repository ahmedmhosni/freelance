const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const { authenticateToken, requireAdmin } = require('../../../middleware/auth');

/**
 * Admin Controller
 * Handles HTTP requests for administrative operations
 */
class AdminController extends BaseController {
  constructor(adminService) {
    super(adminService);
    this.adminService = adminService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Apply authentication and admin check to all routes
    this.router.use(authenticateToken);
    this.router.use(requireAdmin);

    // User management
    this.router.get('/users', this.getAllUsers.bind(this));
    this.router.get('/users/:id', this.getUserWithStats.bind(this));
    this.router.put('/users/:id/role', this.updateUserRole.bind(this));
    this.router.put('/users/:id/verification', this.updateUserVerification.bind(this));
    this.router.delete('/users/:id', this.deleteUser.bind(this));

    // System statistics
    this.router.get('/stats', this.getSystemStats.bind(this));
    this.router.get('/reports', this.getSystemReports.bind(this));
  }

  /**
   * Get all users
   * GET /api/v2/admin/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await this.adminService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user with statistics
   * GET /api/v2/admin/users/:id
   */
  async getUserWithStats(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const result = await this.adminService.getUserWithStats(userId);
      
      res.json({
        user: result.user,
        stats: result.stats.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   * PUT /api/v2/admin/users/:id/role
   */
  async updateUserRole(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          error: 'Role is required'
        });
      }

      await this.adminService.updateUserRole(userId, role);

      res.json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user verification status
   * PUT /api/v2/admin/users/:id/verification
   */
  async updateUserVerification(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const { email_verified } = req.body;

      if (email_verified === undefined) {
        return res.status(400).json({
          success: false,
          error: 'email_verified is required'
        });
      }

      await this.adminService.updateUserVerification(userId, email_verified);

      res.json({
        success: true,
        message: 'User verification status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/v2/admin/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
      }

      await this.adminService.deleteUser(userId);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system statistics
   * GET /api/v2/admin/stats
   */
  async getSystemStats(req, res, next) {
    try {
      const stats = await this.adminService.getSystemStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system reports
   * GET /api/admin/reports
   */
  async getSystemReports(req, res, next) {
    try {
      const stats = await this.adminService.getSystemStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
