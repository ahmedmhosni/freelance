const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getAll, getOne } = require('../db/database');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const path = require('path');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const invoices = await getAll('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { project_id, client_id, invoice_number, amount, status, due_date, notes } = req.body;
  try {
    const result = await runQuery(
      'INSERT INTO invoices (user_id, project_id, client_id, invoice_number, amount, status, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, project_id, client_id, invoice_number, amount, status, due_date, notes]
    );
    res.status(201).json({ id: result.id, message: 'Invoice created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { project_id, client_id, amount, status, due_date, sent_date, paid_date, notes } = req.body;
  try {
    await runQuery(
      'UPDATE invoices SET project_id = ?, client_id = ?, amount = ?, status = ?, due_date = ?, sent_date = ?, paid_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [project_id, client_id, amount, status, due_date, sent_date, paid_date, notes, req.params.id, req.user.id]
    );
    res.json({ message: 'Invoice updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM invoices WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await getOne('SELECT * FROM invoices WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const client = await getOne('SELECT * FROM clients WHERE id = ?', [invoice.client_id]);
    const user = await getOne('SELECT * FROM users WHERE id = ?', [req.user.id]);

    const pdfPath = await generateInvoicePDF(invoice, client, user);
    res.download(pdfPath, `invoice-${invoice.invoice_number}.pdf`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
