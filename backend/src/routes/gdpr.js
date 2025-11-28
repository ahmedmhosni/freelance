const express = require('express');
const router = express.Router();
const { query } = require('../db/postgresql');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const fs = require('fs').promises;
const path = require('path');

/**
 * @swagger
 * /api/gdpr/export:
 *   post:
 *     summary: Request data export (GDPR compliance)
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Export request created
 */
router.post('/export', authenticate, asyncHandler(async (req, res) => {
  // Check if there's already a pending request
  const existingRequest = await query(
    `SELECT id, status, requested_at 
     FROM data_export_requests 
     WHERE user_id = $1 
     AND status IN ('pending', 'processing')
     ORDER BY requested_at DESC 
     LIMIT 1`,
    [req.user.id]
  );

  if (existingRequest.rows.length > 0) {
    return res.status(429).json({
      error: 'Export already in progress',
      message: 'You already have a pending export request. Please wait for it to complete.',
      requestId: existingRequest.rows[0].id
    });
  }

  // Create export request
  const result = await query(
    `INSERT INTO data_export_requests (user_id, status)
     VALUES ($1, 'pending')
     RETURNING id, requested_at`,
    [req.user.id]
  );

  const requestId = result.rows[0].id;

  // Process export asynchronously (don't wait)
  processDataExport(req.user.id, requestId).catch(err => {
    console.error('Export processing error:', err);
  });

  res.json({
    message: 'Data export request created. You will receive an email with a download link within 24 hours.',
    requestId,
    estimatedTime: '15-30 minutes'
  });
}));

/**
 * @swagger
 * /api/gdpr/export/status:
 *   get:
 *     summary: Check data export status
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Export status
 */
router.get('/export/status', authenticate, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, status, requested_at, completed_at, expires_at, error_message
     FROM data_export_requests 
     WHERE user_id = $1 
     ORDER BY requested_at DESC 
     LIMIT 5`,
    [req.user.id]
  );

  res.json({ requests: result.rows });
}));

/**
 * @swagger
 * /api/gdpr/delete-account:
 *   post:
 *     summary: Request account deletion (soft delete)
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.post('/delete-account', authenticate, asyncHandler(async (req, res) => {
  const { password, reason } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password confirmation required' });
  }

  // Verify password
  const bcrypt = require('bcryptjs');
  const userResult = await query(
    'SELECT password FROM users WHERE id = $1',
    [req.user.id]
  );

  const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Soft delete - set deleted_at timestamp
  await query(
    `UPDATE users 
     SET deleted_at = NOW(),
         deletion_reason = $1,
         is_active = false,
         email = CONCAT('deleted_', id, '_', email)
     WHERE id = $2`,
    [reason || 'User requested deletion', req.user.id]
  );

  // Send confirmation email
  try {
    await emailService.sendEmail(
      req.user.email,
      'Account Deletion Confirmation',
      `
        <h2>Account Deleted</h2>
        <p>Your Roastify account has been successfully deleted.</p>
        <p>If this was a mistake, please contact support@roastify.com within 30 days to restore your account.</p>
        <p>Thank you for using Roastify.</p>
      `
    );
  } catch (emailError) {
    console.error('Failed to send deletion confirmation email:', emailError);
  }

  res.json({
    message: 'Your account has been deleted successfully',
    note: 'If you change your mind, contact support within 30 days to restore your account.'
  });
}));

// Background function to process data export
async function processDataExport(userId, requestId) {
  try {
    // Update status to processing
    await query(
      'UPDATE data_export_requests SET status = $1 WHERE id = $2',
      ['processing', requestId]
    );

    // Fetch all user data
    const userData = await fetchUserData(userId);

    // Create JSON file
    const exportData = {
      exportDate: new Date().toISOString(),
      user: userData.user,
      clients: userData.clients,
      projects: userData.projects,
      tasks: userData.tasks,
      invoices: userData.invoices,
      timeEntries: userData.timeEntries,
      files: userData.files
    };

    // Save to file (in production, upload to Azure Blob Storage)
    const exportDir = path.join(__dirname, '../../exports');
    await fs.mkdir(exportDir, { recursive: true });
    
    const filename = `user_${userId}_export_${Date.now()}.json`;
    const filepath = path.join(exportDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));

    // In production, upload to Azure Blob Storage and get URL
    const downloadUrl = `/api/gdpr/download/${filename}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update request with download URL
    await query(
      `UPDATE data_export_requests 
       SET status = $1, download_url = $2, expires_at = $3, completed_at = NOW()
       WHERE id = $4`,
      ['completed', downloadUrl, expiresAt, requestId]
    );

    // Send email with download link
    const userEmail = userData.user.email;
    await emailService.sendEmail(
      userEmail,
      'Your Data Export is Ready',
      `
        <h2>Your Data Export is Ready</h2>
        <p>Your requested data export has been completed and is ready for download.</p>
        <p><strong>Download Link:</strong> <a href="${process.env.APP_URL}${downloadUrl}">Download Your Data</a></p>
        <p><strong>Expires:</strong> ${expiresAt.toLocaleDateString()}</p>
        <p>This link will expire in 7 days for security reasons.</p>
        <p>The export includes all your data: clients, projects, tasks, invoices, and time entries.</p>
      `
    );

  } catch (error) {
    console.error('Data export error:', error);
    
    // Update request with error
    await query(
      `UPDATE data_export_requests 
       SET status = $1, error_message = $2
       WHERE id = $3`,
      ['failed', error.message, requestId]
    );
  }
}

// Helper function to fetch all user data
async function fetchUserData(userId) {
  const [user, clients, projects, tasks, invoices, timeEntries, files] = await Promise.all([
    query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]),
    query('SELECT * FROM clients WHERE user_id = $1', [userId]),
    query('SELECT * FROM projects WHERE user_id = $1', [userId]),
    query('SELECT * FROM tasks WHERE user_id = $1', [userId]),
    query('SELECT * FROM invoices WHERE user_id = $1', [userId]),
    query('SELECT * FROM time_entries WHERE user_id = $1', [userId]),
    query('SELECT * FROM files WHERE user_id = $1', [userId])
  ]);

  return {
    user: user.rows[0],
    clients: clients.rows,
    projects: projects.rows,
    tasks: tasks.rows,
    invoices: invoices.rows,
    timeEntries: timeEntries.rows,
    files: files.rows
  };
}

/**
 * Download export file (protected)
 */
router.get('/download/:filename', authenticate, asyncHandler(async (req, res) => {
  const { filename } = req.params;

  // Verify this export belongs to the user
  const result = await query(
    `SELECT download_url, expires_at 
     FROM data_export_requests 
     WHERE user_id = $1 
     AND download_url LIKE $2
     AND status = 'completed'`,
    [req.user.id, `%${filename}%`]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Export not found or expired' });
  }

  const expiresAt = new Date(result.rows[0].expires_at);
  if (expiresAt < new Date()) {
    return res.status(410).json({ error: 'Download link has expired' });
  }

  // Send file
  const filepath = path.join(__dirname, '../../exports', filename);
  res.download(filepath, `roastify_data_export.json`);
}));

module.exports = router;
