const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db/azuresql');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    
    const result = await request.query('SELECT * FROM projects WHERE user_id = @userId ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { client_id, title, description, status, deadline } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    request.input('clientId', sql.Int, client_id || null);
    request.input('title', sql.NVarChar, title);
    request.input('description', sql.NVarChar, description || null);
    request.input('status', sql.NVarChar, status || 'active');
    request.input('deadline', sql.Date, deadline || null);
    
    const result = await request.query(
      'INSERT INTO projects (user_id, client_id, title, description, status, deadline) OUTPUT INSERTED.id VALUES (@userId, @clientId, @title, @description, @status, @deadline)'
    );
    
    res.status(201).json({ id: result.recordset[0].id, message: 'Project created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { client_id, title, description, status, deadline } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('clientId', sql.Int, client_id || null);
    request.input('title', sql.NVarChar, title);
    request.input('description', sql.NVarChar, description || null);
    request.input('status', sql.NVarChar, status);
    request.input('deadline', sql.Date, deadline || null);
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    await request.query(
      'UPDATE projects SET client_id = @clientId, title = @title, description = @description, status = @status, deadline = @deadline, updated_at = GETDATE() WHERE id = @id AND user_id = @userId'
    );
    
    res.json({ message: 'Project updated' });
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
    
    await request.query('DELETE FROM projects WHERE id = @id AND user_id = @userId');
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
