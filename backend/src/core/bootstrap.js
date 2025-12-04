/**
 * Application Bootstrap
 * Initializes DI container and registers all modules
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const Container = require('./container/Container');
const Database = require('./database/Database');
const config = require('./config/config');
const logger = require('./logger');
const { authenticateToken } = require('../middleware/auth');

// Import module registration functions
const { registerClientsModule } = require('../modules/clients');
const { registerProjectsModule } = require('../modules/projects');
const { registerTasksModule } = require('../modules/tasks');
const { InvoiceController, InvoiceService, InvoiceRepository } = require('../modules/invoices');
const { registerTimeTrackingModule } = require('../modules/time-tracking');
const { registerReportsModule } = require('../modules/reports');
const { registerNotificationsModule } = require('../modules/notifications');
const { registerAuthModule } = require('../modules/auth');
const { registerAdminModule } = require('../modules/admin');

/**
 * Bootstrap the application
 * @param {Object} options - Bootstrap options
 * @param {boolean} options.createApp - Whether to create Express app (default: true)
 * @returns {Object} Object containing container and optionally app
 */
async function bootstrap(options = {}) {
  const { createApp = true } = options;
  
  logger.info('Bootstrapping application');

  // Create DI container
  const container = new Container();

  // Register core services
  registerCoreServices(container);

  // Register feature modules
  registerModules(container);

  logger.info('Application bootstrap complete');

  // Create Express app if requested
  if (createApp) {
    const app = createExpressApp(container);
    return { container, app };
  }

  return { container };
}

/**
 * Create and configure Express application
 * @param {Container} container - DI container
 * @returns {Express} Configured Express app
 */
function createExpressApp(container) {
  const app = express();

  // Basic middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Authentication middleware
  const { authenticateToken } = require('../middleware/auth');

  // Register v2 routes
  const clientController = container.resolve('clientController');
  const projectController = container.resolve('projectController');
  const taskController = container.resolve('taskController');
  const invoiceController = container.resolve('invoiceController');
  const timeEntryController = container.resolve('timeEntryController');
  const reportsController = container.resolve('reportsController');
  const notificationController = container.resolve('notificationController');
  const authController = container.resolve('authController');
  const adminController = container.resolve('adminController');

  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Freelance Management API Documentation'
  }));
  
  // Swagger JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Public routes (no auth required)
  app.use('/api/v2/auth', authController.router);

  // Protected routes (auth required)
  app.use('/api/v2/clients', authenticateToken, clientController.router);
  app.use('/api/v2/projects', authenticateToken, projectController.router);
  app.use('/api/v2/tasks', authenticateToken, taskController.router);
  app.use('/api/v2/invoices', authenticateToken, invoiceController.router);
  app.use('/api/v2/time-tracking', authenticateToken, timeEntryController.router);
  app.use('/api/v2/reports', authenticateToken, reportsController.router);
  app.use('/api/v2/notifications', authenticateToken, notificationController.router);
  app.use('/api/v2/admin', authenticateToken, adminController.router);

  // Dashboard endpoint
  app.get('/api/v2/dashboard', authenticateToken, async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const database = container.resolve('database');
      const stats = await database.queryOne(`
        SELECT 
          (SELECT COUNT(*) FROM clients WHERE user_id = $1) as total_clients,
          (SELECT COUNT(*) FROM projects WHERE user_id = $1 AND status = 'active') as active_projects,
          (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status != 'completed') as pending_tasks,
          (SELECT SUM(amount) FROM invoices WHERE user_id = $1 AND status = 'paid') as total_revenue
      `, [userId]);

      res.json({ stats });
    } catch (error) {
      next(error);
    }
  });

  // Error handler
  app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error'
    });
  });

  return app;
}

/**
 * Register core services in DI container
 * @param {Container} container
 */
function registerCoreServices(container) {
  // Register configuration
  container.registerSingleton('config', () => config);

  // Register logger
  container.registerSingleton('logger', () => logger);

  // Register database as singleton
  container.registerSingleton('database', () => {
    const dbConfig = config.getDatabaseConfig();
    const database = new Database({
      ...dbConfig,
      logQueries: config.logging.logQueries
    });
    
    // Connect to database (don't exit in test environment)
    database.connect().catch(error => {
      logger.error('Failed to connect to database', error);
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    });

    return database;
  });

  logger.info('Core services registered');
}

/**
 * Register feature modules in DI container
 * @param {Container} container
 */
function registerModules(container) {
  // Register clients module
  registerClientsModule(container);
  logger.info('Clients module registered');

  // Register projects module
  registerProjectsModule(container);
  logger.info('Projects module registered');

  // Register tasks module
  registerTasksModule(container);
  logger.info('Tasks module registered');

  // Register invoices module
  container.registerSingleton('invoiceRepository', (c) => 
    new InvoiceRepository(c.resolve('database'))
  );
  container.registerSingleton('clientRepository', (c) => {
    const { ClientRepository } = require('../modules/clients');
    return new ClientRepository(c.resolve('database'));
  });
  container.registerTransient('invoiceService', (c) => 
    new InvoiceService(
      c.resolve('invoiceRepository'),
      c.resolve('clientRepository')
    )
  );
  container.registerSingleton('invoiceController', (c) => 
    new InvoiceController(c.resolve('invoiceService'))
  );
  logger.info('Invoices module registered');

  // Register time tracking module
  registerTimeTrackingModule(container);
  logger.info('Time tracking module registered');

  // Register reports module
  registerReportsModule(container);
  logger.info('Reports module registered');

  // Register notifications module
  registerNotificationsModule(container);
  logger.info('Notifications module registered');

  // Register auth module
  registerAuthModule(container);
  logger.info('Auth module registered');

  // Register admin module
  registerAdminModule(container);
  logger.info('Admin module registered');

  // Additional modules will be registered here as they are migrated
}

/**
 * Shutdown the application gracefully
 * @param {Container} container
 */
async function shutdown(container) {
  logger.info('Shutting down application');

  try {
    // Close database connection
    const database = container.resolve('database');
    await database.close();
    
    logger.info('Application shutdown complete');
  } catch (error) {
    logger.error('Error during shutdown', error);
  }
}

module.exports = {
  bootstrap,
  shutdown
};
