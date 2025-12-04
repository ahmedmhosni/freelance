const ReportsService = require('./services/ReportsService');
const ReportsController = require('./controllers/ReportsController');

/**
 * Register Reports Module with DI Container
 * @param {Container} container - Dependency injection container
 */
function registerReportsModule(container) {
  // Register ReportsService
  container.registerTransient('reportsService', (c) => {
    const database = c.resolve('database');
    return new ReportsService(database);
  });

  // Register ReportsController
  container.registerSingleton('reportsController', (c) => {
    const reportsService = c.resolve('reportsService');
    return new ReportsController(reportsService);
  });
}

module.exports = { registerReportsModule };
