const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getAll } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const projects = await getAll('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { client_id, title, description, status, deadline } = req.body;
  try {
    const result = await runQuery(
      'INSERT INTO projects (user_id, client_id, title, description, status, deadline) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, client_id, title, description, status, deadline]
    );
    res.status(201).json({ id: result.id, message: 'Project created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { client_id, title, description, status, deadline } = req.body;
  try {
    await runQuery(
      'UPDATE projects SET client_id = ?, title = ?, description = ?, status = ?, deadline = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [client_id, title, description, status, deadline, req.params.id, req.user.id]
    );
    res.json({ message: 'Project updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
