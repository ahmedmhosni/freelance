const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const path = require('path');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    
    const result = await request.query(`
      SELECT 
        i.*, 
        c.name as client_name, 
        p.name as project_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.user_id = @userId 
      ORDER BY i.created_at DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { client_id, invoice_number, amount, status, issue_date, due_date, notes } = req.body;
  try {
    console.log('Creating invoice with data:', { client_id, invoice_number, amount, status, issue_date, due_date, notes });
    
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
    
    const pool = await db;
    const request = pool.request();
    request.input('userId', sql.Int, req.user.id);
    request.input('clientId', sql.Int, parseInt(client_id));
    request.input('invoiceNumber', sql.NVarChar, invoice_number);
    request.input('amount', sql.Decimal(10, 2), parseFloat(amount));
    request.input('tax', sql.Decimal(10, 2), 0); // Default tax to 0
    request.input('total', sql.Decimal(10, 2), parseFloat(amount)); // Total = amount (no tax for now)
    request.input('status', sql.NVarChar, status || 'draft');
    request.input('issueDate', sql.Date, issue_date ? new Date(issue_date) : new Date());
    request.input('dueDate', sql.Date, due_date || null);
    request.input('notes', sql.NVarChar, notes || null);
    
    // Note: project_id is set to NULL as projects are linked at the item level
    const result = await request.query(
      'INSERT INTO invoices (user_id, project_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, notes) OUTPUT INSERTED.id VALUES (@userId, NULL, @clientId, @invoiceNumber, @amount, @tax, @total, @status, @issueDate, @dueDate, @notes)'
    );
    
    res.status(201).json({ id: result.recordset[0].id, message: 'Invoice created' });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { client_id, amount, status, issue_date, due_date, sent_date, paid_date, notes } = req.body;
  try {
    console.log('Updating invoice with data:', { client_id, amount, status, issue_date, due_date, sent_date, paid_date, notes });
    
    const pool = await db;
    
    // First, get the current invoice to check status change
    const getCurrentRequest = pool.request();
    getCurrentRequest.input('id', sql.Int, parseInt(req.params.id));
    getCurrentRequest.input('userId', sql.Int, req.user.id);
    const currentResult = await getCurrentRequest.query('SELECT status, sent_date, paid_date FROM invoices WHERE id = @id AND user_id = @userId');
    const currentInvoice = currentResult.recordset[0];
    
    // Auto-set dates based on status changes (only if not manually provided)
    let finalSentDate = sent_date ? new Date(sent_date) : null;
    let finalPaidDate = paid_date ? new Date(paid_date) : null;
    
    // If status changed to 'sent' and sent_date is not set, auto-set it
    if (status === 'sent' && currentInvoice.status !== 'sent' && !currentInvoice.sent_date && !sent_date) {
      finalSentDate = new Date();
    } else if (sent_date) {
      finalSentDate = new Date(sent_date);
    } else if (currentInvoice.sent_date) {
      finalSentDate = currentInvoice.sent_date;
    }
    
    // If status changed to 'paid' and paid_date is not set, auto-set it
    if (status === 'paid' && currentInvoice.status !== 'paid' && !currentInvoice.paid_date && !paid_date) {
      finalPaidDate = new Date();
    } else if (paid_date) {
      finalPaidDate = new Date(paid_date);
    } else if (currentInvoice.paid_date) {
      finalPaidDate = currentInvoice.paid_date;
    }
    
    const request = pool.request();
    request.input('clientId', sql.Int, parseInt(client_id));
    request.input('amount', sql.Decimal(10, 2), parseFloat(amount || 0));
    request.input('tax', sql.Decimal(10, 2), 0); // Tax will be calculated from items
    request.input('total', sql.Decimal(10, 2), parseFloat(amount || 0)); // Total = amount for now
    request.input('status', sql.NVarChar, status || 'draft');
    request.input('issueDate', sql.Date, issue_date ? new Date(issue_date) : null);
    request.input('dueDate', sql.Date, due_date || null);
    request.input('sentDate', sql.Date, finalSentDate);
    request.input('paidDate', sql.Date, finalPaidDate);
    request.input('notes', sql.NVarChar, notes || null);
    request.input('id', sql.Int, parseInt(req.params.id));
    request.input('userId', sql.Int, req.user.id);
    
    // Update all fields - dates are managed by application logic, not triggers
    await request.query(
      'UPDATE invoices SET client_id = @clientId, amount = @amount, tax = @tax, total = @total, status = @status, issue_date = @issueDate, due_date = @dueDate, sent_date = @sentDate, paid_date = @paidDate, notes = @notes, updated_at = GETDATE() WHERE id = @id AND user_id = @userId'
    );
    
    res.json({ message: 'Invoice updated' });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    await request.query('DELETE FROM invoices WHERE id = @id AND user_id = @userId');
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const pool = await db;
    
    // Get invoice
    const invoiceRequest = pool.request();
    invoiceRequest.input('id', sql.Int, req.params.id);
    invoiceRequest.input('userId', sql.Int, req.user.id);
    const invoiceResult = await invoiceRequest.query('SELECT * FROM invoices WHERE id = @id AND user_id = @userId');
    const invoice = invoiceResult.recordset[0];
    
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Get client
    const clientRequest = pool.request();
    clientRequest.input('clientId', sql.Int, invoice.client_id);
    const clientResult = await clientRequest.query('SELECT * FROM clients WHERE id = @clientId');
    const client = clientResult.recordset[0];

    // Get user
    const userRequest = pool.request();
    userRequest.input('userId', sql.Int, req.user.id);
    const userResult = await userRequest.query('SELECT * FROM users WHERE id = @userId');
    const user = userResult.recordset[0];

    // Get invoice items
    const itemsRequest = pool.request();
    itemsRequest.input('invoiceId', sql.Int, req.params.id);
    const itemsResult = await itemsRequest.query(`
      SELECT 
        ii.*,
        p.name as project_name,
        t.title as task_name
      FROM invoice_items ii
      LEFT JOIN projects p ON ii.project_id = p.id
      LEFT JOIN tasks t ON ii.task_id = t.id
      WHERE ii.invoice_id = @invoiceId
      ORDER BY ii.created_at ASC
    `);
    const items = itemsResult.recordset;

    const pdfPath = await generateInvoicePDF(invoice, client, user, items);
    res.download(pdfPath, `invoice-${invoice.invoice_number}.pdf`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
