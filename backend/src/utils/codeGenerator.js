/**
 * Verification Code Generator
 * Generates 6-digit codes for email verification
 */

/**
 * Generate a 6-digit verification code
 * @returns {string} 6-digit code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate verification code format
 * @param {string} code - Code to validate
 * @returns {boolean} True if valid format
 */
const isValidCodeFormat = (code) => {
  return /^\d{6}$/.test(code);
};

module.exports = {
  generateVerificationCode,
  isValidCodeFormat
};
