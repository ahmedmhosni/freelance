/**
 * Time Tracking Module
 */

const express = require('express');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();
router.use(authenticate);

// TODO: Implement controllers
router.get('/', (req, res) => res.json({ message: 'Time tracking - Coming soon' }));

module.exports = router;
