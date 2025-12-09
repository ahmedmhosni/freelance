/**
 * AI Assistant Routes
 * Handles chat requests and AI-related endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const AIService = require('../services/AIService');
const Database = require('../core/database/Database');
const config = require('../core/config/config');
const logger = require('../utils/logger');

// Initialize database and AI service
const dbConfig = config.getDatabaseConfig();
const database = new Database(dbConfig);
const aiService = new AIService(database);

/**
 * POST /api/ai/chat
 * Send a message to AI assistant
 */
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty'
      });
    }

    logger.info('AI chat request', { userId, messageLength: message.length });

    // Send to AI service
    const result = await aiService.chat(userId, message.trim(), context || {});

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('AI chat error', error);
    
    res.status(error.message.includes('disabled') ? 403 : 500).json({
      success: false,
      error: error.message || 'Failed to process AI request'
    });
  }
});

/**
 * GET /api/ai/status
 * Get AI assistant status and user usage
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const enabled = await aiService.isEnabled();
    const usage = await aiService.getUserUsage(userId);
    const settings = await aiService.getSettings();

    res.json({
      success: true,
      data: {
        enabled,
        usage,
        provider: settings.provider,
        maxMessageLength: settings.max_message_length
      }
    });
  } catch (error) {
    logger.error('AI status error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI status'
    });
  }
});

/**
 * GET /api/ai/health
 * Health check for AI provider
 */
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('AI health check error', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

module.exports = router;
