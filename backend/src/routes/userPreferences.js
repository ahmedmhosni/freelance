const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Preferences
 *   description: User preferences management
 */

/**
 * @swagger
 * /api/user/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 theme:
 *                   type: string
 *                   enum: [light, dark]
 *                   example: dark
 *       401:
 *         description: Unauthorized
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user preferences from database
    const result = await query('SELECT theme FROM users WHERE id = $1', [userId]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      theme: user.theme || 'light'
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * @swagger
 * /api/user/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *                 example: dark
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Invalid theme value
 *       401:
 *         description: Unauthorized
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;
    
    // Validate theme
    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme value. Must be "light" or "dark"' });
    }
    
    // Update user preferences
    await query(
      'UPDATE users SET theme = $1 WHERE id = $2',
      [theme || 'light', userId]
    );
    
    res.json({
      message: 'Preferences updated successfully',
      theme: theme || 'light'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;
