/**
 * Admin AI Routes
 * Admin-only endpoints for managing AI assistant
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const AIService = require('../services/AIService');
const Database = require('../core/database/Database');
const config = require('../core/config/config');
const logger = require('../utils/logger');

// Initialize database and AI service
const dbConfig = config.getDatabaseConfig();
const database = new Database(dbConfig);
const aiService = new AIService(database);

/**
 * GET /api/admin/ai/settings
 * Get AI assistant settings
 */
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await aiService.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error fetching AI settings', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI settings'
    });
  }
});

/**
 * PUT /api/admin/ai/settings
 * Update AI assistant settings
 */
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      enabled,
      provider,
      maxRequestsPerDay,
      maxRequestsPerHour,
      maxMessageLength,
      systemPrompt
    } = req.body;

    const settings = await aiService.updateSettings({
      enabled,
      provider,
      maxRequestsPerDay,
      maxRequestsPerHour,
      maxMessageLength,
      systemPrompt
    });

    logger.info('AI settings updated', { adminId: req.user.id, settings });

    res.json({
      success: true,
      data: settings,
      message: 'AI settings updated successfully'
    });
  } catch (error) {
    logger.error('Error updating AI settings', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AI settings'
    });
  }
});

/**
 * GET /api/admin/ai/analytics
 * Get AI usage analytics
 */
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    
    const analytics = await aiService.getAnalytics(days);
    
    // Get total stats
    const totalStats = await database.queryOne(`
      SELECT 
        SUM(total_requests) as total_requests,
        SUM(total_tokens) as total_tokens,
        AVG(avg_response_time_ms) as avg_response_time,
        SUM(error_count) as total_errors
      FROM ai_analytics
      WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
    `);

    // Get active users count
    const activeUsers = await database.queryOne(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM ai_conversations
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    `);

    res.json({
      success: true,
      data: {
        daily: analytics,
        totals: {
          requests: totalStats?.total_requests || 0,
          tokens: totalStats?.total_tokens || 0,
          avgResponseTime: Math.round(totalStats?.avg_response_time || 0),
          errors: totalStats?.total_errors || 0,
          activeUsers: activeUsers?.count || 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching AI analytics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI analytics'
    });
  }
});

/**
 * GET /api/admin/ai/users
 * Get user usage statistics
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await database.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        au.request_count,
        au.daily_count,
        au.total_tokens_used,
        au.last_request_at
      FROM users u
      LEFT JOIN ai_usage au ON u.id = au.user_id
      WHERE au.request_count > 0
      ORDER BY au.request_count DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Error fetching AI user stats', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

/**
 * GET /api/admin/ai/conversations
 * Get recent conversations (for monitoring)
 */
router.get('/conversations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const conversations = await database.query(`
      SELECT 
        ac.id,
        ac.message,
        ac.response,
        ac.tokens_used,
        ac.response_time_ms,
        ac.created_at,
        u.name as user_name,
        u.email as user_email
      FROM ai_conversations ac
      JOIN users u ON ac.user_id = u.id
      ORDER BY ac.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    logger.error('Error fetching conversations', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

/**
 * POST /api/admin/ai/test
 * Test AI assistant (admin only)
 */
router.post('/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await aiService.chat(req.user.id, message, { test: true });

    res.json({
      success: true,
      data: result,
      message: 'Test successful'
    });
  } catch (error) {
    logger.error('AI test error', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Test failed'
    });
  }
});

module.exports = router;
