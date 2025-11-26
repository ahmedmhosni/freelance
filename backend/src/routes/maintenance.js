const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');

// Get maintenance content (public)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT title, subtitle, message, launch_date, is_active
      FROM maintenance_content
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({
        title: 'Brilliant ideas take time to be roasted',
        subtitle: 'Roastify is coming soon',
        message: 'We are crafting something extraordinary. Great things take time, and we are roasting the perfect experience for you.',
        launch_date: null,
        is_active: false
      });
    }
  } catch (error) {
    console.error('Error fetching maintenance content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update maintenance content (admin only)
router.put('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, subtitle, message, launch_date, is_active } = req.body;
    
    const checkResult = await query('SELECT id FROM maintenance_content');
    
    if (checkResult.rows.length === 0) {
      await query(`
        INSERT INTO maintenance_content (title, subtitle, message, launch_date, is_active, updated_by, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [title, subtitle, message, launch_date || null, is_active ? true : false, req.user.id]);
    } else {
      await query(`
        UPDATE maintenance_content
        SET title = $1,
            subtitle = $2,
            message = $3,
            launch_date = $4,
            is_active = $5,
            updated_by = $6,
            updated_at = NOW()
      `, [title, subtitle, message, launch_date || null, is_active ? true : false, req.user.id]);
    }
    
    res.json({ message: 'Maintenance content updated successfully' });
  } catch (error) {
    console.error('Error updating maintenance content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if maintenance mode is active (public)
router.get('/status', async (req, res) => {
  try {
    const result = await query(`
      SELECT is_active
      FROM maintenance_content
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    
    res.json({ 
      is_active: result.rows.length > 0 ? result.rows[0].is_active : false 
    });
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    res.json({ is_active: false });
  }
});

module.exports = router;
