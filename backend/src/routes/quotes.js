const express = require('express');
const router = express.Router();
const queries = require('../db/queries');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const sql = require('mssql');

// Get daily quote (public endpoint)
router.get('/daily', async (req, res) => {
  try {
    const quote = await queries.getDailyQuote();
    
    if (!quote) {
      // Fallback quote
      return res.json({
        text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        author: 'Winston Churchill'
      });
    }

    res.json({
      text: quote.text,
      author: quote.author
    });
  } catch (error) {
    console.error('Server error in daily quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all quotes (admin only) with pagination
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = require('../db/index');
    const pool = await db;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countRequest = pool.request();
    const countResult = await countRequest.query('SELECT COUNT(*) as total FROM quotes');
    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated quotes
    const request = pool.request();
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);
    
    const result = await request.query(`
      SELECT * FROM quotes 
      ORDER BY id DESC 
      OFFSET @offset ROWS 
      FETCH NEXT @limit ROWS ONLY
    `);

    res.json({ 
      data: result.recordset,
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
    const { text, author, is_active = 1 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    const result = await queries.createQuote(text, author || '', is_active ? 1 : 0);
    
    // Get the created quote
    const db = require('../db/index');
    const pool = await db;
    const request = pool.request();
    request.input('id', sql.Int, result.id || result.recordset[0].id);
    const quoteResult = await request.query('SELECT * FROM quotes WHERE id = @id');

    res.status(201).json(quoteResult.recordset[0]);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update quote (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author, is_active } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    await queries.updateQuote(id, text, author || '', is_active !== undefined ? (is_active ? 1 : 0) : 1);

    // Get updated quote
    const quote = await queries.getQuoteById(id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quote);
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete quote (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await queries.deleteQuote(id);

    if (result.changes === 0 && result.rowsAffected && result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
