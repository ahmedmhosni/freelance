/**
 * Admin Module
 */

const express = require('express');
const { authenticate, authorize } = require('../../shared/middleware/auth');

const router = express.Router();
router.use(authenticate);
router.use(authorize('admin'));

// TODO: Implement controllers
router.get('/users', (req, res) => res.json({ message: 'Admin - Coming soon' }));

module.exports = router;
