const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin AI routes - Placeholder until full implementation

router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  res.json({
    enabled: false,
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    daily_limit: 100,
    monthly_limit: 1000
  });
});

router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  res.status(503).json({
    error: 'AI Assistant admin features not yet implemented',
    message: 'Configuration will be available in a future update'
  });
});

router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  res.json({
    total_requests: 0,
    total_users: 0,
    avg_response_time: 0,
    daily_stats: []
  });
});

router.get('/usage', authenticateToken, requireAdmin, async (req, res) => {
  res.json({ users: [] });
});

module.exports = router;
