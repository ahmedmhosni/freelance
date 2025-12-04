const FinancialReport = require('../models/FinancialReport');
const ProjectReport = require('../models/ProjectReport');
const ClientReport = require('../models/ClientReport');
const TimeTrackingReport = require('../models/TimeTrackingReport');

/**
 * Reports Service - Handles analytics and reporting logic
 */
class ReportsService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Generate financial report
   * @param {number} userId - User ID
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {Promise<FinancialReport>}
   */
  async getFinancialReport(userId, startDate = null, endDate = null) {
    let queryText = 'SELECT * FROM invoices WHERE user_id = $1';
    const params = [userId];

    if (startDate && endDate) {
      queryText += ' AND created_at BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    const invoices = await this.db.queryMany(queryText, params);

    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0);

    const pendingAmount = invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0);

    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0);

    const byStatus = {
      draft: invoices.filter(inv => inv.status === 'draft').length,
      sent: invoices.filter(inv => inv.status === 'sent').length,
      paid: invoices.filter(inv => inv.status === 'paid').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length,
      cancelled: invoices.filter(inv => inv.status === 'cancelled').length
    };

    return new FinancialReport({
      totalInvoices: invoices.length,
      totalRevenue,
      pendingAmount,
      overdueAmount,
      byStatus,
      invoices
    });
  }

  /**
   * Generate project report
   * @param {number} userId - User ID
   * @returns {Promise<ProjectReport>}
   */
  async getProjectReport(userId) {
    const projects = await this.db.queryMany(
      'SELECT * FROM projects WHERE user_id = $1',
      [userId]
    );

    const tasks = await this.db.queryMany(
      'SELECT * FROM tasks WHERE user_id = $1',
      [userId]
    );

    const byStatus = {
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      'on-hold': projects.filter(p => p.status === 'on-hold').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length
    };

    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done' || t.status === 'completed').length
    };

    return new ProjectReport({
      totalProjects: projects.length,
      byStatus,
      totalTasks: tasks.length,
      tasksByStatus,
      projects
    });
  }

  /**
   * Generate client report
   * @param {number} userId - User ID
   * @returns {Promise<ClientReport[]>}
   */
  async getClientReport(userId) {
    const clients = await this.db.queryMany(
      'SELECT * FROM clients WHERE user_id = $1',
      [userId]
    );

    const projects = await this.db.queryMany(
      'SELECT * FROM projects WHERE user_id = $1',
      [userId]
    );

    const invoices = await this.db.queryMany(
      'SELECT * FROM invoices WHERE user_id = $1',
      [userId]
    );

    return clients.map(client => {
      const clientProjects = projects.filter(p => p.client_id === client.id);
      const clientInvoices = invoices.filter(inv => inv.client_id === client.id);
      const totalRevenue = clientInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0);

      return new ClientReport({
        ...client,
        projectCount: clientProjects.length,
        invoiceCount: clientInvoices.length,
        totalRevenue
      });
    });
  }

  /**
   * Generate time tracking report grouped by tasks
   * @param {number} userId - User ID
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {Promise<TimeTrackingReport[]>}
   */
  async getTimeTrackingByTasks(userId, startDate = null, endDate = null) {
    let queryText = `
      SELECT 
        t.id as task_id,
        t.title as task_title,
        p.id as project_id,
        p.name as project_name,
        c.id as client_id,
        c.name as client_name,
        COUNT(te.id) as session_count,
        COALESCE(SUM(te.duration), 0) as total_minutes,
        ROUND(COALESCE(SUM(te.duration), 0) / 60.0, 2) as total_hours
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE te.user_id = $1 AND te.end_time IS NOT NULL
    `;
    const params = [userId];

    if (startDate && endDate) {
      queryText += ' AND te.start_time::date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    queryText += ' GROUP BY t.id, t.title, p.id, p.name, c.id, c.name ORDER BY total_minutes DESC';

    const results = await this.db.queryMany(queryText, params);
    return results.map(row => new TimeTrackingReport(row));
  }

  /**
   * Generate time tracking report grouped by projects
   * @param {number} userId - User ID
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {Promise<TimeTrackingReport[]>}
   */
  async getTimeTrackingByProjects(userId, startDate = null, endDate = null) {
    let queryText = `
      SELECT 
        p.id as project_id,
        p.name as project_name,
        c.id as client_id,
        c.name as client_name,
        COUNT(DISTINCT te.task_id) as task_count,
        COUNT(te.id) as session_count,
        COALESCE(SUM(te.duration), 0) as total_minutes,
        ROUND(COALESCE(SUM(te.duration), 0) / 60.0, 2) as total_hours
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE te.user_id = $1 AND te.end_time IS NOT NULL AND p.id IS NOT NULL
    `;
    const params = [userId];

    if (startDate && endDate) {
      queryText += ' AND te.start_time::date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    queryText += ' GROUP BY p.id, p.name, c.id, c.name ORDER BY total_minutes DESC';

    const results = await this.db.queryMany(queryText, params);
    return results.map(row => new TimeTrackingReport(row));
  }

  /**
   * Generate time tracking report grouped by clients
   * @param {number} userId - User ID
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {Promise<TimeTrackingReport[]>}
   */
  async getTimeTrackingByClients(userId, startDate = null, endDate = null) {
    let queryText = `
      SELECT 
        c.id as client_id,
        c.name as client_name,
        COUNT(DISTINCT p.id) as project_count,
        COUNT(DISTINCT te.task_id) as task_count,
        COUNT(te.id) as session_count,
        COALESCE(SUM(te.duration), 0) as total_minutes,
        ROUND(COALESCE(SUM(te.duration), 0) / 60.0, 2) as total_hours
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE te.user_id = $1 AND te.end_time IS NOT NULL AND c.id IS NOT NULL
    `;
    const params = [userId];

    if (startDate && endDate) {
      queryText += ' AND te.start_time::date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    queryText += ' GROUP BY c.id, c.name ORDER BY total_minutes DESC';

    const results = await this.db.queryMany(queryText, params);
    return results.map(row => new TimeTrackingReport(row));
  }
}

module.exports = ReportsService;
