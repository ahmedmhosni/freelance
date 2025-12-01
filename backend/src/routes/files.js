const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query, getAll } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

// Get file metadata
router.get('/', async (req, res) => {
  try {
    // Check if file_metadata table exists, if not use files table
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'file_metadata'
      )
    `);

    const tableName = tableCheck.rows[0].exists ? 'file_metadata' : 'files';
    const files = await getAll(
      `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Store file metadata (after upload to cloud)
router.post('/', async (req, res) => {
  const {
    project_id,
    file_name,
    cloud_provider,
    file_link,
    file_size,
    mime_type,
  } = req.body;
  try {
    // Check which table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'file_metadata'
      )
    `);

    if (tableCheck.rows[0].exists) {
      const result = await query(
        `
        INSERT INTO file_metadata (user_id, project_id, file_name, cloud_provider, file_link, file_size, mime_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
        [
          req.user.id,
          project_id || null,
          file_name,
          cloud_provider,
          file_link,
          file_size || null,
          mime_type || null,
        ]
      );

      res
        .status(201)
        .json({ id: result.rows[0].id, message: 'File metadata saved' });
    } else {
      // Use files table
      const result = await query(
        `
        INSERT INTO files (user_id, project_id, filename, original_name, file_path, file_size, mime_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
        [
          req.user.id,
          project_id || null,
          file_name,
          file_name,
          file_link,
          file_size || null,
          mime_type || null,
        ]
      );

      res
        .status(201)
        .json({ id: result.rows[0].id, message: 'File metadata saved' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth connection endpoints (placeholder - implement with actual OAuth flow)
router.post('/connect', async (req, res) => {
  const { provider } = req.body;
  // TODO: Implement OAuth flow for Google Drive, Dropbox, OneDrive
  // oauth_token will be used when implementing actual OAuth flow
  res.json({ message: `Connected to ${provider}` });
});

module.exports = router;
