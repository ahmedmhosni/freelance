const NotificationRepository = require('./repositories/NotificationRepository');
const NotificationService = require('./services/NotificationService');
const NotificationController = require('./controllers/NotificationController');

/**
 * Register Notifications Module with DI Container
 * @param {Container} container - Dependency injection container
 */
function registerNotificationsModule(container) {
  // Register NotificationRepository
  container.registerSingleton('notificationRepository', (c) => {
    const database = c.resolve('database');
    return new NotificationRepository(database);
  });

  // Register NotificationService
  container.registerTransient('notificationService', (c) => {
    const notificationRepository = c.resolve('notificationRepository');
    return new NotificationService(notificationRepository);
  });

  // Register NotificationController
  container.registerSingleton('notificationController', (c) => {
    const notificationService = c.resolve('notificationService');
    return new NotificationController(notificationService);
  });
}

module.exports = { registerNotificationsModule };
