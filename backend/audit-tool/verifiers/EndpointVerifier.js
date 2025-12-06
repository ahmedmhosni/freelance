/**
 * EndpointVerifier
 * 
 * Verifies HTTP endpoints by testing individual routes, authentication flows,
 * CRUD operations, and validation error handling.
 */

const axios = require('axios');
const logger = require('../utils/logger');
const { createVerificationResult } = require('../models/VerificationResult');

class EndpointVerifier {
  /**
   * Creates a new EndpointVerifier instance
   * @param {Object} config - Configuration object
   * @param {string} config.baseURL - Base URL for API requests
   * @param {number} config.timeout - Request timeout in milliseconds
   * @param {number} config.retries - Number of retries for failed requests
   */
  constructor(config) {
    this.config = config;
    this.baseURL = config.baseURL || 'http://localhost:5000';
    this.timeout = config.timeout || 5000;
    this.retries = config.retries || 3;
    this.authToken = null;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      validateStatus: () => true // Don't throw on any status code
    });
  }

  /**
   * Sets the authentication token for subsequent requests
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Clears the authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Tests a single endpoint
   * @param {Object} route - Route information
   * @param {Object} context - Test context (auth, data)
   * @returns {Promise<Object>} Verification result
   */
  async verifyEndpoint(route, context = {}) {
    const startTime = Date.now();
    
    try {
      // Prepare request configuration
      const requestConfig = {
        method: route.method.toLowerCase(),
        url: route.path,
        headers: {
          'Content-Type': 'application/json',
          ...context.headers
        }
      };

      // Add authentication if required
      if (route.requiresAuth && this.authToken) {
        requestConfig.headers['Authorization'] = `Bearer ${this.authToken}`;
      } else if (route.requiresAuth && context.token) {
        requestConfig.headers['Authorization'] = `Bearer ${context.token}`;
      }

      // Add request body if provided
      if (context.body) {
        requestConfig.data = context.body;
      }

      // Add query parameters if provided
      if (context.query) {
        requestConfig.params = context.query;
      }

      logger.debug(`Testing endpoint: ${route.method} ${route.path}`);

      // Make the request
      const response = await this.client.request(requestConfig);
      const responseTime = Date.now() - startTime;

      // Determine success based on status code
      const success = response.status >= 200 && response.status < 300;

      const result = createVerificationResult({
        route,
        success,
        statusCode: response.status,
        responseTime,
        timestamp: new Date().toISOString(),
        request: {
          method: route.method,
          path: route.path,
          headers: requestConfig.headers,
          body: context.body || {}
        },
        response: {
          status: response.status,
          headers: response.headers,
          body: response.data
        },
        errors: success ? [] : [`Request failed with status ${response.status}`]
      });

      logger.info(`Endpoint ${route.method} ${route.path}: ${success ? 'PASS' : 'FAIL'} (${responseTime}ms)`);

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error(`Endpoint verification failed for ${route.method} ${route.path}:`, error.message);

      return createVerificationResult({
        route,
        success: false,
        statusCode: error.response?.status || 0,
        responseTime,
        timestamp: new Date().toISOString(),
        request: {
          method: route.method,
          path: route.path,
          headers: {},
          body: context.body || {}
        },
        response: {
          status: error.response?.status || 0,
          headers: error.response?.headers || {},
          body: error.response?.data || {}
        },
        errors: [error.message]
      });
    }
  }

  /**
   * Tests authentication flow (register, login, protected route, logout)
   * @returns {Promise<Object>} Authentication test results
   */
  async verifyAuthFlow() {
    const results = {
      register: { success: false, error: null },
      login: { success: false, error: null, token: null },
      protectedRoute: { success: false, error: null },
      logout: { success: false, error: null },
      timestamp: new Date().toISOString()
    };

    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User'
    };

    let userId = null;

    try {
      // Test REGISTER
      try {
        logger.debug('Testing user registration...');
        
        const registerResponse = await this.client.post('/api/auth/register', testUser);
        
        if (registerResponse.status === 201 || registerResponse.status === 200) {
          results.register.success = true;
          userId = registerResponse.data.user?.id || registerResponse.data.id;
          logger.info('Registration test: PASS');
        } else {
          results.register.error = `Registration failed with status ${registerResponse.status}`;
          logger.warn(`Registration test: FAIL (${registerResponse.status})`);
        }
      } catch (error) {
        results.register.error = error.message;
        logger.error('Registration test failed:', error.message);
        return results; // Can't continue without registration
      }

      // Test LOGIN
      try {
        logger.debug('Testing user login...');
        
        const loginResponse = await this.client.post('/api/auth/login', {
          email: testUser.email,
          password: testUser.password
        });
        
        if (loginResponse.status === 200 && loginResponse.data.token) {
          results.login.success = true;
          results.login.token = loginResponse.data.token;
          this.setAuthToken(loginResponse.data.token);
          logger.info('Login test: PASS');
        } else {
          results.login.error = `Login failed with status ${loginResponse.status}`;
          logger.warn(`Login test: FAIL (${loginResponse.status})`);
          return results; // Can't continue without token
        }
      } catch (error) {
        results.login.error = error.message;
        logger.error('Login test failed:', error.message);
        return results;
      }

      // Test PROTECTED ROUTE
      try {
        logger.debug('Testing protected route access...');
        
        const protectedResponse = await this.client.get('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        if (protectedResponse.status === 200) {
          results.protectedRoute.success = true;
          logger.info('Protected route test: PASS');
        } else {
          results.protectedRoute.error = `Protected route failed with status ${protectedResponse.status}`;
          logger.warn(`Protected route test: FAIL (${protectedResponse.status})`);
        }
      } catch (error) {
        results.protectedRoute.error = error.message;
        logger.error('Protected route test failed:', error.message);
      }

      // Test LOGOUT
      try {
        logger.debug('Testing user logout...');
        
        const logoutResponse = await this.client.post('/api/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        if (logoutResponse.status === 200 || logoutResponse.status === 204) {
          results.logout.success = true;
          this.clearAuthToken();
          logger.info('Logout test: PASS');
        } else {
          results.logout.error = `Logout failed with status ${logoutResponse.status}`;
          logger.warn(`Logout test: FAIL (${logoutResponse.status})`);
        }
      } catch (error) {
        results.logout.error = error.message;
        logger.error('Logout test failed:', error.message);
      }

    } catch (error) {
      logger.error('Authentication flow verification failed:', error.message);
      results.error = error.message;
    } finally {
      // Cleanup: Try to delete test user if created
      if (userId && this.authToken) {
        try {
          await this.client.delete(`/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${this.authToken}`
            }
          });
          logger.debug('Test user cleaned up');
        } catch (error) {
          logger.warn('Failed to cleanup test user:', error.message);
        }
      }
    }

    return results;
  }

  /**
   * Tests CRUD operations for a module
   * @param {string} moduleName - Module to test (e.g., 'clients', 'projects')
   * @param {Object} testData - Test data for create operation
   * @returns {Promise<Object>} CRUD test results
   */
  async verifyCRUDOperations(moduleName, testData) {
    const results = {
      module: moduleName,
      create: { success: false, error: null, data: null },
      read: { success: false, error: null, data: null },
      update: { success: false, error: null, data: null },
      delete: { success: false, error: null },
      timestamp: new Date().toISOString()
    };

    let createdId = null;

    try {
      const basePath = `/api/${moduleName}`;

      // Test CREATE
      try {
        logger.debug(`Testing CREATE for ${moduleName}...`);
        
        const createResponse = await this.client.post(basePath, testData, {
          headers: this.authToken ? {
            'Authorization': `Bearer ${this.authToken}`
          } : {}
        });
        
        if (createResponse.status === 201 || createResponse.status === 200) {
          results.create.success = true;
          results.create.data = createResponse.data;
          createdId = createResponse.data.id || createResponse.data[moduleName.slice(0, -1)]?.id;
          logger.info(`CREATE test for ${moduleName}: PASS`);
        } else {
          results.create.error = `Create failed with status ${createResponse.status}`;
          logger.warn(`CREATE test for ${moduleName}: FAIL (${createResponse.status})`);
          return results; // Can't continue without create
        }
      } catch (error) {
        results.create.error = error.message;
        logger.error(`CREATE test for ${moduleName} failed:`, error.message);
        return results;
      }

      // Test READ
      try {
        logger.debug(`Testing READ for ${moduleName}...`);
        
        const readResponse = await this.client.get(`${basePath}/${createdId}`, {
          headers: this.authToken ? {
            'Authorization': `Bearer ${this.authToken}`
          } : {}
        });
        
        if (readResponse.status === 200) {
          results.read.success = true;
          results.read.data = readResponse.data;
          logger.info(`READ test for ${moduleName}: PASS`);
        } else {
          results.read.error = `Read failed with status ${readResponse.status}`;
          logger.warn(`READ test for ${moduleName}: FAIL (${readResponse.status})`);
        }
      } catch (error) {
        results.read.error = error.message;
        logger.error(`READ test for ${moduleName} failed:`, error.message);
      }

      // Test UPDATE
      try {
        logger.debug(`Testing UPDATE for ${moduleName}...`);
        
        // Modify the first field in testData
        const updateData = { ...testData };
        const firstKey = Object.keys(updateData)[0];
        if (firstKey) {
          updateData[firstKey] = `${updateData[firstKey]}_updated`;
        }
        
        const updateResponse = await this.client.put(`${basePath}/${createdId}`, updateData, {
          headers: this.authToken ? {
            'Authorization': `Bearer ${this.authToken}`
          } : {}
        });
        
        if (updateResponse.status === 200) {
          results.update.success = true;
          results.update.data = updateResponse.data;
          logger.info(`UPDATE test for ${moduleName}: PASS`);
        } else {
          results.update.error = `Update failed with status ${updateResponse.status}`;
          logger.warn(`UPDATE test for ${moduleName}: FAIL (${updateResponse.status})`);
        }
      } catch (error) {
        results.update.error = error.message;
        logger.error(`UPDATE test for ${moduleName} failed:`, error.message);
      }

      // Test DELETE
      try {
        logger.debug(`Testing DELETE for ${moduleName}...`);
        
        const deleteResponse = await this.client.delete(`${basePath}/${createdId}`, {
          headers: this.authToken ? {
            'Authorization': `Bearer ${this.authToken}`
          } : {}
        });
        
        if (deleteResponse.status === 200 || deleteResponse.status === 204) {
          results.delete.success = true;
          
          // Verify deletion by trying to read
          const verifyResponse = await this.client.get(`${basePath}/${createdId}`, {
            headers: this.authToken ? {
              'Authorization': `Bearer ${this.authToken}`
            } : {}
          });
          
          if (verifyResponse.status === 404) {
            logger.info(`DELETE test for ${moduleName}: PASS`);
          } else {
            results.delete.success = false;
            results.delete.error = 'Record still exists after delete';
            logger.warn(`DELETE test for ${moduleName}: FAIL (record still exists)`);
          }
        } else {
          results.delete.error = `Delete failed with status ${deleteResponse.status}`;
          logger.warn(`DELETE test for ${moduleName}: FAIL (${deleteResponse.status})`);
        }
      } catch (error) {
        results.delete.error = error.message;
        logger.error(`DELETE test for ${moduleName} failed:`, error.message);
      }

    } catch (error) {
      logger.error(`CRUD verification failed for ${moduleName}:`, error.message);
      results.error = error.message;
    }

    return results;
  }

  /**
   * Tests validation error handling
   * @param {string} path - Endpoint path
   * @param {string} method - HTTP method
   * @param {Object} invalidData - Invalid data to send
   * @returns {Promise<Object>} Validation test result
   */
  async verifyValidationErrors(path, method, invalidData) {
    const result = {
      path,
      method,
      success: false,
      statusCode: 0,
      hasErrorMessage: false,
      errorMessage: null,
      timestamp: new Date().toISOString()
    };

    try {
      logger.debug(`Testing validation errors for ${method} ${path}...`);
      
      const response = await this.client.request({
        method: method.toLowerCase(),
        url: path,
        data: invalidData,
        headers: this.authToken ? {
          'Authorization': `Bearer ${this.authToken}`
        } : {}
      });

      result.statusCode = response.status;

      // Validation errors should return 400-level status codes
      if (response.status >= 400 && response.status < 500) {
        result.success = true;
        
        // Check if error message is descriptive
        if (response.data && (response.data.error || response.data.message || response.data.errors)) {
          result.hasErrorMessage = true;
          result.errorMessage = response.data.error || response.data.message || JSON.stringify(response.data.errors);
        }
        
        logger.info(`Validation error test for ${method} ${path}: PASS`);
      } else {
        result.error = `Expected 400-level status, got ${response.status}`;
        logger.warn(`Validation error test for ${method} ${path}: FAIL (status ${response.status})`);
      }

    } catch (error) {
      result.error = error.message;
      logger.error(`Validation error test failed for ${method} ${path}:`, error.message);
    }

    return result;
  }

  /**
   * Tests foreign key constraint handling
   * @param {string} path - Endpoint path
   * @param {Object} dataWithInvalidFK - Data with invalid foreign key
   * @returns {Promise<Object>} Foreign key test result
   */
  async verifyForeignKeyConstraints(path, dataWithInvalidFK) {
    const result = {
      path,
      success: false,
      statusCode: 0,
      constraintViolationDetected: false,
      errorMessage: null,
      timestamp: new Date().toISOString()
    };

    try {
      logger.debug(`Testing foreign key constraints for ${path}...`);
      
      const response = await this.client.post(path, dataWithInvalidFK, {
        headers: this.authToken ? {
          'Authorization': `Bearer ${this.authToken}`
        } : {}
      });

      result.statusCode = response.status;

      // Foreign key violations should return 400 or 409 status
      if (response.status === 400 || response.status === 409 || response.status === 422) {
        result.success = true;
        result.constraintViolationDetected = true;
        
        if (response.data && (response.data.error || response.data.message)) {
          result.errorMessage = response.data.error || response.data.message;
        }
        
        logger.info(`Foreign key constraint test for ${path}: PASS`);
      } else if (response.status === 201 || response.status === 200) {
        result.error = 'Record created with invalid foreign key (constraint not enforced)';
        logger.warn(`Foreign key constraint test for ${path}: FAIL (constraint not enforced)`);
      } else {
        result.error = `Unexpected status ${response.status}`;
        logger.warn(`Foreign key constraint test for ${path}: FAIL (status ${response.status})`);
      }

    } catch (error) {
      result.error = error.message;
      logger.error(`Foreign key constraint test failed for ${path}:`, error.message);
    }

    return result;
  }
}

module.exports = EndpointVerifier;
