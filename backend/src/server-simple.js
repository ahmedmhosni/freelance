require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { query } = require('./db/postgresql');

// Try to import bootstrap system
let bootstrap;
try {
  const bootstrapModule = require('./core/bootstrap');
  bootstrap = bootstrapModule.bootstrap;
  console.log('✅ Bootstrap system loaded');
} catch (error) {
  console.error('❌ Failed to load bootstrap system:', error.message);
}

// Import routes (with error handling)
let authRoutes, profileRoutes, dashboardRoutes, quotesRoutes, maintenanceRoutes, healthRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

try {
  profileRoutes = require('./routes/profile');
  console.log('✅ Profile routes loaded');
} catch (error) {
  console.error('❌ Failed to load profile routes:', error.message);
}

try {
  dashboardRoutes = require('./routes/dashboard');
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.error('❌ Failed to load dashboard routes:', error.message);
}

try {
  quotesRoutes = require('./routes/quotes');
  console.log('✅ Quotes routes loaded');
} catch (error) {
  console.error('❌ Failed to load quotes routes:', error.message);
}

try {
  maintenanceRoutes = require('./routes/maintenance');
  console.log('✅ Maintenance routes loaded');
} catch (error) {
  console.error('❌ Failed to load maintenance routes:', error.message);
}

try {
  healthRoutes = require('./routes/health');
  console.log('✅ Health routes loaded');
} catch (error) {
  console.error('❌ Failed to load health routes:', error.message);
}

const app = express();
const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

// Trust proxy for Azure
app.set('trust proxy', true);

// Basic security and middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://roastify.online',
    'https://white-sky-0a7e9f003.3.azurestaticapps.net',
    'https://white-sky-0a7e9f003.4.azurestaticapps.net'
  ],
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple logging
app.use(morgan('combined'));

// Health endpoints
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  try {
    // Test database connection
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

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Basic API routes (without database for now)
app.get('/api/maintenance/status', (req, res) => {
  res.json({ maintenance: false, message: 'System operational' });
});

app.get('/api/quotes/daily', (req, res) => {
  res.json({ 
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  });
});

app.get('/api/announcements/featured', (req, res) => {
  res.json([]);
});

app.get('/api/changelog/current-version', (req, res) => {
  res.json({ version: '1.0.3', date: new Date().toISOString() });
});

// Add authentication routes (with safety checks)
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered');
} else {
  // Fallback auth test endpoint
  app.get('/api/auth/test', (req, res) => {
    res.json({ message: 'Auth routes failed to load', error: 'Module import failed' });
  });
}

if (profileRoutes) {
  app.use('/api/profile', profileRoutes);
  console.log('✅ Profile routes registered');
}

if (dashboardRoutes) {
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes registered');
}

if (quotesRoutes) {
  app.use('/api/quotes', quotesRoutes);
  console.log('✅ Quotes routes registered');
}

if (maintenanceRoutes) {
  app.use('/api/maintenance', maintenanceRoutes);
  console.log('✅ Maintenance routes registered');
}

if (healthRoutes) {
  app.use('/api', healthRoutes);
  console.log('✅ Health routes registered');
}

// Status endpoint showing all loaded routes
app.get('/api/routes/status', (req, res) => {
  res.json({ 
    message: 'Route loading status', 
    routes: {
      auth: !!authRoutes,
      profile: !!profileRoutes,
      dashboard: !!dashboardRoutes,
      quotes: !!quotesRoutes,
      maintenance: !!maintenanceRoutes,
      health: !!healthRoutes
    },
    bootstrap: {
      loaded: !!bootstrap,
      initialized: 'Check server logs'
    },
    timestamp: new Date().toISOString() 
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await query('SELECT 1 as test');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Try to initialize bootstrap system
async function initializeBootstrap() {
  if (!bootstrap) {
    console.log('⚠️ Bootstrap system not available, skipping DI container');
    return null;
  }

  try {
    console.log('🔍 Initializing bootstrap system...');
    const result = await Promise.race([
      bootstrap({ createApp: false }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bootstrap timeout after 15 seconds')), 15000)
      )
    ]);
    console.log('✅ Bootstrap system initialized');
    return result;
  } catch (error) {
    console.error('❌ Bootstrap initialization failed:', error.message);
    return null;
  }
}

// Start server
async function startServer() {
  // Test database first
  const dbConnected = await testDatabaseConnection();
  
  // Try to initialize bootstrap system
  const bootstrapResult = await initializeBootstrap();
  
  // Add bootstrap routes if available
  if (bootstrapResult && bootstrapResult.container) {
    try {
      // Try to add new architecture routes
      const clientController = bootstrapResult.container.resolve('clientController');
      if (clientController) {
        app.use('/api/clients', clientController.router);
        console.log('✅ Client controller registered');
      }
    } catch (error) {
      console.error('❌ Failed to register bootstrap routes:', error.message);
    }
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Simplified server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Database: ${dbConnected ? 'Connected' : 'Failed'}`);
    console.log(`✅ Bootstrap: ${bootstrapResult ? 'Initialized' : 'Skipped'}`);
    console.log(`✅ Listening on all interfaces`);
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
});