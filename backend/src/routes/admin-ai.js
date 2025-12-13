const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Try to import AIService, but handle gracefully if not available
let aiService = null;
try {
  aiService = require('../services/AIService');
} catch (error) {
  console.warn('AIService not available:', error.message);
}

/**
 * @swagger
 * /api/admin/ai/settings:
 *   get:
 *     summary: Get AI settings (Admin only)
 *     tags: [Admin, AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI settings
 */
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (aiService && aiService.getSettings) {
      const settings = await aiService.getSettings();
      res.json({
        ...settings,
        api_key_configured: !!process.env.GEMINI_API_KEY
      });
    } else {
      // Fallback response when AIService is not available
      res.json({
        enabled: false,
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        daily_limit: 100,
        monthly_limit: 1000,
        api_key_configured: !!process.env.GEMINI_API_KEY,
        message: 'AI Service not fully initialized'
      });
    }
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    res.json({
      enabled: false,
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      daily_limit: 100,
      monthly_limit: 1000,
      api_key_configured: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/ai/settings:
 *   put:
 *     summary: Update AI settings (Admin only)
 *     tags: [Admin, AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               provider:
 *                 type: string
 *               model:
 *                 type: string
 *               daily_limit:
 *                 type: integer
 *               monthly_limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { enabled, provider, model, daily_limit, monthly_limit } = req.body;

    if (aiService && aiService.updateSettings) {
      await aiService.updateSettings({
        enabled,
        provider,
        model,
        daily_limit,
        monthly_limit
      });

      res.json({
        success: true,
        message: 'AI settings updated successfully'
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'AI Service not available',
        message: 'AI settings cannot be updated at this time'
      });
    }
  } catch (error) {
    console.error('Error updating AI settings:', error);
    res.status(500).json({
      error: 'Failed to update AI settings',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/ai/analytics:
 *   get:
 *     summary: Get AI analytics (Admin only)
 *     tags: [Admin, AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: AI analytics
 */
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    if (aiService && aiService.getAnalytics) {
      const analytics = await aiService.getAnalytics(parseInt(days));

      const totalRequests = analytics.reduce((sum, day) => sum + day.total_requests, 0);
      const avgResponseTime = analytics.length > 0
        ? analytics.reduce((sum, day) => sum + (day.avg_response_time || 0), 0) / analytics.length
        : 0;

      res.json({
        total_requests: totalRequests,
        total_users: analytics.length > 0 ? Math.max(...analytics.map(d => d.unique_users)) : 0,
        avg_response_time: avgResponseTime,
        daily_stats: analytics
      });
    } else {
      res.json({
        total_requests: 0,
        total_users: 0,
        avg_response_time: 0,
        daily_stats: [],
        message: 'AI Service not available'
      });
    }
  } catch (error) {
    console.error('Error fetching AI analytics:', error);
    res.json({
      total_requests: 0,
      total_users: 0,
      avg_response_time: 0,
      daily_stats: [],
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/ai/usage:
 *   get:
 *     summary: Get AI usage statistics (Admin only)
 *     tags: [Admin, AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI usage statistics
 */
router.get('/usage', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (aiService && aiService.getUsageStats) {
      const usage = await aiService.getUsageStats();
      res.json(usage);
    } else {
      res.json({
        total_requests: 0,
        active_users: 0,
        requests_today: 0,
        avg_response_time: 0,
        message: 'AI Service not available'
      });
    }
  } catch (error) {
    console.error('Error fetching AI usage:', error);
    res.json({
      total_requests: 0,
      active_users: 0,
      requests_today: 0,
      avg_response_time: 0,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/ai/test-connection:
 *   post:
 *     summary: Test AI service connection (Admin only)
 *     tags: [Admin, AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection test result
 */
router.post('/test-connection', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (aiService && aiService.testConnection) {
      const result = await aiService.testConnection();
      res.json(result);
    } else {
      res.json({
        success: false,
        error: 'AI Service not available',
        message: 'Cannot test connection - AI Service not initialized'
      });
    }
  } catch (error) {
    console.error('Error testing AI connection:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
