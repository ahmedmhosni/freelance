/**
 * Property-Based Test: Consistent Base URL Configuration
 * 
 * **Feature: full-system-audit, Property 8: Consistent Base URL Configuration**
 * 
 * For any API call in the frontend, it should use the centralized API configuration 
 * (api.js) for base URL resolution.
 * 
 * **Validates: Requirements 2.5**
 */

const fc = require('fast-check');
const fs = require('fs');
const pathModule = require('path');
const os = require('os');
const FrontendAPIScanner = require('../scanners/FrontendAPIScanner');

describe('Property 8: Consistent Base URL Configuration', () => {
  let tempDir;
  let scanner;

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(pathModule.join(os.tmpdir(), 'api-config-test-'));
    
    // Create scanner with test config
    scanner = new FrontendAPIScanner({
      frontend: {
        srcPath: tempDir,
        apiConfigPath: pathModule.join(tempDir, 'api.js')
      }
    });
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * Arbitrary generator for base URLs
   */
  const baseURLArbitrary = fc.constantFrom(
    'http://localhost:3000/api',
    'http://localhost:5000/api',
    'https://api.example.com',
    'https://staging-api.example.com/api'
  );

  /**
   * Arbitrary generator for environment variable names
   */
  const envVarArbitrary = fc.constantFrom(
    'VITE_API_URL',
    'REACT_APP_API_URL',
    'NEXT_PUBLIC_API_URL',
    'API_BASE_URL'
  );

  /**
   * Helper function to create API config file
   */
  function createAPIConfigFile(baseURL, envVar) {
    const filePath = pathModule.join(tempDir, 'api.js');
    const content = `
import axios from 'axios';

const API_URL = import.meta.env.${envVar} || '${baseURL}';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;
`;
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * Property Test: API config file should be parseable
   */
  test('API config file can be parsed without errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(baseURLArbitrary, envVarArbitrary),
        async ([baseURL, envVar]) => {
          // Create API config file
          createAPIConfigFile(baseURL, envVar);

          // Extract configuration - should not throw
          const config = scanner.getAPIConfig();

          // Property: Config should be returned (even if some fields are null)
          expect(config).toBeDefined();
          expect(config.interceptors).toBeDefined();
          expect(config.envVars).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: API config should identify environment variables
   */
  test('API config extraction identifies environment variables', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(baseURLArbitrary, envVarArbitrary),
        async ([baseURL, envVar]) => {
          // Create API config file
          createAPIConfigFile(baseURL, envVar);

          // Extract configuration
          const config = scanner.getAPIConfig();

          // Property: Environment variable should be identified
          expect(config.envVars).toBeDefined();
          expect(Array.isArray(config.envVars)).toBe(true);
          expect(config.envVars).toContain(envVar);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: API config should detect interceptors
   */
  test('API config extraction detects request interceptors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(baseURLArbitrary, envVarArbitrary),
        async ([baseURL, envVar]) => {
          // Create API config file
          createAPIConfigFile(baseURL, envVar);

          // Extract configuration
          const config = scanner.getAPIConfig();

          // Property: Request interceptor should be detected
          expect(config.interceptors).toBeDefined();
          expect(config.interceptors.request).toBeDefined();
          expect(Array.isArray(config.interceptors.request)).toBe(true);
          expect(config.interceptors.request.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: All API calls using centralized config should have hasBaseURL=true
   */
  test('API calls using centralized config are marked with hasBaseURL', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          baseURLArbitrary,
          envVarArbitrary,
          fc.constantFrom('get', 'post', 'put', 'delete'),
          fc.constantFrom('/users', '/clients', '/projects', '/tasks')
        ),
        async ([baseURL, envVar, method, path]) => {
          // Create API config file
          createAPIConfigFile(baseURL, envVar);

          // Create component file using the API config
          const componentPath = pathModule.join(tempDir, 'TestComponent.jsx');
          const componentContent = `
import api from './api';

function TestComponent() {
  const fetchData = async () => {
    const response = await api.${method}('${path}');
    return response.data;
  };
  return null;
}

export default TestComponent;
`;
          fs.writeFileSync(componentPath, componentContent, 'utf-8');

          // Scan for API calls
          const apiCalls = scanner.scanAPICalls();

          // Property: All API calls should have hasBaseURL=true
          expect(apiCalls.length).toBeGreaterThan(0);
          
          for (const call of apiCalls) {
            expect(call.hasBaseURL).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Direct axios calls should have hasBaseURL=false
   */
  test('direct axios calls without centralized config have hasBaseURL=false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom('get', 'post', 'put', 'delete'),
          fc.constantFrom('http://localhost:3000/api/users', 'https://api.example.com/clients')
        ),
        async ([method, fullURL]) => {
          // Create component file with direct axios call (not using api.js)
          const componentPath = pathModule.join(tempDir, 'DirectAxiosComponent.jsx');
          const componentContent = `
import axios from 'axios';

function DirectAxiosComponent() {
  const fetchData = async () => {
    const response = await axios.${method}('${fullURL}');
    return response.data;
  };
  return null;
}

export default DirectAxiosComponent;
`;
          fs.writeFileSync(componentPath, componentContent, 'utf-8');

          // Scan for API calls
          const apiCalls = scanner.scanAPICalls();

          // Property: Direct axios calls should have hasBaseURL=false
          expect(apiCalls.length).toBeGreaterThan(0);
          
          for (const call of apiCalls) {
            expect(call.hasBaseURL).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Config extraction should handle missing config file gracefully
   */
  test('config extraction handles missing config file', async () => {
    // Don't create API config file

    // Extract configuration
    const config = scanner.getAPIConfig();

    // Property: Should return empty/default config without throwing
    expect(config).toBeDefined();
    expect(config.baseURL).toBeNull();
    expect(config.envVars).toBeDefined();
    expect(Array.isArray(config.envVars)).toBe(true);
    expect(config.interceptors).toBeDefined();
  });
});
