const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db');

const router = express.Router();
router.use(authenticateToken);

// Get all items for an invoice
router.get('/:invoiceId/items', async (req, res) => {
  try {
    const pool = await db;
    const request = pool.request();
    request.input('invoiceId', sql.Int, req.params.invoiceId);
    request.input('userId', sql.Int, req.user.id);
    
    // Verify invoice belongs to user
    const invoiceCheck = await request.query(
      'SELECT id FROM invoices WHERE id = @invoiceId AND user_id = @userId'
    );
    
    if (invoiceCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const itemsRequest = pool.request();
    itemsRequest.input('invoiceId', sql.Int, req.params.invoiceId);
    
    const result = await itemsRequest.query(`
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
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching invoice items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add item to invoice
router.post('/:invoiceId/items', async (req, res) => {
  const { project_id, task_id, description, quantity, unit_price, hours_worked, rate_per_hour } = req.body;
  
  try {
    const pool = await db;
    
    // Verify invoice belongs to user
    const checkRequest = pool.request();
    checkRequest.input('invoiceId', sql.Int, req.params.invoiceId);
    checkRequest.input('userId', sql.Int, req.user.id);
    
    const invoiceCheck = await checkRequest.query(
      'SELECT id FROM invoices WHERE id = @invoiceId AND user_id = @userId'
    );
    
    if (invoiceCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Calculate amount
    let amount;
    if (hours_worked && rate_per_hour) {
      amount = parseFloat(hours_worked) * parseFloat(rate_per_hour);
    } else {
      amount = parseFloat(quantity || 1) * parseFloat(unit_price);
    }
    
    const request = pool.request();
    request.input('invoiceId', sql.Int, parseInt(req.params.invoiceId));
    request.input('projectId', sql.Int, (project_id && project_id !== '') ? parseInt(project_id) : null);
    request.input('taskId', sql.Int, (task_id && task_id !== '') ? parseInt(task_id) : null);
    request.input('description', sql.NVarChar, description);
    request.input('quantity', sql.Decimal(10, 2), parseFloat(quantity || 1));
    request.input('unitPrice', sql.Decimal(10, 2), parseFloat(unit_price || 0));
    request.input('hoursWorked', sql.Decimal(10, 2), hours_worked ? parseFloat(hours_worked) : null);
    request.input('ratePerHour', sql.Decimal(10, 2), rate_per_hour ? parseFloat(rate_per_hour) : null);
    request.input('amount', sql.Decimal(10, 2), amount);
    
    const result = await request.query(`
      INSERT INTO invoice_items 
      (invoice_id, project_id, task_id, description, quantity, unit_price, hours_worked, rate_per_hour, amount)
      OUTPUT INSERTED.*
      VALUES (@invoiceId, @projectId, @taskId, @description, @quantity, @unitPrice, @hoursWorked, @ratePerHour, @amount)
    `);
    
    // Update invoice totals
    await updateInvoiceTotals(pool, req.params.invoiceId);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error adding invoice item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update invoice item
router.put('/:invoiceId/items/:itemId', async (req, res) => {
  const { project_id, task_id, description, quantity, unit_price, hours_worked, rate_per_hour } = req.body;
  
  try {
    const pool = await db;
    
    // Verify invoice belongs to user
    const checkRequest = pool.request();
    checkRequest.input('invoiceId', sql.Int, req.params.invoiceId);
    checkRequest.input('userId', sql.Int, req.user.id);
    
    const invoiceCheck = await checkRequest.query(
      'SELECT id FROM invoices WHERE id = @invoiceId AND user_id = @userId'
    );
    
    if (invoiceCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Calculate amount
    let amount;
    if (hours_worked && rate_per_hour) {
      amount = parseFloat(hours_worked) * parseFloat(rate_per_hour);
    } else {
      amount = parseFloat(quantity || 1) * parseFloat(unit_price);
    }
    
    const request = pool.request();
    request.input('itemId', sql.Int, req.params.itemId);
    request.input('invoiceId', sql.Int, req.params.invoiceId);
    request.input('projectId', sql.Int, project_id || null);
    request.input('taskId', sql.Int, task_id || null);
    request.input('description', sql.NVarChar, description);
    request.input('quantity', sql.Decimal(10, 2), parseFloat(quantity || 1));
    request.input('unitPrice', sql.Decimal(10, 2), parseFloat(unit_price || 0));
    request.input('hoursWorked', sql.Decimal(10, 2), hours_worked ? parseFloat(hours_worked) : null);
    request.input('ratePerHour', sql.Decimal(10, 2), rate_per_hour ? parseFloat(rate_per_hour) : null);
    request.input('amount', sql.Decimal(10, 2), amount);
    
    await request.query(`
      UPDATE invoice_items 
      SET project_id = @projectId,
          task_id = @taskId,
          description = @description,
          quantity = @quantity,
          unit_price = @unitPrice,
          hours_worked = @hoursWorked,
          rate_per_hour = @ratePerHour,
          amount = @amount
      WHERE id = @itemId AND invoice_id = @invoiceId
    `);
    
    // Update invoice totals
    await updateInvoiceTotals(pool, req.params.invoiceId);
    
    res.json({ message: 'Invoice item updated' });
  } catch (error) {
    console.error('Error updating invoice item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete invoice item
router.delete('/:invoiceId/items/:itemId', async (req, res) => {
  try {
    const pool = await db;
    
    // Verify invoice belongs to user
    const checkRequest = pool.request();
    checkRequest.input('invoiceId', sql.Int, req.params.invoiceId);
    checkRequest.input('userId', sql.Int, req.user.id);
    
    const invoiceCheck = await checkRequest.query(
      'SELECT id FROM invoices WHERE id = @invoiceId AND user_id = @userId'
    );
    
    if (invoiceCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const request = pool.request();
    request.input('itemId', sql.Int, req.params.itemId);
    request.input('invoiceId', sql.Int, req.params.invoiceId);
    
    await request.query(
      'DELETE FROM invoice_items WHERE id = @itemId AND invoice_id = @invoiceId'
    );
    
    // Update invoice totals
    await updateInvoiceTotals(pool, req.params.invoiceId);
    
    res.json({ message: 'Invoice item deleted' });
  } catch (error) {
    console.error('Error deleting invoice item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update invoice totals
async function updateInvoiceTotals(pool, invoiceId) {
  const request = pool.request();
  request.input('invoiceId', sql.Int, invoiceId);
  
  const result = await request.query(`
    SELECT ISNULL(SUM(amount), 0) as subtotal
    FROM invoice_items
    WHERE invoice_id = @invoiceId
  `);
  
  const subtotal = result.recordset[0].subtotal;
  const tax = subtotal * 0; // No tax for now, can be customized
  const total = subtotal + tax;
  
  const updateRequest = pool.request();
  updateRequest.input('invoiceId', sql.Int, invoiceId);
  updateRequest.input('amount', sql.Decimal(10, 2), subtotal);
  updateRequest.input('tax', sql.Decimal(10, 2), tax);
  updateRequest.input('total', sql.Decimal(10, 2), total);
  
  await updateRequest.query(`
    UPDATE invoices 
    SET amount = @amount, tax = @tax, total = @total
    WHERE id = @invoiceId
  `);
}

module.exports = router;
