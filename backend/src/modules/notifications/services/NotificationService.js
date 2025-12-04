const Notification = require('../models/Notification');

/**
 * Notification Service
 * Handles business logic for notifications
 */
class NotificationService {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  /**
   * Get all notifications for a user
   * @param {number} userId - User ID
   * @returns {Promise<Notification[]>}
   */
  async getUserNotifications(userId) {
    const notifications = [];

    // Get upcoming tasks
    const upcomingTasks = await this.notificationRepository.getUpcomingTasks(userId, 7);
    upcomingTasks.forEach(task => {
      notifications.push(new Notification({
        type: 'task_due',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due on ${new Date(task.due_date).toLocaleDateString()}`,
        date: task.due_date,
        priority: task.priority || 'normal',
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.project_id
        }
      }));
    });

    // Get overdue invoices
    const overdueInvoices = await this.notificationRepository.getOverdueInvoices(userId);
    overdueInvoices.forEach(invoice => {
      notifications.push(new Notification({
        type: 'invoice_overdue',
        title: 'Invoice Overdue',
        message: `Invoice ${invoice.invoice_number} is overdue`,
        date: invoice.due_date,
        priority: 'urgent',
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.total || invoice.amount
        }
      }));
    });

    // Get overdue tasks
    const overdueTasks = await this.notificationRepository.getOverdueTasks(userId);
    overdueTasks.forEach(task => {
      notifications.push(new Notification({
        type: 'task_overdue',
        title: 'Task Overdue',
        message: `Task "${task.title}" was due on ${new Date(task.due_date).toLocaleDateString()}`,
        date: task.due_date,
        priority: 'high',
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.project_id
        }
      }));
    });

    // Sort by date (most urgent first)
    notifications.sort((a, b) => new Date(a.date) - new Date(b.date));

    return notifications;
  }

  /**
   * Get notification count for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>}
   */
  async getNotificationCount(userId) {
    const notifications = await this.getUserNotifications(userId);
    return notifications.length;
  }
}

module.exports = NotificationService;
