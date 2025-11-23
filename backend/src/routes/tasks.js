const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db/azuresql');

const router = express.Router();
router.use(authenticateToken);

// Get tasks with pagination
router.get('/', async (req, res) => {
  try {
    const pool = await db;
    const { page = 1, limit = 50, status, priority } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM tasks WHERE user_id = @userId';
    let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE user_id = @userId';

    const request = pool.request();
    const countRequest = pool.request();
    
    request.input('userId', sql.Int, req.user.id);
    countRequest.input('userId', sql.Int, req.user.id);

    if (status) {
      query += ' AND status = @status';
      countQuery += ' AND status = @status';
      request.input('status', sql.NVarChar, status);
      countRequest.input('status', sql.NVarChar, status);
    }

    if (priority) {
      query += ' AND priority = @priority';
      countQuery += ' AND priority = @priority';
      request.input('priority', sql.NVarChar, priority);
      countRequest.input('priority', sql.NVarChar, priority);
    }

    query += ' ORDER BY due_date ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    request.input('offset', sql.Int, parseInt(offset));
    request.input('limit', sql.Int, parseInt(limit));

    const result = await request.query(query);
    const countResult = await countRequest.query(countQuery);
    
    const tasks = result.recordset;
    const total = countResult.recordset[0].total;

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
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    request.input('projectId', sql.Int, project_id || null);
    request.input('title', sql.NVarChar, title);
    request.input('description', sql.NVarChar, description || null);
    request.input('priority', sql.NVarChar, priority || 'medium');
    request.input('status', sql.NVarChar, status || 'pending');
    request.input('dueDate', sql.Date, due_date || null);
    
    const result = await request.query(
      'INSERT INTO tasks (user_id, project_id, title, description, priority, status, due_date) OUTPUT INSERTED.* VALUES (@userId, @projectId, @title, @description, @priority, @status, @dueDate)'
    );

    const task = result.recordset[0];

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
    const pool = await db;
    const request = pool.request();
    request.input('projectId', sql.Int, project_id || null);
    request.input('title', sql.NVarChar, title);
    request.input('description', sql.NVarChar, description || null);
    request.input('priority', sql.NVarChar, priority);
    request.input('status', sql.NVarChar, status);
    request.input('dueDate', sql.Date, due_date || null);
    request.input('comments', sql.NVarChar, comments || null);
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    await request.query(
      'UPDATE tasks SET project_id = @projectId, title = @title, description = @description, priority = @priority, status = @status, due_date = @dueDate, comments = @comments, updated_at = GETDATE() WHERE id = @id AND user_id = @userId'
    );

    // Get updated task
    const getRequest = pool.request();
    getRequest.input('taskId', sql.Int, req.params.id);
    const taskResult = await getRequest.query('SELECT * FROM tasks WHERE id = @taskId');
    const task = taskResult.recordset[0];

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
    const pool = await db;
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    await request.query('DELETE FROM tasks WHERE id = @id AND user_id = @userId');

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
