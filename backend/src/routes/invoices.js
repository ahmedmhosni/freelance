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
    
    const result = await request.query('SELECT * FROM invoices WHERE user_id = @userId ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { project_id, client_id, invoice_number, amount, status, due_date, notes } = req.body;
  try {
    console.log('Creating invoice with data:', { project_id, client_id, invoice_number, amount, status, due_date, notes });
    
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
    request.input('projectId', sql.Int, project_id || null);
    request.input('clientId', sql.Int, parseInt(client_id));
    request.input('invoiceNumber', sql.NVarChar, invoice_number);
    request.input('amount', sql.Decimal(10, 2), parseFloat(amount));
    request.input('status', sql.NVarChar, status || 'draft');
    request.input('dueDate', sql.Date, due_date || null);
    request.input('notes', sql.NVarChar, notes || null);
    
    const result = await request.query(
      'INSERT INTO invoices (user_id, project_id, client_id, invoice_number, amount, status, due_date, notes) OUTPUT INSERTED.id VALUES (@userId, @projectId, @clientId, @invoiceNumber, @amount, @status, @dueDate, @notes)'
    );
    
    res.status(201).json({ id: result.recordset[0].id, message: 'Invoice created' });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { project_id, client_id, amount, status, due_date, sent_date, paid_date, notes } = req.body;
  try {
    const pool = await db;
    const request = pool.request();
    request.input('projectId', sql.Int, project_id || null);
    request.input('clientId', sql.Int, client_id);
    request.input('amount', sql.Decimal(10, 2), amount);
    request.input('status', sql.NVarChar, status);
    request.input('dueDate', sql.Date, due_date || null);
    request.input('sentDate', sql.Date, sent_date || null);
    request.input('paidDate', sql.Date, paid_date || null);
    request.input('notes', sql.NVarChar, notes || null);
    request.input('id', sql.Int, req.params.id);
    request.input('userId', sql.Int, req.user.id);
    
    await request.query(
      'UPDATE invoices SET project_id = @projectId, client_id = @clientId, amount = @amount, status = @status, due_date = @dueDate, sent_date = @sentDate, paid_date = @paidDate, notes = @notes, updated_at = GETDATE() WHERE id = @id AND user_id = @userId'
    );
    
    res.json({ message: 'Invoice updated' });
  } catch (error) {
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

    const pdfPath = await generateInvoicePDF(invoice, client, user);
    res.download(pdfPath, `invoice-${invoice.invoice_number}.pdf`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
