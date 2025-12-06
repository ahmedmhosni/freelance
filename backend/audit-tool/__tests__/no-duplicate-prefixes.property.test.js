/**
 * Property-Based Test: No Duplicate API Prefixes
 * 
 * **Feature: full-system-audit, Property 6: No Duplicate API Prefixes**
 * 
 * For any constructed API URL in the frontend, the final URL should not contain 
 * duplicate `/api` prefixes (e.g., `/api/api/clients`).
 * 
 * **Validates: Requirements 2.2**
 */

const fc = require('fast-check');
const fs = require('fs');
const pathModule = require('path');
const os = require('os');
const FrontendAPIScanner = require('../scanners/FrontendAPIScanner');

describe('Property 6: No Duplicate API Prefixes', () => {
  let tempDir;
  let scanner;

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(pathModule.join(os.tmpdir(), 'prefix-test-'));
    
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
   * Helper function to create a component file with API calls
   */
  function createComponentFile(filename, apiCalls) {
    const filePath = pathModule.join(tempDir, filename);
    const componentName = pathModule.basename(filename, pathModule.extname(filename));
    
    const imports = `import api from './api';\n\n`;
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
  }

  /**
   * Arbitrary generator for HTTP methods
   */
  const httpMethodArbitrary = fc.constantFrom('get', 'post', 'put', 'delete', 'patch');

  /**
   * Arbitrary generator for API paths WITHOUT /api prefix
   */
  const cleanPathArbitrary = fc.constantFrom(
    '/users',
    '/clients',
    '/projects',
    '/tasks',
    '/invoices',
    '/reports'
  );

  /**
   * Arbitrary generator for API paths WITH /api prefix (problematic)
   */
  const prefixedPathArbitrary = fc.constantFrom(
    '/api/users',
    '/api/clients',
    '/api/projects',
    '/api/tasks',
    '/api/invoices',
    '/api/reports'
  );

  /**
   * Arbitrary generator for API paths WITH duplicate /api/api prefix (very problematic)
   */
  const duplicatePrefixPathArbitrary = fc.constantFrom(
    '/api/api/users',
    '/api/api/clients',
    '/api/api/projects'
  );

  /**
   * Property Test: Clean paths should not trigger duplicate prefix warnings
   */
  test('clean API paths without /api prefix do not trigger warnings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(httpMethodArbitrary, cleanPathArbitrary),
        async ([method, path]) => {
          // Create component with clean API call
          createComponentFile('CleanComponent.jsx', [{ method, path }]);

          // Scan for API calls
          const apiCalls = scanner.scanAPICalls();

          // Detect duplicate prefixes
          const issues = scanner.detectDuplicatePrefixes(apiCalls);

          // Property: Clean paths should not have duplicate prefix issues
          expect(issues.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Paths with /api prefix should trigger warnings when using base URL
   */
  test('API paths starting with /api trigger warnings when base URL includes /api', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(httpMethodArbitrary, prefixedPathArbitrary),
        async ([method, path]) => {
          // Create component with prefixed API call
          createComponentFile('PrefixedComponent.jsx', [{ method, path }]);

          // Scan for API calls
          const apiCalls = scanner.scanAPICalls();

          // Detect duplicate prefixes
          const issues = scanner.detectDuplicatePrefixes(apiCalls);

          // Property: Prefixed paths should trigger warnings
          expect(issues.length).toBeGreaterThan(0);
          expect(issues[0].severity).toBe('MEDIUM');
          expect(issues[0].issue).toContain('/api');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Paths with /api/api should always trigger high severity warnings
   */
  test('API paths with /api/api pattern trigger high severity warnings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(httpMethodArbitrary, duplicatePrefixPathArbitrary),
        async ([method, path]) => {
          // Create component with duplicate prefix API call
          createComponentFile('DuplicateComponent.jsx', [{ method, path }]);

          // Scan for API calls
          const apiCalls = scanner.scanAPICalls();

          // Detect duplicate prefixes
          const issues = scanner.detectDuplicatePrefixes(apiCalls);

          // Property: Duplicate prefixes should trigger HIGH severity warnings
          expect(issues.length).toBeGreaterThan(0);
          expect(issues[0].severity).toBe('HIGH');
          expect(issues[0].issue).toContain('Duplicate /api prefix');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Each issue should include a suggested fix
   */
  test('duplicate prefix issues include suggested fixes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(httpMethodArbitrary, fc.oneof(prefixedPathArbitrary, duplicatePrefixPathArbitrary)),
        async ([method, path]) => {
          // Create component with problematic API call
          createComponentFile('ProblematicComponent.jsx', [{ method, path }]);

          // Scan for API calls
          const apiCalls = scanner.scanAPICalls();

          // Detect duplicate prefixes
          const issues = scanner.detectDuplicatePrefixes(apiCalls);

          // Property: Each issue should have a suggested fix
          if (issues.length > 0) {
            for (const issue of issues) {
              expect(issue.suggestedFix).toBeDefined();
              expect(issue.suggestedFix).toBeTruthy();
              // Suggested fix should not contain duplicate prefixes
              expect(issue.suggestedFix).not.toContain('/api/api');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Issues should include file location information
   */
  test('duplicate prefix issues include file and line information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(httpMethodArbitrary, duplicatePrefixPathArbitrary),
        async ([method, path]) => {
          // Create component with duplicate prefix
          const filename = 'LocationTest.jsx';
          createComponentFile(filename, [{ method, path }]);

          // Scan for API calls
          const apiCalls = scanner.scanAPICalls();

          // Detect duplicate prefixes
          const issues = scanner.detectDuplicatePrefixes(apiCalls);

          // Property: Issues should include location information
          expect(issues.length).toBeGreaterThan(0);
          
          for (const issue of issues) {
            expect(issue.file).toBeDefined();
            expect(issue.file).toContain(filename);
            expect(issue.line).toBeDefined();
            expect(issue.line).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Multiple problematic calls should generate multiple issues
   */
  test('multiple problematic API calls generate multiple issues', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        async (numCalls) => {
          // Clean temp directory before creating new files
          const existingFiles = fs.readdirSync(tempDir);
          existingFiles.forEach(file => {
            const filePath = pathModule.join(tempDir, file);
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
            }
          });

          // Generate unique problematic calls
          const paths = ['/api/users', '/api/clients', '/api/projects', '/api/tasks', '/api/invoices'];
          const methods = ['get', 'post', 'put', 'delete', 'patch'];
          
          const uniqueCalls = [];
          for (let i = 0; i < Math.min(numCalls, paths.length); i++) {
            uniqueCalls.push({
              method: methods[i % methods.length],
              path: paths[i]
            });
          }

          // Create component with multiple problematic calls
          createComponentFile('MultipleIssues.jsx', uniqueCalls);

          // Scan for API calls
          const scannedCalls = scanner.scanAPICalls();

          // Detect duplicate prefixes
          const issues = scanner.detectDuplicatePrefixes(scannedCalls);

          // Property: Number of issues should match number of problematic calls
          expect(issues.length).toBe(uniqueCalls.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
