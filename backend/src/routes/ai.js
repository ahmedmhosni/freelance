const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// AI Assistant routes - Placeholder until full implementation
// Tables exist in database, but service layer not yet implemented

router.post('/chat', authenticateToken, async (req, res) => {
  res.status(503).json({
    error: 'AI Assistant service is not yet configured',
    message: 'Please configure GEMINI_API_KEY in Azure App Service settings'
  });
});

router.get('/conversations', authenticateToken, async (req, res) => {
  res.json({ conversations: [] });
});

router.get('/usage', authenticateToken, async (req, res) => {
  res.json({
    daily_requests: 0,
    monthly_requests: 0,
    daily_limit: 100,
    monthly_limit: 1000
  });
});

module.exports = router;
