/**
 * Status Module
 */

const express = require('express');

const router = express.Router();

// Public status endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: 'operational'
    }
  });
});

module.exports = router;
