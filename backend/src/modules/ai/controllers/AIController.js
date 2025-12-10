const BaseController = require('../../../shared/base/BaseController');
const { authenticateToken, requireAdmin } = require('../../../middleware/auth');
const { validationResult } = require('express-validator');
const ChatRequestDTO = require('../dto/ChatRequestDTO');
const UpdateSettingsDTO = require('../dto/UpdateSettingsDTO');
const {
  chatValidation,
  settingsUpdateValidation,
  conversationIdValidation,
  usageQueryValidation
} = require('../validators/aiValidator');

/**
 * AI Controller
 * Handles HTTP requests for AI operations
 */
class AIController extends BaseController {
  constructor(service) {
    super(service);
  }

  /**
   * Setup AI-specific routes
   * @private
   */
  _setupRoutes() {
    // Public routes
    this.router.get('/status', this.getStatus.bind(this));

    // User routes (require authentication)
    this.router.post('/chat', authenticateToken, chatValidation, this.chat.bind(this));
    this.router.get('/conversations', authenticateToken, this.getUserConversations.bind(this));
    this.router.get('/conversations/:conversationId', authenticateToken, conversationIdValidation, this.getConversationHistory.bind(this));
    this.router.get('/usage', authenticateToken, this.getUserUsage.bind(this));

    // Admin routes
    this.router.get('/admin/settings', authenticateToken, requireAdmin, this.getSettings.bind(this));
    this.router.put('/admin/settings', authenticateToken, requireAdmin, settingsUpdateValidation, this.updateSettings.bind(this));
    this.router.post('/admin/test-connection', authenticateToken, requireAdmin, this.testConnection.bind(this));
    this.router.get('/admin/usage', authenticateToken, requireAdmin, usageQueryValidation, this.getUsageStats.bind(this));
    this.router.get('/admin/all-usage', authenticateToken, requireAdmin, this.getAllUsage.bind(this));
  }

  /**
   * Get AI status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getStatus(req, res, next) {
    try {
      const status = this.service.getStatus();
      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Chat with AI
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async chat(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const chatRequest = new ChatRequestDTO(req.body);

      const response = await this.service.chat(userId, chatRequest);
      
      res.json({
        success: true,
        data: response.toResponse()
      });
    } catch (error) {
      if (error.message.includes('limit reached')) {
        return res.status(429).json({
          success: false,
          error: error.message,
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }
      next(error);
    }
  }

  /**
   * Get user conversations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getUserConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const conversations = await this.service.getUserConversations(userId);
      
      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversation history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getConversationHistory(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const { conversationId } = req.params;
      
      const history = await this.service.getConversationHistory(userId, conversationId);
      
      res.json({
        success: true,
        data: history.map(msg => msg.toResponse())
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user usage
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getUserUsage(req, res, next) {
    try {
      const userId = req.user.id;
      const usage = await this.service.getUserUsage(userId);
      
      res.json({
        success: true,
        data: usage ? usage.toResponse() : null
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== Admin Methods ====================

  /**
   * Get AI settings (Admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getSettings(req, res, next) {
    try {
      const settings = await this.service.getSettings();
      
      res.json({
        success: true,
        data: {
          ...settings.toResponse(),
          api_key_configured: !!process.env.GEMINI_API_KEY
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update AI settings (Admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async updateSettings(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const updateDTO = new UpdateSettingsDTO(req.body);
      const settings = await this.service.updateSettings(updateDTO);
      
      res.json({
        success: true,
        message: 'AI settings updated successfully',
        data: settings.toResponse()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test AI connection (Admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async testConnection(req, res, next) {
    try {
      const result = await this.service.testConnection();
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get usage statistics (Admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getUsageStats(req, res, next) {
    try {
      const stats = await this.service.getUsageStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users usage (Admin)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async getAllUsage(req, res, next) {
    try {
      const usage = await this.service.getAllUsage();
      
      res.json({
        success: true,
        data: usage
      });
    } catch (error) {
      next(error);
    }
  }

  // Override base methods (not needed for AI module)
  async getAll(req, res, next) {
    res.status(404).json({ error: 'Not implemented' });
  }

  async getById(req, res, next) {
    res.status(404).json({ error: 'Not implemented' });
  }

  async create(req, res, next) {
    res.status(404).json({ error: 'Not implemented' });
  }

  async update(req, res, next) {
    res.status(404).json({ error: 'Not implemented' });
  }

  async delete(req, res, next) {
    res.status(404).json({ error: 'Not implemented' });
  }
}

module.exports = AIController;