const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { query, getAll, getOne } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await getAll(
      `SELECT 
        id, name, email, role, email_verified, created_at,
        last_login_at, last_activity_at, login_count, last_login_ip
      FROM users 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details with stats
router.get('/users/:id', async (req, res) => {
  try {
    // Get user
    const user = await getOne(
      'SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get stats
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE user_id = $1) as clients_count,
        (SELECT COUNT(*) FROM projects WHERE user_id = $1) as projects_count,
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1) as tasks_count,
        (SELECT COUNT(*) FROM invoices WHERE user_id = $1) as invoices_count
    `, [req.params.id]);

    const statsData = statsResult.rows[0];
    const stats = {
      clients: { count: parseInt(statsData.clients_count) },
      projects: { count: parseInt(statsData.projects_count) },
      tasks: { count: parseInt(statsData.tasks_count) },
      invoices: { count: parseInt(statsData.invoices_count) }
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
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user verification status
router.put('/users/:id/verification', async (req, res) => {
  const { email_verified } = req.body;
  try {
    await query('UPDATE users SET email_verified = $1 WHERE id = $2', [email_verified, req.params.id]);
    res.json({ message: 'User verification status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System reports
router.get('/reports', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM projects) as projects_count,
        (SELECT COUNT(*) FROM invoices) as invoices_count,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = $1) as total_revenue
    `, ['paid']);

    const data = result.rows[0];

    res.json({
      users: parseInt(data.users_count),
      projects: parseInt(data.projects_count),
      invoices: parseInt(data.invoices_count),
      revenue: parseFloat(data.total_revenue)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity logs
router.get('/logs', async (req, res) => {
  try {
    // Check if activity_logs table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'activity_logs'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      return res.json([]);
    }

    const logs = await getAll(`
      SELECT * FROM activity_logs 
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
