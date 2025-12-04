const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const TaskResponseDTO = require('../dto/TaskResponseDTO');
const logger = require('../../../core/logger');

/**
 * Task Controller
 * Handles HTTP requests for task operations
 */
class TaskController extends BaseController {
  constructor(taskService) {
    super(taskService);
    this.taskService = taskService;
    this.router = express.Router();
    this.setupRoutes();
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    const { authenticateToken } = require('../../../middleware/auth');
    const {
      validateCreateTask,
      validateUpdateTask,
      validateTaskId,
      validateQueryParams
    } = require('../validators/taskValidators');

    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Routes
    this.router.get('/', validateQueryParams, this.getAll.bind(this));
    this.router.get('/overdue', this.getOverdue.bind(this));
    this.router.get('/due-soon', validateQueryParams, this.getDueSoon.bind(this));
    this.router.get('/search', validateQueryParams, this.search.bind(this));
    this.router.get('/stats/status', this.getStatusStats.bind(this));
    this.router.get('/stats/priority', this.getPriorityStats.bind(this));
    this.router.get('/:id', validateTaskId, this.getById.bind(this));
    this.router.post('/', validateCreateTask, this.create.bind(this));
    this.router.put('/:id', validateTaskId, validateUpdateTask, this.update.bind(this));
    this.router.delete('/:id', validateTaskId, this.delete.bind(this));
  }

  /**
   * Get all tasks for authenticated user
   * GET /api/v2/tasks
   */
  async getAll(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { project_id, client_id, status, priority, page, limit } = req.query;

      logger.info('Fetching tasks', {
        correlationId,
        userId,
        projectId: project_id,
        clientId: client_id,
        status,
        priority,
        page,
        limit
      });

      const filters = {};
      if (project_id) filters.projectId = project_id;
      if (client_id) filters.clientId = client_id;
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (page && limit) options.offset = (parseInt(page) - 1) * parseInt(limit);

      const tasks = await this.taskService.getAllForUser(userId, filters, options);
      
      // Convert to response DTOs
      const responseData = tasks.map(task => new TaskResponseDTO(task));

      logger.info('Tasks fetched successfully', {
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
   * Get task by ID
   * GET /api/v2/tasks/:id
   */
  async getById(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const taskId = parseInt(req.params.id);

      logger.info('Fetching task', {
        correlationId,
        userId,
        taskId
      });

      const task = await this.taskService.getByIdForUser(taskId, userId);
      const responseData = new TaskResponseDTO(task);

      logger.info('Task fetched successfully', {
        correlationId,
        userId,
        taskId
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Create new task
   * POST /api/v2/tasks
   */
  async create(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const taskData = req.body;

      logger.info('Creating task', {
        correlationId,
        userId,
        taskTitle: taskData.title
      });

      const task = await this.taskService.createForUser(taskData, userId);
      const responseData = new TaskResponseDTO(task);

      // Emit real-time update via WebSocket
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${userId}`).emit('task_created', responseData);
      }

      logger.info('Task created successfully', {
        correlationId,
        userId,
        taskId: task.id
      });

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Task created successfully'
      });
    });
  }

  /**
   * Update task
   * PUT /api/v2/tasks/:id
   */
  async update(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const taskId = parseInt(req.params.id);
      const taskData = req.body;

      logger.info('Updating task', {
        correlationId,
        userId,
        taskId
      });

      const task = await this.taskService.updateForUser(taskId, taskData, userId);
      const responseData = new TaskResponseDTO(task);

      // Emit real-time update via WebSocket
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${userId}`).emit('task_updated', responseData);
      }

      logger.info('Task updated successfully', {
        correlationId,
        userId,
        taskId
      });

      res.json({
        success: true,
        data: responseData,
        message: 'Task updated successfully'
      });
    });
  }

  /**
   * Delete task
   * DELETE /api/v2/tasks/:id
   */
  async delete(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const taskId = parseInt(req.params.id);

      logger.info('Deleting task', {
        correlationId,
        userId,
        taskId
      });

      await this.taskService.deleteForUser(taskId, userId);

      // Emit real-time update via WebSocket
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${userId}`).emit('task_deleted', { id: taskId });
      }

      logger.info('Task deleted successfully', {
        correlationId,
        userId,
        taskId
      });

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    });
  }

  /**
   * Get overdue tasks
   * GET /api/v2/tasks/overdue
   */
  async getOverdue(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;

      logger.info('Fetching overdue tasks', {
        correlationId,
        userId
      });

      const tasks = await this.taskService.getOverdue(userId);
      const responseData = tasks.map(task => new TaskResponseDTO(task));

      logger.info('Overdue tasks fetched successfully', {
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
   * Get tasks due soon
   * GET /api/v2/tasks/due-soon?days=7
   */
  async getDueSoon(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const days = parseInt(req.query.days) || 7;

      logger.info('Fetching tasks due soon', {
        correlationId,
        userId,
        days
      });

      const tasks = await this.taskService.getDueSoon(userId, days);
      const responseData = tasks.map(task => new TaskResponseDTO(task));

      logger.info('Tasks due soon fetched successfully', {
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
   * Search tasks
   * GET /api/v2/tasks/search?search=term
   */
  async search(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { search } = req.query;

      logger.info('Searching tasks', {
        correlationId,
        userId,
        searchTerm: search
      });

      const tasks = await this.taskService.search(search, userId);
      const responseData = tasks.map(task => new TaskResponseDTO(task));

      logger.info('Task search completed', {
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
   * Get task statistics by status
   * GET /api/v2/tasks/stats/status
   */
  async getStatusStats(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;

      logger.info('Fetching task status statistics', {
        correlationId,
        userId
      });

      const stats = await this.taskService.getStatusCounts(userId);

      logger.info('Task status statistics fetched successfully', {
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
   * Get task statistics by priority
   * GET /api/v2/tasks/stats/priority
   */
  async getPriorityStats(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;

      logger.info('Fetching task priority statistics', {
        correlationId,
        userId
      });

      const stats = await this.taskService.getPriorityCounts(userId);

      logger.info('Task priority statistics fetched successfully', {
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

module.exports = TaskController;
