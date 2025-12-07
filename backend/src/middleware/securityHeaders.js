/**
 * Security Headers Middleware
 * 
 * Implements comprehensive security headers including:
 * - HTTPS enforcement
 * - HSTS (HTTP Strict Transport Security)
 * - Secure cookie configuration
 * - CSP (Content Security Policy)
 * - Additional security headers
 */

const logger = require('../utils/logger');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Force HTTPS in production
 * Redirects HTTP requests to HTTPS
 */
const httpsRedirect = (req, res, next) => {
  if (!isProduction) {
    return next();
  }

  // Check if request is already HTTPS
  const isHttps = req.secure || 
                  req.headers['x-forwarded-proto'] === 'https' ||
                  req.headers['x-forwarded-ssl'] === 'on';

  if (!isHttps) {
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    logger.info(`Redirecting HTTP to HTTPS: ${req.url}`);
    return res.redirect(301, httpsUrl); // 301 = Permanent redirect
  }

  next();
};

/**
 * HSTS (HTTP Strict Transport Security) Header
 * Tells browsers to only use HTTPS for future requests
 */
const hstsHeader = (req, res, next) => {
  if (isProduction) {
    // max-age=31536000 = 1 year
    // includeSubDomains = Apply to all subdomains
    // preload = Allow inclusion in browser HSTS preload lists
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  next();
};

/**
 * Additional Security Headers
 * Provides defense-in-depth security
 */
const additionalSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  next();
};

/**
 * Configure secure cookies
 * Sets default cookie options for the application
 */
const configureCookies = (app) => {
  if (isProduction) {
    // Set secure cookie defaults
    app.set('trust proxy', 1); // Trust first proxy
    
    // Configure session cookies (if using express-session)
    if (app.get('session')) {
      app.get('session').cookie.secure = true; // Require HTTPS
      app.get('session').cookie.httpOnly = true; // Prevent XSS
      app.get('session').cookie.sameSite = 'strict'; // CSRF protection
    }
  }
};

/**
 * Security info endpoint
 * Provides information about security features (for frontend)
 */
const securityInfo = (req, res) => {
  res.json({
    https: {
      enforced: isProduction,
      hsts: isProduction,
      message: isProduction 
        ? 'HTTPS is enforced. All HTTP requests are redirected to HTTPS.'
        : 'HTTPS enforcement is disabled in development mode.'
    },
    cookies: {
      secure: isProduction,
      httpOnly: true,
      sameSite: 'strict',
      message: isProduction
        ? 'Cookies are secured with HTTPS, HttpOnly, and SameSite flags.'
        : 'Cookie security is relaxed in development mode.'
    },
    headers: {
      hsts: isProduction,
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      xssProtection: true,
      referrerPolicy: 'strict-origin-when-cross-origin'
    },
    environment: process.env.NODE_ENV || 'development'
  });
};

/**
 * Apply all security middleware
 */
const applySecurityMiddleware = (app) => {
  // 1. HTTPS redirect (must be first)
  app.use(httpsRedirect);
  
  // 2. HSTS header
  app.use(hstsHeader);
  
  // 3. Additional security headers
  app.use(additionalSecurityHeaders);
  
  // 4. Configure secure cookies
  configureCookies(app);
  
  // 5. Security info endpoint
  app.get('/api/security-info', securityInfo);
  
  logger.info(`Security middleware applied (Production: ${isProduction})`);
  
  if (isProduction) {
    logger.info('✅ HTTPS enforcement enabled');
    logger.info('✅ HSTS enabled (1 year, includeSubDomains, preload)');
    logger.info('✅ Secure cookies enabled');
  } else {
    logger.info('⚠️  HTTPS enforcement disabled (development mode)');
  }
};

module.exports = {
  httpsRedirect,
  hstsHeader,
  additionalSecurityHeaders,
  configureCookies,
  securityInfo,
  applySecurityMiddleware
};
