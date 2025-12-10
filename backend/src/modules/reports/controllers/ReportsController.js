const express = require('express');
const BaseController = require('../../../shared/base/BaseController');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Reports Controller - Handles HTTP requests for reports
 */
class ReportsController extends BaseController {
  constructor(reportsService) {
    super(reportsService);
    this.reportsService = reportsService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Apply authentication to all routes
    this.router.use(authenticateToken);

    // Root route - list available reports
    this.router.get('/', this.getAvailableReports.bind(this));

    // Financial report
    this.router.get('/financial', this.getFinancialReport.bind(this));

    // Project report
    this.router.get('/projects', this.getProjectReport.bind(this));

    // Client report
    this.router.get('/clients', this.getClientReport.bind(this));

    // Time tracking reports
    this.router.get('/time-tracking/tasks', this.getTimeTrackingByTasks.bind(this));
    this.router.get('/time-tracking/projects', this.getTimeTrackingByProjects.bind(this));
    this.router.get('/time-tracking/clients', this.getTimeTrackingByClients.bind(this));
  }

  /**
   * Get available reports
   * GET /api/reports
   */
  async getAvailableReports(req, res, next) {
    try {
      const reports = [
        {
          name: 'Financial Report',
          endpoint: '/api/reports/financial',
          description: 'Revenue, expenses, and profit analysis',
          parameters: ['startDate', 'endDate']
        },
        {
          name: 'Project Report',
          endpoint: '/api/reports/projects',
          description: 'Project status and completion analysis',
          parameters: []
        },
        {
          name: 'Client Report',
          endpoint: '/api/reports/clients',
          description: 'Client activity and revenue analysis',
          parameters: []
        },
        {
          name: 'Time Tracking by Tasks',
          endpoint: '/api/reports/time-tracking/tasks',
          description: 'Time spent on individual tasks',
          parameters: ['start_date', 'end_date']
        },
        {
          name: 'Time Tracking by Projects',
          endpoint: '/api/reports/time-tracking/projects',
          description: 'Time spent on projects',
          parameters: ['start_date', 'end_date']
        },
        {
          name: 'Time Tracking by Clients',
          endpoint: '/api/reports/time-tracking/clients',
          description: 'Time spent for each client',
          parameters: ['start_date', 'end_date']
        }
      ];

      res.json({
        message: 'Available reports',
        reports,
        total: reports.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get financial report
   * GET /api/reports/financial
   */
  async getFinancialReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user.id;

      const report = await this.reportsService.getFinancialReport(userId, startDate, endDate);
      res.json(report.toJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get project report
   * GET /api/v2/reports/projects
   */
  async getProjectReport(req, res, next) {
    try {
      const userId = req.user.id;

      const report = await this.reportsService.getProjectReport(userId);
      res.json(report.toJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client report
   * GET /api/v2/reports/clients
   */
  async getClientReport(req, res, next) {
    try {
      const userId = req.user.id;

      const reports = await this.reportsService.getClientReport(userId);
      res.json(reports.map(r => r.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get time tracking report by tasks
   * GET /api/v2/reports/time-tracking/tasks
   */
  async getTimeTrackingByTasks(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const userId = req.user.id;

      const reports = await this.reportsService.getTimeTrackingByTasks(userId, start_date, end_date);
      res.json(reports.map(r => r.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get time tracking report by projects
   * GET /api/v2/reports/time-tracking/projects
   */
  async getTimeTrackingByProjects(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const userId = req.user.id;

      const reports = await this.reportsService.getTimeTrackingByProjects(userId, start_date, end_date);
      res.json(reports.map(r => r.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get time tracking report by clients
   * GET /api/v2/reports/time-tracking/clients
   */
  async getTimeTrackingByClients(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const userId = req.user.id;

      const reports = await this.reportsService.getTimeTrackingByClients(userId, start_date, end_date);
      res.json(reports.map(r => r.toJSON()));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportsController;
