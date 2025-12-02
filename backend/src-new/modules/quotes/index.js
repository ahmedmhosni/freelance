/**
 * Quotes Module
 */

const express = require('express');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();
router.use(authenticate);

// TODO: Implement controllers
router.get('/', (req, res) => res.json({ message: 'Quotes - Coming soon' }));

module.exports = router;
