/**
 * System Health Module
 * Provides comprehensive system validation, monitoring, and deployment automation
 */

const HealthCheckService = require('./services/HealthCheckService');
const BuildValidationService = require('./services/BuildValidationService');
const APITestingService = require('./services/APITestingService');
const DeploymentService = require('./services/DeploymentService');
const MonitoringService = require('./services/MonitoringService');

const HealthCheckController = require('./controllers/HealthCheckController');
const BuildController = require('./controllers/BuildController');
const DeploymentController = require('./controllers/DeploymentController');

const HealthCheckRepository = require('./repositories/HealthCheckRepository');
const DeploymentLogRepository = require('./repositories/DeploymentLogRepository');
const BuildResultRepository = require('./repositories/BuildResultRepository');

/**
 * Register System Health Module with DI Container
 * @param {Container} container - DI Container instance
 */
function registerSystemHealthModule(container) {
  // Register repositories
  container.register('healthCheckRepository', (c) => 
    new HealthCheckRepository(c.resolve('database'))
  );
  
  container.register('deploymentLogRepository', (c) => 
    new DeploymentLogRepository(c.resolve('database'))
  );
  
  container.register('buildResultRepository', (c) => 
    new BuildResultRepository(c.resolve('database'))
  );

  // Register services
  container.register('healthCheckService', (c) => 
    new HealthCheckService(
      c.resolve('database'),
      c.resolve('logger'),
      c.resolve('config'),
      c.resolve('healthCheckRepository')
    )
  );
  
  container.register('buildValidationService', (c) => 
    new BuildValidationService(
      c.resolve('database'),
      c.resolve('logger'),
      c.resolve('config'),
      c.resolve('buildResultRepository')
    )
  );
  
  container.register('apiTestingService', (c) => 
    new APITestingService(
      c.resolve('database'),
      c.resolve('logger'),
      c.resolve('authService'),
      c.resolve('clientService'),
      c.resolve('projectService'),
      container.has('taskService') ? c.resolve('taskService') : null,
      container.has('invoiceService') ? c.resolve('invoiceService') : null
    )
  );
  
  container.register('deploymentService', (c) => 
    new DeploymentService(
      c.resolve('database'),
      c.resolve('logger'),
      c.resolve('config'),
      c.resolve('notificationService'),
      c.resolve('deploymentLogRepository')
    )
  );
  
  container.register('monitoringService', (c) => 
    new MonitoringService(
      c.resolve('database'),
      c.resolve('logger'),
      c.resolve('config'),
      c.resolve('notificationService'),
      c.resolve('analyticsService')
    )
  );

  // Register controllers
  container.register('healthCheckController', (c) =>
    new HealthCheckController(c.resolve('healthCheckService'))
  );
  
  container.register('buildController', (c) =>
    new BuildController(c.resolve('buildValidationService'))
  );
  
  container.register('deploymentController', (c) =>
    new DeploymentController(c.resolve('deploymentService'))
  );
}

module.exports = {
  registerSystemHealthModule
};