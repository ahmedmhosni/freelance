/**
 * Property-Based Test: API Call Discovery Completeness
 * 
 * **Feature: full-system-audit, Property 7: API Call Discovery Completeness**
 * 
 * For any file in the frontend codebase that makes API calls, the scanner 
 * should identify all API integration points in that file.
 * 
 * **Validates: Requirements 2.3**
 */

const fc = require('fast-check');
const fs = require('fs');
const pathModule = require('path');
const os = require('os');
const FrontendAPIScanner = require('../scanners/FrontendAPIScanner');

describe('Property 7: API Call Discovery Completeness', () => {
  let tempDir;
  let scanner;

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(pathModule.join(os.tmpdir(), 'api-scanner-test-'));
    
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
   * Helper function to create a test file with API calls
   * @param {string} filename
   * @param {Array<{method: string, path: string}>} apiCalls
   * @returns {string} File path
   */
  function createTestFile(filename, apiCalls) {
    const filePath = pathModule.join(tempDir, filename);
    
    // Generate file content with API calls
    const imports = `import api from './api';\n\n`;
    const componentName = pathModule.basename(filename, pathModule.extname(filename));
    const component = `function ${componentName}() {\n`;
    const calls = apiCalls.map((call, index) => 
      `  const call${index} = async () => {\n` +
      `    const response = await api.${call.method}('${call.path}');\n` +
      `    return response.data;\n` +
      `  };\n`
    ).join('\n');
    const closing = `\n  return null;\n}\n\nexport default ${componentName};`;
    
    const content = imports + component + calls + closing;
    
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Arbitrary generator for HTTP methods
   */
  const httpMethodArbitrary = fc.constantFrom('get', 'post', 'put', 'delete', 'patch');

  /**
   * Arbitrary generator for API paths
   */
  const apiPathArbitrary = fc.tuple(
    fc.constantFrom('users', 'clients', 'projects', 'tasks', 'invoices', 'reports'),
    fc.option(fc.constantFrom('id', 'status', 'details'), { nil: null })
  ).map(([base, param]) => {
    if (param) {
      return `/${base}/:${param}`;
    }
    return `/${base}`;
  });

  /**
   * Arbitrary generator for a single API call
   */
  const apiCallArbitrary = fc.record({
    method: httpMethodArbitrary,
    path: apiPathArbitrary
  });

  /**
   * Property Test: All API calls in a file should be discovered
   */
  test('scanner discovers all API calls in a file', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(apiCallArbitrary, { minLength: 1, maxLength: 10 }),
        async (apiCallDefinitions) => {
          // Remove duplicates
          const uniqueCalls = [];
          const seen = new Set();
          
          for (const call of apiCallDefinitions) {
            const key = `${call.method}:${call.path}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueCalls.push(call);
            }
          }

          // Create test file with API calls
          const filename = 'TestComponent.jsx';
          createTestFile(filename, uniqueCalls);

          // Scan for API calls
          const discoveredCalls = scanner.scanAPICalls();

          // Property: Number of discovered calls should equal number of defined calls
          expect(discoveredCalls.length).toBe(uniqueCalls.length);

          // Property: Each defined call should be discovered
          for (const definedCall of uniqueCalls) {
            const isDiscovered = discoveredCalls.some(
              discovered => 
                discovered.method === definedCall.method &&
                discovered.path === definedCall.path
            );

            expect(isDiscovered).toBe(true);
          }

          // Property: All discovered calls should have required metadata
          for (const discovered of discoveredCalls) {
            expect(discovered.file).toBeDefined();
            expect(discovered.line).toBeGreaterThan(0);
            expect(discovered.method).toBeDefined();
            expect(discovered.path).toBeDefined();
            expect(discovered.component).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Scanner should handle template literals correctly
   */
  test('scanner discovers API calls with template literals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          httpMethodArbitrary,
          fc.constantFrom('users', 'clients', 'projects'),
          fc.constantFrom('id', 'userId', 'clientId')
        ),
        async ([method, resource, paramName]) => {
          // Create file with template literal API call
          const filePath = pathModule.join(tempDir, 'TemplateTest.jsx');
          const content = `
import api from './api';

function TemplateTest() {
  const ${paramName} = 123;
  const fetchData = async () => {
    const response = await api.${method}(\`/${resource}/\${${paramName}}\`);
    return response.data;
  };
  return null;
}

export default TemplateTest;
`;
          fs.writeFileSync(filePath, content, 'utf-8');

          // Scan for API calls
          const discoveredCalls = scanner.scanAPICalls();

          // Property: Template literal call should be discovered
          expect(discoveredCalls.length).toBeGreaterThan(0);

          const call = discoveredCalls[0];
          expect(call.method).toBe(method);
          expect(call.path).toContain(`/${resource}/`);
          expect(call.path).toContain(`:${paramName}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Scanner should handle multiple files correctly
   */
  test('scanner discovers API calls across multiple files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, maxLength: 3 }),
        fc.array(apiCallArbitrary, { minLength: 1, maxLength: 3 }),
        async (fileCount, apiCalls) => {
          // Clean temp directory before creating new files
          const existingFiles = fs.readdirSync(tempDir);
          existingFiles.forEach(file => {
            const filePath = pathModule.join(tempDir, file);
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
            }
          });

          // Remove duplicates from API calls
          const uniqueCalls = [];
          const seen = new Set();
          
          for (const call of apiCalls) {
            const key = `${call.method}:${call.path}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueCalls.push(call);
            }
          }

          // Create a single test file
          const filename = 'MultiFileTest.jsx';
          createTestFile(filename, uniqueCalls);

          // Scan all files
          const discoveredCalls = scanner.scanAPICalls();

          // Property: Total discovered calls should match total defined calls
          expect(discoveredCalls.length).toBe(uniqueCalls.length);

          // Property: All discovered calls should be from our test file
          for (const discovered of discoveredCalls) {
            expect(discovered.file).toContain(filename);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Scanner should correctly identify component names
   */
  test('scanner extracts correct component names from file paths', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom('UserList', 'ClientDetail', 'ProjectView', 'TaskManager'),
          apiCallArbitrary
        ),
        async ([componentName, apiCall]) => {
          // Clean temp directory before creating new file
          const existingFiles = fs.readdirSync(tempDir);
          existingFiles.forEach(file => {
            const filePath = pathModule.join(tempDir, file);
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
            }
          });

          // Create file with specific component name
          const filename = `${componentName}.jsx`;
          createTestFile(filename, [apiCall]);

          // Scan for API calls
          const discoveredCalls = scanner.scanAPICalls();

          // Property: Component name should match filename (without extension)
          expect(discoveredCalls.length).toBe(1);
          expect(discoveredCalls[0].component).toBe(componentName);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Scanner should handle direct axios calls
   */
  test('scanner discovers direct axios calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(httpMethodArbitrary, apiPathArbitrary),
        async ([method, apiPath]) => {
          // Create file with direct axios call
          const filePath = pathModule.join(tempDir, 'AxiosTest.jsx');
          const content = `
import axios from 'axios';

function AxiosTest() {
  const fetchData = async () => {
    const response = await axios.${method}('${apiPath}');
    return response.data;
  };
  return null;
}

export default AxiosTest;
`;
          fs.writeFileSync(filePath, content, 'utf-8');

          // Scan for API calls
          const discoveredCalls = scanner.scanAPICalls();

          // Property: Direct axios call should be discovered
          expect(discoveredCalls.length).toBeGreaterThan(0);
          
          const call = discoveredCalls[0];
          expect(call.method).toBe(method);
          expect(call.path).toBe(apiPath);
          expect(call.hasBaseURL).toBe(false); // Direct axios calls don't use base URL
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Scanner should handle fetch calls
   */
  test('scanner discovers fetch API calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
          apiPathArbitrary
        ),
        async ([method, apiPath]) => {
          // Create file with fetch call
          const filePath = pathModule.join(tempDir, 'FetchTest.jsx');
          const content = `
function FetchTest() {
  const fetchData = async () => {
    const response = await fetch('${apiPath}', {
      method: '${method}'
    });
    return response.json();
  };
  return null;
}

export default FetchTest;
`;
          fs.writeFileSync(filePath, content, 'utf-8');

          // Scan for API calls
          const discoveredCalls = scanner.scanAPICalls();

          // Property: Fetch call should be discovered
          expect(discoveredCalls.length).toBeGreaterThan(0);
          
          const call = discoveredCalls[0];
          expect(call.method).toBe(method.toLowerCase());
          expect(call.path).toBe(apiPath);
        }
      ),
      { numRuns: 100 }
    );
  });
});
