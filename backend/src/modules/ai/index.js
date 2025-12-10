const AIRepository = require('./repositories/AIRepository');
const AIService = require('./services/AIService');
const AIController = require('./controllers/AIController');

/**
 * Register AI Module with DI Container
 * @param {Container} container - Dependency injection container
 */
function registerAIModule(container) {
  // Register repository
  container.registerSingleton('aiRepository', (c) => {
    const database = c.resolve('database');
    return new AIRepository(database);
  });

  // Register service
  container.registerTransient('aiService', (c) => {
    const repository = c.resolve('aiRepository');
    return new AIService(repository);
  });

  // Register controller
  container.registerSingleton('aiController', (c) => {
    const service = c.resolve('aiService');
    return new AIController(service);
  });
}

module.exports = {
  registerAIModule,
  AIRepository,
  AIService,
  AIController
};