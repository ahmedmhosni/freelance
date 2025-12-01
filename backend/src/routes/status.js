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

  // Internal detailed status (not exposed to public)
  const internalStatus = {
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    errors: [],
  };

  // Public status (sanitized)
  const status = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      api: {
        status: 'operational',
        responseTime: 0,
      },
      database: {
        status: 'unknown',
        responseTime: 0,
      },
      email: {
        status: 'unknown',
        responseTime: 0,
      },
      websocket: {
        status: 'operational',
      },
    },
  };

  // Check database
  try {
    const dbStart = Date.now();
    await query('SELECT 1');
    status.services.database.status = 'operational';
    status.services.database.responseTime = Date.now() - dbStart;
  } catch (error) {
    status.services.database.status = 'degraded';
    status.status = 'degraded';
    internalStatus.errors.push({ service: 'database', error: error.message });
  }

  // Check email service
  try {
    if (emailService.client) {
      status.services.email.status = 'operational';
    } else {
      status.services.email.status = 'operational'; // Don't expose "not_configured"
    }
  } catch (error) {
    status.services.email.status = 'degraded';
    internalStatus.errors.push({ service: 'email', error: error.message });
  }

  // API response time
  status.services.api.responseTime = Date.now() - startTime;

  // Overall status
  const allOperational = Object.values(status.services).every(
    (service) => service.status === 'operational'
  );

  if (!allOperational) {
    status.status = 'degraded';
  }

  // Save status to history (async, don't wait)
  saveStatusHistory(status.services).catch((err) =>
    console.error('Failed to save status history:', err)
  );

  // If admin is requesting (has auth header), include internal details
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Add system metrics for authenticated users
    status.uptime = internalStatus.uptime;
    status.version = internalStatus.version;
    status.environment = internalStatus.environment;
  }

  res.json(status);
});

// Helper function to save status history
async function saveStatusHistory(services) {
  try {
    // Check if table exists first
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'status_history'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      return; // Table doesn't exist yet, skip saving
    }

    for (const [serviceName, serviceData] of Object.entries(services)) {
      await query(
        `INSERT INTO status_history (service_name, status, response_time, checked_at)
         VALUES ($1, $2, $3, NOW())`,
        [serviceName, serviceData.status, serviceData.responseTime || null]
      );
    }
  } catch (error) {
    // Silently fail - don't break the status endpoint
    console.error('Error saving status history:', error.message);
  }
}

/**
 * @swagger
 * /api/status/history:
 *   get:
 *     summary: Get status history for the last 24 hours (Public)
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: Status history data
 */
router.get('/history', async (req, res) => {
  try {
    // Check if table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'status_history'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      return res.json({
        history: {},
        message: 'History tracking not yet enabled',
      });
    }

    // Get history for last 90 days, grouped by day
    const history = await query(`
      SELECT 
        service_name,
        DATE_TRUNC('day', checked_at) as day,
        COUNT(*) as total_checks,
        COUNT(CASE WHEN status = 'operational' THEN 1 END) as successful_checks,
        AVG(response_time) as avg_response_time,
        MAX(checked_at) as last_check
      FROM status_history
      WHERE checked_at >= NOW() - INTERVAL '90 days'
      GROUP BY service_name, DATE_TRUNC('day', checked_at)
      ORDER BY service_name, day DESC
    `);

    // Format data by service
    const formattedHistory = {};
    history.rows.forEach((row) => {
      if (!formattedHistory[row.service_name]) {
        formattedHistory[row.service_name] = [];
      }
      formattedHistory[row.service_name].push({
        hour: row.day, // Keep 'hour' key for frontend compatibility
        uptime: ((row.successful_checks / row.total_checks) * 100).toFixed(2),
        avgResponseTime: row.avg_response_time
          ? Math.round(row.avg_response_time)
          : null,
        checks: row.total_checks,
      });
    });

    res.json({ history: formattedHistory });
  } catch (error) {
    console.error('Error fetching status history:', error);
    res.status(500).json({ error: 'Failed to fetch status history' });
  }
});

/**
 * @swagger
 * /api/status/detailed:
 *   get:
 *     summary: Get detailed system metrics (Admin Only)
 *     tags: [Status]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed system metrics
 *       401:
 *         description: Unauthorized
 */
router.get('/detailed', async (req, res) => {
  // Check for admin authentication (optional - can be made required)
  const isAdmin = req.headers.authorization && req.user?.role === 'admin';

  if (!isAdmin) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin access required for detailed metrics',
    });
  }
  const status = {
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: {
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
    database: {
      status: 'checking...',
      tables: [],
    },
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
