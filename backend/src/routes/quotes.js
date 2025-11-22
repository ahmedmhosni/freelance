const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get daily quote (public endpoint)
router.get('/daily', (req, res) => {
  try {
    // Get day of year to rotate quotes daily
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    db.get(
      `SELECT * FROM quotes WHERE is_active = 1 ORDER BY id LIMIT 1 OFFSET ?`,
      [(dayOfYear % 365)],
      (err, quote) => {
        if (err) {
          console.error('Error fetching daily quote:', err);
          return res.status(500).json({ error: 'Failed to fetch quote' });
        }
        
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
      }
    );
  } catch (error) {
    console.error('Server error in daily quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all quotes (admin only) with pagination
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    db.get('SELECT COUNT(*) as total FROM quotes', [], (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch quotes count' });
      }

      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);

      // Get paginated quotes
      db.all(
        'SELECT * FROM quotes ORDER BY id DESC LIMIT ? OFFSET ?',
        [limit, offset],
        (err, quotes) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch quotes' });
          }
          res.json({ 
            data: quotes,
            pagination: {
              page,
              limit,
              total,
              totalPages
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create quote (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { text, author, is_active = 1 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    db.run(
      'INSERT INTO quotes (text, author, is_active) VALUES (?, ?, ?)',
      [text, author || '', is_active],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create quote' });
        }

        db.get(
          'SELECT * FROM quotes WHERE id = ?',
          [this.lastID],
          (err, quote) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch created quote' });
            }
            res.status(201).json(quote);
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update quote (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { text, author, is_active } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    db.run(
      'UPDATE quotes SET text = ?, author = ?, is_active = ? WHERE id = ?',
      [text, author || '', is_active !== undefined ? is_active : 1, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update quote' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Quote not found' });
        }

        db.get(
          'SELECT * FROM quotes WHERE id = ?',
          [id],
          (err, quote) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch updated quote' });
            }
            res.json(quote);
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete quote (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    db.run(
      'DELETE FROM quotes WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete quote' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Quote not found' });
        }

        res.json({ message: 'Quote deleted successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
