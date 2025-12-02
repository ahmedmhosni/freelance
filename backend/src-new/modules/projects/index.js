/**
 * Projects Module
 */

const express = require('express');
const projectsController = require('./controllers/projects.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', projectsController.getAll);
router.get('/:id', projectsController.getById);
router.post('/', projectsController.create);
router.put('/:id', projectsController.update);
router.delete('/:id', projectsController.delete);
router.patch('/:id/status', projectsController.updateStatus);

module.exports = router;
