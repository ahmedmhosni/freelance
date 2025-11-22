const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getAll, getOne } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts
    const clientsCount = await getOne('SELECT COUNT(*) as count FROM clients WHERE user_id = ?', [userId]);
    const projectsCount = await getOne('SELECT COUNT(*) as count FROM projects WHERE user_id = ?', [userId]);
    const activeProjectsCount = await getOne('SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND status = ?', [userId, 'active']);
    const tasksCount = await getOne('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [userId]);
    const activeTasksCount = await getOne('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != ?', [userId, 'done']);
    const invoicesCount = await getOne('SELECT COUNT(*) as count FROM invoices WHERE user_id = ?', [userId]);
    const pendingInvoicesCount = await getOne('SELECT COUNT(*) as count FROM invoices WHERE user_id = ? AND status IN (?, ?)', [userId, 'sent', 'overdue']);
    
    // Get total revenue from paid invoices
    const revenueResult = await getOne('SELECT SUM(amount) as total FROM invoices WHERE user_id = ? AND status = ?', [userId, 'paid']);
    const totalRevenue = revenueResult.total || 0;

    res.json({
      clients: clientsCount.count,
      projects: projectsCount.count,
      activeProjects: activeProjectsCount.count,
      tasks: tasksCount.count,
      activeTasks: activeTasksCount.count,
      invoices: invoicesCount.count,
      pendingInvoices: pendingInvoicesCount.count,
      totalRevenue: parseFloat(totalRevenue)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent tasks with project info
router.get('/recent-tasks', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const tasks = await getAll(`
      SELECT 
        t.*,
        p.title as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = ? AND t.status != 'done'
      ORDER BY 
        CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
        t.due_date ASC
      LIMIT ?
    `, [userId, limit]);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chart data
router.get('/charts', async (req, res) => {
  try {
    const userId = req.user.id;

    // Task status distribution
    const tasksByStatus = await getAll(`
      SELECT status, COUNT(*) as count
      FROM tasks
      WHERE user_id = ?
      GROUP BY status
    `, [userId]);

    // Invoice status distribution
    const invoicesByStatus = await getAll(`
      SELECT status, COUNT(*) as count
      FROM invoices
      WHERE user_id = ?
      GROUP BY status
    `, [userId]);

    res.json({
      taskData: tasksByStatus.map(row => ({
        name: row.status.replace('-', ' '),
        value: row.count
      })),
      invoiceData: invoicesByStatus.map(row => ({
        name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
        count: row.count
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
