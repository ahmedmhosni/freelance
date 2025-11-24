const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');

// Get maintenance content (public)
router.get('/', async (req, res) => {
  try {
    const dbModule = require('../db/index');
    const pool = await dbModule;
    const request = pool.request();
    
    const result = await request.query(`
      SELECT TOP 1 title, subtitle, message, launch_date, is_active
      FROM maintenance_content
      ORDER BY updated_at DESC
    `);
    
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
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
    const dbModule = require('../db/index');
    const pool = await dbModule;
    
    const checkRequest = pool.request();
    const checkResult = await checkRequest.query('SELECT id FROM maintenance_content');
    
    if (checkResult.recordset.length === 0) {
      const insertRequest = pool.request();
      insertRequest.input('title', sql.NVarChar, title);
      insertRequest.input('subtitle', sql.NVarChar, subtitle);
      insertRequest.input('message', sql.NVarChar, message);
      insertRequest.input('launchDate', sql.Date, launch_date || null);
      insertRequest.input('isActive', sql.Bit, is_active ? 1 : 0);
      insertRequest.input('updatedBy', sql.Int, req.user.id);
      
      await insertRequest.query(`
        INSERT INTO maintenance_content (title, subtitle, message, launch_date, is_active, updated_by, updated_at)
        VALUES (@title, @subtitle, @message, @launchDate, @isActive, @updatedBy, GETDATE())
      `);
    } else {
      const updateRequest = pool.request();
      updateRequest.input('title', sql.NVarChar, title);
      updateRequest.input('subtitle', sql.NVarChar, subtitle);
      updateRequest.input('message', sql.NVarChar, message);
      updateRequest.input('launchDate', sql.Date, launch_date || null);
      updateRequest.input('isActive', sql.Bit, is_active ? 1 : 0);
      updateRequest.input('updatedBy', sql.Int, req.user.id);
      
      await updateRequest.query(`
        UPDATE maintenance_content
        SET title = @title,
            subtitle = @subtitle,
            message = @message,
            launch_date = @launchDate,
            is_active = @isActive,
            updated_by = @updatedBy,
            updated_at = GETDATE()
      `);
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
    const dbModule = require('../db/index');
    const pool = await dbModule;
    const request = pool.request();
    
    const result = await request.query(`
      SELECT TOP 1 is_active
      FROM maintenance_content
      ORDER BY updated_at DESC
    `);
    
    res.json({ 
      is_active: result.recordset.length > 0 ? result.recordset[0].is_active : false 
    });
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    res.json({ is_active: false });
  }
});

module.exports = router;
