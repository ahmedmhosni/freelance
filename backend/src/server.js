require('dotenv').config();

// Application Insights - Must be first!
if (process.env.NODE_ENV === 'production' && process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  const appInsights = require('applicationinsights');
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();
  console.log('✅ Application Insights initialized');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

// Old routes that are still needed (no new architecture equivalent yet)
const fileRoutes = require('./routes/files');
const dashboardRoutes = require('./routes/dashboard');
const quotesRoutes = require('./routes/quotes');
const maintenanceRoutes = require('./routes/maintenance');
const statusRoutes = require('./routes/status');
const profileRoutes = require('./routes/profile');
const userPreferencesRoutes = require('./routes/userPreferences');
const legalRoutes = require('./routes/legal');
const healthRoutes = require('./routes/health');
const feedbackRoutes = require('./routes/feedback');
const mediaRoutes = require('./routes/media');
const preferencesRoutes = require('./routes/preferences');
const gdprRoutes = require('./routes/gdpr');
const adminGdprRoutes = require('./routes/admin-gdpr');
const adminActivityRoutes = require('./routes/admin-activity');
const versionRoutes = require('./routes/version');
const changelogRoutes = require('./routes/changelog');
const announcementsRoutes = require('./routes/announcements');
const aiRoutes = require('./routes/ai');
const adminAiRoutes = require('./routes/admin-ai');

const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./shared/middleware/errorHandler');
const logger = require('./utils/logger');
const { swaggerUi, specs } = require('./swagger');

// New architecture imports
const { bootstrap } = require('./core/bootstrap');
const { loggingMiddleware } = require('./shared/middleware/loggingMiddleware');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const server = http.createServer(app);

// Trust proxy - Required for reverse proxies to get real client IP
app.set('trust proxy', true);

// Allowed origins for CORS - use environment variable or defaults
// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];

// Add production URLs from environment variable
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Add additional allowed origins from environment (comma-separated)
if (process.env.ALLOWED_ORIGINS) {
  const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...additionalOrigins);
}

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Apply comprehensive security middleware (HTTPS, HSTS, secure cookies, etc.)
const { applySecurityMiddleware } = require('./middleware/securityHeaders');
applySecurityMiddleware(app);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Compression middleware - compress all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9, 6 is default and good balance)
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Add logging middleware for new architecture routes
app.use('/api/', loggingMiddleware);

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Make io accessible to routes
app.set('io', io);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Roastify API Documentation'
}));

// CSRF token endpoint
const { getCsrfToken } = require('./middleware/csrfProtection');
app.get('/api/csrf-token', getCsrfToken);

// Health check (must be before other routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Bootstrap new architecture (DI container and modules)
bootstrap({ createApp: false }).then(({ container }) => {
  // New architecture routes (now default at /api/*)
  const clientController = container.resolve('clientController');
  app.use('/api/clients', clientController.router);

  const projectController = container.resolve('projectController');
  app.use('/api/projects', projectController.router);

  const taskController = container.resolve('taskController');
  app.use('/api/tasks', taskController.router);

  const invoiceController = container.resolve('invoiceController');
  app.use('/api/invoices', invoiceController.router);

  const timeEntryController = container.resolve('timeEntryController');
  app.use('/api/time-tracking', timeEntryController.router);

  // Reports module (new architecture)
  const reportsController = container.resolve('reportsController');
  app.use('/api/reports', reportsController.router);

  // Notifications module (new architecture)
  const notificationController = container.resolve('notificationController');
  app.use('/api/notifications', notificationController.router);

  // Auth module (new architecture)
  const authController = container.resolve('authController');
  app.use('/api/auth', authController.router);

  // Admin module (new architecture)
  const adminController = container.resolve('adminController');
  app.use('/api/admin', adminController.router);

  // User Preferences module (new architecture)
  const userPreferencesController = container.resolve('userPreferencesController');
  app.use('/api/user', userPreferencesController.router);

  // GDPR module (new architecture)
  const gdprController = container.resolve('gdprController');
  app.use('/api/gdpr', gdprController.router);

  // Additional routes that don't have new architecture equivalents yet
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/quotes', quotesRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/status', statusRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/legal', legalRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/preferences', preferencesRoutes);
  app.use('/api/admin/gdpr', adminGdprRoutes);
  app.use('/api/admin/activity', adminActivityRoutes);
  app.use('/api/admin/ai', adminAiRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/version', versionRoutes);
  app.use('/api/changelog', changelogRoutes);
  app.use('/api/announcements', announcementsRoutes);
  app.use('/api', healthRoutes);

  // Public route aliases (without /api prefix for frontend compatibility)
  app.use('/maintenance', maintenanceRoutes);
  app.use('/changelog', changelogRoutes);
  app.use('/announcements', announcementsRoutes);

  // Serve static files from frontend build in production
  if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    const frontendPath = path.join(__dirname, '../../frontend/dist');
    
    app.use(express.static(frontendPath));
    
    // Serve index.html for all non-API routes (SPA support)
    // Only catch routes that don't start with /api, /maintenance, /changelog, or /announcements
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || 
          req.path.startsWith('/maintenance') || 
          req.path.startsWith('/changelog') || 
          req.path.startsWith('/announcements')) {
        return next(); // Let it fall through to 404 handler
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  // 404 handler
  app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND'
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  // Start server after all routes are registered
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`WebSocket server ready`);
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch(error => {
  logger.error('Failed to bootstrap application', error);
  process.exit(1);
});
