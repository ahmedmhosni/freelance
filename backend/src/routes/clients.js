const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getOne, getAll } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);

// Get all clients for user with search and pagination
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM clients WHERE user_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM clients WHERE user_id = ?';
    let params = [req.user.id];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const queryParams = [...params, parseInt(limit), parseInt(offset)];

    const clients = await getAll(query, queryParams);
    const { total } = await getOne(countQuery, params);

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
    const client = await getOne('SELECT * FROM clients WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
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
    const result = await runQuery(
      'INSERT INTO clients (user_id, name, email, phone, company, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, email, phone, company, notes, tags]
    );
    res.status(201).json({ id: result.id, message: 'Client created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  const { name, email, phone, company, notes, tags } = req.body;
  try {
    await runQuery(
      'UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, notes = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name, email, phone, company, notes, tags, req.params.id, req.user.id]
    );
    res.json({ message: 'Client updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM clients WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
