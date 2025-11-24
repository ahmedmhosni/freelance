/**
 * Email Configuration
 * All email settings in one place - NO HARDCODED VALUES
 */

module.exports = {
  // Azure Communication Services
  azure: {
    connectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING,
    senderEmail: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
  },

  // Email Templates Configuration
  templates: {
    // Base URL for links in emails
    appUrl: process.env.APP_URL || 'http://localhost:5173',
    
    // Company/App Info
    appName: process.env.APP_NAME || 'Roastify',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@roastify.com',
    
    // Token Expiration Times
    emailVerificationExpiry: process.env.EMAIL_VERIFICATION_EXPIRY || '24h', // 24 hours
    passwordResetExpiry: process.env.PASSWORD_RESET_EXPIRY || '1h', // 1 hour
  },

  // Email Types (for tracking/logging)
  types: {
    VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset',
    WELCOME: 'welcome',
    INVOICE_SENT: 'invoice_sent',
    INVOICE_PAID: 'invoice_paid',
    TASK_REMINDER: 'task_reminder',
    PROJECT_UPDATE: 'project_update'
  }
};
