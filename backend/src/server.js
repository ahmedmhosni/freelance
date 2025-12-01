require('dotenv').config();

// Application Insights - Must be first!
if (
  process.env.NODE_ENV === 'production' &&
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
) {
  const appInsights = require('applicationinsights');
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
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
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth-pg');
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const invoiceRoutes = require('./routes/invoices');
const invoiceItemsRoutes = require('./routes/invoiceItems');
const fileRoutes = require('./routes/files');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const timeTrackingRoutes = require('./routes/timeTracking');
const dashboardRoutes = require('./routes/dashboard');
const quotesRoutes = require('./routes/quotes');
const maintenanceRoutes = require('./routes/maintenance');
const statusRoutes = require('./routes/status');
const profileRoutes = require('./routes/profile');
const userPreferencesRoutes = require('./routes/userPreferences');
const legalRoutes = require('./routes/legal');
const healthRoutes = require('./routes/health');
const feedbackRoutes = require('./routes/feedback');
const preferencesRoutes = require('./routes/preferences');
const gdprRoutes = require('./routes/gdpr');
const adminGdprRoutes = require('./routes/admin-gdpr');
const adminActivityRoutes = require('./routes/admin-activity');
const versionRoutes = require('./routes/version');
const changelogRoutes = require('./routes/changelog');
const announcementsRoutes = require('./routes/announcements');

const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { swaggerUi, specs } = require('./swagger');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const server = http.createServer(app);

// Trust proxy - Required for Azure App Service to get real client IP
// Azure uses X-Forwarded-For header
app.set('trust proxy', true);

// Allowed origins for CORS - use environment variable or defaults
const allowedOrigins = process.env.FRONTEND_URL
  ? [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
      'https://roastify.online',
      'https://www.roastify.online',
      'https://status.roastify.online',
    ]
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://white-sky-0a7e9f003.3.azurestaticapps.net',
      'https://roastify.online',
      'https://www.roastify.online',
      'https://status.roastify.online',
    ];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Middleware
app.use(helmet());
app.use(
  cors({
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
    credentials: true,
  })
);

// Request logging
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Roastify API Documentation',
  })
);

// CSRF token endpoint
const { getCsrfToken } = require('./middleware/csrfProtection');
app.get('/api/csrf-token', getCsrfToken);

// Health check (must be before other routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/invoices', invoiceItemsRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/user', userPreferencesRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/admin/gdpr', adminGdprRoutes);
app.use('/api/admin/activity', adminActivityRoutes);
app.use('/api/version', versionRoutes);
app.use('/api/changelog', changelogRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api', healthRoutes);

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendPath = path.join(__dirname, '../../frontend/dist');

  app.use(express.static(frontendPath));

  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 handler
app.use((req, res, _next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`WebSocket server ready`);
  console.log(`✅ Server running on port ${PORT}`);
});
