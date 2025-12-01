const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'
        )
      );
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

// Root route - redirect to /me
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.redirect('/api/profile/me');
  })
);

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
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const queryText = `
    SELECT 
      id, name, email, username, role,
      job_title, bio, profile_picture, location, website,
      linkedin, behance, instagram, facebook, twitter, github, dribbble, portfolio,
      profile_visibility,
      created_at
    FROM users 
    WHERE id = $1
  `;

    const result = await query(queryText, [req.user.id]);

    if (!result.rows || result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json(result.rows[0]);
  })
);

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
router.put(
  '/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      name,
      username,
      job_title,
      bio,
      profile_picture,
      location,
      website,
      linkedin,
      behance,
      instagram,
      facebook,
      twitter,
      github,
      dribbble,
      portfolio,
      profile_visibility,
    } = req.body;

    // Validate username if provided
    if (username) {
      // Check if username is already taken by another user
      const checkQuery = `
      SELECT id FROM users 
      WHERE username = $1 AND id != $2
    `;
      const existing = await query(checkQuery, [username, req.user.id]);

      if (existing.rows && existing.rows.length > 0) {
        throw new AppError('Username already taken', 400);
      }

      // Validate username format (alphanumeric, underscore, hyphen only)
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        throw new AppError(
          'Username can only contain letters, numbers, underscores, and hyphens',
          400
        );
      }

      // Validate username length
      if (username.length < 3 || username.length > 30) {
        throw new AppError('Username must be between 3 and 30 characters', 400);
      }
    }

    // Validate profile visibility
    if (
      profile_visibility &&
      !['public', 'private'].includes(profile_visibility)
    ) {
      throw new AppError(
        'Profile visibility must be either public or private',
        400
      );
    }

    const updateQuery = `
    UPDATE users 
    SET 
      name = COALESCE($1, name),
      username = $2,
      job_title = $3,
      bio = $4,
      profile_picture = $5,
      location = $6,
      website = $7,
      linkedin = $8,
      behance = $9,
      instagram = $10,
      facebook = $11,
      twitter = $12,
      github = $13,
      dribbble = $14,
      portfolio = $15,
      profile_visibility = COALESCE($16, profile_visibility)
    WHERE id = $17
  `;

    await query(updateQuery, [
      name,
      username,
      job_title,
      bio,
      profile_picture,
      location,
      website,
      linkedin,
      behance,
      instagram,
      facebook,
      twitter,
      github,
      dribbble,
      portfolio,
      profile_visibility,
      req.user.id,
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
    WHERE id = $1
  `;

    const result = await query(getQuery, [req.user.id]);

    res.json({
      message: 'Profile updated successfully',
      profile: result.rows[0],
    });
  })
);

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
router.get(
  '/:username',
  asyncHandler(async (req, res) => {
    const { username } = req.params;

    const queryText = `
    SELECT 
      id, name, username, role,
      job_title, bio, profile_picture, location, website,
      linkedin, behance, instagram, facebook, twitter, github, dribbble, portfolio,
      created_at
    FROM users 
    WHERE username = $1 AND profile_visibility = 'public'
  `;

    const result = await query(queryText, [username]);

    if (!result.rows || result.rows.length === 0) {
      throw new AppError('Profile not found or is private', 404);
    }

    res.json(result.rows[0]);
  })
);

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
router.get(
  '/check-username/:username',
  asyncHandler(async (req, res) => {
    const { username } = req.params;

    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.json({ available: false, message: 'Invalid username format' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.json({
        available: false,
        message: 'Username must be between 3 and 30 characters',
      });
    }

    const queryText = `SELECT id FROM users WHERE username = $1`;
    const result = await query(queryText, [username]);

    res.json({
      available: !result.rows || result.rows.length === 0,
      message:
        result.rows && result.rows.length > 0
          ? 'Username already taken'
          : 'Username available',
    });
  })
);

/**
 * @swagger
 * /api/profile/upload-picture:
 *   post:
 *     summary: Upload profile picture to Azure Blob Storage
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Picture uploaded successfully
 *       400:
 *         description: Invalid file or missing file
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/upload-picture',
  authenticateToken,
  upload.single('profilePicture'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const userId = req.user.id;
    const file = req.file;
    const path = require('path');
    const fs = require('fs');

    try {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const containerName =
        process.env.AZURE_STORAGE_CONTAINER_NAME || 'profile-pictures';
      const isProduction = process.env.NODE_ENV === 'production';

      let fileUrl;

      // Use Azure Blob Storage if connection string is available
      if (connectionString) {
        // PRODUCTION: Upload to Azure Blob Storage
        const blobServiceClient =
          BlobServiceClient.fromConnectionString(connectionString);
        const containerClient =
          blobServiceClient.getContainerClient(containerName);

        // Generate unique blob name
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop();
        const blobName = `user-${userId}-${timestamp}.${extension}`;

        // Get blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload file buffer to blob
        await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: {
            blobContentType: file.mimetype,
          },
        });

        fileUrl = blockBlobClient.url;

        // Delete old profile picture from blob storage if it exists
        const oldPictureResult = await query(
          'SELECT profile_picture FROM users WHERE id = $1',
          [userId]
        );

        if (oldPictureResult.rows[0]?.profile_picture) {
          const oldPicture = oldPictureResult.rows[0].profile_picture;

          if (
            oldPicture.includes('blob.core.windows.net') &&
            !oldPicture.includes('dicebear.com')
          ) {
            try {
              const oldBlobName = oldPicture.split('/').pop();
              const oldBlobClient =
                containerClient.getBlockBlobClient(oldBlobName);
              await oldBlobClient.deleteIfExists();
            } catch (error) {
              console.error('Error deleting old picture:', error);
            }
          }
        }
      } else {
        // Check if we are in production - if so, we MUST use Azure Blob Storage
        if (isProduction) {
          throw new AppError(
            'Azure Storage configuration missing in production environment',
            500
          );
        }

        // DEVELOPMENT: Save to local uploads directory
        const uploadsDir = path.join(
          __dirname,
          '../../uploads/profile-pictures'
        );

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop();
        const filename = `user-${userId}-${timestamp}.${extension}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file
        fs.writeFileSync(filepath, file.buffer);

        // Generate local URL
        fileUrl = `/uploads/profile-pictures/${filename}`;

        // Delete old local file if it exists
        const oldPictureResult = await query(
          'SELECT profile_picture FROM users WHERE id = $1',
          [userId]
        );

        if (oldPictureResult.rows[0]?.profile_picture) {
          const oldPicture = oldPictureResult.rows[0].profile_picture;

          if (
            oldPicture.startsWith('/uploads/') &&
            !oldPicture.includes('dicebear.com')
          ) {
            try {
              const oldFilename = path.basename(oldPicture);
              const oldFilepath = path.join(uploadsDir, oldFilename);
              if (fs.existsSync(oldFilepath)) {
                fs.unlinkSync(oldFilepath);
              }
            } catch (error) {
              console.error('Error deleting old file:', error);
            }
          }
        }
      }

      // Update user's profile picture in database
      await query('UPDATE users SET profile_picture = $1 WHERE id = $2', [
        fileUrl,
        userId,
      ]);

      res.json({
        success: true,
        url: fileUrl,
        message: 'Profile picture uploaded successfully',
      });
    } catch (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        throw new AppError('File too large. Maximum size is 5MB.', 400);
      }

      if (error.message?.includes('Invalid file type')) {
        throw new AppError(error.message, 400);
      }

      throw error;
    }
  })
);

/**
 * @swagger
 * /api/profile/delete-picture:
 *   delete:
 *     summary: Delete profile picture from Azure Blob Storage
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Picture deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/delete-picture',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const path = require('path');
    const fs = require('fs');

    // Get current profile picture
    const result = await query(
      'SELECT profile_picture FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (
      user?.profile_picture &&
      !user.profile_picture.includes('dicebear.com')
    ) {
      // Delete from blob storage if it's a blob URL
      if (user.profile_picture.includes('blob.core.windows.net')) {
        try {
          const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
          const containerName =
            process.env.AZURE_STORAGE_CONTAINER_NAME || 'profile-pictures';

          if (connectionString) {
            const blobServiceClient =
              BlobServiceClient.fromConnectionString(connectionString);
            const containerClient =
              blobServiceClient.getContainerClient(containerName);
            const blobName = user.profile_picture.split('/').pop();
            const blobClient = containerClient.getBlockBlobClient(blobName);

            await blobClient.deleteIfExists();
          }
        } catch (error) {
          console.error('Error deleting blob:', error);
        }
      }
      // Delete from local storage if it's a local file
      else if (user.profile_picture.startsWith('/uploads/')) {
        try {
          const filename = path.basename(user.profile_picture);
          const filepath = path.join(
            __dirname,
            '../../uploads/profile-pictures',
            filename
          );
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        } catch (error) {
          console.error('Error deleting local file:', error);
        }
      }
    }

    // Clear profile picture from database
    await query('UPDATE users SET profile_picture = NULL WHERE id = $1', [
      userId,
    ]);

    res.json({
      success: true,
      message: 'Profile picture deleted successfully',
    });
  })
);

module.exports = router;
