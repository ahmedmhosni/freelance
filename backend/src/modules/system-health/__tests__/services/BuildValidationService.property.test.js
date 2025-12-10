/**
 * Property-Based Tests for BuildValidationService
 * **Feature: system-health-deployment, Property 2: Build Process Determinism**
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

const fc = require('fast-check');
const BuildValidationService = require('../../services/BuildValidationService');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('BuildValidationService Property Tests', () => {
  let service;
  let mockRepository;
  let mockLogger;
  let mockDatabase;
  let mockConfig;
  let tempDir;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'build-test-'));
    
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
   * Property 2: Build Process Determinism
   * For any valid React application, the build process should produce the same output artifacts 
   * when run multiple times with identical source code
   */
  describe('Property 2: Build Process Determinism', () => {
    test('should produce consistent validation results for identical build outputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test data for build artifacts
          fc.record({
            files: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.js'),
                content: fc.string({ minLength: 10, maxLength: 100 }),
                size: fc.integer({ min: 100, max: 10000 })
              }),
              { minLength: 1, maxLength: 5 }
            ),
            hasIndexHtml: fc.boolean(),
            hasCssFiles: fc.boolean()
          }),
          async (testData) => {
            // Create test build directory structure
            const buildDir = path.join(tempDir, 'test-build');
            await fs.mkdir(buildDir, { recursive: true });

            // Create test files
            const createdFiles = [];
            
            if (testData.hasIndexHtml) {
              const indexPath = path.join(buildDir, 'index.html');
              await fs.writeFile(indexPath, '<html><body>Test</body></html>');
              createdFiles.push(indexPath);
            }

            if (testData.hasCssFiles) {
              const cssPath = path.join(buildDir, 'styles.css');
              await fs.writeFile(cssPath, 'body { margin: 0; }');
              createdFiles.push(cssPath);
            }

            for (const file of testData.files) {
              const filePath = path.join(buildDir, file.name);
              await fs.writeFile(filePath, file.content);
              createdFiles.push(filePath);
            }

            // Run validation multiple times
            const result1 = await service.checkBuildOutput(buildDir);
            const result2 = await service.checkBuildOutput(buildDir);

            // Results should be deterministic (same status and file counts)
            expect(result1.status).toBe(result2.status);
            expect(result1.details.totalFiles).toBe(result2.details.totalFiles);
            expect(result1.details.foundExtensions.sort()).toEqual(result2.details.foundExtensions.sort());
            
            // If both passed or both failed, the missing files should be the same
            if (result1.status === result2.status) {
              expect(result1.details.missingFiles.sort()).toEqual(result2.details.missingFiles.sort());
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should produce consistent bundle analysis for identical file sets', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test files with different sizes and types
          fc.array(
            fc.record({
              name: fc.oneof(
                fc.string({ minLength: 1, maxLength: 15 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.js'),
                fc.string({ minLength: 1, maxLength: 15 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.css'),
                fc.string({ minLength: 1, maxLength: 15 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.png')
              ),
              size: fc.integer({ min: 100, max: 50000 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (testFiles) => {
            // Create test files
            const buildDir = path.join(tempDir, 'bundle-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];
            for (const file of testFiles) {
              const filePath = path.join(buildDir, file.name);
              // Create file with specified size
              const content = 'x'.repeat(file.size);
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
            }

            // Run bundle analysis multiple times
            const analysis1 = await service.analyzeBundleSize(filePaths);
            const analysis2 = await service.analyzeBundleSize(filePaths);

            // Results should be deterministic
            expect(analysis1.status).toBe(analysis2.status);
            expect(analysis1.details.bundleSize.total).toBe(analysis2.details.bundleSize.total);
            expect(analysis1.details.bundleSize.javascript).toBe(analysis2.details.bundleSize.javascript);
            expect(analysis1.details.bundleSize.css).toBe(analysis2.details.bundleSize.css);
            expect(analysis1.details.bundleSize.files.length).toBe(analysis2.details.bundleSize.files.length);
            
            // Warnings should be consistent
            expect(analysis1.details.warnings.length).toBe(analysis2.details.warnings.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should produce consistent production readiness validation for identical content', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test files with various content patterns
          fc.array(
            fc.record({
              name: fc.oneof(
                fc.string({ minLength: 1, maxLength: 10 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.js'),
                fc.string({ minLength: 1, maxLength: 10 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.css'),
                fc.string({ minLength: 1, maxLength: 10 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.html')
              ),
              content: fc.oneof(
                fc.constant('console.log("debug");'), // Development reference
                fc.constant('const API_URL = "https://api.example.com";'), // Production code
                fc.constant('body { color: red; }'), // CSS
                fc.constant('<html><body>Hello</body></html>') // HTML
              ),
              hasDevelopmentRef: fc.boolean()
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (testFiles) => {
            // Create test files
            const buildDir = path.join(tempDir, 'prod-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];
            for (const file of testFiles) {
              const filePath = path.join(buildDir, file.name);
              let content = file.content;
              
              // Optionally add development references
              if (file.hasDevelopmentRef) {
                content += '\n// localhost:3000';
              }
              
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
            }

            // Run production readiness validation multiple times
            const validation1 = await service.validateProductionReadiness(filePaths);
            const validation2 = await service.validateProductionReadiness(filePaths);

            // Results should be deterministic
            expect(validation1.status).toBe(validation2.status);
            expect(validation1.details.issues.length).toBe(validation2.details.issues.length);
            expect(validation1.details.checkedFiles).toBe(validation2.details.checkedFiles);
            
            // Issues should be identical
            const issues1 = validation1.details.issues.map(i => `${i.file}:${i.issue}`).sort();
            const issues2 = validation2.details.issues.map(i => `${i.file}:${i.issue}`).sort();
            expect(issues1).toEqual(issues2);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle clean build artifacts operation consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            createDirectory: fc.boolean(),
            fileCount: fc.integer({ min: 0, max: 10 })
          }),
          async (testData) => {
            const buildDir = path.join(tempDir, 'clean-test');
            
            if (testData.createDirectory) {
              await fs.mkdir(buildDir, { recursive: true });
              
              // Create some test files
              for (let i = 0; i < testData.fileCount; i++) {
                await fs.writeFile(path.join(buildDir, `file${i}.js`), 'test content');
              }
            }

            // Run clean operation multiple times
            const result1 = await service.cleanBuildArtifacts(buildDir);
            const result2 = await service.cleanBuildArtifacts(buildDir);

            // Both operations should succeed (pass status)
            expect(result1.status).toBe('pass');
            expect(result2.status).toBe('pass');
            
            // Both should report the same build path
            expect(result1.details.buildPath).toBe(result2.details.buildPath);
            
            // Directory should not exist after cleaning
            try {
              await fs.access(buildDir);
              // If we reach here, directory still exists, which is unexpected after cleaning
              expect(false).toBe(true);
            } catch (error) {
              // Expected - directory should not exist
              expect(error.code).toBe('ENOENT');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});