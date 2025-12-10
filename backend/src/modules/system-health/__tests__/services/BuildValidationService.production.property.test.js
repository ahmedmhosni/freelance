/**
 * Property-Based Tests for Production Build Validation
 * **Feature: system-health-deployment, Property 4: Production Build Cleanliness**
 * **Validates: Requirements 2.5**
 */

const fc = require('fast-check');
const BuildValidationService = require('../../services/BuildValidationService');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('BuildValidationService Production Readiness Property Tests', () => {
  let service;
  let mockRepository;
  let mockLogger;
  let mockDatabase;
  let mockConfig;
  let tempDir;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'prod-test-'));
    
    mockRepository = {
      create: jest.fn().mockResolvedValue({ id: 1 })
    };
    
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    mockDatabase = {};
    mockConfig = {};
    
    service = new BuildValidationService(mockDatabase, mockLogger, mockConfig, mockRepository);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * Property 4: Production Build Cleanliness
   * For any production build, the output should contain no development-specific references or debugging code
   */
  describe('Property 4: Production Build Cleanliness', () => {
    test('should detect development references in any file type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fileType: fc.oneof(
              fc.constant('.js'),
              fc.constant('.css'),
              fc.constant('.html'),
              fc.constant('.json')
            ),
            devReference: fc.oneof(
              fc.constant('localhost'),
              fc.constant('console.log'),
              fc.constant('debugger'),
              fc.constant('development'),
              fc.constant('dev-server'),
              fc.constant('hot-reload')
            ),
            cleanContent: fc.oneof(
              fc.constant('const API_URL = "https://api.example.com";'),
              fc.constant('body { color: #333; }'),
              fc.constant('<html><body>Production App</body></html>'),
              fc.constant('{"version": "1.0.0"}')
            ),
            includeDevRef: fc.boolean()
          }),
          async (testData) => {
            const buildDir = path.join(tempDir, 'dev-ref-test');
            await fs.mkdir(buildDir, { recursive: true });

            const fileName = `test${testData.fileType}`;
            const filePath = path.join(buildDir, fileName);
            
            // Create content with or without development reference
            let content = testData.cleanContent;
            if (testData.includeDevRef) {
              content += `\n// ${testData.devReference}`;
            }
            
            await fs.writeFile(filePath, content);

            // Run production readiness validation
            const result = await service.validateProductionReadiness([filePath]);

            // Check if development reference was detected correctly
            const hasDevRef = testData.includeDevRef;
            const foundIssues = result.details.issues.filter(issue => 
              issue.issue.includes(testData.devReference)
            );

            if (hasDevRef) {
              expect(foundIssues.length).toBeGreaterThan(0);
              expect(result.status).toBe('warning');
            } else {
              expect(foundIssues.length).toBe(0);
              expect(result.status).toBe('pass');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should detect source map references in JavaScript files', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            baseContent: fc.string({ minLength: 10, maxLength: 100 }),
            hasSourceMap: fc.boolean(),
            sourceMapType: fc.oneof(
              fc.constant('sourceMappingURL=app.js.map'),
              fc.constant('sourceMappingURL=data:application/json;base64,'),
              fc.constant('sourceMappingURL=./bundle.js.map')
            )
          }),
          async (testData) => {
            const buildDir = path.join(tempDir, 'sourcemap-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePath = path.join(buildDir, 'bundle.js');
            
            // Create JavaScript content with or without source map
            let content = `function app() { ${testData.baseContent} }`;
            if (testData.hasSourceMap) {
              content += `\n//# ${testData.sourceMapType}`;
            }
            
            await fs.writeFile(filePath, content);

            // Run production readiness validation
            const result = await service.validateProductionReadiness([filePath]);

            // Check if source map reference was detected correctly
            const sourceMapIssues = result.details.issues.filter(issue => 
              issue.issue.includes('source map reference')
            );

            if (testData.hasSourceMap) {
              expect(sourceMapIssues.length).toBeGreaterThan(0);
              expect(result.status).toBe('warning');
            } else {
              expect(sourceMapIssues.length).toBe(0);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should handle multiple files with mixed content correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 10 })
                .filter(s => s.trim().length > 0)
                .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim()),
              extension: fc.oneof(
                fc.constant('.js'),
                fc.constant('.css'),
                fc.constant('.html')
              ),
              content: fc.string({ minLength: 10, maxLength: 50 }),
              hasDevContent: fc.boolean(),
              devContent: fc.oneof(
                fc.constant('console.log("debug")'),
                fc.constant('localhost:3000'),
                fc.constant('debugger;')
              )
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (testFiles) => {
            const buildDir = path.join(tempDir, 'multi-file-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];
            let expectedIssueCount = 0;

            // Create test files
            for (const file of testFiles) {
              const fileName = file.name + file.extension;
              const filePath = path.join(buildDir, fileName);
              
              let content = file.content;
              if (file.hasDevContent) {
                content += `\n${file.devContent}`;
                expectedIssueCount++;
              }
              
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
            }

            // Run production readiness validation
            const result = await service.validateProductionReadiness(filePaths);

            // Check that the correct number of issues were found
            const actualIssueCount = result.details.issues.length;
            
            if (expectedIssueCount > 0) {
              expect(actualIssueCount).toBeGreaterThan(0);
              expect(result.status).toBe('warning');
            } else {
              expect(actualIssueCount).toBe(0);
              expect(result.status).toBe('pass');
            }

            // Verify that the number of checked files is correct
            expect(result.details.checkedFiles).toBe(filePaths.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should ignore non-text files during validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 8 })
                .filter(s => s.trim().length > 0)
                .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim()),
              extension: fc.oneof(
                fc.constant('.png'),
                fc.constant('.jpg'),
                fc.constant('.gif'),
                fc.constant('.woff'),
                fc.constant('.ttf')
              ),
              size: fc.integer({ min: 100, max: 1000 })
            }),
            { minLength: 1, maxLength: 3 }
          ),
          async (binaryFiles) => {
            const buildDir = path.join(tempDir, 'binary-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];

            // Create binary files (with dummy content)
            for (const file of binaryFiles) {
              const fileName = file.name + file.extension;
              const filePath = path.join(buildDir, fileName);
              
              // Create dummy binary content
              const content = Buffer.alloc(file.size, 0xFF);
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
            }

            // Run production readiness validation
            const result = await service.validateProductionReadiness(filePaths);

            // Binary files should not generate any issues
            expect(result.details.issues).toHaveLength(0);
            expect(result.status).toBe('pass');
            expect(result.details.checkedFiles).toBe(filePaths.length);
          }
        ),
        { numRuns: 30 }
      );
    });

    test('should be consistent across multiple validation runs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 8 })
                .filter(s => s.trim().length > 0)
                .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.js'),
              content: fc.string({ minLength: 20, max: 100 }),
              hasIssue: fc.boolean()
            }),
            { minLength: 1, maxLength: 4 }
          ),
          async (testFiles) => {
            const buildDir = path.join(tempDir, 'consistency-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];

            // Create test files
            for (const file of testFiles) {
              const filePath = path.join(buildDir, file.name);
              
              let content = file.content;
              if (file.hasIssue) {
                content += '\nconsole.log("development debug");';
              }
              
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
            }

            // Run validation multiple times
            const result1 = await service.validateProductionReadiness(filePaths);
            const result2 = await service.validateProductionReadiness(filePaths);

            // Results should be identical
            expect(result1.status).toBe(result2.status);
            expect(result1.details.issues.length).toBe(result2.details.issues.length);
            expect(result1.details.checkedFiles).toBe(result2.details.checkedFiles);
            
            // Issue details should match
            const issues1 = result1.details.issues.map(i => `${i.file}:${i.issue}`).sort();
            const issues2 = result2.details.issues.map(i => `${i.file}:${i.issue}`).sort();
            expect(issues1).toEqual(issues2);
          }
        ),
        { numRuns: 30 }
      );
    });

    test('should handle empty file arrays gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant([]), // Empty array
          async (emptyArray) => {
            // Create an empty dist directory to avoid scanning errors
            const emptyDistDir = path.join(tempDir, 'empty-prod-dist');
            await fs.mkdir(emptyDistDir, { recursive: true });
            
            // Mock the path.resolve to return our empty directory
            const originalResolve = path.resolve;
            jest.spyOn(path, 'resolve').mockImplementation((p) => {
              if (p === 'frontend/dist') {
                return emptyDistDir;
              }
              return originalResolve(p);
            });

            try {
              // Run production readiness validation with empty array
              const result = await service.validateProductionReadiness(emptyArray);

              // Should handle gracefully
              expect(result.name).toBe('production_readiness');
              expect(result.details.issues).toHaveLength(0);
              expect(result.details.checkedFiles).toBe(0);
              expect(result.status).toBe('pass');
            } finally {
              // Restore original path.resolve
              path.resolve.mockRestore();
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    test('should correctly categorize different types of development references', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            devRefType: fc.oneof(
              fc.record({ 
                ref: fc.constant('localhost'), 
                type: fc.constant('development_reference'),
                expectedMessage: fc.constant('Contains development reference: localhost')
              }),
              fc.record({ 
                ref: fc.constant('console.log'), 
                type: fc.constant('development_reference'),
                expectedMessage: fc.constant('Contains development reference: console.log')
              }),
              fc.record({ 
                ref: fc.constant('debugger'), 
                type: fc.constant('development_reference'),
                expectedMessage: fc.constant('Contains development reference: debugger')
              }),
              fc.record({ 
                ref: fc.constant('sourceMappingURL'), 
                type: fc.constant('source_map'),
                expectedMessage: fc.constant('Contains source map reference in production build')
              })
            ),
            fileName: fc.string({ minLength: 1, maxLength: 10 })
              .filter(s => s.trim().length > 0)
              .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.js')
          }),
          async (testData) => {
            const buildDir = path.join(tempDir, 'categorize-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePath = path.join(buildDir, testData.fileName);
            const content = `function test() { return true; }\n// ${testData.devRefType.ref}`;
            
            await fs.writeFile(filePath, content);

            // Run production readiness validation
            const result = await service.validateProductionReadiness([filePath]);

            // Should find exactly one issue with correct type
            expect(result.details.issues).toHaveLength(1);
            expect(result.details.issues[0].type).toBe(testData.devRefType.type);
            expect(result.details.issues[0].issue).toBe(testData.devRefType.expectedMessage);
            expect(result.status).toBe('warning');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});