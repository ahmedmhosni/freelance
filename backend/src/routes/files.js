const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getAll } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);

// Get file metadata
router.get('/', async (req, res) => {
  try {
    const files = await getAll('SELECT * FROM file_metadata WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Store file metadata (after upload to cloud)
router.post('/', async (req, res) => {
  const { project_id, file_name, cloud_provider, file_link, file_size, mime_type } = req.body;
  try {
    const result = await runQuery(
      'INSERT INTO file_metadata (user_id, project_id, file_name, cloud_provider, file_link, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, project_id, file_name, cloud_provider, file_link, file_size, mime_type]
    );
    res.status(201).json({ id: result.id, message: 'File metadata saved' });
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
