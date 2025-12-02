/**
 * Tasks Module
 */

const express = require('express');
const tasksController = require('./controllers/tasks.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', tasksController.getAll);
router.get('/:id', tasksController.getById);
router.post('/', tasksController.create);
router.put('/:id', tasksController.update);
router.delete('/:id', tasksController.delete);
router.patch('/:id/status', tasksController.updateStatus);
router.patch('/:id/complete', tasksController.markComplete);

module.exports = router;
