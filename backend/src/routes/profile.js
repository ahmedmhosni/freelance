const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      id, name, email, username, role,
      job_title, bio, profile_picture, location, website,
      linkedin, behance, instagram, facebook, twitter, github, dribbble, portfolio,
      profile_visibility,
      created_at
    FROM users 
    WHERE id = @param1
  `;
  
  const result = await db.query(query, [req.user.id]);
  
  if (!result.recordset || result.recordset.length === 0) {
    throw new AppError('User not found', 404);
  }
  
  res.json(result.recordset[0]);
}));

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               job_title:
 *                 type: string
 *               bio:
 *                 type: string
 *               profile_picture:
 *                 type: string
 *               location:
 *                 type: string
 *               website:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               behance:
 *                 type: string
 *               instagram:
 *                 type: string
 *               facebook:
 *                 type: string
 *               twitter:
 *                 type: string
 *               github:
 *                 type: string
 *               dribbble:
 *                 type: string
 *               portfolio:
 *                 type: string
 *               profile_visibility:
 *                 type: string
 *                 enum: [public, private]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authenticateToken, asyncHandler(async (req, res) => {
  const {
    name, username, job_title, bio, profile_picture, location, website,
    linkedin, behance, instagram, facebook, twitter, github, dribbble, portfolio,
    profile_visibility
  } = req.body;

  // Validate username if provided
  if (username) {
    // Check if username is already taken by another user
    const checkQuery = `
      SELECT id FROM users 
      WHERE username = @param1 AND id != @param2
    `;
    const existing = await db.query(checkQuery, [username, req.user.id]);
    
    if (existing.recordset && existing.recordset.length > 0) {
      throw new AppError('Username already taken', 400);
    }

    // Validate username format (alphanumeric, underscore, hyphen only)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new AppError('Username can only contain letters, numbers, underscores, and hyphens', 400);
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      throw new AppError('Username must be between 3 and 30 characters', 400);
    }
  }

  // Validate profile visibility
  if (profile_visibility && !['public', 'private'].includes(profile_visibility)) {
    throw new AppError('Profile visibility must be either public or private', 400);
  }

  const updateQuery = `
    UPDATE users 
    SET 
      name = COALESCE(@param1, name),
      username = @param2,
      job_title = @param3,
      bio = @param4,
      profile_picture = @param5,
      location = @param6,
      website = @param7,
      linkedin = @param8,
      behance = @param9,
      instagram = @param10,
      facebook = @param11,
      twitter = @param12,
      github = @param13,
      dribbble = @param14,
      portfolio = @param15,
      profile_visibility = COALESCE(@param16, profile_visibility)
    WHERE id = @param17
  `;

  await db.query(updateQuery, [
    name, username, job_title, bio, profile_picture, location, website,
    linkedin, behance, instagram, facebook, twitter, github, dribbble, portfolio,
    profile_visibility, req.user.id
  ]);

  // Get updated profile
  const getQuery = `
    SELECT 
      id, name, email, username, role,
      job_title, bio, profile_picture, location, website,
      linkedin, behance, instagram, facebook, twitter, github, dribbble, portfolio,
      profile_visibility,
      created_at
    FROM users 
    WHERE id = @param1
  `;
  
  const result = await db.query(getQuery, [req.user.id]);
  
  res.json({
    message: 'Profile updated successfully',
    profile: result.recordset[0]
  });
}));

/**
 * @swagger
 * /api/profile/{username}:
 *   get:
 *     summary: Get public profile by username
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the profile to retrieve
 *     responses:
 *       200:
 *         description: Public profile retrieved successfully
 *       404:
 *         description: Profile not found or private
 */
router.get('/:username', asyncHandler(async (req, res) => {
  const { username } = req.params;

  const query = `
    SELECT 
      id, name, username, role,
      job_title, bio, profile_picture, location, website,
      linkedin, behance, instagram, facebook, twitter, github, dribbble, portfolio,
      created_at
    FROM users 
    WHERE username = @param1 AND profile_visibility = 'public'
  `;
  
  const result = await db.query(query, [username]);
  
  if (!result.recordset || result.recordset.length === 0) {
    throw new AppError('Profile not found or is private', 404);
  }
  
  res.json(result.recordset[0]);
}));

/**
 * @swagger
 * /api/profile/check-username/{username}:
 *   get:
 *     summary: Check if username is available
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Username availability status
 */
router.get('/check-username/:username', asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Validate username format
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.json({ available: false, message: 'Invalid username format' });
  }

  if (username.length < 3 || username.length > 30) {
    return res.json({ available: false, message: 'Username must be between 3 and 30 characters' });
  }

  const query = `SELECT id FROM users WHERE username = @param1`;
  const result = await db.query(query, [username]);
  
  res.json({
    available: !result.recordset || result.recordset.length === 0,
    message: result.recordset && result.recordset.length > 0 ? 'Username already taken' : 'Username available'
  });
}));

module.exports = router;
