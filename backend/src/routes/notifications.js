const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');
const db = require('../db/azuresql');

const router = express.Router();
router.use(authenticateToken);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const pool = await db;
    
    // Get upcoming tasks
    const tasksRequest = pool.request();
    tasksRequest.input('userId', sql.Int, req.user.id);
    tasksRequest.input('doneStatus', sql.NVarChar, 'done');
    
    const tasksResult = await tasksRequest.query(`
      SELECT * FROM tasks 
      WHERE user_id = @userId 
        AND status != @doneStatus 
        AND due_date <= DATEADD(day, 7, GETDATE())
      ORDER BY due_date ASC
    `);
    const upcomingTasks = tasksResult.recordset;

    // Get overdue invoices
    const invoicesRequest = pool.request();
    invoicesRequest.input('userId', sql.Int, req.user.id);
    invoicesRequest.input('sentStatus', sql.NVarChar, 'sent');
    
    const invoicesResult = await invoicesRequest.query(`
      SELECT * FROM invoices 
      WHERE user_id = @userId 
        AND status = @sentStatus 
        AND due_date < CAST(GETDATE() AS DATE)
      ORDER BY due_date ASC
    `);
    const overdueInvoices = invoicesResult.recordset;

    const notifications = [
      ...upcomingTasks.map(task => ({
        type: 'task_due',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due on ${new Date(task.due_date).toLocaleDateString()}`,
        date: task.due_date,
        priority: task.priority
      })),
      ...overdueInvoices.map(invoice => ({
        type: 'invoice_overdue',
        title: 'Invoice Overdue',
        message: `Invoice ${invoice.invoice_number} is overdue`,
        date: invoice.due_date,
        priority: 'urgent'
      }))
    ];

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
