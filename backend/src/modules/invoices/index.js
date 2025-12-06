/**
 * Invoices Module
 * Handles all invoice-related functionality
 */

const InvoiceController = require('./controllers/InvoiceController');
const InvoiceService = require('./services/InvoiceService');
const InvoiceRepository = require('./repositories/InvoiceRepository');
const InvoiceItemService = require('./services/InvoiceItemService');
const InvoiceItemRepository = require('./repositories/InvoiceItemRepository');

/**
 * Register invoices module with DI container
 * @param {Container} container - DI container instance
 */
function registerInvoicesModule(container) {
  // Register repositories as singletons
  container.registerSingleton('invoiceRepository', (c) => {
    const database = c.resolve('database');
    return new InvoiceRepository(database);
  });

  container.registerSingleton('invoiceItemRepository', (c) => {
    const database = c.resolve('database');
    return new InvoiceItemRepository(database);
  });

  // Register services as transient
  container.registerTransient('invoiceService', (c) => {
    const repository = c.resolve('invoiceRepository');
    return new InvoiceService(repository);
  });

  container.registerTransient('invoiceItemService', (c) => {
    const itemRepository = c.resolve('invoiceItemRepository');
    const invoiceRepository = c.resolve('invoiceRepository');
    return new InvoiceItemService(itemRepository, invoiceRepository);
  });

  // Register controller as singleton
  container.registerSingleton('invoiceController', (c) => {
    const service = c.resolve('invoiceService');
    const itemService = c.resolve('invoiceItemService');
    return new InvoiceController(service, itemService);
  });
}

module.exports = {
  registerInvoicesModule,
  InvoiceController,
  InvoiceService,
  InvoiceRepository,
  InvoiceItemService,
  InvoiceItemRepository
};
