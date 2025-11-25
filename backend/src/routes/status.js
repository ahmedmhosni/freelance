const express = require('express');
const sql = require('mssql');
const db = require('../db');
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: operational
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 services:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: operational
 *                         responseTime:
 *                           type: number
 *                           example: 5
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: operational
 *                         responseTime:
 *                           type: number
 *                           example: 12
 *                     email:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: operational
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
    const pool = await db;
    const request = pool.request();
    request.timeout = 30000; // 30 second timeout for status check
    await request.query('SELECT 1');
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

  // Check database tables
  try {
    const pool = await db;
    const result = await pool.request().query(`
      SELECT 
        t.name as table_name,
        SUM(p.rows) as row_count
      FROM sys.tables t
      INNER JOIN sys.partitions p ON t.object_id = p.object_id
      WHERE p.index_id IN (0,1)
      GROUP BY t.name
      ORDER BY t.name
    `);
    
    status.database.status = 'operational';
    status.database.tables = result.recordset;
  } catch (error) {
    status.database.status = 'error';
    status.database.error = error.message;
  }

  res.json(status);
});

module.exports = router;
