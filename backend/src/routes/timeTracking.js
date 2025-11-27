const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query, getAll } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

// Get all time entries with task and project details
router.get('/', async (req, res) => {
  try {
    const { task_id, project_id, start_date, end_date } = req.query;
    
    let queryText = `
      SELECT 
        te.*,
        t.title as task_title,
        p.name as project_name,
        c.name as client_name,
        CASE WHEN te.end_time IS NULL THEN 1 ELSE 0 END as is_running
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE te.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (task_id) {
      queryText += ` AND te.task_id = $${paramIndex}`;
      params.push(task_id);
      paramIndex++;
    }
    if (project_id) {
      queryText += ` AND te.project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }
    if (start_date && end_date) {
      queryText += ` AND te.start_time::date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(start_date, end_date);
      paramIndex += 2;
    }

    queryText += ' ORDER BY te.start_time DESC';
    
    const result = await query(queryText, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Time tracking GET error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start time tracking
router.post('/start', async (req, res) => {
  const { task_id, project_id, description } = req.body;
  try {
    // Check if there's already a running timer
    const runningCheck = await query(
      'SELECT id FROM time_entries WHERE user_id = $1 AND end_time IS NULL',
      [req.user.id]
    );
    
    if (runningCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a running timer. Please stop it first.' });
    }

    const result = await query(`
      INSERT INTO time_entries (user_id, task_id, project_id, description, start_time) 
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [req.user.id, task_id || null, project_id || null, description || null]);
    
    res.status(201).json({ id: result.rows[0].id, message: 'Time tracking started' });
  } catch (error) {
    console.error('Time tracking START error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop time tracking
router.post('/stop/:id', async (req, res) => {
  try {
    // Check if entry exists and is running
    const checkResult = await query(
      'SELECT * FROM time_entries WHERE id = $1 AND user_id = $2 AND end_time IS NULL',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Active time entry not found' });
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
    console.error('Time tracking STOP error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete time entry
router.delete('/:id', async (req, res) => {
  try {
    // Check if entry exists and delete
    const result = await query(
      'DELETE FROM time_entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    res.json({ message: 'Time entry deleted' });
  } catch (error) {
    console.error('Time tracking DELETE error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get summary
router.get('/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let queryText = `
      SELECT 
        COALESCE(SUM(duration), 0) as total_hours, 
        COUNT(*) as total_entries 
      FROM time_entries 
      WHERE user_id = $1 AND end_time IS NOT NULL
    `;
    const params = [req.user.id];

    if (start_date && end_date) {
      queryText += ' AND start_time::date BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    const result = await query(queryText, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Time tracking SUMMARY error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get grouped summary by task/project/client
router.get('/grouped', async (req, res) => {
  try {
    const { start_date, end_date, group_by } = req.query;
    
    let selectFields = '';
    let groupFields = '';
    
    if (group_by === 'task') {
      selectFields = `
        te.task_id,
        t.title as task_title,
        p.name as project_name,
        c.name as client_name,
      `;
      groupFields = 'te.task_id, t.title, p.name, c.name';
    } else if (group_by === 'project') {
      selectFields = `
        te.project_id,
        p.name as project_name,
        c.name as client_name,
      `;
      groupFields = 'te.project_id, p.name, c.name';
    } else if (group_by === 'client') {
      selectFields = `
        c.id as client_id,
        c.name as client_name,
      `;
      groupFields = 'c.id, c.name';
    } else {
      return res.status(400).json({ error: 'group_by must be task, project, or client' });
    }
    
    let queryText = `
      SELECT 
        ${selectFields}
        COUNT(te.id) as session_count,
        COALESCE(SUM(te.duration), 0) as total_minutes,
        ROUND(COALESCE(SUM(te.duration), 0) / 60.0, 2) as total_hours
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE te.user_id = $1 AND te.end_time IS NOT NULL
    `;
    const params = [req.user.id];

    if (start_date && end_date) {
      queryText += ' AND te.start_time::date BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    queryText += ` GROUP BY ${groupFields} ORDER BY total_minutes DESC`;
    
    const result = await query(queryText, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Time tracking GROUPED error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
