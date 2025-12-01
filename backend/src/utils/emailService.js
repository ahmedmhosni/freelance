const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP)
  // For production, use SendGrid, AWS SES, or other service

  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Log emails to console
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.password',
      },
    });
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || 'Freelancer App <noreply@freelancerapp.com>',
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  invoiceSent: (invoiceNumber, amount, dueDate, clientName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Invoice Sent</h2>
      <p>Dear ${clientName},</p>
      <p>Your invoice <strong>#${invoiceNumber}</strong> has been sent.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
      </div>
      <p>Please review and process the payment at your earliest convenience.</p>
      <p>Thank you for your business!</p>
    </div>
  `,

  taskReminder: (taskTitle, dueDate, userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Task Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a reminder that the following task is due soon:</p>
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p><strong>${taskTitle}</strong></p>
        <p>Due: ${new Date(dueDate).toLocaleDateString()}</p>
      </div>
      <p>Don't forget to complete it on time!</p>
    </div>
  `,

  invoiceOverdue: (invoiceNumber, amount, clientName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">Invoice Overdue</h2>
      <p>Dear ${clientName},</p>
      <p>Invoice <strong>#${invoiceNumber}</strong> is now overdue.</p>
      <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <p><strong>Amount Due:</strong> $${amount}</p>
        <p><strong>Status:</strong> Overdue</p>
      </div>
      <p>Please arrange payment as soon as possible.</p>
    </div>
  `,

  welcomeEmail: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Welcome to Freelancer Management App!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for joining our platform. We're excited to help you manage your freelance business more efficiently.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Getting Started:</h3>
        <ul>
          <li>Add your first client</li>
          <li>Create a project</li>
          <li>Track tasks with our Kanban board</li>
          <li>Generate professional invoices</li>
        </ul>
      </div>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy freelancing!</p>
    </div>
  `,
};

module.exports = { sendEmail, emailTemplates };
