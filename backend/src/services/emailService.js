/**
 * Centralized Email Service
 * All email sending logic in one place
 */

const { EmailClient } = require('@azure/communication-email');
const emailConfig = require('../config/email.config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    if (!emailConfig.azure.connectionString) {
      logger.warn('Azure Communication Services connection string not configured');
      this.client = null;
    } else {
      this.client = new EmailClient(emailConfig.azure.connectionString);
    }
  }

  /**
   * Send email using Azure Communication Services
   * @private
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.client) {
      logger.error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING');
      throw new Error('Email service not configured');
    }

    try {
      const message = {
        senderAddress: emailConfig.azure.senderEmail,
        content: {
          subject,
          plainText: text,
          html
        },
        recipients: {
          to: [{ address: to }]
        },
        headers: {
          'X-Mailer': emailConfig.azure.senderName || 'Roastify'
        },
        replyTo: [
          {
            address: emailConfig.templates.supportEmail || emailConfig.azure.senderEmail
          }
        ]
      };

      const poller = await this.client.beginSend(message);
      const result = await poller.pollUntilDone();

      logger.info(`Email sent successfully to ${to}`, {
        messageId: result.id,
        status: result.status
      });

      return result;
    } catch (error) {
      logger.error('Failed to send email', {
        to,
        subject,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send email verification (with both link and code)
   */
  async sendVerificationEmail(user, token, code) {
    const verificationUrl = `${emailConfig.templates.appUrl}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0 20px 0; }
          .logo { height: 40px; margin-bottom: 10px; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 10px 30px; background: #37352f; color: #ffffff !important; text-decoration: none; border-radius: 3px; margin: 20px 0; font-weight: 600; font-size: 14px; transition: background 0.15s ease; }
          .button:hover { background: #2f2e2a; }
          .code-box { background: #f8f9fa; border: 2px dashed #37352f; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #37352f; font-family: 'Courier New', monospace; }
          .divider { text-align: center; margin: 30px 0; color: #999; font-size: 14px; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 12px; margin-top: 40px; }
          .footer a { color: #37352f; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="font-size: 28px; font-weight: 700; color: #37352f; margin: 0; letter-spacing: -0.5px;">${emailConfig.templates.appName}</h1>
            <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Freelance Management Platform</p>
          </div>
          <div class="content">
            <h2>Welcome, ${user.name}!</h2>
            <p>Thank you for registering with ${emailConfig.templates.appName}. Please verify your email address to get started.</p>
            
            <h3>Option 1: Click the button</h3>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <div class="divider">── OR ──</div>
            
            <h3>Option 2: Enter this code</h3>
            <div class="code-box">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your verification code:</p>
              <div class="code">${code}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Enter this code on the verification page</p>
            </div>
            
            <p style="font-size: 13px; color: #666; margin-top: 30px;">
              <strong>Can't click the button?</strong> Copy and paste this link:<br>
              <span style="word-break: break-all; color: #999;">${verificationUrl}</span>
            </p>
            
            <p><strong>This code and link will expire in ${emailConfig.templates.emailVerificationExpiry}.</strong></p>
            <p style="font-size: 13px; color: #999;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.templates.appName}. All rights reserved.</p>
            <p>Need help? Contact us at <a href="mailto:${emailConfig.templates.supportEmail}">${emailConfig.templates.supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to ${emailConfig.templates.appName}!
      
      Please verify your email address using one of these methods:
      
      OPTION 1: Click this link
      ${verificationUrl}
      
      OPTION 2: Enter this code on the website
      ${code}
      
      This code and link will expire in ${emailConfig.templates.emailVerificationExpiry}.
      
      If you didn't create an account, you can safely ignore this email.
    `;

    return this.sendEmail({
      to: user.email,
      subject: `✉️ Verify Your Email Address - ${emailConfig.templates.appName}`,
      html,
      text
    });
  }

  /**
   * Send password reset email (link only, no code)
   */
  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${emailConfig.templates.appUrl}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0 20px 0; }
          .logo { height: 40px; margin-bottom: 10px; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 10px 30px; background: #37352f; color: #ffffff !important; text-decoration: none; border-radius: 3px; margin: 20px 0; font-weight: 600; font-size: 14px; transition: background 0.15s ease; }
          .button:hover { background: #2f2e2a; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 3px; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 12px; margin-top: 40px; }
          .footer a { color: #37352f; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="font-size: 28px; font-weight: 700; color: #37352f; margin: 0; letter-spacing: -0.5px;">${emailConfig.templates.appName}</h1>
            <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Freelance Management Platform</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p style="font-size: 13px; color: #666; margin-top: 30px;">
              <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
              <span style="word-break: break-all; color: #999;">${resetUrl}</span>
            </p>
            
            <p><strong>This link will expire in ${emailConfig.templates.passwordResetExpiry}.</strong></p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.templates.appName}. All rights reserved.</p>
            <p>Need help? Contact us at <a href="mailto:${emailConfig.templates.supportEmail}">${emailConfig.templates.supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      Hi ${user.name},
      
      We received a request to reset your password. Click this link to reset it:
      ${resetUrl}
      
      This link will expire in ${emailConfig.templates.passwordResetExpiry}.
      
      If you didn't request a password reset, please ignore this email.
    `;

    return this.sendEmail({
      to: user.email,
      subject: `🔐 Password Reset Request - ${emailConfig.templates.appName}`,
      html,
      text
    });
  }

  /**
   * Send welcome email (after verification)
   */
  async sendWelcomeEmail(user) {
    const dashboardUrl = `${emailConfig.templates.appUrl}/dashboard`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0 20px 0; }
          .logo { height: 40px; margin-bottom: 10px; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 10px 30px; background: #37352f; color: #ffffff !important; text-decoration: none; border-radius: 3px; margin: 20px 0; font-weight: 600; font-size: 14px; transition: background 0.15s ease; }
          .button:hover { background: #2f2e2a; }
          .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 12px; margin-top: 40px; }
          .footer a { color: #37352f; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="font-size: 28px; font-weight: 700; color: #37352f; margin: 0; letter-spacing: -0.5px;">🎉 Welcome to ${emailConfig.templates.appName}!</h1>
            <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Freelance Management Platform</p>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Your email has been verified successfully! You're all set to start using ${emailConfig.templates.appName}.</p>
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            <div class="features">
              <h3>What you can do:</h3>
              <ul>
                <li>✅ Manage clients and projects</li>
                <li>✅ Track tasks and time</li>
                <li>✅ Create and send invoices</li>
                <li>✅ Generate reports</li>
              </ul>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.templates.appName}. All rights reserved.</p>
            <p>Need help? Contact us at <a href="mailto:${emailConfig.templates.supportEmail}">${emailConfig.templates.supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to ${emailConfig.templates.appName}!
      
      Hi ${user.name},
      
      Your email has been verified successfully! You're all set to start using ${emailConfig.templates.appName}.
      
      Visit your dashboard: ${dashboardUrl}
      
      What you can do:
      - Manage clients and projects
      - Track tasks and time
      - Create and send invoices
      - Generate reports
    `;

    return this.sendEmail({
      to: user.email,
      subject: `🎉 Welcome to ${emailConfig.templates.appName} - Your Account is Ready!`,
      html,
      text
    });
  }

  /**
   * Send invoice notification
   */
  async sendInvoiceEmail(user, invoice, type = 'sent') {
    const subject = type === 'sent' 
      ? `📄 Invoice ${invoice.invoice_number} Sent Successfully`
      : `✅ Invoice ${invoice.invoice_number} Payment Received`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0 20px 0; }
          .logo { height: 40px; margin-bottom: 10px; }
          .content { padding: 30px 0; }
          .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 12px; margin-top: 40px; }
          .footer a { color: #37352f; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="font-size: 28px; font-weight: 700; color: #37352f; margin: 0; letter-spacing: -0.5px;">${emailConfig.templates.appName}</h1>
            <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Freelance Management Platform</p>
          </div>
          <div class="content">
            <h2>Invoice ${type === 'sent' ? 'Sent' : 'Paid'}</h2>
            <p>Hi ${user.name},</p>
            <p>Invoice ${invoice.invoice_number} has been ${type}.</p>
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Amount:</strong> $${invoice.amount}</p>
              <p><strong>Status:</strong> ${invoice.status}</p>
              ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ''}
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.templates.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Invoice ${invoice.invoice_number} has been ${type}. Amount: $${invoice.amount}`
    });
  }

  /**
   * Send task reminder
   */
  async sendTaskReminder(user, task) {
    const taskUrl = `${emailConfig.templates.appUrl}/tasks`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0 20px 0; }
          .logo { height: 40px; margin-bottom: 10px; }
          .content { padding: 30px 0; }
          .task-details { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 3px; }
          .button { display: inline-block; padding: 10px 30px; background: #37352f; color: #ffffff !important; text-decoration: none; border-radius: 3px; margin: 20px 0; font-weight: 600; font-size: 14px; transition: background 0.15s ease; }
          .button:hover { background: #2f2e2a; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 12px; margin-top: 40px; }
          .footer a { color: #37352f; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="font-size: 28px; font-weight: 700; color: #37352f; margin: 0; letter-spacing: -0.5px;">${emailConfig.templates.appName}</h1>
            <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Freelance Management Platform</p>
          </div>
          <div class="content">
            <h2>⏰ Task Reminder</h2>
            <p>Hi ${user.name},</p>
            <p>This is a reminder about an upcoming task:</p>
            <div class="task-details">
              <p><strong>${task.title}</strong></p>
              ${task.description ? `<p>${task.description}</p>` : ''}
              <p><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
              <p><strong>Priority:</strong> ${task.priority}</p>
            </div>
            <a href="${taskUrl}" class="button">View Task</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.templates.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `⏰ Task Due Soon: ${task.title} - ${emailConfig.templates.appName}`,
      html,
      text: `Task Reminder: ${task.title}\nDue: ${new Date(task.due_date).toLocaleDateString()}\nPriority: ${task.priority}`
    });
  }
}

// Export singleton instance
module.exports = new EmailService();
