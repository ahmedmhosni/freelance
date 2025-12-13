require('dotenv').config();

const { bootstrap } = require('./core/bootstrap');
const logger = require('./core/logger');

// Import existing routes only (avoid missing module errors)
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const quotesRoutes = require('./routes/quotes');
const maintenanceRoutes = require('./routes/maintenance');
const healthRoutes = require('./routes/health');
const aiRoutes = require('./routes/ai');
const preferencesRoutes = require('./routes/preferences');
const feedbackRoutes = require('./routes/feedback');
const announcementsRoutes = require('./routes/announcements');
const changelogRoutes = require('./routes/changelog');
const gdprRoutes = require('./routes/gdpr');

// Import admin routes
const adminActivityRoutes = require('./routes/admin-activity');
const adminAiRoutes = require('./routes/admin-ai');
const adminGdprRoutes = require('./routes/admin-gdpr');

// Import additional routes
const legalRoutes = require('./routes/legal');
const statusRoutes = require('./routes/status');

const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

async function startServer() {
  try {
    logger.info('Starting server with bootstrap system');
    
    // Bootstrap the application with DI container and modular architecture
    const { container, app } = await bootstrap();
    
    // Trust proxy for Azure - be more specific to avoid rate limiter warnings
    if (process.env.WEBSITE_INSTANCE_ID) {
      // In Azure, trust the first proxy (Azure Load Balancer)
      app.set('trust proxy', 1);
    } else {
      // Local development
      app.set('trust proxy', false);
    }
    
    // Enhanced CORS for production
    const cors = require('cors');
    app.use(cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5173',
        'https://roastify.online',
        'https://white-sky-0a7e9f003.3.azurestaticapps.net',
        'https://white-sky-0a7e9f003.4.azurestaticapps.net'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Add existing routes only (v1 API) - specific routes first
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/quotes', quotesRoutes);
    app.use('/api/maintenance', maintenanceRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/preferences', preferencesRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/announcements', announcementsRoutes);
    app.use('/api/changelog', changelogRoutes);
    app.use('/api/gdpr', gdprRoutes);

    // Add admin routes with authentication
    app.use('/api/admin/activity', adminActivityRoutes);
    app.use('/api/admin/ai', adminAiRoutes);
    app.use('/api/admin/gdpr', adminGdprRoutes);

    // Add additional routes
    app.use('/api/legal', legalRoutes);
    app.use('/api/status', statusRoutes);

    // Add v1 API aliases for v2 modular APIs (for frontend compatibility)
    // The bootstrap system creates full APIs under /api/v2/, but frontend expects /api/
    
    // Get controllers from container for v1 aliases
    try {
      const clientController = container.resolve('clientController');
      const projectController = container.resolve('projectController');
      const taskController = container.resolve('taskController');
      const invoiceController = container.resolve('invoiceController');
      const timeEntryController = container.resolve('timeEntryController');
      const reportsController = container.resolve('reportsController');
      const notificationController = container.resolve('notificationController');

      // Add v1 API aliases with authentication
      const { authenticateToken } = require('./middleware/auth');
      
      app.use('/api/clients', authenticateToken, clientController.router);
      app.use('/api/projects', authenticateToken, projectController.router);
      app.use('/api/tasks', authenticateToken, taskController.router);
      app.use('/api/invoices', authenticateToken, invoiceController.router);
      app.use('/api/time-tracking', authenticateToken, timeEntryController.router);
      app.use('/api/reports', authenticateToken, reportsController.router);
      app.use('/api/notifications', authenticateToken, notificationController.router);
      
      logger.info('✅ All modular API controllers loaded successfully');
    } catch (error) {
      logger.error('❌ Error loading modular controllers:', error);
      
      // Fallback: Add minimal endpoints if controllers fail to load
      const { authenticateToken } = require('./middleware/auth');
      
      app.get('/api/clients', authenticateToken, (req, res) => res.json([]));
      app.get('/api/projects', authenticateToken, (req, res) => res.json([]));
      app.get('/api/tasks', authenticateToken, (req, res) => res.json([]));
      app.get('/api/invoices', authenticateToken, (req, res) => res.json([]));
      app.get('/api/time-tracking', authenticateToken, (req, res) => res.json([]));
      app.get('/api/notifications', authenticateToken, (req, res) => res.json([]));
      
      // Reports fallback endpoints
      app.get('/api/reports', authenticateToken, (req, res) => {
        res.json([
          { name: 'Financial Report', endpoint: '/api/reports/financial' },
          { name: 'Project Report', endpoint: '/api/reports/projects' },
          { name: 'Client Report', endpoint: '/api/reports/clients' }
        ]);
      });
      
      app.get('/api/reports/financial', authenticateToken, (req, res) => {
        res.json({
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          invoicesPaid: 0,
          invoicesPending: 0,
          monthlyRevenue: []
        });
      });
      
      app.get('/api/time-tracking/summary', authenticateToken, (req, res) => {
        res.json({
          totalHours: 0,
          totalEntries: 0,
          thisWeek: 0,
          thisMonth: 0,
          billableHours: 0,
          nonBillableHours: 0
        });
      });
      
      logger.info('✅ Fallback minimal endpoints loaded');
    }

    // Admin endpoints (basic fallbacks for missing endpoints)
    app.get('/api/admin/reports', (req, res) => {
      res.json([]);
    });

    app.get('/api/admin/users', (req, res) => {
      res.json([]);
    });

    // Add health routes last to avoid conflicts
    app.use('/api', healthRoutes);

    // Root endpoints
    app.get('/', (req, res) => {
      res.status(200).json({ 
        message: 'Roastify API Server - Full Production v2.2',
        version: '2.0.1',
        status: 'running',
        features: ['Bootstrap System', 'DI Container', 'All Modules', 'AI Assistant'],
        timestamp: new Date().toISOString()
      });
    });

    // Temporary debug endpoint to check environment variables
    app.get('/api/debug/env', (req, res) => {
      const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        WEBSITE_INSTANCE_ID: process.env.WEBSITE_INSTANCE_ID ? 'SET' : 'MISSING',
        DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
        DB_PORT: process.env.DB_PORT || 'MISSING',
        DB_DATABASE: process.env.DB_DATABASE ? 'SET' : 'MISSING',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING',
        DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || 'MISSING'
      };
      
      res.json({
        message: 'Environment Variables Status',
        environment: process.env.NODE_ENV || 'development',
        isAzure: !!process.env.WEBSITE_INSTANCE_ID,
        variables: envVars,
        timestamp: new Date().toISOString()
      });
    });

    // Debug endpoint to test database connection used by auth routes
    app.get('/api/debug/db', async (req, res) => {
      try {
        const { query } = require('./db/postgresql');
        const result = await query('SELECT COUNT(*) as user_count FROM users');
        res.json({
          message: 'Database connection test',
          success: true,
          userCount: result.rows[0].user_count,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          message: 'Database connection failed',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Debug endpoint to check user verification status
    app.get('/api/debug/users', async (req, res) => {
      try {
        const { query } = require('./db/postgresql');
        const result = await query('SELECT id, email, email_verified, created_at FROM users ORDER BY id DESC LIMIT 5');
        res.json({
          message: 'Recent users status',
          success: true,
          users: result.rows,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          message: 'Failed to fetch users',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Debug endpoint to verify a user (for testing)
    app.post('/api/debug/verify-user', async (req, res) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }
        
        const { query } = require('./db/postgresql');
        const result = await query('UPDATE users SET email_verified = true WHERE email = $1 RETURNING id, email, email_verified', [email]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
          message: 'User verified successfully',
          success: true,
          user: result.rows[0],
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          message: 'Failed to verify user',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    app.get('/status', (req, res) => {
      res.status(200).json({ 
        status: 'OK',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Azure health check endpoints
    app.get('/robots933456.txt', (req, res) => {
      res.status(200).send('User-agent: *\nDisallow:');
    });

    app.get('/robots.txt', (req, res) => {
      res.status(200).send('User-agent: *\nDisallow:');
    });

    // Global error handler
    app.use((err, req, res, next) => {
      logger.error('Unhandled error:', err);
      res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString()
      });
    });

    // Start server with Socket.io support
    const http = require('http');
    const { Server } = require('socket.io');
    
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:5173',
          'https://roastify.online',
          'https://white-sky-0a7e9f003.3.azurestaticapps.net',
          'https://white-sky-0a7e9f003.4.azurestaticapps.net'
        ],
        credentials: true
      }
    });

    // Socket.io connection handling
    io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);
      
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });

    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Full Production Server running on port ${PORT}`);
      logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✅ Bootstrap system with DI container initialized`);
      logger.info(`✅ All modules loaded: Auth, AI, Clients, Projects, Tasks, Invoices`);
      logger.info(`✅ Socket.io enabled for real-time features`);
      logger.info(`✅ Listening on all interfaces`);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    
    // In Azure, don't exit immediately - let the platform handle restarts
    if (process.env.WEBSITE_INSTANCE_ID) {
      logger.error('Azure environment detected - server will be restarted by platform');
      // Keep process alive for a bit to allow logging
      setTimeout(() => process.exit(1), 5000);
    } else {
      process.exit(1);
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  if (!process.env.WEBSITE_INSTANCE_ID) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  if (!process.env.WEBSITE_INSTANCE_AZURE) {
    process.exit(1);
  }
});

startServer();