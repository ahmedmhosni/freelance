const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const ClientResponseDTO = require('../dto/ClientResponseDTO');
const logger = require('../../../core/logger');

/**
 * Client Controller
 * Handles HTTP requests for client operations
 */
class ClientController extends BaseController {
  constructor(clientService) {
    super(clientService);
    this.clientService = clientService;
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
    const { apiLimiter } = require('../../../middleware/rateLimiter');
    const {
      validateCreateClient,
      validateUpdateClient,
      validateClientId,
      validateQueryParams
    } = require('../validators/clientValidators');

    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Apply rate limiting to all routes
    this.router.use(apiLimiter);

    // Routes
    this.router.get('/', validateQueryParams, this.getAll.bind(this));
    this.router.get('/:id', validateClientId, this.getById.bind(this));
    this.router.post('/', validateCreateClient, this.create.bind(this));
    this.router.put('/:id', validateClientId, validateUpdateClient, this.update.bind(this));
    this.router.delete('/:id', validateClientId, this.delete.bind(this));
  }

  /**
   * Get all clients for authenticated user
   * GET /api/v2/clients
   */
  async getAll(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { search, page, limit } = req.query;

      logger.info('Fetching clients', {
        correlationId,
        userId,
        search,
        page,
        limit
      });

      const result = await this.clientService.getAllForUser(userId, {
        search,
        page,
        limit
      });

      // Convert to response DTOs
      const responseData = ClientResponseDTO.fromClientArray(result.data);

      logger.info('Clients fetched successfully', {
        correlationId,
        userId,
        count: responseData.length
      });

      res.json({
        success: true,
        data: responseData,
        pagination: result.pagination
      });
    });
  }

  /**
   * Get client by ID
   * GET /api/v2/clients/:id
   */
  async getById(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const clientId = parseInt(req.params.id);

      logger.info('Fetching client', {
        correlationId,
        userId,
        clientId
      });

      const client = await this.clientService.getByIdForUser(clientId, userId);
      const responseData = ClientResponseDTO.fromClient(client);

      logger.info('Client fetched successfully', {
        correlationId,
        userId,
        clientId
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Create new client
   * POST /api/v2/clients
   */
  async create(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const clientData = req.body;

      logger.info('Creating client', {
        correlationId,
        userId,
        clientName: clientData.name
      });

      const client = await this.clientService.create(clientData, userId);
      const responseData = ClientResponseDTO.fromClient(client);

      logger.info('Client created successfully', {
        correlationId,
        userId,
        clientId: client.id
      });

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Client created successfully'
      });
    });
  }

  /**
   * Update client
   * PUT /api/v2/clients/:id
   */
  async update(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const clientId = parseInt(req.params.id);
      const clientData = req.body;

      logger.info('Updating client', {
        correlationId,
        userId,
        clientId
      });

      const client = await this.clientService.update(clientId, clientData, userId);
      const responseData = ClientResponseDTO.fromClient(client);

      logger.info('Client updated successfully', {
        correlationId,
        userId,
        clientId
      });

      res.json({
        success: true,
        data: responseData,
        message: 'Client updated successfully'
      });
    });
  }

  /**
   * Delete client
   * DELETE /api/v2/clients/:id
   */
  async delete(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const clientId = parseInt(req.params.id);

      logger.info('Deleting client', {
        correlationId,
        userId,
        clientId
      });

      await this.clientService.delete(clientId, userId);

      logger.info('Client deleted successfully', {
        correlationId,
        userId,
        clientId
      });

      res.json({
        success: true,
        message: 'Client deleted successfully'
      });
    });
  }

  /**
   * Get Express router
   * @returns {express.Router}
   */
  getRouter() {
    return this.router;
  }
}

module.exports = ClientController;
