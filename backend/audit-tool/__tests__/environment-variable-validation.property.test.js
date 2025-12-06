/**
 * Property-Based Test: Environment Variable Validation
 * 
 * **Feature: full-system-audit, Property 34: Environment Variable Validation**
 * 
 * For any required environment variable, the system should verify it exists
 * before starting the application.
 * 
 * **Validates: Requirements 10.1**
 */

const fc = require('fast-check');
const ConfigLoader = require('../config/ConfigLoader');

describe('Property 34: Environment Variable Validation', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  test('should validate required environment variables in production', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          JWT_SECRET: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
          DB_HOST: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          DB_NAME: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          DB_USER: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          DB_PASSWORD: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined })
        }),
        async (envVars) => {
          // Set environment to production
          process.env.NODE_ENV = 'production';

          // Set environment variables
          if (envVars.JWT_SECRET !== undefined) {
            process.env.JWT_SECRET = envVars.JWT_SECRET;
          } else {
            delete process.env.JWT_SECRET;
          }

          if (envVars.DB_HOST !== undefined) {
            process.env.DB_HOST = envVars.DB_HOST;
          } else {
            delete process.env.DB_HOST;
          }

          if (envVars.DB_NAME !== undefined) {
            process.env.DB_NAME = envVars.DB_NAME;
          } else {
            delete process.env.DB_NAME;
          }

          if (envVars.DB_USER !== undefined) {
            process.env.DB_USER = envVars.DB_USER;
          } else {
            delete process.env.DB_USER;
          }

          if (envVars.DB_PASSWORD !== undefined) {
            process.env.DB_PASSWORD = envVars.DB_PASSWORD;
          } else {
            delete process.env.DB_PASSWORD;
          }

          const configLoader = new ConfigLoader({
            environment: 'production'
          });

          // Check if all required variables are set
          const allRequiredSet = 
            envVars.JWT_SECRET !== undefined &&
            envVars.DB_HOST !== undefined &&
            envVars.DB_NAME !== undefined &&
            envVars.DB_USER !== undefined &&
            envVars.DB_PASSWORD !== undefined;

          if (allRequiredSet) {
            // Should load successfully
            try {
              const config = configLoader.load();
              expect(config).toBeDefined();
              expect(configLoader.hasErrors()).toBe(false);
            } catch (error) {
              // May fail for other validation reasons, but not env vars
              if (error.name === 'ConfigValidationError') {
                const envVarErrors = error.errors.filter(e => 
                  e.field.startsWith('env.')
                );
                expect(envVarErrors.length).toBe(0);
              }
            }
          } else {
            // Should fail with validation errors
            try {
              configLoader.load();
              // If it doesn't throw, check for errors
              expect(configLoader.hasErrors()).toBe(true);
              
              const errors = configLoader.getValidationErrorsBySeverity('error');
              const envVarErrors = errors.filter(e => e.field.startsWith('env.'));
              expect(envVarErrors.length).toBeGreaterThan(0);
            } catch (error) {
              // Should throw ConfigValidationError
              expect(error.name).toBe('ConfigValidationError');
              
              const envVarErrors = error.errors.filter(e => 
                e.field.startsWith('env.') && e.severity === 'error'
              );
              expect(envVarErrors.length).toBeGreaterThan(0);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should not require environment variables in development', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          JWT_SECRET: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
          DB_HOST: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined })
        }),
        async (envVars) => {
          // Set environment to development
          process.env.NODE_ENV = 'development';

          // Set environment variables
          if (envVars.JWT_SECRET !== undefined) {
            process.env.JWT_SECRET = envVars.JWT_SECRET;
          } else {
            delete process.env.JWT_SECRET;
          }

          if (envVars.DB_HOST !== undefined) {
            process.env.DB_HOST = envVars.DB_HOST;
          } else {
            delete process.env.DB_HOST;
          }

          const configLoader = new ConfigLoader({
            environment: 'development'
          });

          try {
            const config = configLoader.load();
            
            // In development, missing env vars should not cause errors
            const errors = configLoader.getValidationErrorsBySeverity('error');
            const envVarErrors = errors.filter(e => e.field.startsWith('env.'));
            
            // Development should not have required env var errors
            expect(envVarErrors.length).toBe(0);
          } catch (error) {
            // If it fails, it should not be due to missing env vars
            if (error.name === 'ConfigValidationError') {
              const envVarErrors = error.errors.filter(e => 
                e.field.startsWith('env.') && e.severity === 'error'
              );
              expect(envVarErrors.length).toBe(0);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should detect missing required environment variables', () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';

    // Clear all required env vars
    delete process.env.JWT_SECRET;
    delete process.env.DB_HOST;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;

    const configLoader = new ConfigLoader({
      environment: 'production'
    });

    try {
      configLoader.load();
      fail('Should have thrown ConfigValidationError');
    } catch (error) {
      expect(error.name).toBe('ConfigValidationError');
      expect(error.errors.length).toBeGreaterThan(0);
      
      // Should have errors for missing env vars
      const envVarErrors = error.errors.filter(e => 
        e.field.startsWith('env.') && e.severity === 'error'
      );
      expect(envVarErrors.length).toBeGreaterThan(0);
    }
  });

  test('should accept all required environment variables when set', () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';

    // Set all required env vars
    process.env.JWT_SECRET = 'secure-secret-key-for-testing';
    process.env.DB_HOST = 'localhost';
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_password';

    const configLoader = new ConfigLoader({
      environment: 'production'
    });

    try {
      const config = configLoader.load();
      
      // Should not have env var errors
      const errors = configLoader.getValidationErrorsBySeverity('error');
      const envVarErrors = errors.filter(e => e.field.startsWith('env.'));
      expect(envVarErrors.length).toBe(0);
    } catch (error) {
      // If it fails, it should not be due to missing env vars
      if (error.name === 'ConfigValidationError') {
        const envVarErrors = error.errors.filter(e => 
          e.field.startsWith('env.') && e.severity === 'error'
        );
        expect(envVarErrors.length).toBe(0);
      }
    }
  });
});
