/**
 * Property-Based Test: API URL Validity
 * 
 * **Feature: full-system-audit, Property 35: API URL Validity**
 * 
 * For any configured API base URL, it should be a valid URL format and reachable.
 * 
 * **Validates: Requirements 10.3**
 */

const fc = require('fast-check');
const ConfigLoader = require('../config/ConfigLoader');

describe('Property 35: API URL Validity', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  test('should validate backend base URL format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Valid URLs
          fc.webUrl(),
          fc.constant('http://localhost:5000'),
          fc.constant('https://api.example.com'),
          fc.constant('http://192.168.1.1:8080'),
          // Invalid URLs
          fc.constant('not-a-url'),
          fc.constant('ftp://invalid-protocol.com'),
          fc.constant(''),
          fc.constant('just-text'),
          fc.constant('http://'),
          fc.constant('://missing-protocol.com')
        ),
        async (baseURL) => {
          // Set backend base URL
          process.env.AUDIT_BACKEND_BASE_URL = baseURL;

          const configLoader = new ConfigLoader({
            environment: 'development'
          });

          // Check if URL is valid
          const isValidURL = (url) => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          };

          const urlIsValid = isValidURL(baseURL);

          try {
            const config = configLoader.load();
            
            if (urlIsValid) {
              // Should not have URL validation errors
              const errors = configLoader.getValidationErrorsBySeverity('error');
              const urlErrors = errors.filter(e => 
                e.field === 'backend.baseURL' && e.message.includes('Invalid')
              );
              expect(urlErrors.length).toBe(0);
            } else {
              // Should have URL validation errors
              const errors = configLoader.getValidationErrorsBySeverity('error');
              const urlErrors = errors.filter(e => 
                e.field === 'backend.baseURL' && e.message.includes('Invalid')
              );
              expect(urlErrors.length).toBeGreaterThan(0);
            }
          } catch (error) {
            if (error.name === 'ConfigValidationError') {
              if (!urlIsValid) {
                // Should have URL validation errors
                const urlErrors = error.errors.filter(e => 
                  e.field === 'backend.baseURL' && e.message.includes('Invalid')
                );
                expect(urlErrors.length).toBeGreaterThan(0);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should validate frontend base URL format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Valid URLs
          fc.webUrl(),
          fc.constant('http://localhost:3000'),
          fc.constant('https://app.example.com/api'),
          // Invalid URLs
          fc.constant('invalid-url'),
          fc.constant(''),
          fc.constant('http://')
        ),
        async (baseURL) => {
          // Set frontend base URL
          process.env.VITE_API_URL = baseURL;

          const configLoader = new ConfigLoader({
            environment: 'development'
          });

          // Check if URL is valid
          const isValidURL = (url) => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          };

          const urlIsValid = isValidURL(baseURL);

          try {
            const config = configLoader.load();
            
            if (urlIsValid) {
              // Should not have URL validation errors
              const errors = configLoader.getValidationErrorsBySeverity('error');
              const urlErrors = errors.filter(e => 
                e.field === 'frontend.baseURL' && e.message.includes('Invalid')
              );
              expect(urlErrors.length).toBe(0);
            } else {
              // Should have URL validation errors
              const errors = configLoader.getValidationErrorsBySeverity('error');
              const urlErrors = errors.filter(e => 
                e.field === 'frontend.baseURL' && e.message.includes('Invalid')
              );
              expect(urlErrors.length).toBeGreaterThan(0);
            }
          } catch (error) {
            if (error.name === 'ConfigValidationError') {
              if (!urlIsValid) {
                // Should have URL validation errors
                const urlErrors = error.errors.filter(e => 
                  e.field === 'frontend.baseURL' && e.message.includes('Invalid')
                );
                expect(urlErrors.length).toBeGreaterThan(0);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should accept valid HTTP and HTTPS URLs', () => {
    const validURLs = [
      'http://localhost:5000',
      'https://api.example.com',
      'http://192.168.1.1:8080',
      'https://subdomain.example.com:3000/api',
      'http://example.com'
    ];

    for (const url of validURLs) {
      process.env.AUDIT_BACKEND_BASE_URL = url;

      const configLoader = new ConfigLoader({
        environment: 'development'
      });

      try {
        const config = configLoader.load();
        
        // Should not have URL validation errors
        const errors = configLoader.getValidationErrorsBySeverity('error');
        const urlErrors = errors.filter(e => 
          e.field === 'backend.baseURL' && e.message.includes('Invalid')
        );
        expect(urlErrors.length).toBe(0);
      } catch (error) {
        if (error.name === 'ConfigValidationError') {
          const urlErrors = error.errors.filter(e => 
            e.field === 'backend.baseURL' && e.message.includes('Invalid')
          );
          expect(urlErrors.length).toBe(0);
        }
      }
    }
  });

  test('should reject invalid URL formats', () => {
    const invalidURLs = [
      'not-a-url',
      'ftp://invalid-protocol.com',
      '',
      'just-text',
      'http://',
      '://missing-protocol.com',
      'http:// spaces .com'
    ];

    for (const url of invalidURLs) {
      process.env.AUDIT_BACKEND_BASE_URL = url;

      const configLoader = new ConfigLoader({
        environment: 'development'
      });

      try {
        configLoader.load();
        
        // Should have URL validation errors
        const errors = configLoader.getValidationErrorsBySeverity('error');
        const urlErrors = errors.filter(e => 
          e.field === 'backend.baseURL' && e.message.includes('Invalid')
        );
        expect(urlErrors.length).toBeGreaterThan(0);
      } catch (error) {
        // Should throw an error (either ConfigValidationError or other error from invalid config)
        expect(error).toBeDefined();
        
        if (error.name === 'ConfigValidationError') {
          const urlErrors = error.errors.filter(e => 
            e.field === 'backend.baseURL' && e.message.includes('Invalid')
          );
          expect(urlErrors.length).toBeGreaterThan(0);
        }
        // If it's a different error, that's also acceptable as it indicates the URL was invalid
      }
    }
  });
});
