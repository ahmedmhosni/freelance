/**
 * Password validation utility matching backend requirements
 */

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Note: Special character requirement removed to match backend validation
  // Backend only requires: length >= 8, uppercase, lowercase, and number

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get password strength level
 * @param {string} password 
 * @returns {object} { strength: 'weak'|'medium'|'strong', score: 0-5 }
 */
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 'weak', score: 0 };

  let score = 0;
  
  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character types
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  let strength = 'weak';
  if (score >= 4) strength = 'medium';
  if (score >= 5) strength = 'strong';

  return { strength, score };
};

/**
 * Get password requirements status
 * @param {string} password 
 * @returns {object} Object with each requirement and its status
 */
export const getPasswordRequirements = (password) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password)
    // hasSpecialChar removed to match backend requirements
  };
};
