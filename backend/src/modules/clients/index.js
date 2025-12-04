/**
 * Clients Module
 * Handles all client-related functionality
 */

const ClientRepository = require('./repositories/ClientRepository');
const ClientService = require('./services/ClientService');
const ClientController = require('./controllers/ClientController');

/**
 * Register clients module with DI container
 * @param {Container} container - DI container instance
 */
function registerClientsModule(container) {
  // Register repository as singleton
  container.registerSingleton('clientRepository', (c) => {
    const database = c.resolve('database');
    return new ClientRepository(database);
  });

  // Register service as transient
  container.registerTransient('clientService', (c) => {
    const repository = c.resolve('clientRepository');
    return new ClientService(repository);
  });

  // Register controller as singleton
  container.registerSingleton('clientController', (c) => {
    const service = c.resolve('clientService');
    return new ClientController(service);
  });
}

module.exports = {
  registerClientsModule,
  ClientRepository,
  ClientService,
  ClientController
};
