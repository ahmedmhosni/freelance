const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const pool = await db;
    const { client_id } = req.query;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    
    let query = 'SELECT * FROM projects WHERE user_id = @userId';
    
    if (client_id) {
      query += ' AND client_id = @clientId';
      request.input('clientId', sql.Int, parseInt(client_id));
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { client_id, name, description, status, end_date, start_date } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    request.input('clientId', sql.Int, client_id || null);
    request.input('name', sql.NVarChar, name);
    request.input('description', sql.NVarChar, description || null);
    request.input('status', sql.NVarChar, status || 'active');
    request.input('startDate', sql.Date, start_date || null);
    request.input('endDate', sql.Date, end_date || null);
    
    console.log('Creating project with data:', { userId: req.user.id, client_id, name, description, status, start_date, end_date });
    
    const result = await request.query(
      'INSERT INTO projects (user_id, client_id, name, description, status, start_date, end_date) OUTPUT INSERTED.id VALUES (@userId, @clientId, @name, @description, @status, @startDate, @endDate)'
    );
    
    res.status(201).json({ id: result.recordset[0].id, message: 'Project created' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { client_id, name, description, status, end_date, start_date } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('clientId', sql.Int, client_id || null);
    request.input('name', sql.NVarChar, name);
    request.input('description', sql.NVarChar, description || null);
    request.input('status', sql.NVarChar, status);
    request.input('startDate', sql.Date, start_date || null);
    request.input('endDate', sql.Date, end_date || null);
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    await request.query(
      'UPDATE projects SET client_id = @clientId, name = @name, description = @description, status = @status, start_date = @startDate, end_date = @endDate WHERE id = @id AND user_id = @userId'
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
