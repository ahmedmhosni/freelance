/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

const authService = require('../services/auth.service');
const { validateRegistration, validateLogin } = require('../validators/auth.validator');

class AuthController {
  async register(req, res, next) {
    try {
      const { error } = validateRegistration(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { error } = validateLogin(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      await authService.verifyEmail(req.body.token);
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req, res, next) {
    try {
      await authService.resendVerification(req.body.email);
      res.json({ message: 'Verification email sent' });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
