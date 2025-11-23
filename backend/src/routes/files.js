const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db');

const router = express.Router();
router.use(authenticateToken);

// Get file metadata
router.get('/', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    
    const result = await request.query('SELECT * FROM file_metadata WHERE user_id = @userId ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Store file metadata (after upload to cloud)
router.post('/', async (req, res) => {
  const { project_id, file_name, cloud_provider, file_link, file_size, mime_type } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    request.input('projectId', sql.Int, project_id || null);
    request.input('fileName', sql.NVarChar, file_name);
    request.input('cloudProvider', sql.NVarChar, cloud_provider);
    request.input('fileLink', sql.NVarChar, file_link);
    request.input('fileSize', sql.Int, file_size || null);
    request.input('mimeType', sql.NVarChar, mime_type || null);
    
    const result = await request.query(`
      INSERT INTO file_metadata (user_id, project_id, file_name, cloud_provider, file_link, file_size, mime_type) 
      OUTPUT INSERTED.id
      VALUES (@userId, @projectId, @fileName, @cloudProvider, @fileLink, @fileSize, @mimeType)
    `);
    
    res.status(201).json({ id: result.recordset[0].id, message: 'File metadata saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth connection endpoints (placeholder - implement with actual OAuth flow)
router.post('/connect', async (req, res) => {
  const { provider, oauth_token } = req.body;
  // TODO: Implement OAuth flow for Google Drive, Dropbox, OneDrive
  res.json({ message: `Connected to ${provider}` });
});

module.exports = router;
