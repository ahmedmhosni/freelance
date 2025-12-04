const express = require('express');

/**
 * Base Controller Class
 * Provides common HTTP handling patterns for all controllers
 */
class BaseController {
  constructor(service) {
    if (!service) {
      throw new Error('Service instance is required');
    }
    this.service = service;
    this.router = express.Router();
    this._setupRoutes();
  }

  /**
   * Setup default REST routes
   * Override in subclass to customize routes
   * @private
   */
  _setupRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.put('/:id', this.update.bind(this));
    this.router.delete('/:id', this.delete.bind(this));
  }

  /**
   * Wrapper for handling requests with error handling
   * @param {Function} handler - Request handler function
   * @returns {Function} Express middleware
   */
  handleRequest(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * GET / - Get all records
   */
  async getAll(req, res, next) {
    try {
      const { limit, offset, orderBy, order, ...filters } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
        orderBy: orderBy || 'id',
        order: order || 'ASC'
      };

      const records = await this.service.getAll(filters, options);
      const total = await this.service.count(filters);

      res.json({
        success: true,
        data: records,
        pagination: {
          total,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /:id - Get record by ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const record = await this.service.getById(id);

      res.json({
        success: true,
        data: record
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST / - Create new record
   */
  async create(req, res, next) {
    try {
      const data = req.body;
      const record = await this.service.create(data);

      res.status(201).json({
        success: true,
        data: record
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /:id - Update record
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const record = await this.service.update(id, data);

      res.json({
        success: true,
        data: record
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /:id - Delete record
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.service.delete(id);

      res.json({
        success: true,
        message: 'Record deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, data, statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      data
    });
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  sendError(res, message, statusCode = 400) {
    res.status(statusCode).json({
      success: false,
      error: message
    });
  }
}

module.exports = BaseController;
