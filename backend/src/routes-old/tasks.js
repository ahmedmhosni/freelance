const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

// Get tasks with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, priority, client_id } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `SELECT t.*, p.name as project_name, p.client_id 
                     FROM tasks t 
                     LEFT JOIN projects p ON t.project_id = p.id 
                     WHERE t.user_id = $1`;
    let countQueryText = `SELECT COUNT(*) as total 
                          FROM tasks t 
                          LEFT JOIN projects p ON t.project_id = p.id 
                          WHERE t.user_id = $1`;

    let params = [req.user.id];
    let countParams = [req.user.id];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND t.status = $${paramIndex}`;
      countQueryText += ` AND t.status = $${paramIndex}`;
      params.push(status);
      countParams.push(status);
      paramIndex++;
    }

    if (priority) {
      queryText += ` AND t.priority = $${paramIndex}`;
      countQueryText += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      countParams.push(priority);
      paramIndex++;
    }

    if (client_id) {
      queryText += ` AND p.client_id = $${paramIndex}`;
      countQueryText += ` AND p.client_id = $${paramIndex}`;
      params.push(parseInt(client_id));
      countParams.push(parseInt(client_id));
      paramIndex++;
    }

    queryText += ` ORDER BY t.due_date ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);
    const countResult = await query(countQueryText, countParams);
    
    const tasks = result.rows;
    const total = parseInt(countResult.rows[0].total);

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
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { project_id, title, description, priority, status, due_date } = req.body;
  try {
    const result = await query(
      `INSERT INTO tasks (user_id, project_id, title, description, priority, status, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [req.user.id, project_id || null, title, description || null, priority || 'medium', status || 'pending', due_date || null]
    );

    const task = result.rows[0];

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user.id}`).emit('task_created', task);
    }

    res.status(201).json({ id: task.id, message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { project_id, title, description, priority, status, due_date, comments } = req.body;
  try {
    await query(
      `UPDATE tasks 
       SET project_id = $1, title = $2, description = $3, priority = $4, status = $5, due_date = $6, comments = $7, updated_at = NOW() 
       WHERE id = $8 AND user_id = $9`,
      [project_id || null, title, description || null, priority, status, due_date || null, comments || null, req.params.id, req.user.id]
    );

    // Get updated task
    const taskResult = await query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    const task = taskResult.rows[0];

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user.id}`).emit('task_updated', task);
    }

    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user.id}`).emit('task_deleted', { id: req.params.id });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
