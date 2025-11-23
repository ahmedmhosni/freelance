const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db/azuresql');

const router = express.Router();
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = await db;
    const userId = req.user.id;

    // Get counts
    const request = pool.request();
    request.input('userId', sql.Int, userId);
    request.input('activeStatus', sql.NVarChar, 'active');
    request.input('doneStatus', sql.NVarChar, 'done');
    request.input('sentStatus', sql.NVarChar, 'sent');
    request.input('overdueStatus', sql.NVarChar, 'overdue');
    request.input('paidStatus', sql.NVarChar, 'paid');

    const result = await request.query(`
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE user_id = @userId) as clients_count,
        (SELECT COUNT(*) FROM projects WHERE user_id = @userId) as projects_count,
        (SELECT COUNT(*) FROM projects WHERE user_id = @userId AND status = @activeStatus) as active_projects_count,
        (SELECT COUNT(*) FROM tasks WHERE user_id = @userId) as tasks_count,
        (SELECT COUNT(*) FROM tasks WHERE user_id = @userId AND status != @doneStatus) as active_tasks_count,
        (SELECT COUNT(*) FROM invoices WHERE user_id = @userId) as invoices_count,
        (SELECT COUNT(*) FROM invoices WHERE user_id = @userId AND status IN (@sentStatus, @overdueStatus)) as pending_invoices_count,
        (SELECT ISNULL(SUM(amount), 0) FROM invoices WHERE user_id = @userId AND status = @paidStatus) as total_revenue
    `);

    const stats = result.recordset[0];

    res.json({
      clients: stats.clients_count,
      projects: stats.projects_count,
      activeProjects: stats.active_projects_count,
      tasks: stats.tasks_count,
      activeTasks: stats.active_tasks_count,
      invoices: stats.invoices_count,
      pendingInvoices: stats.pending_invoices_count,
      totalRevenue: parseFloat(stats.total_revenue)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent tasks with project info
router.get('/recent-tasks', async (req, res) => {
  try {
    const pool = await db;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const request = pool.request();
    request.input('userId', sql.Int, userId);
    request.input('doneStatus', sql.NVarChar, 'done');
    request.input('limit', sql.Int, limit);

    const result = await request.query(`
      SELECT TOP (@limit)
        t.*,
        p.title as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = @userId AND t.status != @doneStatus
      ORDER BY 
        CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
        t.due_date ASC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chart data
router.get('/charts', async (req, res) => {
  try {
    const pool = await db;
    const userId = req.user.id;

    const request = pool.request();
    request.input('userId', sql.Int, userId);

    // Task status distribution
    const taskResult = await request.query(`
      SELECT status, COUNT(*) as count
      FROM tasks
      WHERE user_id = @userId
      GROUP BY status
    `);

    // Invoice status distribution
    const invoiceRequest = pool.request();
    invoiceRequest.input('userId', sql.Int, userId);
    const invoiceResult = await invoiceRequest.query(`
      SELECT status, COUNT(*) as count
      FROM invoices
      WHERE user_id = @userId
      GROUP BY status
    `);

    res.json({
      taskData: taskResult.recordset.map(row => ({
        name: row.status.replace('-', ' '),
        value: row.count
      })),
      invoiceData: invoiceResult.recordset.map(row => ({
        name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
        count: row.count
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
