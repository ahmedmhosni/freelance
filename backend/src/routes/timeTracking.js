const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db/azuresql');

const router = express.Router();
router.use(authenticateToken);

// Get all time entries
router.get('/', async (req, res) => {
  try {
    const pool = await db;
    const { task_id, project_id, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM time_entries WHERE user_id = @userId';
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);

    if (task_id) {
      query += ' AND task_id = @taskId';
      request.input('taskId', sql.Int, task_id);
    }
    if (project_id) {
      query += ' AND project_id = @projectId';
      request.input('projectId', sql.Int, project_id);
    }
    if (start_date && end_date) {
      query += ' AND date BETWEEN @startDate AND @endDate';
      request.input('startDate', sql.Date, start_date);
      request.input('endDate', sql.Date, end_date);
    }

    query += ' ORDER BY date DESC, start_time DESC';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start time tracking
router.post('/start', async (req, res) => {
  const { task_id, project_id, description } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    request.input('taskId', sql.Int, task_id || null);
    request.input('projectId', sql.Int, project_id || null);
    request.input('description', sql.NVarChar, description || null);
    
    const result = await request.query(`
      INSERT INTO time_entries (user_id, task_id, project_id, description, date, start_time, is_running) 
      OUTPUT INSERTED.id
      VALUES (@userId, @taskId, @projectId, @description, CAST(GETDATE() AS DATE), CAST(GETDATE() AS TIME), 1)
    `);
    
    res.status(201).json({ id: result.recordset[0].id, message: 'Time tracking started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop time tracking
router.post('/stop/:id', async (req, res) => {
  try {
    const pool = await db;
    
    // Check if entry exists
    const checkRequest = pool.request();
    checkRequest.input('id', sql.Int, req.params.id);
    checkRequest.input('userId', sql.Int, req.user.id);
    const checkResult = await checkRequest.query('SELECT * FROM time_entries WHERE id = @id AND user_id = @userId');
    const entry = checkResult.recordset[0];
    
    if (!entry) return res.status(404).json({ error: 'Time entry not found' });

    // Stop tracking and calculate duration
    const updateRequest = pool.request();
    updateRequest.input('id', sql.Int, req.params.id);
    
    await updateRequest.query(`
      UPDATE time_entries 
      SET 
        end_time = CAST(GETDATE() AS TIME), 
        is_running = 0,
        duration = DATEDIFF(MINUTE, 
          CAST(CONCAT(CAST(date AS VARCHAR), ' ', CAST(start_time AS VARCHAR)) AS DATETIME),
          GETDATE()
        ) / 60.0
      WHERE id = @id
    `);

    // Get updated entry
    const getRequest = pool.request();
    getRequest.input('id', sql.Int, req.params.id);
    const getResult = await getRequest.query('SELECT duration FROM time_entries WHERE id = @id');
    const duration = getResult.recordset[0].duration;

    res.json({ message: 'Time tracking stopped', duration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete time entry
router.delete('/:id', async (req, res) => {
  try {
    const pool = await db;
    
    // Check if entry exists
    const checkRequest = pool.request();
    checkRequest.input('id', sql.Int, req.params.id);
    checkRequest.input('userId', sql.Int, req.user.id);
    const checkResult = await checkRequest.query('SELECT * FROM time_entries WHERE id = @id AND user_id = @userId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    // Delete entry
    const deleteRequest = pool.request();
    deleteRequest.input('id', sql.Int, req.params.id);
    deleteRequest.input('userId', sql.Int, req.user.id);
    await deleteRequest.query('DELETE FROM time_entries WHERE id = @id AND user_id = @userId');
    
    res.json({ message: 'Time entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary
router.get('/summary', async (req, res) => {
  try {
    const pool = await db;
    const { start_date, end_date } = req.query;
    
    let query = 'SELECT ISNULL(SUM(duration), 0) as total_hours, COUNT(*) as total_entries FROM time_entries WHERE user_id = @userId AND is_running = 0';
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);

    if (start_date && end_date) {
      query += ' AND date BETWEEN @startDate AND @endDate';
      request.input('startDate', sql.Date, start_date);
      request.input('endDate', sql.Date, end_date);
    }

    const result = await request.query(query);
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
