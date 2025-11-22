const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getAll, getOne } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);

// Financial report
router.get('/financial', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM invoices WHERE user_id = ?';
    let params = [req.user.id];

    if (startDate && endDate) {
      query += ' AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const invoices = await getAll(query, params);

    const report = {
      totalInvoices: invoices.length,
      totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      pendingAmount: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
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
    const projects = await getAll('SELECT * FROM projects WHERE user_id = ?', [req.user.id]);
    const tasks = await getAll('SELECT * FROM tasks WHERE user_id = ?', [req.user.id]);

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
        todo: tasks.filter(t => t.status === 'todo').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length
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
    const clients = await getAll('SELECT * FROM clients WHERE user_id = ?', [req.user.id]);
    const projects = await getAll('SELECT * FROM projects WHERE user_id = ?', [req.user.id]);
    const invoices = await getAll('SELECT * FROM invoices WHERE user_id = ?', [req.user.id]);

    const clientReport = clients.map(client => {
      const clientProjects = projects.filter(p => p.client_id === client.id);
      const clientInvoices = invoices.filter(inv => inv.client_id === client.id);
      const totalRevenue = clientInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

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

module.exports = router;
