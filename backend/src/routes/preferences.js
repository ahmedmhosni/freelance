const express = require('express');
const router = express.Router();
const { query } = require('../db/postgresql');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/preferences/email:
 *   get:
 *     summary: Get user email preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email preferences
 */
router.get('/email', authenticate, asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT email_preferences FROM users WHERE id = $1',
    [req.user.id]
  );

  const preferences = result.rows[0]?.email_preferences || {
    marketing: true,
    notifications: true,
    updates: true
  };

  res.json({ preferences });
}));

/**
 * @swagger
 * /api/preferences/email:
 *   put:
 *     summary: Update email preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marketing:
 *                 type: boolean
 *               notifications:
 *                 type: boolean
 *               updates:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.put('/email', authenticate, asyncHandler(async (req, res) => {
  const { marketing, notifications, updates } = req.body;

  const preferences = {
    marketing: marketing !== undefined ? marketing : true,
    notifications: notifications !== undefined ? notifications : true,
    updates: updates !== undefined ? updates : true
  };

  await query(
    'UPDATE users SET email_preferences = $1 WHERE id = $2',
    [JSON.stringify(preferences), req.user.id]
  );

  res.json({ 
    message: 'Email preferences updated successfully',
    preferences 
  });
}));

/**
 * @swagger
 * /api/preferences/unsubscribe:
 *   post:
 *     summary: Unsubscribe from all emails (public endpoint with token)
 *     tags: [Preferences]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 */
router.post('/unsubscribe', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Unsubscribe from all marketing emails
  await query(
    `UPDATE users 
     SET email_preferences = jsonb_set(
       COALESCE(email_preferences, '{}'::jsonb),
       '{marketing}',
       'false'
     )
     WHERE email = $1`,
    [email]
  );

  res.json({ 
    message: 'You have been unsubscribed from marketing emails',
    success: true 
  });
}));

module.exports = router;
