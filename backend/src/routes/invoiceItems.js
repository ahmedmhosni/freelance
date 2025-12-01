const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

// Get all items for an invoice
router.get('/:invoiceId/items', async (req, res) => {
  try {
    // Verify invoice belongs to user
    const invoiceCheck = await query(
      'SELECT id FROM invoices WHERE id = $1 AND user_id = $2',
      [req.params.invoiceId, req.user.id]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const result = await query(
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
      [req.params.invoiceId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invoice items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add item to invoice
router.post('/:invoiceId/items', async (req, res) => {
  const {
    project_id,
    task_id,
    description,
    quantity,
    unit_price,
    hours_worked,
    rate_per_hour,
  } = req.body;

  try {
    // Verify invoice belongs to user
    const invoiceCheck = await query(
      'SELECT id FROM invoices WHERE id = $1 AND user_id = $2',
      [req.params.invoiceId, req.user.id]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate amount
    let amount;
    if (hours_worked && rate_per_hour) {
      amount = parseFloat(hours_worked) * parseFloat(rate_per_hour);
    } else {
      amount = parseFloat(quantity || 1) * parseFloat(unit_price);
    }

    const result = await query(
      `
      INSERT INTO invoice_items 
      (invoice_id, project_id, task_id, description, quantity, unit_price, hours_worked, rate_per_hour, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        parseInt(req.params.invoiceId),
        project_id && project_id !== '' ? parseInt(project_id) : null,
        task_id && task_id !== '' ? parseInt(task_id) : null,
        description,
        parseFloat(quantity || 1),
        parseFloat(unit_price || 0),
        hours_worked ? parseFloat(hours_worked) : null,
        rate_per_hour ? parseFloat(rate_per_hour) : null,
        amount,
      ]
    );

    // Update invoice totals
    await updateInvoiceTotals(req.params.invoiceId);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding invoice item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update invoice item
router.put('/:invoiceId/items/:itemId', async (req, res) => {
  const {
    project_id,
    task_id,
    description,
    quantity,
    unit_price,
    hours_worked,
    rate_per_hour,
  } = req.body;

  try {
    // Verify invoice belongs to user
    const invoiceCheck = await query(
      'SELECT id FROM invoices WHERE id = $1 AND user_id = $2',
      [req.params.invoiceId, req.user.id]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate amount
    let amount;
    if (hours_worked && rate_per_hour) {
      amount = parseFloat(hours_worked) * parseFloat(rate_per_hour);
    } else {
      amount = parseFloat(quantity || 1) * parseFloat(unit_price);
    }

    await query(
      `
      UPDATE invoice_items 
      SET project_id = $1,
          task_id = $2,
          description = $3,
          quantity = $4,
          unit_price = $5,
          hours_worked = $6,
          rate_per_hour = $7,
          amount = $8
      WHERE id = $9 AND invoice_id = $10
    `,
      [
        project_id || null,
        task_id || null,
        description,
        parseFloat(quantity || 1),
        parseFloat(unit_price || 0),
        hours_worked ? parseFloat(hours_worked) : null,
        rate_per_hour ? parseFloat(rate_per_hour) : null,
        amount,
        req.params.itemId,
        req.params.invoiceId,
      ]
    );

    // Update invoice totals
    await updateInvoiceTotals(req.params.invoiceId);

    res.json({ message: 'Invoice item updated' });
  } catch (error) {
    console.error('Error updating invoice item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete invoice item
router.delete('/:invoiceId/items/:itemId', async (req, res) => {
  try {
    // Verify invoice belongs to user
    const invoiceCheck = await query(
      'SELECT id FROM invoices WHERE id = $1 AND user_id = $2',
      [req.params.invoiceId, req.user.id]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await query('DELETE FROM invoice_items WHERE id = $1 AND invoice_id = $2', [
      req.params.itemId,
      req.params.invoiceId,
    ]);

    // Update invoice totals
    await updateInvoiceTotals(req.params.invoiceId);

    res.json({ message: 'Invoice item deleted' });
  } catch (error) {
    console.error('Error deleting invoice item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update invoice totals
async function updateInvoiceTotals(invoiceId) {
  const result = await query(
    `
    SELECT COALESCE(SUM(amount), 0) as subtotal
    FROM invoice_items
    WHERE invoice_id = $1
  `,
    [invoiceId]
  );

  const subtotal = parseFloat(result.rows[0].subtotal);
  const tax = subtotal * 0; // No tax for now, can be customized
  const total = subtotal + tax;

  await query(
    `
    UPDATE invoices 
    SET amount = $1, tax = $2, total = $3
    WHERE id = $4
  `,
    [subtotal, tax, total, invoiceId]
  );
}

module.exports = router;
