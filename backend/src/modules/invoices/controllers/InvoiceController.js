const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const InvoiceResponseDTO = require('../dto/InvoiceResponseDTO');
const logger = require('../../../core/logger');

/**
 * Invoice Controller
 * Handles HTTP requests for invoice operations
 */
class InvoiceController extends BaseController {
  constructor(invoiceService) {
    super(invoiceService);
    this.invoiceService = invoiceService;
    this.router = express.Router();
    this.setupRoutes();
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

    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Routes
    this.router.get('/', queryValidation, this.getAll.bind(this));
    this.router.get('/overdue', this.getOverdue.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
    this.router.get('/search', queryValidation, this.search.bind(this));
    this.router.get('/:id', getInvoiceValidation, this.getById.bind(this));
    this.router.post('/', createInvoiceValidation, this.create.bind(this));
    this.router.put('/:id', updateInvoiceValidation, this.update.bind(this));
    this.router.delete('/:id', deleteInvoiceValidation, this.delete.bind(this));
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
}

module.exports = InvoiceController;
