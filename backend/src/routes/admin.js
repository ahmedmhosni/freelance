const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { runQuery, getAll, getOne } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await getAll('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details with stats
router.get('/users/:id', async (req, res) => {
  try {
    const user = await getOne('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const stats = {
      clients: await getOne('SELECT COUNT(*) as count FROM clients WHERE user_id = ?', [req.params.id]),
      projects: await getOne('SELECT COUNT(*) as count FROM projects WHERE user_id = ?', [req.params.id]),
      tasks: await getOne('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [req.params.id]),
      invoices: await getOne('SELECT COUNT(*) as count FROM invoices WHERE user_id = ?', [req.params.id])
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
    await runQuery('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System reports
router.get('/reports', async (req, res) => {
  try {
    const totalUsers = await getOne('SELECT COUNT(*) as count FROM users');
    const totalProjects = await getOne('SELECT COUNT(*) as count FROM projects');
    const totalInvoices = await getOne('SELECT COUNT(*) as count FROM invoices');
    const totalRevenue = await getOne('SELECT SUM(amount) as total FROM invoices WHERE status = "paid"');

    res.json({
      users: totalUsers.count,
      projects: totalProjects.count,
      invoices: totalInvoices.count,
      revenue: totalRevenue.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await getAll('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
