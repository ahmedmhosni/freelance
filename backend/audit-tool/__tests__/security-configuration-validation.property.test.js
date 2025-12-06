/**
 * Property-Based Test: Security Configuration Validation
 * 
 * **Feature: full-system-audit, Property 36: Security Configuration Validation**
 * 
 * For any production environment, security features (HTTPS, helmet, CORS) should be
 * enabled and properly configured.
 * 
 * **Validates: Requirements 10.5**
 */

const fc = require('fast-check');
const ConfigLoader = require('../config/ConfigLoader');

describe('Property 36: Security Configuration Validation', () => {
  // Save original environment
  let originalEnv;

  beforeEach(() => {
    // Save current environment before each test
    originalEnv = {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD
    };
  });

  afterEach(() => {
    // Restore original environment after each test
    if (originalEnv.NODE_ENV !== undefined) {
      process.env.NODE_ENV = originalEnv.NODE_ENV;
    } else {
      delete process.env.NODE_ENV;
    }
    
    if (originalEnv.JWT_SECRET !== undefined) {
      process.env.JWT_SECRET = originalEnv.JWT_SECRET;
    } else {
      delete process.env.JWT_SECRET;
    }
    
    if (originalEnv.DB_HOST !== undefined) {
      process.env.DB_HOST = originalEnv.DB_HOST;
    } else {
      delete process.env.DB_HOST;
    }
    
    if (originalEnv.DB_NAME !== undefined) {
      process.env.DB_NAME = originalEnv.DB_NAME;
    } else {
      delete process.env.DB_NAME;
    }
    
    if (originalEnv.DB_USER !== undefined) {
      process.env.DB_USER = originalEnv.DB_USER;
    } else {
      delete process.env.DB_USER;
    }
    
    if (originalEnv.DB_PASSWORD !== undefined) {
      process.env.DB_PASSWORD = originalEnv.DB_PASSWORD;
    } else {
      delete process.env.DB_PASSWORD;
    }
  });

  test('should require secure JWT secret in production', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('test-secret-key'),
          fc.constant(''),
          fc.string({ minLength: 20, maxLength: 100 })
        ),
        async (jwtSecret) => {
          // Set environment to production with all required vars
          process.env.NODE_ENV = 'production';
          process.env.JWT_SECRET = jwtSecret;
          process.env.DB_HOST = 'localhost';
          process.env.DB_NAME = 'test_db';
          process.env.DB_USER = 'test_user';
          process.env.DB_PASSWORD = 'test_password';

          const configLoader = new ConfigLoader({
            environment: 'production'
          });

          const isSecure = jwtSecret.length >= 20 && jwtSecret !== 'test-secret-key';

          try {
            configLoader.load();
            
            if (isSecure) {
              // Should not have security errors for JWT secret
              const errors = configLoader.getValidationErrorsBySeverity('error');
              const jwtErrors = errors.filter(e => 
                e.field === 'security.jwtSecret' || e.field === 'env.JWT_SECRET'
              );
              expect(jwtErrors.length).toBe(0);
            } else {
              // Should have security errors
              const errors = configLoader.getValidationErrorsBySeverity('error');
              const jwtErrors = errors.filter(e => 
                e.field === 'security.jwtSecret' || e.field === 'env.JWT_SECRET'
              );
              expect(jwtErrors.length).toBeGreaterThan(0);
            }
          } catch (error) {
            if (error.name === 'ConfigValidationError') {
              if (!isSecure) {
                const jwtErrors = error.errors.filter(e => 
                  (e.field === 'security.jwtSecret' || e.field === 'env.JWT_SECRET') && e.severity === 'error'
                );
                expect(jwtErrors.length).toBeGreaterThan(0);
              }
            } else {
              // Unexpected error, rethrow
              throw error;
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should warn about disabled SSL verification in production', () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'secure-production-secret-key-12345';

    const configLoader = new ConfigLoader({
      environment: 'production'
    });

    try {
      const config = configLoader.load();
      
      // If rejectUnauthorized is false in production, should have warnings
      if (config.security.rejectUnauthorized === false) {
        const warnings = configLoader.getValidationErrorsBySeverity('warning');
        const sslWarnings = warnings.filter(w => 
          w.field === 'security.rejectUnauthorized'
        );
        expect(sslWarnings.length).toBeGreaterThan(0);
      }
    } catch (error) {
      // May fail for other reasons, but check for SSL warnings if ConfigValidationError
      if (error.name === 'ConfigValidationError') {
        const warnings = error.errors.filter(e => 
          e.field === 'security.rejectUnauthorized' && e.severity === 'warning'
        );
        // Should have warning about SSL
        expect(warnings.length).toBeGreaterThan(0);
      }
    }
  });

  test('should not require secure JWT secret in development', () => {
    // Set environment to development
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'test-secret-key';

    const configLoader = new ConfigLoader({
      environment: 'development'
    });

    try {
      const config = configLoader.load();
      
      // In development, test secrets should be allowed
      const errors = configLoader.getValidationErrorsBySeverity('error');
      const jwtErrors = errors.filter(e => 
        e.field === 'security.jwtSecret'
      );
      expect(jwtErrors.length).toBe(0);
    } catch (error) {
      if (error.name === 'ConfigValidationError') {
        const jwtErrors = error.errors.filter(e => 
          e.field === 'security.jwtSecret' && e.severity === 'error'
        );
        expect(jwtErrors.length).toBe(0);
      }
    }
  });

  test('should reject insecure JWT secrets in production', () => {
    const insecureSecrets = [
      'test-secret-key',
      '',
      'short',
      '12345',
      'password'
    ];

    for (const secret of insecureSecrets) {
      // Set environment to production with all required vars
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = secret;
      process.env.DB_HOST = 'localhost';
      process.env.DB_NAME = 'test_db';
      process.env.DB_USER = 'test_user';
      process.env.DB_PASSWORD = 'test_password';

      const configLoader = new ConfigLoader({
        environment: 'production'
      });

      try {
        configLoader.load();
        
        // Should have security errors
        const errors = configLoader.getValidationErrorsBySeverity('error');
        const jwtErrors = errors.filter(e => 
          e.field === 'security.jwtSecret' || e.field === 'env.JWT_SECRET'
        );
        expect(jwtErrors.length).toBeGreaterThan(0);
      } catch (error) {
        expect(error.name).toBe('ConfigValidationError');
        
        const jwtErrors = error.errors.filter(e => 
          (e.field === 'security.jwtSecret' || e.field === 'env.JWT_SECRET') && e.severity === 'error'
        );
        expect(jwtErrors.length).toBeGreaterThan(0);
      }
    }
  });

  test('should validate JWT secret from config in production', () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';
    // Don't set JWT_SECRET so it falls back to config default 'test-secret-key'
    delete process.env.JWT_SECRET;
    // Set required production env vars
    process.env.DB_HOST = 'localhost';
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_password';

    const configLoader = new ConfigLoader({
      environment: 'production'
    });

    // The default config has 'test-secret-key' which should fail in production
    try {
      configLoader.load();
      
      // Should have JWT secret errors for insecure default
      const errors = configLoader.getValidationErrorsBySeverity('error');
      const jwtErrors = errors.filter(e => 
        e.field === 'security.jwtSecret' || e.field === 'env.JWT_SECRET'
      );
      expect(jwtErrors.length).toBeGreaterThan(0);
    } catch (error) {
      expect(error.name).toBe('ConfigValidationError');
      
      const jwtErrors = error.errors.filter(e => 
        (e.field === 'security.jwtSecret' || e.field === 'env.JWT_SECRET') && e.severity === 'error'
      );
      expect(jwtErrors.length).toBeGreaterThan(0);
    }
  });
});
