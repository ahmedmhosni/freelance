const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getAll } = require('../db/postgresql');

const router = express.Router();
router.use(authenticateToken);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    // Get upcoming tasks (due within 7 days)
    const upcomingTasks = await getAll(
      `
      SELECT * FROM tasks 
      WHERE user_id = $1 
        AND status != $2 
        AND due_date <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY due_date ASC
    `,
      [req.user.id, 'done']
    );

    // Get overdue invoices
    const overdueInvoices = await getAll(
      `
      SELECT * FROM invoices 
      WHERE user_id = $1 
        AND status = $2 
        AND due_date < CURRENT_DATE
      ORDER BY due_date ASC
    `,
      [req.user.id, 'sent']
    );

    const notifications = [
      ...upcomingTasks.map((task) => ({
        type: 'task_due',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due on ${new Date(task.due_date).toLocaleDateString()}`,
        date: task.due_date,
        priority: task.priority,
      })),
      ...overdueInvoices.map((invoice) => ({
        type: 'invoice_overdue',
        title: 'Invoice Overdue',
        message: `Invoice ${invoice.invoice_number} is overdue`,
        date: invoice.due_date,
        priority: 'urgent',
      })),
    ];

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
