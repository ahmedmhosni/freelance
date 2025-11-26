const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE user_id = $1) as clients_count,
        (SELECT COUNT(*) FROM projects WHERE user_id = $1) as projects_count,
        (SELECT COUNT(*) FROM projects WHERE user_id = $1 AND status = 'active') as active_projects_count,
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1) as tasks_count,
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status != 'done') as active_tasks_count,
        (SELECT COUNT(*) FROM invoices WHERE user_id = $1) as invoices_count,
        (SELECT COUNT(*) FROM invoices WHERE user_id = $1 AND status IN ('sent', 'overdue')) as pending_invoices_count,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE user_id = $1 AND status = 'paid') as total_revenue
    `, [userId]);

    const stats = result.rows[0];

    res.json({
      clients: parseInt(stats.clients_count) || 0,
      projects: parseInt(stats.projects_count) || 0,
      activeProjects: parseInt(stats.active_projects_count) || 0,
      tasks: parseInt(stats.tasks_count) || 0,
      activeTasks: parseInt(stats.active_tasks_count) || 0,
      invoices: parseInt(stats.invoices_count) || 0,
      pendingInvoices: parseInt(stats.pending_invoices_count) || 0,
      totalRevenue: parseFloat(stats.total_revenue) || 0
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

    const result = await query(`
      SELECT 
        t.*,
        p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = $1 AND t.status != 'done'
      ORDER BY 
        CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
        t.due_date ASC
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chart data
router.get('/charts', async (req, res) => {
  try {
    const userId = req.user.id;

    // Task status distribution
    const taskResult = await query(`
      SELECT status, COUNT(*) as count
      FROM tasks
      WHERE user_id = $1
      GROUP BY status
    `, [userId]);

    // Invoice status distribution
    const invoiceResult = await query(`
      SELECT status, COUNT(*) as count
      FROM invoices
      WHERE user_id = $1
      GROUP BY status
    `, [userId]);

    res.json({
      taskData: taskResult.rows.map(row => ({
        name: row.status.replace('-', ' '),
        value: parseInt(row.count)
      })),
      invoiceData: invoiceResult.rows.map(row => ({
        name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
        count: parseInt(row.count)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
