const express = require('express');
const router = express.Router();
const { query } = require('../db/postgresql');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/admin/activity/inactive-users:
 *   get:
 *     summary: Get inactive users (Admin only)
 *     tags: [Admin, Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Number of days of inactivity
 *     responses:
 *       200:
 *         description: List of inactive users
 */
router.get(
  '/inactive-users',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { days = 90 } = req.query;

    const result = await query('SELECT * FROM get_inactive_users($1)', [days]);

    // Get stats
    const statsResult = await query(`
    SELECT 
      COUNT(*) FILTER (WHERE last_login_at IS NULL) as never_logged_in,
      COUNT(*) FILTER (WHERE last_login_at < NOW() - INTERVAL '30 days') as inactive_30_days,
      COUNT(*) FILTER (WHERE last_login_at < NOW() - INTERVAL '90 days') as inactive_90_days,
      COUNT(*) FILTER (WHERE last_login_at < NOW() - INTERVAL '180 days') as inactive_180_days
    FROM users
    WHERE deleted_at IS NULL
  `);

    res.json({
      users: result.rows,
      stats: statsResult.rows[0],
      criteria: {
        days_inactive: parseInt(days),
        total_found: result.rows.length,
      },
    });
  })
);

/**
 * @swagger
 * /api/admin/activity/user-activity:
 *   get:
 *     summary: Get user activity logs (Admin only)
 *     tags: [Admin, Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Activity logs
 */
router.get(
  '/user-activity',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId, limit = 50 } = req.query;

    let sql = `
    SELECT 
      al.id,
      al.user_id,
      u.name as user_name,
      u.email as user_email,
      al.action,
      al.entity_type,
      al.entity_id,
      al.details,
      al.ip_address,
      al.created_at
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
  `;

    const params = [];
    if (userId) {
      sql += ' WHERE al.user_id = $1';
      params.push(userId);
    }

    sql += ' ORDER BY al.created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await query(sql, params);

    res.json({
      activities: result.rows,
      total: result.rows.length,
    });
  })
);

/**
 * @swagger
 * /api/admin/activity/delete-inactive:
 *   post:
 *     summary: Delete inactive users (Admin only)
 *     tags: [Admin, Activity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 description: Delete users inactive for this many days
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Specific user IDs to delete (optional)
 *     responses:
 *       200:
 *         description: Users deleted
 */
router.post(
  '/delete-inactive',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { days, userIds } = req.body;

    let deletedCount = 0;

    if (userIds && userIds.length > 0) {
      // Delete specific users
      const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
      const result = await query(
        `UPDATE users 
       SET deleted_at = NOW(),
           deletion_reason = 'Deleted by admin - inactive account'
       WHERE id IN (${placeholders})
       AND deleted_at IS NULL`,
        userIds
      );
      deletedCount = result.rowCount;
    } else if (days) {
      // Delete users inactive for X days
      const result = await query(
        `UPDATE users 
       SET deleted_at = NOW(),
           deletion_reason = $1
       WHERE deleted_at IS NULL
       AND (
         last_login_at IS NULL 
         OR last_login_at < NOW() - ($2 || ' days')::INTERVAL
       )
       AND created_at < NOW() - ($2 || ' days')::INTERVAL
       AND role != 'admin'`,
        [`Deleted by admin - inactive for ${days}+ days`, days]
      );
      deletedCount = result.rowCount;
    }

    // Log this action
    await query(
      `INSERT INTO activity_logs (user_id, action, details)
     VALUES ($1, $2, $3)`,
      [
        req.user.id,
        'bulk_delete_inactive_users',
        JSON.stringify({ days, userIds, deletedCount }),
      ]
    );

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} inactive user(s)`,
      deletedCount,
    });
  })
);

/**
 * @swagger
 * /api/admin/activity/stats:
 *   get:
 *     summary: Get activity statistics (Admin only)
 *     tags: [Admin, Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity statistics
 */
router.get(
  '/stats',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const stats = await query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE last_login_at IS NOT NULL) as users_logged_in,
      COUNT(*) FILTER (WHERE last_login_at IS NULL) as never_logged_in,
      COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '7 days') as active_7_days,
      COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '30 days') as active_30_days,
      COUNT(*) FILTER (WHERE last_login_at < NOW() - INTERVAL '90 days' OR last_login_at IS NULL) as inactive_90_days,
      AVG(login_count) as avg_login_count,
      MAX(last_login_at) as most_recent_login,
      MIN(last_login_at) as oldest_login
    FROM users
    WHERE deleted_at IS NULL
  `);

    const recentActivity = await query(`
    SELECT 
      action,
      COUNT(*) as count
    FROM activity_logs
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY action
    ORDER BY count DESC
    LIMIT 10
  `);

    res.json({
      userStats: stats.rows[0],
      recentActions: recentActivity.rows,
    });
  })
);

module.exports = router;
