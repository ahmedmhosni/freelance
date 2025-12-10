const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { query } = require('../db/postgresql');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// Get all announcements (public)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    // Return empty array if table doesn't exist
    res.json([]);
  }
});

// Get featured announcements (public)
router.get('/featured', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM announcements WHERE is_featured = true ORDER BY created_at DESC LIMIT 5'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured announcements:', error);
    // Return empty array if table doesn't exist
    res.json([]);
  }
});

// Get single announcement (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM announcements WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// Create announcement (admin only)
router.post('/', authenticateToken, requireAdmin, upload.single('media'), async (req, res) => {
  try {
    const { title, content, isFeatured } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let mediaUrl = null;
    let mediaType = null;

    // Upload media to Azure Blob Storage if provided
    if (req.file) {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const containerName = 'general';

      if (connectionString) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Generate unique blob name
        const timestamp = Date.now();
        const fileExtension = req.file.originalname.split('.').pop();
        const blobName = `announcements/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload file
        await blockBlobClient.uploadData(req.file.buffer, {
          blobHTTPHeaders: { blobContentType: req.file.mimetype }
        });

        mediaUrl = blockBlobClient.url;
        mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      }
    }

    const result = await query(
      `INSERT INTO announcements (title, content, is_featured, media_url, media_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, content, isFeatured === 'true' || isFeatured === true, mediaUrl, mediaType]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Update announcement (admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('media'), async (req, res) => {
  try {
    const { title, content, isFeatured } = req.body;
    const announcementId = req.params.id;

    // Get existing announcement
    const existing = await query(
      'SELECT * FROM announcements WHERE id = $1',
      [announcementId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    let mediaUrl = existing.rows[0].media_url;
    let mediaType = existing.rows[0].media_type;

    // Upload new media if provided
    if (req.file) {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const containerName = 'general';

      if (connectionString) {
        // Delete old media if exists
        if (mediaUrl) {
          try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const oldBlobName = mediaUrl.split('/').pop();
            const blobClient = containerClient.getBlockBlobClient(`announcements/${oldBlobName}`);
            await blobClient.deleteIfExists();
          } catch (deleteError) {
            console.error('Error deleting old media:', deleteError);
          }
        }

        // Upload new media
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const timestamp = Date.now();
        const fileExtension = req.file.originalname.split('.').pop();
        const blobName = `announcements/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(req.file.buffer, {
          blobHTTPHeaders: { blobContentType: req.file.mimetype }
        });

        mediaUrl = blockBlobClient.url;
        mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      }
    }

    const result = await query(
      `UPDATE announcements 
       SET title = $1, content = $2, is_featured = $3, media_url = $4, media_type = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, content, isFeatured === 'true' || isFeatured === true, mediaUrl, mediaType, announcementId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const announcementId = req.params.id;

    // Get announcement to delete media
    const existing = await query(
      'SELECT * FROM announcements WHERE id = $1',
      [announcementId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Delete media from blob storage if exists
    if (existing.rows[0].media_url) {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const containerName = 'general';

      if (connectionString) {
        try {
          const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
          const containerClient = blobServiceClient.getContainerClient(containerName);
          const blobName = existing.rows[0].media_url.split('/').pop();
          const blobClient = containerClient.getBlockBlobClient(`announcements/${blobName}`);
          await blobClient.deleteIfExists();
        } catch (deleteError) {
          console.error('Error deleting media:', deleteError);
        }
      }
    }

    await query('DELETE FROM announcements WHERE id = $1', [announcementId]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;
