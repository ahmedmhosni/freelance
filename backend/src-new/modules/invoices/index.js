/**
 * Invoices Module
 */

const express = require('express');
const invoicesController = require('./controllers/invoices.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', invoicesController.getAll);
router.get('/:id', invoicesController.getById);
router.post('/', invoicesController.create);
router.put('/:id', invoicesController.update);
router.delete('/:id', invoicesController.delete);
router.patch('/:id/status', invoicesController.updateStatus);
router.get('/:id/pdf', invoicesController.generatePDF);

module.exports = router;
