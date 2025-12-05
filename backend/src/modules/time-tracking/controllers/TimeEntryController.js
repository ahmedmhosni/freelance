const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const TimeEntryResponseDTO = require('../dto/TimeEntryResponseDTO');
const logger = require('../../../core/logger');

/**
 * TimeEntry Controller
 * Handles HTTP requests for time tracking operations
 */
class TimeEntryController extends BaseController {
  constructor(timeEntryService) {
    super(timeEntryService);
    this.timeEntryService = timeEntryService;
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
      validateCreateTimeEntry,
      validateStartTimer,
      validateUpdateTimeEntry,
      validateTimeEntryId,
      validateQueryParams
    } = require('../validators/timeEntryValidators');

    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Routes
    this.router.get('/', validateQueryParams, this.getAll.bind(this));
    this.router.get('/running', this.getRunningTimers.bind(this));
    this.router.get('/summary', validateQueryParams, this.getSummary.bind(this));
    this.router.get('/duration/total', validateQueryParams, this.getTotalDuration.bind(this));
    this.router.get('/duration/by-date', validateQueryParams, this.getDurationByDate.bind(this));
    this.router.get('/duration/task/:taskId', this.getDurationByTask.bind(this));
    this.router.get('/duration/project/:projectId', this.getDurationByProject.bind(this));
    this.router.get('/:id', validateTimeEntryId, this.getById.bind(this));
    this.router.post('/', validateCreateTimeEntry, this.create.bind(this));
    this.router.post('/start', validateStartTimer, this.startTimer.bind(this));
    this.router.post('/:id/stop', validateTimeEntryId, this.stopTimer.bind(this));
    this.router.put('/:id', validateTimeEntryId, validateUpdateTimeEntry, this.update.bind(this));
    this.router.delete('/:id', validateTimeEntryId, this.delete.bind(this));
  }

  /**
   * Get all time entries for authenticated user
   * GET /api/v2/time-tracking
   */
  async getAll(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { task_id, project_id, start_date, end_date, page, limit } = req.query;

      logger.info('Fetching time entries', {
        correlationId,
        userId,
        taskId: task_id,
        projectId: project_id,
        startDate: start_date,
        endDate: end_date,
        page,
        limit
      });

      const filters = {};
      if (task_id) filters.taskId = task_id;
      if (project_id) filters.projectId = project_id;
      if (start_date) filters.startDate = start_date;
      if (end_date) filters.endDate = end_date;

      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (page && limit) options.offset = (parseInt(page) - 1) * parseInt(limit);

      const timeEntries = await this.timeEntryService.getAllForUser(userId, filters, options);
      
      // Convert to response DTOs
      const responseData = timeEntries.map(entry => new TimeEntryResponseDTO(entry));

      logger.info('Time entries fetched successfully', {
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
   * Get time entry by ID
   * GET /api/v2/time-tracking/:id
   */
  async getById(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { id } = req.params;

      logger.info('Fetching time entry by ID', {
        correlationId,
        userId,
        timeEntryId: id
      });

      const timeEntry = await this.timeEntryService.getByIdForUser(id, userId);
      const responseData = new TimeEntryResponseDTO(timeEntry);

      logger.info('Time entry fetched successfully', {
        correlationId,
        userId,
        timeEntryId: id
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Get time tracking summary for authenticated user
   * GET /api/time-tracking/summary
   */
  async getSummary(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      logger.info('Fetching time tracking summary', {
        correlationId,
        userId,
        startDate: start_date,
        endDate: end_date
      });

      // Get total duration
      const totalDuration = await this.timeEntryService.getTotalDuration(userId, start_date, end_date);

      // Get duration by date
      const durationByDate = await this.timeEntryService.getDurationByDate(userId, start_date, end_date);

      // Get running timers
      const runningTimers = await this.timeEntryService.getRunningTimers(userId);

      logger.info('Time tracking summary fetched successfully', {
        correlationId,
        userId,
        totalDuration,
        runningTimersCount: runningTimers.length
      });

      res.json({
        success: true,
        data: {
          totalDuration,
          durationByDate,
          runningTimers: runningTimers.map(entry => new TimeEntryResponseDTO(entry))
        }
      });
    });
  }

  /**
   * Get running timers for authenticated user
   * GET /api/v2/time-tracking/running
   */
  async getRunningTimers(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;

      logger.info('Fetching running timers', {
        correlationId,
        userId
      });

      const runningTimers = await this.timeEntryService.getRunningTimers(userId);
      const responseData = runningTimers.map(entry => new TimeEntryResponseDTO(entry));

      logger.info('Running timers fetched successfully', {
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
   * Create a new time entry (manual entry)
   * POST /api/v2/time-tracking
   */
  async create(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const data = req.body;

      logger.info('Creating time entry', {
        correlationId,
        userId,
        data
      });

      const timeEntry = await this.timeEntryService.createForUser(data, userId);
      const responseData = new TimeEntryResponseDTO(timeEntry);

      logger.info('Time entry created successfully', {
        correlationId,
        userId,
        timeEntryId: timeEntry.id
      });

      res.status(201).json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Start a new timer
   * POST /api/v2/time-tracking/start
   */
  async startTimer(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const data = req.body;

      logger.info('Starting timer', {
        correlationId,
        userId,
        data
      });

      const timeEntry = await this.timeEntryService.startTimer(data, userId);
      const responseData = new TimeEntryResponseDTO(timeEntry);

      logger.info('Timer started successfully', {
        correlationId,
        userId,
        timeEntryId: timeEntry.id
      });

      res.status(201).json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Stop a running timer
   * POST /api/v2/time-tracking/:id/stop
   */
  async stopTimer(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { id } = req.params;

      logger.info('Stopping timer', {
        correlationId,
        userId,
        timeEntryId: id
      });

      const timeEntry = await this.timeEntryService.stopTimer(id, userId);
      const responseData = new TimeEntryResponseDTO(timeEntry);

      logger.info('Timer stopped successfully', {
        correlationId,
        userId,
        timeEntryId: id
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Update a time entry
   * PUT /api/v2/time-tracking/:id
   */
  async update(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { id } = req.params;
      const data = req.body;

      logger.info('Updating time entry', {
        correlationId,
        userId,
        timeEntryId: id,
        data
      });

      const timeEntry = await this.timeEntryService.updateForUser(id, data, userId);
      const responseData = new TimeEntryResponseDTO(timeEntry);

      logger.info('Time entry updated successfully', {
        correlationId,
        userId,
        timeEntryId: id
      });

      res.json({
        success: true,
        data: responseData
      });
    });
  }

  /**
   * Delete a time entry
   * DELETE /api/v2/time-tracking/:id
   */
  async delete(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { id } = req.params;

      logger.info('Deleting time entry', {
        correlationId,
        userId,
        timeEntryId: id
      });

      await this.timeEntryService.deleteForUser(id, userId);

      logger.info('Time entry deleted successfully', {
        correlationId,
        userId,
        timeEntryId: id
      });

      res.json({
        success: true,
        message: 'Time entry deleted successfully'
      });
    });
  }

  /**
   * Get total duration for user
   * GET /api/v2/time-tracking/duration/total
   */
  async getTotalDuration(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      logger.info('Calculating total duration', {
        correlationId,
        userId,
        startDate: start_date,
        endDate: end_date
      });

      const duration = await this.timeEntryService.getTotalDuration(userId, start_date, end_date);

      logger.info('Total duration calculated successfully', {
        correlationId,
        userId,
        duration
      });

      res.json({
        success: true,
        data: duration
      });
    });
  }

  /**
   * Get duration by task
   * GET /api/v2/time-tracking/duration/task/:taskId
   */
  async getDurationByTask(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { taskId } = req.params;

      logger.info('Calculating duration by task', {
        correlationId,
        userId,
        taskId
      });

      const duration = await this.timeEntryService.getDurationByTask(parseInt(taskId), userId);

      logger.info('Duration by task calculated successfully', {
        correlationId,
        userId,
        taskId,
        duration
      });

      res.json({
        success: true,
        data: duration
      });
    });
  }

  /**
   * Get duration by project
   * GET /api/v2/time-tracking/duration/project/:projectId
   */
  async getDurationByProject(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { projectId } = req.params;

      logger.info('Calculating duration by project', {
        correlationId,
        userId,
        projectId
      });

      const duration = await this.timeEntryService.getDurationByProject(parseInt(projectId), userId);

      logger.info('Duration by project calculated successfully', {
        correlationId,
        userId,
        projectId,
        duration
      });

      res.json({
        success: true,
        data: duration
      });
    });
  }

  /**
   * Get duration grouped by date
   * GET /api/v2/time-tracking/duration/by-date
   */
  async getDurationByDate(req, res, next) {
    await this.handleRequest(req, res, next, async () => {
      const correlationId = req.correlationId;
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      logger.info('Calculating duration by date', {
        correlationId,
        userId,
        startDate: start_date,
        endDate: end_date
      });

      const durationByDate = await this.timeEntryService.getDurationByDate(userId, start_date, end_date);

      logger.info('Duration by date calculated successfully', {
        correlationId,
        userId,
        count: durationByDate.length
      });

      res.json({
        success: true,
        data: durationByDate
      });
    });
  }
}

module.exports = TimeEntryController;
