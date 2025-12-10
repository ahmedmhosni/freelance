const express = require('express');
const router = express.Router();
const { getOne } = require('../db/postgresql');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get daily quote (public endpoint)
router.get('/daily', async (req, res) => {
  try {
    const quote = await getOne(
      'SELECT * FROM quotes WHERE is_active = true ORDER BY RANDOM() LIMIT 1'
    );
    
    if (!quote) {
      // Fallback quote
      return res.json({
        text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        author: 'Winston Churchill',
        category: 'motivation'
      });
    }

    res.json({
      text: quote.text,
      author: quote.author,
      category: quote.category
    });
  } catch (error) {
    console.error('Server error in daily quote:', error);
    // Return fallback quote instead of error
    res.json({
      text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      author: 'Winston Churchill',
      category: 'motivation'
    });
  }
});

// Get all quotes (admin only) with pagination
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = require('../db/postgresql');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM quotes');
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get paginated quotes
    const result = await pool.query(
      'SELECT * FROM quotes ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({ 
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create quote (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = require('../db/postgresql');
    const { text, author, category, is_active = true } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    const result = await pool.query(
      'INSERT INTO quotes (text, author, category, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [text, author || '', category || 'general', is_active]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update quote (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = require('../db/postgresql');
    const { id } = req.params;
    const { text, author, category, is_active } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    const result = await pool.query(
      'UPDATE quotes SET text = $1, author = $2, category = $3, is_active = $4 WHERE id = $5 RETURNING *',
      [text, author || '', category || 'general', is_active !== undefined ? is_active : true, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete quote (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = require('../db/postgresql');
    const { id } = req.params;

    const result = await pool.query('DELETE FROM quotes WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
