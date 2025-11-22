const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getAll } = require('../db/database');

const router = express.Router();
router.use(authenticateToken);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    // This is a placeholder - in production, you'd have a notifications table
    const upcomingTasks = await getAll(
      'SELECT * FROM tasks WHERE user_id = ? AND status != "done" AND due_date <= date("now", "+7 days") ORDER BY due_date ASC',
      [req.user.id]
    );

    const overdueInvoices = await getAll(
      'SELECT * FROM invoices WHERE user_id = ? AND status = "sent" AND due_date < date("now") ORDER BY due_date ASC',
      [req.user.id]
    );

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
