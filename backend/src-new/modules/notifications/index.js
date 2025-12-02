/**
 * Notifications Module
 */

const express = require('express');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();
router.use(authenticate);

// TODO: Implement controllers
router.get('/', (req, res) => res.json({ message: 'Notifications - Coming soon' }));
router.patch('/:id/read', (req, res) => res.json({ message: 'Mark as read' }));

module.exports = router;
