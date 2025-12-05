const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const ProjectResponseDTO = require('../dto/ProjectResponseDTO');
const logger = require('../../../core/logger');

/**
 * Project Controller
 * Handles HTTP requests for project operations
 */
class ProjectController extends BaseController {
  constructor(projectService) {
    super(projectService);
    this.projectService = projectService;
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
      validateCreateProject,
      validateUpdateProject,
      validateProjectId,
      validateQueryParams
    } = require('../validators/projectValidators');

    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Routes
    this.router.get('/', validateQueryParams, this.getAll.bind(this));
    this.router.get('/overdue', this.getOverdue.bind(this));
    this.router.get('/search', validateQueryParams, this.search.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
    this.router.get('/:id', validateProjectId, this.getById.bind(this));
    this.router.post('/', validateCreateProject, this.create.bind(this));
    this.router.put('/:id', validateProjectId, validateUpdateProject, this.update.bind(this));
    this.router.delete('/:id', validateProjectId, this.delete.bind(this));
  }

  /**
   * Get all projects for authenticated user
   * GET /api/v2/projects
   */
  async getAll(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { client_id, status, page, limit } = req.query;

      logger.info('Fetching projects', {
        correlationId,
        userId,
        clientId: client_id,
        status,
        page,
        limit
      });

      const filters = {};
      if (client_id) filters.clientId = client_id;
      if (status) filters.status = status;

      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (page && limit) options.offset = (parseInt(page) - 1) * parseInt(limit);

      const projects = await this.projectService.getAllForUser(userId, filters, options);
      
      // Convert to response DTOs
      const responseData = projects.map(project => new ProjectResponseDTO(project));

      logger.info('Projects fetched successfully', {
        correlationId,
        userId,
        count: responseData.length
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Get project by ID
   * GET /api/v2/projects/:id
   */
  async getById(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);

      logger.info('Fetching project', {
        correlationId,
        userId,
        projectId
      });

      const project = await this.projectService.getByIdForUser(projectId, userId);
      const responseData = new ProjectResponseDTO(project);

      logger.info('Project fetched successfully', {
        correlationId,
        userId,
        projectId
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Create new project
   * POST /api/v2/projects
   */
  async create(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const projectData = req.body;

      logger.info('Creating project', {
        correlationId,
        userId,
        projectName: projectData.name
      });

      const project = await this.projectService.createForUser(projectData, userId);
      const responseData = new ProjectResponseDTO(project);

      logger.info('Project created successfully', {
        correlationId,
        userId,
        projectId: project.id
      });

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Project created successfully'
      });
    });
  }

  /**
   * Update project
   * PUT /api/v2/projects/:id
   */
  async update(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);
      const projectData = req.body;

      logger.info('Updating project', {
        correlationId,
        userId,
        projectId
      });

      const project = await this.projectService.updateForUser(projectId, projectData, userId);
      const responseData = new ProjectResponseDTO(project);

      logger.info('Project updated successfully', {
        correlationId,
        userId,
        projectId
      });

      res.json({
        success: true,
        data: responseData,
        message: 'Project updated successfully'
      });
    });
  }

  /**
   * Delete project
   * DELETE /api/v2/projects/:id
   */
  async delete(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);

      logger.info('Deleting project', {
        correlationId,
        userId,
        projectId
      });

      await this.projectService.deleteForUser(projectId, userId);

      logger.info('Project deleted successfully', {
        correlationId,
        userId,
        projectId
      });

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    });
  }

  /**
   * Get overdue projects
   * GET /api/v2/projects/overdue
   */
  async getOverdue(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;

      logger.info('Fetching overdue projects', {
        correlationId,
        userId
      });

      const projects = await this.projectService.getOverdue(userId);
      const responseData = projects.map(project => new ProjectResponseDTO(project));

      logger.info('Overdue projects fetched successfully', {
        correlationId,
        userId,
        count: responseData.length
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Search projects
   * GET /api/v2/projects/search?q=term
   */
  async search(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { search } = req.query;

      logger.info('Searching projects', {
        correlationId,
        userId,
        searchTerm: search
      });

      const projects = await this.projectService.search(search, userId);
      const responseData = projects.map(project => new ProjectResponseDTO(project));

      logger.info('Project search completed', {
        correlationId,
        userId,
        count: responseData.length
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Get project statistics
   * GET /api/v2/projects/stats
   */
  async getStats(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;

      logger.info('Fetching project statistics', {
        correlationId,
        userId
      });

      const stats = await this.projectService.getStatusCounts(userId);

      logger.info('Project statistics fetched successfully', {
        correlationId,
        userId,
        stats
      });

      res.json({
        success: true,
        data: stats
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

module.exports = ProjectController;
