const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Check if running in development
const isDevelopment = process.env.NODE_ENV === 'development';

// Helper function to format retry time
const formatRetryTime = (resetTime) => {
  if (!resetTime) return 'a few minutes';
  
  const now = Date.now();
  const diff = resetTime - now;
  const minutes = Math.ceil(diff / 60000);
  
  if (minutes <= 1) return 'less than a minute';
  if (minutes < 60) return `${minutes} minutes`;
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours > 1 ? 's' : ''}`;
};

// General API rate limiter (per user or IP)
// Generous limits to allow normal work without interruption
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 1000, // 1000 requests per 15 min (allows ~1 request per second)
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    return undefined; // Use default IP-based limiting
  },
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === 'localhost')) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    const identifier = req.user ? `User ID: ${req.user.id}` : `IP: ${req.ip}`;
    const retryTime = formatRetryTime(req.rateLimit.resetTime);
    
    logger.warn(`API rate limit exceeded for ${identifier}`);
    
    res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: `You're making requests too quickly. Please wait ${retryTime} before trying again.`,
      details: 'This limit helps us maintain service quality for all users.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit,
      remaining: 0
    });
  }
});

// Login rate limiter - Protects against brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 5, // 5 failed attempts per 15 min per IP
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === 'localhost')) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    const email = req.body.email || 'unknown';
    const retryTime = formatRetryTime(req.rateLimit.resetTime);
    
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}, Email: ${email}`);
    
    res.status(429).json({
      error: 'Too Many Login Attempts',
      message: `Too many failed login attempts. Please try again in ${retryTime}.`,
      details: 'If you forgot your password, use the "Forgot Password" link to reset it.',
      suggestion: 'Double-check your email and password, or reset your password.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Register rate limiter - Prevents spam account creation
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 3, // 3 registrations per hour per IP
  message: 'Too many accounts created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === 'localhost')) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    const retryTime = formatRetryTime(req.rateLimit.resetTime);
    
    logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
    
    res.status(429).json({
      error: 'Registration Limit Reached',
      message: `You've created too many accounts recently. Please try again in ${retryTime}.`,
      details: 'This limit prevents spam and helps keep our service secure.',
      suggestion: 'If you already have an account, try logging in instead.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Password reset rate limiter - Prevents abuse of password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 3, // 3 reset requests per hour per IP
  message: 'Too many password reset requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === 'localhost')) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    const retryTime = formatRetryTime(req.rateLimit.resetTime);
    
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    
    res.status(429).json({
      error: 'Too Many Reset Requests',
      message: `You've requested too many password resets. Please try again in ${retryTime}.`,
      details: 'Check your email for previous reset links - they remain valid for 1 hour.',
      suggestion: 'If you didn\'t receive the email, check your spam folder.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Legacy auth limiter (for backward compatibility)
const authLimiter = loginLimiter;

// Rate limiter for file uploads (per user or IP)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 100, // 100 uploads per hour (generous for normal work)
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    return undefined;
  },
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === 'localhost')) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    const identifier = req.user ? `User ID: ${req.user.id}` : `IP: ${req.ip}`;
    const retryTime = formatRetryTime(req.rateLimit.resetTime);
    
    logger.warn(`Upload rate limit exceeded for ${identifier}`);
    
    res.status(429).json({
      error: 'Upload Limit Reached',
      message: `You've uploaded too many files recently. Please try again in ${retryTime}.`,
      details: 'This limit helps us manage server resources effectively.',
      suggestion: 'Consider uploading files in batches or waiting a bit between uploads.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit
    });
  }
});

// Email sending rate limiter - Prevents email spam
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 10, // 10 emails per hour per user
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    return undefined;
  },
  message: 'Too many emails sent, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === 'localhost')) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    const identifier = req.user ? `User ID: ${req.user.id}` : `IP: ${req.ip}`;
    const retryTime = formatRetryTime(req.rateLimit.resetTime);
    
    logger.warn(`Email rate limit exceeded for ${identifier}`);
    
    res.status(429).json({
      error: 'Email Limit Reached',
      message: `You've sent too many emails recently. Please try again in ${retryTime}.`,
      details: 'This limit prevents spam and helps maintain email deliverability.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  emailLimiter
};
