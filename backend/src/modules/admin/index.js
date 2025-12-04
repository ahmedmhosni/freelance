const AdminService = require('./services/AdminService');
const AdminController = require('./controllers/AdminController');

/**
 * Register Admin Module with DI Container
 * @param {Container} container - Dependency injection container
 */
function registerAdminModule(container) {
  // Register AdminService
  container.registerTransient('adminService', (c) => {
    const database = c.resolve('database');
    return new AdminService(database);
  });

  // Register AdminController
  container.registerSingleton('adminController', (c) => {
    const adminService = c.resolve('adminService');
    return new AdminController(adminService);
  });
}

module.exports = { registerAdminModule };
