/**
 * Token Generation Utility
 * Generates secure random tokens for email verification and password reset
 */

const crypto = require('crypto');

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Hex string token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate token expiry date
 * @param {string} duration - Duration string (e.g., '24h', '1h')
 * @returns {Date} Expiry date
 */
const generateTokenExpiry = (duration = '24h') => {
  const now = new Date();
  const match = duration.match(/^(\d+)([hmd])$/);

  if (!match) {
    throw new Error(
      'Invalid duration format. Use format like: 24h, 1h, 30m, 7d'
    );
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  switch (unit) {
    case 'h': // hours
      now.setHours(now.getHours() + numValue);
      break;
    case 'm': // minutes
      now.setMinutes(now.getMinutes() + numValue);
      break;
    case 'd': // days
      now.setDate(now.getDate() + numValue);
      break;
    default:
      throw new Error(
        'Invalid duration unit. Use h (hours), m (minutes), or d (days)'
      );
  }

  return now;
};

/**
 * Check if token is expired
 * @param {Date} expiryDate - Token expiry date
 * @returns {boolean} True if expired
 */
const isTokenExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

module.exports = {
  generateToken,
  generateTokenExpiry,
  isTokenExpired,
};
