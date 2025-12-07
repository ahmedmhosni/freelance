const GDPRRepository = require('./repositories/GDPRRepository');
const GDPRService = require('./services/GDPRService');
const GDPRController = require('./controllers/GDPRController');

/**
 * Register GDPR Module with DI Container
 * @param {Container} container - Dependency injection container
 */
function registerGDPRModule(container) {
  // Register repository
  container.registerSingleton('gdprRepository', (c) => {
    const database = c.resolve('database');
    return new GDPRRepository(database);
  });

  // Register service
  container.registerTransient('gdprService', (c) => {
    const repository = c.resolve('gdprRepository');
    const authService = c.resolve('authService');
    return new GDPRService(repository, authService);
  });

  // Register controller
  container.registerSingleton('gdprController', (c) => {
    const service = c.resolve('gdprService');
    return new GDPRController(service);
  });
}

module.exports = {
  registerGDPRModule,
  GDPRRepository,
  GDPRService,
  GDPRController
};
