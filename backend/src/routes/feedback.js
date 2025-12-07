const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const emailService = require('../utils/emailService');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit feedback, bug report, or feature request
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [bug, feature, other]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               screenshot:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, upload.single('screenshot'), asyncHandler(async (req, res) => {
  const { type, title, description } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!type || !title || !description) {
    throw new AppError('Type, title, and description are required', 400);
  }

  if (!['bug', 'feature', 'other'].includes(type)) {
    throw new AppError('Invalid feedback type', 400);
  }

  let screenshotUrl = null;

  // Upload screenshot if provided
  if (req.file) {
    try {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const containerName = 'feedback-screenshots';

      if (connectionString) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Generate unique blob name
        const timestamp = Date.now();
        const extension = req.file.originalname.split('.').pop();
        const blobName = `feedback-${userId}-${timestamp}.${extension}`;

        // Upload file
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadData(req.file.buffer, {
          blobHTTPHeaders: {
            blobContentType: req.file.mimetype
          }
        });

        // Use proxied URL through our domain instead of direct blob URL
        const appUrl = process.env.APP_URL || 'http://localhost:5000';
        screenshotUrl = `${appUrl}/api/media/feedback/${blobName}`;
      }
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      // Continue without screenshot if upload fails
    }
  }

  // Save feedback to database
  const result = await query(
    `INSERT INTO feedback (user_id, type, title, description, screenshot_url, status)
     VALUES ($1, $2, $3, $4, $5, 'new')
     RETURNING id, type, title, description, screenshot_url, status, created_at`,
    [userId, type, title, description, screenshotUrl]
  );

  const feedback = result.rows[0];

  // Get user info for email
  const userResult = await query(
    'SELECT name, email FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];

  // Send email notification
  try {
    const typeLabel = type === 'bug' ? '🐛 Bug Report' : type === 'feature' ? '✨ Feature Request' : '💬 Feedback';

    await emailService.sendEmail(
      process.env.SUPPORT_EMAIL || 'support@roastify.com',
      `${typeLabel}: ${title}`,
      `
        <h2>${typeLabel}</h2>
        <p><strong>From:</strong> ${user.name} (${user.email})</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong></p>
        <p>${description.replace(/\n/g, '<br>')}</p>
        ${screenshotUrl ? `<p><strong>Screenshot:</strong> <a href="${screenshotUrl}">View Screenshot</a></p>` : ''}
        <p><strong>View in Admin Panel:</strong> <a href="${process.env.APP_URL}/admin/feedback">Manage Feedback</a></p>
      `
    );
  } catch (error) {
    console.error('Error sending feedback email:', error);
    // Don't fail the request if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback! We\'ll review it soon.',
    feedback
  });
}));

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Get all feedback (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [bug, feature, other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, in_progress, completed, closed]
 *     responses:
 *       200:
 *         description: List of feedback
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied. Admin only.', 403);
  }

  const { type, status } = req.query;

  let queryText = `
    SELECT 
      f.id, f.type, f.title, f.description, f.screenshot_url, 
      f.status, f.admin_notes, f.created_at, f.updated_at,
      u.id as user_id, u.name as user_name, u.email as user_email
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (type) {
    params.push(type);
    queryText += ` AND f.type = $${params.length}`;
  }

  if (status) {
    params.push(status);
    queryText += ` AND f.status = $${params.length}`;
  }

  queryText += ' ORDER BY f.created_at DESC';

  const result = await query(queryText, params);

  res.json({
    success: true,
    feedback: result.rows
  });
}));

/**
 * @swagger
 * /api/feedback/{id}:
 *   put:
 *     summary: Update feedback status/notes (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, in_progress, completed, closed]
 *               admin_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Feedback not found
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied. Admin only.', 403);
  }

  const { id } = req.params;
  const { status, admin_notes } = req.body;

  // Validate status if provided
  if (status && !['new', 'in_progress', 'completed', 'closed'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const updates = [];
  const params = [];

  if (status) {
    params.push(status);
    updates.push(`status = $${params.length}`);
  }

  if (admin_notes !== undefined) {
    params.push(admin_notes);
    updates.push(`admin_notes = $${params.length}`);
  }

  if (updates.length === 0) {
    throw new AppError('No updates provided', 400);
  }

  params.push(id);
  const queryText = `
    UPDATE feedback 
    SET ${updates.join(', ')}
    WHERE id = $${params.length}
    RETURNING *
  `;

  const result = await query(queryText, params);

  if (result.rows.length === 0) {
    throw new AppError('Feedback not found', 404);
  }

  res.json({
    success: true,
    message: 'Feedback updated successfully',
    feedback: result.rows[0]
  });
}));

/**
 * @swagger
 * /api/feedback/{id}:
 *   delete:
 *     summary: Delete feedback (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Feedback not found
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied. Admin only.', 403);
  }

  const { id } = req.params;

  // Get feedback to delete screenshot if exists
  const feedbackResult = await query(
    'SELECT screenshot_url FROM feedback WHERE id = $1',
    [id]
  );

  if (feedbackResult.rows.length === 0) {
    throw new AppError('Feedback not found', 404);
  }

  const feedback = feedbackResult.rows[0];

  // Delete screenshot from blob storage if exists
  if (feedback.screenshot_url && feedback.screenshot_url.includes('blob.core.windows.net')) {
    try {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const containerName = 'feedback-screenshots';

      if (connectionString) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = feedback.screenshot_url.split('/').pop();
        const blobClient = containerClient.getBlockBlobClient(blobName);

        await blobClient.deleteIfExists();
      }
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      // Continue with feedback deletion even if screenshot deletion fails
    }
  }

  // Delete feedback
  await query('DELETE FROM feedback WHERE id = $1', [id]);

  res.json({
    success: true,
    message: 'Feedback deleted successfully'
  });
}));

module.exports = router;
