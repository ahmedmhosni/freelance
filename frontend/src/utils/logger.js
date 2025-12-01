// Production-safe logger utility
// Only logs in development, silent in production

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // In production, you might want to send errors to a monitoring service
    // Example: sendToSentry(args);
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};

export default logger;
