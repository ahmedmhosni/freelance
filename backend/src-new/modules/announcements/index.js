/**
 * Announcements Module
 */

const express = require('express');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

// Public routes
router.get('/', (req, res) => res.json({ message: 'Announcements - Coming soon' }));

// Protected routes
router.use(authenticate);
router.post('/', (req, res) => res.json({ message: 'Create announcement' }));

module.exports = router;
