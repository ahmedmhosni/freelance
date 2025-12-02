/**
 * Feedback Module
 */

const express = require('express');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();
router.use(authenticate);

// TODO: Implement controllers
router.get('/', (req, res) => res.json({ message: 'Feedback - Coming soon' }));
router.post('/', (req, res) => res.json({ message: 'Submit feedback' }));

module.exports = router;
