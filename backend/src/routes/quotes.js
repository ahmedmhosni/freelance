const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/azuresql');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get daily quote (public endpoint)
router.get('/daily', async (req, res) => {
  try {
    const pool = await db;
    
    // Get day of year to rotate quotes daily
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const request = pool.request();
    request.input('offset', sql.Int, dayOfYear % 365);
    
    const result = await request.query(`
      SELECT * FROM quotes 
      WHERE is_active = 1 
      ORDER BY id 
      OFFSET @offset ROWS 
      FETCH NEXT 1 ROWS ONLY
    `);
    
    const quote = result.recordset[0];
    
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
    const pool = await db;
    const { text, author, is_active = 1 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    const request = pool.request();
    request.input('text', sql.NVarChar, text);
    request.input('author', sql.NVarChar, author || '');
    request.input('isActive', sql.Bit, is_active);
    
    const result = await request.query(`
      INSERT INTO quotes (text, author, is_active) 
      OUTPUT INSERTED.*
      VALUES (@text, @author, @isActive)
    `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update quote (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await db;
    const { id } = req.params;
    const { text, author, is_active } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('text', sql.NVarChar, text);
    request.input('author', sql.NVarChar, author || '');
    request.input('isActive', sql.Bit, is_active !== undefined ? is_active : 1);
    
    await request.query(`
      UPDATE quotes 
      SET text = @text, author = @author, is_active = @isActive 
      WHERE id = @id
    `);

    // Get updated quote
    const getRequest = pool.request();
    getRequest.input('id', sql.Int, id);
    const result = await getRequest.query('SELECT * FROM quotes WHERE id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete quote (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await db;
    const { id } = req.params;

    const request = pool.request();
    request.input('id', sql.Int, id);
    
    const result = await request.query('DELETE FROM quotes WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
