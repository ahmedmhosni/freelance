const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query, getAll } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

// Get all time entries
router.get('/', async (req, res) => {
  try {
    const { task_id, project_id, start_date, end_date } = req.query;
    
    let queryText = 'SELECT * FROM time_entries WHERE user_id = $1';
    const params = [req.user.id];
    let paramIndex = 2;

    if (task_id) {
      queryText += ` AND task_id = $${paramIndex}`;
      params.push(task_id);
      paramIndex++;
    }
    if (project_id) {
      queryText += ` AND project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }
    if (start_date && end_date) {
      queryText += ` AND start_time::date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(start_date, end_date);
      paramIndex += 2;
    }

    queryText += ' ORDER BY start_time DESC';
    const result = await getAll(queryText, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start time tracking
router.post('/start', async (req, res) => {
  const { task_id, project_id, description } = req.body;
  try {
    const result = await query(`
      INSERT INTO time_entries (user_id, task_id, project_id, description, start_time) 
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [req.user.id, task_id || null, project_id || null, description || null]);
    
    res.status(201).json({ id: result.rows[0].id, message: 'Time tracking started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop time tracking
router.post('/stop/:id', async (req, res) => {
  try {
    // Check if entry exists
    const checkResult = await query(
      'SELECT * FROM time_entries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    // Stop tracking and calculate duration (in minutes)
    const updateResult = await query(`
      UPDATE time_entries 
      SET 
        end_time = NOW(),
        duration = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
      WHERE id = $1
      RETURNING duration
    `, [req.params.id]);

    const duration = Math.round(updateResult.rows[0].duration);
    res.json({ message: 'Time tracking stopped', duration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete time entry
router.delete('/:id', async (req, res) => {
  try {
    // Check if entry exists and delete
    const result = await query(
      'DELETE FROM time_entries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    res.json({ message: 'Time entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary
router.get('/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let queryText = 'SELECT COALESCE(SUM(duration), 0) as total_hours, COUNT(*) as total_entries FROM time_entries WHERE user_id = $1 AND end_time IS NOT NULL';
    const params = [req.user.id];

    if (start_date && end_date) {
      queryText += ' AND start_time::date BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    const result = await query(queryText, params);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
