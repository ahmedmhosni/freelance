/**
 * Production-Safe Logger
 * 
 * - Disables all console logs in production
 * - Sanitizes sensitive data
 * - Can integrate with error tracking services (Sentry, etc.)
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Sensitive keys that should never be logged
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'authorization',
  'cookie',
  'session',
  'ssn',
  'credit_card',
  'creditCard',
  'cvv',
  'pin'
];

/**
 * Sanitize data by removing sensitive information
 */
const sanitize = (data) => {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if key contains sensitive information
      const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return data;
};

/**
 * Send error to monitoring service (Sentry, etc.)
 */
const sendToMonitoring = (level, message, data) => {
  // TODO: Integrate with Sentry or other monitoring service
  // Example:
  // if (window.Sentry) {
  //   window.Sentry.captureMessage(message, {
  //     level,
  //     extra: sanitize(data)
  //   });
  // }
};

const logger = {
  /**
   * Log general information (development only)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always logged, sent to monitoring in production)
   */
  error: (message, ...args) => {
    const sanitizedArgs = args.map(arg => sanitize(arg));
    
    if (isDevelopment) {
      console.error(message, ...sanitizedArgs);
    }
    
    if (isProduction) {
      // In production, send to monitoring service
      sendToMonitoring('error', message, sanitizedArgs);
    }
  },

  /**
   * Log warnings (development only, sent to monitoring in production)
   */
  warn: (message, ...args) => {
    const sanitizedArgs = args.map(arg => sanitize(arg));
    
    if (isDevelopment) {
      console.warn(message, ...sanitizedArgs);
    }
    
    if (isProduction) {
      sendToMonitoring('warning', message, sanitizedArgs);
    }
  },

  /**
   * Log debug information (development only)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log info (development only)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log API errors with sanitization
   */
  apiError: (endpoint, error) => {
    const errorData = {
      endpoint,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      // Don't log full response data as it might contain sensitive info
    };

    if (isDevelopment) {
      console.error('API Error:', errorData);
    }

    if (isProduction) {
      sendToMonitoring('error', `API Error: ${endpoint}`, errorData);
    }
  }
};

// Disable console in production
if (isProduction) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  // Keep console.error and console.warn for critical issues
}

export default logger;
