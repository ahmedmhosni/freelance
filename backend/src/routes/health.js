const express = require('express');
const router = express.Router();
const { query } = require('../db/postgresql');

// Health check endpoint for monitoring
router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  try {
    // Check database connection
    const dbStart = Date.now();
    await query('SELECT 1 as health_check');
    const dbResponseTime = Date.now() - dbStart;
    
    health.checks.database = {
      status: dbResponseTime < 1000 ? 'healthy' : 'slow',
      responseTime: `${dbResponseTime}ms`
    };
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = {
      status: 'unhealthy',
      error: 'Database connection failed'
    };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  health.checks.memory = {
    status: heapUsedPercent < 90 ? 'healthy' : 'warning',
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    percentage: `${Math.round(heapUsedPercent)}%`
  };

  // Check disk space (if available)
  health.checks.disk = {
    status: 'healthy',
    message: 'Disk monitoring not implemented'
  };

  // Overall status
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;
