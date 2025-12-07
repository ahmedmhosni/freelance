const UserPreferencesRepository = require('./repositories/UserPreferencesRepository');
const UserPreferencesService = require('./services/UserPreferencesService');
const UserPreferencesController = require('./controllers/UserPreferencesController');

/**
 * Register User Preferences Module with DI Container
 * @param {Container} container - Dependency injection container
 */
function registerUserPreferencesModule(container) {
  // Register repository
  container.registerSingleton('userPreferencesRepository', (c) => {
    const database = c.resolve('database');
    return new UserPreferencesRepository(database);
  });

  // Register service
  container.registerTransient('userPreferencesService', (c) => {
    const repository = c.resolve('userPreferencesRepository');
    return new UserPreferencesService(repository);
  });

  // Register controller
  container.registerSingleton('userPreferencesController', (c) => {
    const service = c.resolve('userPreferencesService');
    return new UserPreferencesController(service);
  });
}

module.exports = {
  registerUserPreferencesModule,
  UserPreferencesRepository,
  UserPreferencesService,
  UserPreferencesController
};
