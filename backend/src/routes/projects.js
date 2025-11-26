const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { client_id } = req.query;
    let queryText = 'SELECT * FROM projects WHERE user_id = $1';
    let params = [req.user.id];
    
    if (client_id) {
      queryText += ' AND client_id = $2';
      params.push(parseInt(client_id));
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { client_id, name, description, status, end_date, start_date } = req.body;
  try {
    console.log('Creating project with data:', { userId: req.user.id, client_id, name, description, status, start_date, end_date });
    
    const result = await query(
      `INSERT INTO projects (user_id, client_id, name, description, status, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [req.user.id, client_id || null, name, description || null, status || 'active', start_date || null, end_date || null]
    );
    
    res.status(201).json({ id: result.rows[0].id, message: 'Project created' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { client_id, name, description, status, end_date, start_date } = req.body;
  try {
    await query(
      `UPDATE projects 
       SET client_id = $1, name = $2, description = $3, status = $4, start_date = $5, end_date = $6 
       WHERE id = $7 AND user_id = $8`,
      [client_id || null, name, description || null, status, start_date || null, end_date || null, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Project updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
