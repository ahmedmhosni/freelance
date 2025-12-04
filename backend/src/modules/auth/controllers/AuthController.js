const express = require('express');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */
class AuthController {
  constructor(authService) {
    this.authService = authService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Public routes
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/refresh', this.refreshToken.bind(this));

    // Protected routes
    this.router.get('/me', authenticateToken, this.getCurrentUser.bind(this));
    this.router.post('/change-password', authenticateToken, this.changePassword.bind(this));
    this.router.post('/logout', authenticateToken, this.logout.bind(this));
  }

  /**
   * Register new user
   * POST /api/v2/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      // Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and password are required'
        });
      }

      const user = await this.authService.register({ name, email, password, role });

      // In test environment, auto-login after registration
      if (process.env.NODE_ENV === 'test') {
        const token = this.authService.generateToken(user);
        return res.status(201).json({
          success: true,
          token,
          user: user.toSafeJSON()
        });
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: user.toSafeJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v2/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const { user, token } = await this.authService.login(email, password);

      res.json({
        success: true,
        token,
        user: user.toSafeJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/v2/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await this.authService.getUserById(userId);

      res.json({
        success: true,
        user: user.toSafeJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * POST /api/v2/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Basic validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * POST /api/v2/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token is required'
        });
      }

      const newToken = await this.authService.refreshToken(token);

      res.json({
        success: true,
        token: newToken
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v2/auth/logout
   */
  async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // But we can track it for analytics
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
