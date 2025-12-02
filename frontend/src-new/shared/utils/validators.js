/**
 * Validator Utilities
 */

export const isEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isPhone = (phone) => {
  const re = /^[\d\s\-\(\)]+$/;
  return re.test(phone);
};

export const isURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const isPositive = (value) => {
  return isNumber(value) && parseFloat(value) > 0;
};

export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return isNumber(num) && num >= min && num <= max;
};
