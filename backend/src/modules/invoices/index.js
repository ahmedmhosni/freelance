/**
 * Invoices Module
 * Exports the invoice controller for registration in the DI container
 */

const InvoiceController = require('./controllers/InvoiceController');
const InvoiceService = require('./services/InvoiceService');
const InvoiceRepository = require('./repositories/InvoiceRepository');

module.exports = {
  InvoiceController,
  InvoiceService,
  InvoiceRepository
};
