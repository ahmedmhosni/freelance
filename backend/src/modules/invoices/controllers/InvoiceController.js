const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const InvoiceResponseDTO = require('../dto/InvoiceResponseDTO');
const InvoiceItemResponseDTO = require('../dto/InvoiceItemResponseDTO');
const logger = require('../../../core/logger');

/**
 * Invoice Controller
 * Handles HTTP requests for invoice operations
 */
class InvoiceController extends BaseController {
  constructor(invoiceService, invoiceItemService) {
    super(invoiceService);
    this.invoiceService = invoiceService;
    this.invoiceItemService = invoiceItemService;
    this.router = express.Router();
    this.setupRoutes();
  }

  /**
   * Handle request with error handling
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next function
   * @param {Function} handler - Async handler function
   */
  async handleRequest(req, res, next, handler) {
    try {
      await handler();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    const { authenticateToken } = require('../../../middleware/auth');
    const {
      createInvoiceValidation,
      updateInvoiceValidation,
      getInvoiceValidation,
      deleteInvoiceValidation,
      queryValidation
    } = require('../validators/invoiceValidators');
    
    const {
      createInvoiceItemValidation,
      updateInvoiceItemValidation,
      getInvoiceItemValidation,
      getInvoiceItemsValidation
    } = require('../validators/invoiceItemValidators');

    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Invoice routes
    this.router.get('/', queryValidation, this.getAll.bind(this));
    this.router.get('/overdue', this.getOverdue.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
    this.router.get('/search', queryValidation, this.search.bind(this));
    this.router.get('/:id', getInvoiceValidation, this.getById.bind(this));
    this.router.post('/', createInvoiceValidation, this.create.bind(this));
    this.router.put('/:id', updateInvoiceValidation, this.update.bind(this));
    this.router.delete('/:id', deleteInvoiceValidation, this.delete.bind(this));
    
    // Invoice items routes
    this.router.get('/:invoiceId/items', getInvoiceItemsValidation, this.getInvoiceItems.bind(this));
    this.router.post('/:invoiceId/items', createInvoiceItemValidation, this.createInvoiceItem.bind(this));
    this.router.put('/:invoiceId/items/:id', updateInvoiceItemValidation, this.updateInvoiceItem.bind(this));
    this.router.delete('/:invoiceId/items/:id', getInvoiceItemValidation, this.deleteInvoiceItem.bind(this));
  }

  /**
   * Get all invoices for authenticated user
   * GET /api/v2/invoices
   */
  async getAll(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const { clientId, status, page, limit } = req.query;

      const filters = {};
      if (clientId) filters.clientId = clientId;
      if (status) filters.status = status;

      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (page && limit) options.offset = (parseInt(page) - 1) * parseInt(limit);

      const invoices = await this.invoiceService.getAllForUser(userId, filters, options);
      const responseData = invoices.map(invoice => new InvoiceResponseDTO(invoice));

      return res.json(responseData);
    });
  }

  /**
   * Get invoice by ID
   * GET /api/v2/invoices/:id
   */
  async getById(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const invoiceId = parseInt(req.params.id);

      const invoice = await this.invoiceService.getByIdForUser(invoiceId, userId);
      const responseData = new InvoiceResponseDTO(invoice);

      return res.json(responseData);
    });
  }

  /**
   * Create new invoice
   * POST /api/v2/invoices
   */
  async create(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const invoice = await this.invoiceService.createForUser(req.body, userId);
      const responseData = new InvoiceResponseDTO(invoice);

      return res.status(201).json(responseData);
    });
  }

  /**
   * Update invoice
   * PUT /api/v2/invoices/:id
   */
  async update(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const invoiceId = parseInt(req.params.id);

      const invoice = await this.invoiceService.updateForUser(invoiceId, req.body, userId);
      const responseData = new InvoiceResponseDTO(invoice);

      return res.json(responseData);
    });
  }

  /**
   * Delete invoice
   * DELETE /api/v2/invoices/:id
   */
  async delete(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const invoiceId = parseInt(req.params.id);

      await this.invoiceService.deleteForUser(invoiceId, userId);

      return res.status(204).send();
    });
  }

  /**
   * Get overdue invoices
   * GET /api/v2/invoices/overdue
   */
  async getOverdue(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const invoices = await this.invoiceService.getOverdue(userId);
      const responseData = invoices.map(invoice => new InvoiceResponseDTO(invoice));

      return res.json(responseData);
    });
  }

  /**
   * Get invoice statistics
   * GET /api/v2/invoices/stats
   */
  async getStats(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const { startDate, endDate, clientId } = req.query;

      const statusCounts = await this.invoiceService.getStatusCounts(userId);
      const revenueStats = await this.invoiceService.getRevenueStats(userId, {
        startDate,
        endDate,
        clientId
      });

      return res.json({
        statusCounts,
        ...revenueStats
      });
    });
  }

  /**
   * Search invoices
   * GET /api/v2/invoices/search?q=term
   */
  async search(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const { q } = req.query;

      const invoices = await this.invoiceService.search(q, userId);
      const responseData = invoices.map(invoice => new InvoiceResponseDTO(invoice));

      return res.json(responseData);
    });
  }

  /**
   * Get all items for an invoice
   * GET /api/v2/invoices/:invoiceId/items
   */
  async getInvoiceItems(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const invoiceId = parseInt(req.params.invoiceId);

      const items = await this.invoiceItemService.getItemsForInvoice(invoiceId, userId);
      const responseData = items.map(item => new InvoiceItemResponseDTO(item));

      return res.json(responseData);
    });
  }

  /**
   * Create a new invoice item
   * POST /api/v2/invoices/:invoiceId/items
   */
  async createInvoiceItem(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const invoiceId = parseInt(req.params.invoiceId);

      const item = await this.invoiceItemService.createItem(invoiceId, req.body, userId);
      const responseData = new InvoiceItemResponseDTO(item);

      return res.status(201).json(responseData);
    });
  }

  /**
   * Update an invoice item
   * PUT /api/v2/invoices/:invoiceId/items/:id
   */
  async updateInvoiceItem(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const itemId = parseInt(req.params.id);

      const item = await this.invoiceItemService.updateItem(itemId, req.body, userId);
      const responseData = new InvoiceItemResponseDTO(item);

      return res.json(responseData);
    });
  }

  /**
   * Delete an invoice item
   * DELETE /api/v2/invoices/:invoiceId/items/:id
   */
  async deleteInvoiceItem(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user.id;
      const itemId = parseInt(req.params.id);

      await this.invoiceItemService.deleteItem(itemId, userId);

      return res.status(204).send();
    });
  }
}

module.exports = InvoiceController;
