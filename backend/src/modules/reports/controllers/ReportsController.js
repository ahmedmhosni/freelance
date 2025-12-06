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
   * Get financial report
   * GET /api/v2/reports/financial
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
