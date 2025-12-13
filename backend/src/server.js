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

const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

async function startServer() {
  try {
    logger.info('Starting server with bootstrap system');
    
    // Bootstrap the application with DI container and modular architecture
    const { container, app } = await bootstrap();
    
    // Trust proxy for Azure
    app.set('trust proxy', true);
    
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

    // Add existing routes only (v1 API)
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/quotes', quotesRoutes);
    app.use('/api/maintenance', maintenanceRoutes);
    app.use('/api', healthRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/preferences', preferencesRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/announcements', announcementsRoutes);
    app.use('/api/changelog', changelogRoutes);
    app.use('/api/gdpr', gdprRoutes);

    // Root endpoints
    app.get('/', (req, res) => {
      res.status(200).json({ 
        message: 'Roastify API Server - Full Production v2.1',
        version: '2.0.0',
        status: 'running',
        features: ['Bootstrap System', 'DI Container', 'All Modules', 'AI Assistant'],
        timestamp: new Date().toISOString()
      });
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

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Full Production Server running on port ${PORT}`);
      logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✅ Bootstrap system with DI container initialized`);
      logger.info(`✅ All modules loaded: Auth, AI, Clients, Projects, Tasks, Invoices`);
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