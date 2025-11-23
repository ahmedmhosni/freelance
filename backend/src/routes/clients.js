const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db');

const router = express.Router();
router.use(authenticateToken);

// Get all clients for user with search and pagination
router.get('/', async (req, res) => {
  try {
    const pool = await db;
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM clients WHERE user_id = @userId';
    let countQuery = 'SELECT COUNT(*) as total FROM clients WHERE user_id = @userId';

    const request = pool.request();
    const countRequest = pool.request();
    
    request.input('userId', sql.Int, req.user.id);
    countRequest.input('userId', sql.Int, req.user.id);

    if (search) {
      const searchTerm = `%${search}%`;
      query += ' AND (name LIKE @search OR email LIKE @search OR company LIKE @search)';
      countQuery += ' AND (name LIKE @search OR email LIKE @search OR company LIKE @search)';
      request.input('search', sql.NVarChar, searchTerm);
      countRequest.input('search', sql.NVarChar, searchTerm);
    }

    query += ' ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    request.input('offset', sql.Int, parseInt(offset));
    request.input('limit', sql.Int, parseInt(limit));

    const result = await request.query(query);
    const countResult = await countRequest.query(countQuery);
    
    const clients = result.recordset;
    const total = countResult.recordset[0].total;

    res.json({
      data: clients,
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

// Get single client
router.get('/:id', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    const result = await request.query('SELECT * FROM clients WHERE id = @id AND user_id = @userId');
    const client = result.recordset[0];
    
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
router.post('/', async (req, res) => {
  const { name, email, phone, company, notes, tags } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    request.input('name', sql.NVarChar, name);
    request.input('email', sql.NVarChar, email || null);
    request.input('phone', sql.NVarChar, phone || null);
    request.input('company', sql.NVarChar, company || null);
    request.input('notes', sql.NVarChar, notes || null);
    request.input('tags', sql.NVarChar, tags || null);
    
    const result = await request.query(
      'INSERT INTO clients (user_id, name, email, phone, company, notes, tags) OUTPUT INSERTED.id VALUES (@userId, @name, @email, @phone, @company, @notes, @tags)'
    );
    
    res.status(201).json({ id: result.recordset[0].id, message: 'Client created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  const { name, email, phone, company, notes, tags } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('name', sql.NVarChar, name);
    request.input('email', sql.NVarChar, email || null);
    request.input('phone', sql.NVarChar, phone || null);
    request.input('company', sql.NVarChar, company || null);
    request.input('notes', sql.NVarChar, notes || null);
    request.input('tags', sql.NVarChar, tags || null);
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    await request.query(
      'UPDATE clients SET name = @name, email = @email, phone = @phone, company = @company, notes = @notes, tags = @tags, updated_at = GETDATE() WHERE id = @id AND user_id = @userId'
    );
    
    res.json({ message: 'Client updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    await request.query('DELETE FROM clients WHERE id = @id AND user_id = @userId');
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
