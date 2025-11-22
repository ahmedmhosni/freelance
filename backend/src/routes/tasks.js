const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getAll, getOne } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);

// Get tasks with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, priority } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?';
    let params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      countQuery += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY due_date ASC LIMIT ? OFFSET ?';
    const queryParams = [...params, parseInt(limit), parseInt(offset)];

    const tasks = await getAll(query, queryParams);
    const { total } = await getOne(countQuery, params);

    res.json({
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { project_id, title, description, priority, status, due_date } = req.body;
  try {
    const result = await runQuery(
      'INSERT INTO tasks (user_id, project_id, title, description, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, project_id, title, description, priority, status, due_date]
    );

    const task = await getOne('SELECT * FROM tasks WHERE id = ?', [result.id]);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('task_created', task);

    res.status(201).json({ id: result.id, message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { project_id, title, description, priority, status, due_date, comments } = req.body;
  try {
    await runQuery(
      'UPDATE tasks SET project_id = ?, title = ?, description = ?, priority = ?, status = ?, due_date = ?, comments = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [project_id, title, description, priority, status, due_date, comments, req.params.id, req.user.id]
    );

    const task = await getOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('task_updated', task);

    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('task_deleted', { id: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
