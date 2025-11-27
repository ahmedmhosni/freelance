const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getAll } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

// Financial report
router.get('/financial', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let queryText = 'SELECT * FROM invoices WHERE user_id = $1';
    const params = [req.user.id];

    if (startDate && endDate) {
      queryText += ' AND created_at BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    const invoices = await getAll(queryText, params);

    const report = {
      totalInvoices: invoices.length,
      totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0),
      pendingAmount: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0),
      overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0),
      byStatus: {
        draft: invoices.filter(inv => inv.status === 'draft').length,
        sent: invoices.filter(inv => inv.status === 'sent').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length,
        cancelled: invoices.filter(inv => inv.status === 'cancelled').length
      },
      invoices: invoices
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project report
router.get('/projects', async (req, res) => {
  try {
    const projects = await getAll('SELECT * FROM projects WHERE user_id = $1', [req.user.id]);
    const tasks = await getAll('SELECT * FROM tasks WHERE user_id = $1', [req.user.id]);

    const report = {
      totalProjects: projects.length,
      byStatus: {
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        'on-hold': projects.filter(p => p.status === 'on-hold').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length
      },
      totalTasks: tasks.length,
      tasksByStatus: {
        todo: tasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done' || t.status === 'completed').length
      },
      projects: projects
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Client report
router.get('/clients', async (req, res) => {
  try {
    const clients = await getAll('SELECT * FROM clients WHERE user_id = $1', [req.user.id]);
    const projects = await getAll('SELECT * FROM projects WHERE user_id = $1', [req.user.id]);
    const invoices = await getAll('SELECT * FROM invoices WHERE user_id = $1', [req.user.id]);

    const clientReport = clients.map(client => {
      const clientProjects = projects.filter(p => p.client_id === client.id);
      const clientInvoices = invoices.filter(inv => inv.client_id === client.id);
      const totalRevenue = clientInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0);

      return {
        ...client,
        projectCount: clientProjects.length,
        invoiceCount: clientInvoices.length,
        totalRevenue: totalRevenue
      };
    });

    res.json(clientReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Time tracking report - grouped by tasks
router.get('/time-tracking/tasks', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
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
    const params = [req.user.id];

    if (start_date && end_date) {
      queryText += ' AND te.start_time::date BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    queryText += ' GROUP BY t.id, t.title, p.id, p.name, c.id, c.name ORDER BY total_minutes DESC';
    
    const result = await getAll(queryText, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Time tracking report - grouped by projects
router.get('/time-tracking/projects', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
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
    const params = [req.user.id];

    if (start_date && end_date) {
      queryText += ' AND te.start_time::date BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    queryText += ' GROUP BY p.id, p.name, c.id, c.name ORDER BY total_minutes DESC';
    
    const result = await getAll(queryText, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Time tracking report - grouped by clients
router.get('/time-tracking/clients', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
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
    const params = [req.user.id];

    if (start_date && end_date) {
      queryText += ' AND te.start_time::date BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    queryText += ' GROUP BY c.id, c.name ORDER BY total_minutes DESC';
    
    const result = await getAll(queryText, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
