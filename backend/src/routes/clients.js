const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or company
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
// Get all clients for user with search and pagination
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM clients WHERE user_id = $1';
    let countQueryText = 'SELECT COUNT(*) as total FROM clients WHERE user_id = $1';
    let params = [req.user.id];
    let countParams = [req.user.id];

    if (search) {
      const searchTerm = `%${search}%`;
      queryText += ' AND (name ILIKE $2 OR email ILIKE $2 OR company ILIKE $2)';
      countQueryText += ' AND (name ILIKE $2 OR email ILIKE $2 OR company ILIKE $2)';
      params.push(searchTerm);
      countParams.push(searchTerm);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);
    const countResult = await query(countQueryText, countParams);
    
    const clients = result.rows;
    const total = parseInt(countResult.rows[0].total);

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
    const result = await query(
      'SELECT * FROM clients WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const client = result.rows[0];
    
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
router.post('/', async (req, res) => {
  const { name, email, phone, company, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO clients (user_id, name, email, phone, company, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [req.user.id, name, email || null, phone || null, company || null, notes || null]
    );
    
    res.status(201).json({ id: result.rows[0].id, message: 'Client created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  const { name, email, phone, company, notes } = req.body;
  try {
    await query(
      `UPDATE clients 
       SET name = $1, email = $2, phone = $3, company = $4, notes = $5 
       WHERE id = $6 AND user_id = $7`,
      [name, email || null, phone || null, company || null, notes || null, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Client updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    await query(
      'DELETE FROM clients WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
