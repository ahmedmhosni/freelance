const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db/azuresql');

const router = express.Router();
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    
    const result = await request.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details with stats
router.get('/users/:id', async (req, res) => {
  try {
    const pool = await db;
    
    // Get user
    const userRequest = pool.request();
    userRequest.input('id', sql.Int, req.params.id);
    const userResult = await userRequest.query('SELECT id, name, email, role, created_at FROM users WHERE id = @id');
    const user = userResult.recordset[0];
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get stats
    const statsRequest = pool.request();
    statsRequest.input('userId', sql.Int, req.params.id);
    
    const statsResult = await statsRequest.query(`
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE user_id = @userId) as clients_count,
        (SELECT COUNT(*) FROM projects WHERE user_id = @userId) as projects_count,
        (SELECT COUNT(*) FROM tasks WHERE user_id = @userId) as tasks_count,
        (SELECT COUNT(*) FROM invoices WHERE user_id = @userId) as invoices_count
    `);
    
    const statsData = statsResult.recordset[0];
    const stats = {
      clients: { count: statsData.clients_count },
      projects: { count: statsData.projects_count },
      tasks: { count: statsData.tasks_count },
      invoices: { count: statsData.invoices_count }
    };

    res.json({ user, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('role', sql.NVarChar, role);
    request.input('id', sql.Int, req.params.id);
    
    await request.query('UPDATE users SET role = @role WHERE id = @id');
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    
    await request.query('DELETE FROM users WHERE id = @id');
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System reports
router.get('/reports', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('paidStatus', sql.NVarChar, 'paid');
    
    const result = await request.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM projects) as projects_count,
        (SELECT COUNT(*) FROM invoices) as invoices_count,
        (SELECT ISNULL(SUM(amount), 0) FROM invoices WHERE status = @paidStatus) as total_revenue
    `);
    
    const data = result.recordset[0];

    res.json({
      users: data.users_count,
      projects: data.projects_count,
      invoices: data.invoices_count,
      revenue: parseFloat(data.total_revenue)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity logs
router.get('/logs', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    
    const result = await request.query(`
      SELECT TOP 100 * FROM activity_logs 
      ORDER BY created_at DESC
    `);
    
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
