const AuthService = require('./services/AuthService');
const AuthController = require('./controllers/AuthController');

/**
 * Register Authentication Module with DI Container
 * @param {Container} container - Dependency injection container
 */
function registerAuthModule(container) {
  // Register AuthService
  container.registerTransient('authService', (c) => {
    const database = c.resolve('database');
    const config = c.resolve('config');
    return new AuthService(database, config);
  });

  // Register AuthController
  container.registerSingleton('authController', (c) => {
    const authService = c.resolve('authService');
    return new AuthController(authService);
  });
}

module.exports = { registerAuthModule };
