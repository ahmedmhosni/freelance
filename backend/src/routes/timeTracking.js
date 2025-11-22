const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getAll, getOne } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);

// Get all time entries
router.get('/', async (req, res) => {
  try {
    const { task_id, project_id, start_date, end_date } = req.query;
    let query = 'SELECT * FROM time_entries WHERE user_id = ?';
    let params = [req.user.id];

    if (task_id) {
      query += ' AND task_id = ?';
      params.push(task_id);
    }
    if (project_id) {
      query += ' AND project_id = ?';
      params.push(project_id);
    }
    if (start_date && end_date) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY date DESC, start_time DESC';
    const entries = await getAll(query, params);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start time tracking
router.post('/start', async (req, res) => {
  const { task_id, project_id, description } = req.body;
  try {
    const result = await runQuery(
      'INSERT INTO time_entries (user_id, task_id, project_id, description, date, start_time, is_running) VALUES (?, ?, ?, ?, date("now"), time("now"), 1)',
      [req.user.id, task_id, project_id, description]
    );
    res.status(201).json({ id: result.id, message: 'Time tracking started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop time tracking
router.post('/stop/:id', async (req, res) => {
  try {
    const entry = await getOne('SELECT * FROM time_entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!entry) return res.status(404).json({ error: 'Time entry not found' });

    await runQuery(
      'UPDATE time_entries SET end_time = time("now"), is_running = 0 WHERE id = ?',
      [req.params.id]
    );

    // Calculate duration
    const updated = await getOne('SELECT * FROM time_entries WHERE id = ?', [req.params.id]);
    const duration = calculateDuration(updated.start_time, updated.end_time);
    
    await runQuery('UPDATE time_entries SET duration = ? WHERE id = ?', [duration, req.params.id]);

    res.json({ message: 'Time tracking stopped', duration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete time entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await getOne('SELECT * FROM time_entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!entry) return res.status(404).json({ error: 'Time entry not found' });

    await runQuery('DELETE FROM time_entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Time entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary
router.get('/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT SUM(duration) as total_hours, COUNT(*) as total_entries FROM time_entries WHERE user_id = ? AND is_running = 0';
    let params = [req.user.id];

    if (start_date && end_date) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const summary = await getOne(query, params);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function
const calculateDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  return (end - start) / (1000 * 60 * 60); // hours
};

module.exports = router;
