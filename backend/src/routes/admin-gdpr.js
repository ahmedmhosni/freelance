const express = require('express');
const router = express.Router();
const { query } = require('../db/postgresql');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/admin/gdpr/export-requests:
 *   get:
 *     summary: Get all data export requests (Admin only)
 *     tags: [Admin, GDPR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of export requests
 */
router.get('/export-requests', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { status, limit = 50 } = req.query;

  let sql = `
    SELECT 
      der.id,
      der.user_id,
      u.name as user_name,
      u.email as user_email,
      der.status,
      der.requested_at,
      der.completed_at,
      der.expires_at,
      der.error_message,
      CASE 
        WHEN der.expires_at < NOW() THEN true 
        ELSE false 
      END as is_expired
    FROM data_export_requests der
    JOIN users u ON der.user_id = u.id
  `;

  const params = [];
  if (status) {
    sql += ' WHERE der.status = $1';
    params.push(status);
  }

  sql += ' ORDER BY der.requested_at DESC LIMIT $' + (params.length + 1);
  params.push(limit);

  const result = await query(sql, params);

  // Get stats
  const statsResult = await query(`
    SELECT 
      status,
      COUNT(*) as count
    FROM data_export_requests
    GROUP BY status
  `);

  const stats = {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  };

  statsResult.rows.forEach(row => {
    stats[row.status] = parseInt(row.count);
    stats.total += parseInt(row.count);
  });

  res.json({
    requests: result.rows,
    stats
  });
}));

/**
 * @swagger
 * /api/admin/gdpr/deleted-accounts:
 *   get:
 *     summary: Get all soft-deleted accounts (Admin only)
 *     tags: [Admin, GDPR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of deleted accounts
 */
router.get('/deleted-accounts', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const result = await query(
    `SELECT 
      id,
      name,
      email,
      role,
      deleted_at,
      deletion_reason,
      created_at,
      EXTRACT(DAY FROM NOW() - deleted_at) as days_since_deletion
    FROM users
    WHERE deleted_at IS NOT NULL
    ORDER BY deleted_at DESC
    LIMIT $1`,
    [limit]
  );

  // Get stats
  const statsResult = await query(`
    SELECT 
      COUNT(*) as total_deleted,
      COUNT(CASE WHEN deleted_at > NOW() - INTERVAL '30 days' THEN 1 END) as deleted_last_30_days,
      COUNT(CASE WHEN deleted_at > NOW() - INTERVAL '7 days' THEN 1 END) as deleted_last_7_days
    FROM users
    WHERE deleted_at IS NOT NULL
  `);

  res.json({
    accounts: result.rows,
    stats: statsResult.rows[0]
  });
}));

/**
 * @swagger
 * /api/admin/gdpr/restore-account:
 *   post:
 *     summary: Restore a soft-deleted account (Admin only)
 *     tags: [Admin, GDPR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Account restored
 */
router.post('/restore-account', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Get user info
  const userResult = await query(
    'SELECT id, email, deleted_at FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = userResult.rows[0];

  if (!user.deleted_at) {
    return res.status(400).json({ error: 'Account is not deleted' });
  }

  // Restore account
  // Remove "deleted_" prefix from email
  const originalEmail = user.email.replace(/^deleted_\d+_/, '');

  await query(
    `UPDATE users 
     SET deleted_at = NULL,
         deletion_reason = NULL,
         is_active = true,
         email = $1
     WHERE id = $2`,
    [originalEmail, userId]
  );

  res.json({
    message: 'Account restored successfully',
    userId,
    email: originalEmail
  });
}));

/**
 * @swagger
 * /api/admin/gdpr/email-preferences-stats:
 *   get:
 *     summary: Get email preferences statistics (Admin only)
 *     tags: [Admin, GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email preferences statistics
 */
router.get('/email-preferences-stats', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN (email_preferences->>'marketing')::boolean = true THEN 1 END) as marketing_enabled,
      COUNT(CASE WHEN (email_preferences->>'marketing')::boolean = false THEN 1 END) as marketing_disabled,
      COUNT(CASE WHEN (email_preferences->>'notifications')::boolean = true THEN 1 END) as notifications_enabled,
      COUNT(CASE WHEN (email_preferences->>'notifications')::boolean = false THEN 1 END) as notifications_disabled,
      COUNT(CASE WHEN (email_preferences->>'updates')::boolean = true THEN 1 END) as updates_enabled,
      COUNT(CASE WHEN (email_preferences->>'updates')::boolean = false THEN 1 END) as updates_disabled
    FROM users
    WHERE deleted_at IS NULL
  `);

  const stats = result.rows[0];

  // Calculate percentages
  const totalUsers = parseInt(stats.total_users);
  
  res.json({
    totalUsers,
    marketing: {
      enabled: parseInt(stats.marketing_enabled),
      disabled: parseInt(stats.marketing_disabled),
      disabledPercentage: totalUsers > 0 ? ((stats.marketing_disabled / totalUsers) * 100).toFixed(1) : 0
    },
    notifications: {
      enabled: parseInt(stats.notifications_enabled),
      disabled: parseInt(stats.notifications_disabled),
      disabledPercentage: totalUsers > 0 ? ((stats.notifications_disabled / totalUsers) * 100).toFixed(1) : 0
    },
    updates: {
      enabled: parseInt(stats.updates_enabled),
      disabled: parseInt(stats.updates_disabled),
      disabledPercentage: totalUsers > 0 ? ((stats.updates_disabled / totalUsers) * 100).toFixed(1) : 0
    }
  });
}));

/**
 * @swagger
 * /api/admin/gdpr/deletion-reasons:
 *   get:
 *     summary: Get account deletion reasons (Admin only)
 *     tags: [Admin, GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deletion reasons with counts
 */
router.get('/deletion-reasons', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT 
      deletion_reason,
      COUNT(*) as count,
      ARRAY_AGG(deleted_at ORDER BY deleted_at DESC) as deletion_dates
    FROM users
    WHERE deleted_at IS NOT NULL
    AND deletion_reason IS NOT NULL
    AND deletion_reason != ''
    GROUP BY deletion_reason
    ORDER BY count DESC
  `);

  res.json({
    reasons: result.rows,
    totalWithReasons: result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
  });
}));

module.exports = router;
