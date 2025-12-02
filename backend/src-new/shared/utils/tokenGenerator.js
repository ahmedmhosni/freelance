/**
 * Token Generator
 * Generates random tokens for verification, password reset, etc.
 */

const crypto = require('crypto');

class TokenGenerator {
  generate(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  generateNumeric(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = new TokenGenerator();
