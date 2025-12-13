require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { query } = require('./db/postgresql');

// Test bootstrap components one by one to find the issue
let Container, Database, config;
try {
  Container = require('./core/container/Container');
  console.log('✅ Container class loaded');
} catch (error) {
  console.error('❌ Failed to load Container:', error.message);
}

try {
  Database = require('./core/database/Database');
  console.log('✅ Database class loaded');
} catch (error) {
  console.error('❌ Failed to load Database class:', error.message);
}

try {
  config = require('./core/config/config');
  console.log('✅ Config loaded');
} catch (error) {
  console.error('❌ Failed to load config:', error.message);
}

// Test module registrations
let registerClientsModule, registerAuthModule, registerAIModule;
try {
  const clientsModule = require('./modules/clients');
  registerClientsModule = clientsModule.registerClientsModule;
  console.log('✅ Clients module loaded');
} catch (error) {
  console.error('❌ Failed to load clients module:', error.message);
}

try {
  const authModule = require('./modules/auth');
  registerAuthModule = authModule.registerAuthModule;
  console.log('✅ Auth module loaded');
} catch (error) {
  console.error('❌ Failed to load auth module:', error.message);
}

try {
  const aiModule = require('./modules/ai');
  registerAIModule = aiModule.registerAIModule;
  console.log('✅ AI module loaded');
} catch (error) {
  console.error('❌ Failed to load AI module:', error.message);
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
      status: 'Testing components individually'
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

// Add Azure health check routes
app.get('/robots933456.txt', (req, res) => {
  res.status(200).send('User-agent: *\nDisallow:');
});

app.get('/robots.txt', (req, res) => {
  res.status(200).send('User-agent: *\nDisallow:');
});

// Test bootstrap components
async function testBootstrapComponents() {
  if (!Container) {
    console.log('⚠️ Container not available');
    return null;
  }

  try {
    console.log('🔍 Testing DI Container creation...');
    const container = new Container();
    console.log('✅ DI Container created successfully');
    
    // Test basic registration
    container.registerSingleton('test', () => ({ message: 'test service' }));
    const testService = container.resolve('test');
    console.log('✅ DI Container registration/resolution works');
    
    // Test Database class (the likely culprit)
    if (Database && config) {
      console.log('🔍 Testing Database class creation...');
      
      try {
        const dbConfig = config.getDatabaseConfig();
        console.log('✅ Database config retrieved');
        
        // Create database instance WITHOUT connecting (to avoid process.exit)
        const database = new Database({
          ...dbConfig,
          logQueries: false
        });
        console.log('✅ Database instance created (not connected)');
        
        // Register in container
        container.registerSingleton('database', () => database);
        console.log('✅ Database registered in container');
        
        // Test module registrations
        console.log('🔍 Testing module registrations...');
        
        if (registerClientsModule) {
          try {
            registerClientsModule(container);
            console.log('✅ Clients module registered');
          } catch (error) {
            console.error('❌ Clients module registration failed:', error.message);
          }
        }
        
        if (registerAuthModule) {
          try {
            registerAuthModule(container);
            console.log('✅ Auth module registered');
          } catch (error) {
            console.error('❌ Auth module registration failed:', error.message);
          }
        }
        
        if (registerAIModule) {
          try {
            registerAIModule(container);
            console.log('✅ AI module registered');
          } catch (error) {
            console.error('❌ AI module registration failed:', error.message);
          }
        }
        
      } catch (error) {
        console.error('❌ Database class test failed:', error.message);
      }
    }
    
    return container;
  } catch (error) {
    console.error('❌ Bootstrap component test failed:', error.message);
    return null;
  }
}

// Start server
async function startServer() {
  // Test database first
  const dbConnected = await testDatabaseConnection();
  
  // Test bootstrap components
  const containerTest = await testBootstrapComponents();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Investigation server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Database: ${dbConnected ? 'Connected' : 'Failed'}`);
    console.log(`✅ Container: ${containerTest ? 'Working' : 'Failed'}`);
    console.log(`✅ Listening on all interfaces`);
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
});