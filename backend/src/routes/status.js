const express = require('express');
const { query } = require('../db/postgresql');
const emailService = require('../services/emailService');

const router = express.Router();

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Get system status (Public)
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: System status information
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const status = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: {
        status: 'operational',
        responseTime: 0
      },
      database: {
        status: 'unknown',
        responseTime: 0
      },
      email: {
        status: 'unknown',
        responseTime: 0
      },
      websocket: {
        status: 'operational',
        connections: 0
      }
    }
  };

  // Check database
  try {
    const dbStart = Date.now();
    await query('SELECT 1');
    status.services.database.status = 'operational';
    status.services.database.responseTime = Date.now() - dbStart;
  } catch (error) {
    status.services.database.status = 'degraded';
    status.services.database.error = error.message;
    status.status = 'degraded';
  }

  // Check email service
  try {
    if (emailService.client) {
      status.services.email.status = 'operational';
    } else {
      status.services.email.status = 'not_configured';
    }
  } catch (error) {
    status.services.email.status = 'degraded';
    status.services.email.error = error.message;
  }

  // API response time
  status.services.api.responseTime = Date.now() - startTime;

  // Overall status
  const allOperational = Object.values(status.services).every(
    service => service.status === 'operational' || service.status === 'not_configured'
  );
  
  if (!allOperational) {
    status.status = 'degraded';
  }

  res.json(status);
});

/**
 * @swagger
 * /api/status/detailed:
 *   get:
 *     summary: Get detailed system metrics (Public)
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: Detailed system metrics
 */
router.get('/detailed', async (req, res) => {
  const status = {
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: {
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    database: {
      status: 'checking...',
      tables: []
    }
  };

  // Check database tables (PostgreSQL)
  try {
    const result = await query(`
      SELECT 
        schemaname,
        tablename as table_name,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      ORDER BY tablename
    `);
    
    status.database.status = 'operational';
    status.database.tables = result.rows;
  } catch (error) {
    status.database.status = 'error';
    status.database.error = error.message;
  }

  res.json(status);
});

module.exports = router;
