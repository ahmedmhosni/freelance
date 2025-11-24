const crypto = require('crypto');

// Simple CSRF protection middleware
// Generates and validates CSRF tokens

const csrfTokens = new Map(); // In production, use Redis

// Generate CSRF token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware to generate CSRF token
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints that use JWT (already protected)
  if (req.path.startsWith('/api/auth/login') || req.path.startsWith('/api/auth/register')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!token) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      code: 'CSRF_MISSING'
    });
  }

  // Validate token
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  const storedToken = csrfTokens.get(sessionId);

  if (!storedToken || storedToken !== token) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    });
  }

  next();
};

// Endpoint to get CSRF token
const getCsrfToken = (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId || crypto.randomBytes(16).toString('hex');
  const token = generateToken();
  
  // Store token (expires in 1 hour)
  csrfTokens.set(sessionId, token);
  setTimeout(() => csrfTokens.delete(sessionId), 60 * 60 * 1000);

  res.json({
    csrfToken: token,
    sessionId
  });
};

module.exports = {
  csrfProtection,
  getCsrfToken
};
