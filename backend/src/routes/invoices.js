const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `
      SELECT 
        i.*, 
        c.name as client_name, 
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.user_id = $1 
      ORDER BY i.created_at DESC
    `,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const {
    client_id,
    invoice_number,
    amount,
    status,
    issue_date,
    due_date,
    notes,
  } = req.body;
  try {
    console.log('Creating invoice with data:', {
      client_id,
      invoice_number,
      amount,
      status,
      issue_date,
      due_date,
      notes,
    });

    // Validate required fields
    if (!client_id) {
      return res.status(400).json({ error: 'Client is required' });
    }
    if (!invoice_number) {
      return res.status(400).json({ error: 'Invoice number is required' });
    }
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Note: project_id is set to NULL as projects are linked at the item level
    const result = await query(
      `INSERT INTO invoices (user_id, project_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, notes) 
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`,
      [
        req.user.id,
        parseInt(client_id),
        invoice_number,
        parseFloat(amount),
        0, // Default tax to 0
        parseFloat(amount), // Total = amount (no tax for now)
        status || 'draft',
        issue_date ? new Date(issue_date) : new Date(),
        due_date || null,
        notes || null,
      ]
    );

    res.status(201).json({ id: result.rows[0].id, message: 'Invoice created' });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const {
    client_id,
    amount,
    status,
    issue_date,
    due_date,
    sent_date,
    paid_date,
    notes,
  } = req.body;
  try {
    console.log('Updating invoice with data:', {
      client_id,
      amount,
      status,
      issue_date,
      due_date,
      sent_date,
      paid_date,
      notes,
    });

    // First, get the current invoice to check status change
    const currentResult = await query(
      'SELECT status, sent_date, paid_date FROM invoices WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id), req.user.id]
    );
    const currentInvoice = currentResult.rows[0];

    // Auto-set dates based on status changes (only if not manually provided)
    let finalSentDate = sent_date ? new Date(sent_date) : null;
    let finalPaidDate = paid_date ? new Date(paid_date) : null;

    // If status changed to 'sent' and sent_date is not set, auto-set it
    if (
      status === 'sent' &&
      currentInvoice.status !== 'sent' &&
      !currentInvoice.sent_date &&
      !sent_date
    ) {
      finalSentDate = new Date();
    } else if (sent_date) {
      finalSentDate = new Date(sent_date);
    } else if (currentInvoice.sent_date) {
      finalSentDate = currentInvoice.sent_date;
    }

    // If status changed to 'paid' and paid_date is not set, auto-set it
    if (
      status === 'paid' &&
      currentInvoice.status !== 'paid' &&
      !currentInvoice.paid_date &&
      !paid_date
    ) {
      finalPaidDate = new Date();
    } else if (paid_date) {
      finalPaidDate = new Date(paid_date);
    } else if (currentInvoice.paid_date) {
      finalPaidDate = currentInvoice.paid_date;
    }

    // Update all fields - dates are managed by application logic, not triggers
    await query(
      `UPDATE invoices 
       SET client_id = $1, amount = $2, tax = $3, total = $4, status = $5, issue_date = $6, due_date = $7, sent_date = $8, paid_date = $9, notes = $10, updated_at = NOW() 
       WHERE id = $11 AND user_id = $12`,
      [
        parseInt(client_id),
        parseFloat(amount || 0),
        0, // Tax will be calculated from items
        parseFloat(amount || 0), // Total = amount for now
        status || 'draft',
        issue_date ? new Date(issue_date) : null,
        due_date || null,
        finalSentDate,
        finalPaidDate,
        notes || null,
        parseInt(req.params.id),
        req.user.id,
      ]
    );

    res.json({ message: 'Invoice updated' });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM invoices WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    // Get invoice
    const invoiceResult = await query(
      'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const invoice = invoiceResult.rows[0];

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Get client
    const clientResult = await query('SELECT * FROM clients WHERE id = $1', [
      invoice.client_id,
    ]);
    const client = clientResult.rows[0];

    // Get user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [
      req.user.id,
    ]);
    const user = userResult.rows[0];

    // Get invoice items
    const itemsResult = await query(
      `
      SELECT 
        ii.*,
        p.name as project_name,
        t.title as task_name
      FROM invoice_items ii
      LEFT JOIN projects p ON ii.project_id = p.id
      LEFT JOIN tasks t ON ii.task_id = t.id
      WHERE ii.invoice_id = $1
      ORDER BY ii.created_at ASC
    `,
      [req.params.id]
    );
    const items = itemsResult.rows;

    const pdfPath = await generateInvoicePDF(invoice, client, user, items);
    res.download(pdfPath, `invoice-${invoice.invoice_number}.pdf`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
