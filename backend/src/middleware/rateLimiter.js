const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Check if running in development
const isDevelopment = process.env.NODE_ENV === 'development';

// General API rate limiter (per user or IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 500, // 500 requests per 15 min per user in production
  // Use user ID if authenticated, otherwise use IP (handled by express-rate-limit)
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    // Return undefined to use default IP-based key generator
    return undefined;
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
    logger.warn(`Rate limit exceeded for ${identifier}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please slow down and try again in a few minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Strict rate limiter for authentication endpoints (per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 10, // 10 attempts per 15 min per IP in production
  skipSuccessfulRequests: true, // Don't count successful requests
  // Use default IP-based key generator
  message: 'Too many login attempts, please try again later.',
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
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Email: ${req.body.email}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Too many failed login attempts. Please try again in 15 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Rate limiter for file uploads (per user or IP)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 50, // 50 uploads per hour per user in production
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    // Return undefined to use default IP-based key generator
    return undefined;
  },
  message: 'Too many file uploads, please try again later.',
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
    logger.warn(`Upload rate limit exceeded for ${identifier}`);
    res.status(429).json({
      error: 'Too many uploads',
      message: 'You have exceeded the upload limit. Please try again in an hour.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter
};
