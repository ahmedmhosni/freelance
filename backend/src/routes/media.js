const express = require('express');
const router = express.Router();
const { BlobServiceClient } = require('@azure/storage-blob');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/media/feedback/{filename}:
 *   get:
 *     summary: Get feedback screenshot via proxy
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image file
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get('/feedback/:filename', authenticateToken, asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent path traversal
  if (!filename || filename.includes('..') || filename.includes('/')) {
    throw new AppError('Invalid filename', 400);
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = 'feedback-screenshots';

  if (!connectionString) {
    throw new AppError('Storage not configured', 500);
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(filename);

    // Check if blob exists
    const exists = await blobClient.exists();
    if (!exists) {
      throw new AppError('File not found', 404);
    }

    // Get blob properties for content type
    const properties = await blobClient.getProperties();
    
    // Stream the blob
    const downloadResponse = await blobClient.download();
    
    // Set appropriate headers
    res.setHeader('Content-Type', properties.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', properties.contentLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('ETag', properties.etag);

    // Stream the file
    downloadResponse.readableStreamBody.pipe(res);

  } catch (error) {
    if (error.statusCode === 404) {
      throw new AppError('File not found', 404);
    }
    throw error;
  }
}));

/**
 * @swagger
 * /api/media/profile/{filename}:
 *   get:
 *     summary: Get profile picture via proxy
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image file
 */
router.get('/profile/:filename', asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Validate filename
  if (!filename || filename.includes('..') || filename.includes('/')) {
    throw new AppError('Invalid filename', 400);
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = 'profile-pictures';

  if (!connectionString) {
    throw new AppError('Storage not configured', 500);
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(filename);

    const exists = await blobClient.exists();
    if (!exists) {
      throw new AppError('File not found', 404);
    }

    const properties = await blobClient.getProperties();
    const downloadResponse = await blobClient.download();
    
    res.setHeader('Content-Type', properties.contentType || 'image/jpeg');
    res.setHeader('Content-Length', properties.contentLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('ETag', properties.etag);

    downloadResponse.readableStreamBody.pipe(res);

  } catch (error) {
    if (error.statusCode === 404) {
      throw new AppError('File not found', 404);
    }
    throw error;
  }
}));

module.exports = router;
