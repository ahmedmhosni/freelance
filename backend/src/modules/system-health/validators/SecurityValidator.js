/**
 * Security Configuration Validator
 * Validates security middleware, CORS settings, and security headers
 */

const fs = require('fs').promises;
const path = require('path');

class SecurityValidator {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Validate security configuration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateSecurity(options = {}) {
    const startTime = Date.now();
    
    try {
      this.logger?.debug('Starting security validation', { options });

      const results = [];
      
      // Validate middleware configuration
      const middlewareResult = await this.validateMiddleware(options);
      results.push(middlewareResult);

      // Validate CORS configuration
      const corsResult = await this.validateCORS(options);
      results.push(corsResult);

      // Validate security headers
      const headersResult = await this.validateSecurityHeaders(options);
      results.push(headersResult);

      // Validate authentication configuration
      const authResult = await this.validateAuthentication(options);
      results.push(authResult);

      // Validate rate limiting
      const rateLimitResult = await this.validateRateLimit(options);
      results.push(rateLimitResult);

      // Check for security best practices
      const bestPracticesResult = await this.validateSecurityBestPractices(options);
      results.push(bestPracticesResult);

      // Determine overall status
      const failedResults = results.filter(r => r.status === 'fail');
      const warningResults = results.filter(r => r.status === 'warning');
      
      const overallStatus = failedResults.length > 0 ? 'fail' : 
                           warningResults.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Security Configuration',
        status: overallStatus,
        message: this.generateSecurityMessage(overallStatus, results),
        details: {
          results,
          summary: {
            total: results.length,
            passed: results.filter(r => r.status === 'pass').length,
            failed: failedResults.length,
            warnings: warningResults.length
          }
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.logger?.error('Security validation failed', error);
      
      return {
        name: 'Security Configuration',
        status: 'fail',
        message: `Security validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate security middleware configuration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateMiddleware(options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const issues = [];

      // Check for security middleware files
      const securityFiles = [
        'backend/src/middleware/securityHeaders.js',
        'backend/src/middleware/rateLimiter.js',
        'backend/src/middleware/auth.js'
      ];

      for (const filePath of securityFiles) {
        try {
          await fs.access(filePath);
          
          // Read and analyze the file
          const content = await fs.readFile(filePath, 'utf8');
          const analysis = this.analyzeSecurityFile(content, filePath);
          
          results.push({
            file: filePath,
            exists: true,
            valid: analysis.valid,
            features: analysis.features,
            issues: analysis.issues
          });

          if (!analysis.valid) {
            issues.push(...analysis.issues.map(issue => ({
              file: filePath,
              issue
            })));
          }
        } catch (error) {
          results.push({
            file: filePath,
            exists: false,
            valid: false,
            error: error.message
          });

          if (filePath.includes('securityHeaders') || filePath.includes('auth')) {
            issues.push({
              file: filePath,
              issue: 'Critical security middleware file missing'
            });
          }
        }
      }

      const criticalIssues = issues.filter(i => i.issue.includes('Critical') || i.issue.includes('missing'));
      const status = criticalIssues.length > 0 ? 'fail' : 
                   issues.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Security Middleware',
        status,
        message: status === 'pass'
          ? `All ${results.filter(r => r.exists).length} security middleware files validated`
          : `${criticalIssues.length} critical issues, ${issues.length} total issues`,
        details: {
          filesChecked: securityFiles.length,
          existingFiles: results.filter(r => r.exists).length,
          validFiles: results.filter(r => r.valid).length,
          issues,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Security Middleware',
        status: 'fail',
        message: `Middleware validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate CORS configuration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateCORS(options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const issues = [];

      // Check server.js for CORS configuration
      const serverFiles = [
        'backend/src/server.js',
        'backend/server.js'
      ];

      let corsFound = false;
      let corsConfig = null;

      for (const serverFile of serverFiles) {
        try {
          const content = await fs.readFile(serverFile, 'utf8');
          
          // Look for CORS configuration
          const corsAnalysis = this.analyzeCORSConfig(content);
          
          if (corsAnalysis.found) {
            corsFound = true;
            corsConfig = corsAnalysis.config;
            
            results.push({
              file: serverFile,
              corsFound: true,
              config: corsAnalysis.config,
              issues: corsAnalysis.issues
            });

            issues.push(...corsAnalysis.issues);
          } else {
            results.push({
              file: serverFile,
              corsFound: false,
              analyzed: true
            });
          }
        } catch (error) {
          results.push({
            file: serverFile,
            corsFound: false,
            error: error.message
          });
        }
      }

      if (!corsFound) {
        issues.push({
          type: 'missing-cors',
          message: 'CORS configuration not found in server files'
        });
      }

      // Validate CORS settings
      if (corsConfig) {
        const corsValidation = this.validateCORSSettings(corsConfig);
        issues.push(...corsValidation.issues);
      }

      const status = issues.filter(i => i.type === 'missing-cors' || i.severity === 'high').length > 0 ? 'fail' :
                   issues.length > 0 ? 'warning' : 'pass';

      return {
        name: 'CORS Configuration',
        status,
        message: status === 'pass'
          ? 'CORS configuration is properly set up'
          : `${issues.length} CORS configuration issues found`,
        details: {
          corsFound,
          corsConfig,
          issues,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'CORS Configuration',
        status: 'fail',
        message: `CORS validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate security headers configuration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateSecurityHeaders(options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const issues = [];

      // Check for security headers middleware
      const securityHeadersFile = 'backend/src/middleware/securityHeaders.js';
      
      try {
        const content = await fs.readFile(securityHeadersFile, 'utf8');
        const analysis = this.analyzeSecurityHeaders(content);
        
        results.push({
          file: securityHeadersFile,
          exists: true,
          headers: analysis.headers,
          issues: analysis.issues
        });

        issues.push(...analysis.issues);

        // Check for required security headers
        const requiredHeaders = [
          'X-Content-Type-Options',
          'X-Frame-Options',
          'X-XSS-Protection',
          'Strict-Transport-Security',
          'Content-Security-Policy'
        ];

        for (const header of requiredHeaders) {
          if (!analysis.headers.includes(header)) {
            issues.push({
              type: 'missing-header',
              header,
              severity: this.getHeaderSeverity(header),
              message: `Missing security header: ${header}`
            });
          }
        }
      } catch (error) {
        results.push({
          file: securityHeadersFile,
          exists: false,
          error: error.message
        });

        issues.push({
          type: 'missing-file',
          severity: 'high',
          message: 'Security headers middleware file not found'
        });
      }

      const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
      const status = highSeverityIssues > 0 ? 'fail' :
                   issues.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Security Headers',
        status,
        message: status === 'pass'
          ? 'Security headers are properly configured'
          : `${highSeverityIssues} critical, ${issues.length} total header issues`,
        details: {
          headersFound: results.length > 0 ? results[0].headers?.length || 0 : 0,
          issues,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Security Headers',
        status: 'fail',
        message: `Security headers validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate authentication configuration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateAuthentication(options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const issues = [];

      // Check JWT configuration
      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        issues.push({
          type: 'missing-jwt-secret',
          severity: 'high',
          message: 'JWT_SECRET environment variable not set'
        });
      } else {
        const jwtValidation = this.validateJWTSecret(jwtSecret);
        if (!jwtValidation.valid) {
          issues.push({
            type: 'weak-jwt-secret',
            severity: jwtValidation.severity,
            message: jwtValidation.message
          });
        }
      }

      results.push({
        component: 'JWT Secret',
        configured: !!jwtSecret,
        secure: jwtSecret ? this.validateJWTSecret(jwtSecret).valid : false
      });

      // Check authentication middleware
      const authFiles = [
        'backend/src/middleware/auth.js',
        'backend/src/modules/auth/middleware/auth.js'
      ];

      let authMiddlewareFound = false;

      for (const authFile of authFiles) {
        try {
          const content = await fs.readFile(authFile, 'utf8');
          const analysis = this.analyzeAuthMiddleware(content);
          
          authMiddlewareFound = true;
          results.push({
            file: authFile,
            exists: true,
            features: analysis.features,
            issues: analysis.issues
          });

          issues.push(...analysis.issues);
        } catch (error) {
          results.push({
            file: authFile,
            exists: false,
            error: error.message
          });
        }
      }

      if (!authMiddlewareFound) {
        issues.push({
          type: 'missing-auth-middleware',
          severity: 'high',
          message: 'Authentication middleware not found'
        });
      }

      const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
      const status = highSeverityIssues > 0 ? 'fail' :
                   issues.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Authentication Configuration',
        status,
        message: status === 'pass'
          ? 'Authentication is properly configured'
          : `${highSeverityIssues} critical, ${issues.length} total auth issues`,
        details: {
          jwtConfigured: !!jwtSecret,
          authMiddlewareFound,
          issues,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Authentication Configuration',
        status: 'fail',
        message: `Authentication validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate rate limiting configuration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateRateLimit(options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const issues = [];

      // Check for rate limiting middleware
      const rateLimitFile = 'backend/src/middleware/rateLimiter.js';
      
      try {
        const content = await fs.readFile(rateLimitFile, 'utf8');
        const analysis = this.analyzeRateLimitConfig(content);
        
        results.push({
          file: rateLimitFile,
          exists: true,
          config: analysis.config,
          issues: analysis.issues
        });

        issues.push(...analysis.issues);

        // Validate rate limit settings
        if (analysis.config) {
          const validation = this.validateRateLimitSettings(analysis.config);
          issues.push(...validation.issues);
        }
      } catch (error) {
        results.push({
          file: rateLimitFile,
          exists: false,
          error: error.message
        });

        issues.push({
          type: 'missing-rate-limit',
          severity: 'medium',
          message: 'Rate limiting middleware not found'
        });
      }

      const status = issues.filter(i => i.severity === 'high').length > 0 ? 'fail' :
                   issues.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Rate Limiting',
        status,
        message: status === 'pass'
          ? 'Rate limiting is properly configured'
          : `${issues.length} rate limiting issues found`,
        details: {
          rateLimitConfigured: results.some(r => r.exists),
          issues,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Rate Limiting',
        status: 'fail',
        message: `Rate limiting validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate security best practices
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validateSecurityBestPractices(options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const issues = [];

      // Check environment-specific security
      const nodeEnv = process.env.NODE_ENV;
      
      if (nodeEnv === 'production') {
        // Production-specific checks
        if (process.env.DEBUG === 'true') {
          issues.push({
            type: 'debug-enabled-production',
            severity: 'high',
            message: 'Debug mode enabled in production'
          });
        }

        if (!process.env.HTTPS_ONLY) {
          issues.push({
            type: 'https-not-enforced',
            severity: 'medium',
            message: 'HTTPS enforcement not configured'
          });
        }
      }

      // Check for sensitive data exposure
      const sensitivePatterns = [
        { pattern: /password\s*=\s*['"][^'"]+['"]/, message: 'Hardcoded password detected' },
        { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/, message: 'Hardcoded API key detected' },
        { pattern: /secret\s*=\s*['"][^'"]+['"]/, message: 'Hardcoded secret detected' }
      ];

      // Check common files for sensitive data
      const filesToCheck = [
        'backend/src/server.js',
        'backend/.env.example'
      ];

      for (const file of filesToCheck) {
        try {
          const content = await fs.readFile(file, 'utf8');
          
          for (const { pattern, message } of sensitivePatterns) {
            if (pattern.test(content)) {
              issues.push({
                type: 'sensitive-data-exposure',
                file,
                severity: 'high',
                message: `${message} in ${file}`
              });
            }
          }

          results.push({
            file,
            checked: true,
            sensitiveDataFound: sensitivePatterns.some(p => p.pattern.test(content))
          });
        } catch (error) {
          results.push({
            file,
            checked: false,
            error: error.message
          });
        }
      }

      const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
      const status = highSeverityIssues > 0 ? 'fail' :
                   issues.length > 0 ? 'warning' : 'pass';

      return {
        name: 'Security Best Practices',
        status,
        message: status === 'pass'
          ? 'Security best practices are followed'
          : `${highSeverityIssues} critical, ${issues.length} total best practice issues`,
        details: {
          environment: nodeEnv,
          filesChecked: results.length,
          issues,
          results
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Security Best Practices',
        status: 'fail',
        message: `Security best practices validation failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze security file content
   * @param {string} content - File content
   * @param {string} filePath - File path
   * @returns {Object} Analysis result
   */
  analyzeSecurityFile(content, filePath) {
    const features = [];
    const issues = [];

    // Check for common security patterns
    if (content.includes('helmet')) {
      features.push('helmet');
    }

    if (content.includes('cors')) {
      features.push('cors');
    }

    if (content.includes('rateLimit') || content.includes('express-rate-limit')) {
      features.push('rate-limiting');
    }

    if (content.includes('jwt') || content.includes('jsonwebtoken')) {
      features.push('jwt');
    }

    // Check for potential issues
    if (content.includes('app.use(cors())') && !content.includes('origin:')) {
      issues.push('CORS configured without origin restrictions');
    }

    if (content.includes('process.env') && content.includes('console.log')) {
      issues.push('Potential environment variable logging detected');
    }

    return {
      valid: issues.length === 0,
      features,
      issues
    };
  }

  /**
   * Analyze CORS configuration
   * @param {string} content - Server file content
   * @returns {Object} CORS analysis result
   */
  analyzeCORSConfig(content) {
    const corsRegex = /cors\s*\(\s*({[^}]*}|\{[\s\S]*?\})\s*\)/;
    const match = content.match(corsRegex);
    
    if (!match) {
      return { found: false };
    }

    const issues = [];
    const configStr = match[1];

    // Check for wildcard origin
    if (configStr.includes('origin: "*"') || configStr.includes("origin: '*'")) {
      issues.push({
        type: 'wildcard-origin',
        severity: 'high',
        message: 'CORS configured with wildcard origin (*) - security risk'
      });
    }

    // Check for credentials with wildcard
    if (configStr.includes('credentials: true') && configStr.includes('*')) {
      issues.push({
        type: 'credentials-with-wildcard',
        severity: 'high',
        message: 'CORS credentials enabled with wildcard origin'
      });
    }

    return {
      found: true,
      config: configStr,
      issues
    };
  }

  /**
   * Validate CORS settings
   * @param {string} corsConfig - CORS configuration string
   * @returns {Object} Validation result
   */
  validateCORSSettings(corsConfig) {
    const issues = [];

    // Additional CORS validation logic
    if (!corsConfig.includes('origin:')) {
      issues.push({
        type: 'no-origin-specified',
        severity: 'medium',
        message: 'CORS origin not explicitly specified'
      });
    }

    return { issues };
  }

  /**
   * Analyze security headers
   * @param {string} content - Security headers file content
   * @returns {Object} Analysis result
   */
  analyzeSecurityHeaders(content) {
    const headers = [];
    const issues = [];

    // Common security headers
    const headerPatterns = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'Referrer-Policy',
      'Permissions-Policy'
    ];

    for (const header of headerPatterns) {
      if (content.includes(header)) {
        headers.push(header);
      }
    }

    // Check for potential issues
    if (content.includes('X-Frame-Options') && content.includes('ALLOWALL')) {
      issues.push({
        type: 'weak-frame-options',
        severity: 'medium',
        message: 'X-Frame-Options set to ALLOWALL'
      });
    }

    return { headers, issues };
  }

  /**
   * Get header severity level
   * @param {string} header - Header name
   * @returns {string} Severity level
   */
  getHeaderSeverity(header) {
    const highPriority = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Content-Security-Policy'
    ];

    return highPriority.includes(header) ? 'high' : 'medium';
  }

  /**
   * Validate JWT secret
   * @param {string} secret - JWT secret
   * @returns {Object} Validation result
   */
  validateJWTSecret(secret) {
    if (secret.length < 32) {
      return {
        valid: false,
        severity: 'high',
        message: 'JWT secret is too short (minimum 32 characters recommended)'
      };
    }

    if (secret.includes('change_this') || secret.includes('your_secret')) {
      return {
        valid: false,
        severity: 'high',
        message: 'JWT secret appears to be a default value'
      };
    }

    if (!/[A-Z]/.test(secret) || !/[a-z]/.test(secret) || !/[0-9]/.test(secret)) {
      return {
        valid: false,
        severity: 'medium',
        message: 'JWT secret should contain uppercase, lowercase, and numeric characters'
      };
    }

    return { valid: true };
  }

  /**
   * Analyze authentication middleware
   * @param {string} content - Auth middleware content
   * @returns {Object} Analysis result
   */
  analyzeAuthMiddleware(content) {
    const features = [];
    const issues = [];

    if (content.includes('jwt.verify') || content.includes('jsonwebtoken')) {
      features.push('jwt-verification');
    }

    if (content.includes('Bearer')) {
      features.push('bearer-token');
    }

    if (content.includes('req.user')) {
      features.push('user-attachment');
    }

    // Check for potential issues
    if (!content.includes('try') && !content.includes('catch')) {
      issues.push({
        type: 'no-error-handling',
        severity: 'medium',
        message: 'Authentication middleware lacks proper error handling'
      });
    }

    return { features, issues };
  }

  /**
   * Analyze rate limit configuration
   * @param {string} content - Rate limit file content
   * @returns {Object} Analysis result
   */
  analyzeRateLimitConfig(content) {
    const issues = [];
    let config = null;

    // Extract rate limit configuration
    const rateLimitRegex = /rateLimit\s*\(\s*({[^}]*}|\{[\s\S]*?\})\s*\)/;
    const match = content.match(rateLimitRegex);
    
    if (match) {
      config = match[1];
    }

    return { config, issues };
  }

  /**
   * Validate rate limit settings
   * @param {string} config - Rate limit configuration
   * @returns {Object} Validation result
   */
  validateRateLimitSettings(config) {
    const issues = [];

    // Check for reasonable limits
    if (config.includes('max:') && config.includes('1000')) {
      issues.push({
        type: 'high-rate-limit',
        severity: 'medium',
        message: 'Rate limit may be too high (1000+ requests)'
      });
    }

    if (!config.includes('windowMs')) {
      issues.push({
        type: 'no-time-window',
        severity: 'medium',
        message: 'Rate limit time window not specified'
      });
    }

    return { issues };
  }

  /**
   * Generate security validation message
   * @param {string} status - Overall status
   * @param {Array} results - Validation results
   * @returns {string} Status message
   */
  generateSecurityMessage(status, results) {
    const totalChecks = results.length;
    const passedChecks = results.filter(r => r.status === 'pass').length;
    const failedChecks = results.filter(r => r.status === 'fail').length;
    const warningChecks = results.filter(r => r.status === 'warning').length;

    if (status === 'pass') {
      return `All ${totalChecks} security checks passed`;
    } else if (status === 'warning') {
      return `${passedChecks}/${totalChecks} checks passed, ${warningChecks} warnings`;
    } else {
      return `${failedChecks}/${totalChecks} checks failed, ${warningChecks} warnings`;
    }
  }
}

module.exports = SecurityValidator;