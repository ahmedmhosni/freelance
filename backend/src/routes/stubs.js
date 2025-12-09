/**
 * Stub Routes
 * Temporary routes for endpoints that return 500 errors in production
 * These provide graceful fallbacks until full implementations are ready
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Activity stats stub
router.get('/admin/activity/stats', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 0,
      activeUsers: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      message: 'Activity tracking coming soon'
    }
  });
});

// GDPR export requests stub
router.get('/admin/gdpr/export-requests', authenticate, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'No export requests'
  });
});

// Legal terms stub
router.get('/legal/terms', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Terms of Service',
      content: 'Terms of Service documentation is being prepared.',
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// Changelog version names stub
router.get('/changelog/admin/version-names', authenticate, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'No versions available'
  });
});

// Changelog versions stub
router.get('/changelog/admin/versions', authenticate, (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });
});

// Feedback stub
router.get('/feedback', authenticate, (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });
});

module.exports = router;
