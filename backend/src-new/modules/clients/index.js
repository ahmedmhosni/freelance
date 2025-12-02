/**
 * Clients Module
 * Handles client management
 */

const express = require('express');
const clientsController = require('./controllers/clients.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', clientsController.getAll);
router.get('/:id', clientsController.getById);
router.post('/', clientsController.create);
router.put('/:id', clientsController.update);
router.delete('/:id', clientsController.delete);

module.exports = router;
