/**
 * Property-Based Tests for Bundle Size Validation
 * **Feature: system-health-deployment, Property 3: Build Size Validation Accuracy**
 * **Validates: Requirements 2.4**
 */

const fc = require('fast-check');
const BuildValidationService = require('../../services/BuildValidationService');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('BuildValidationService Bundle Size Property Tests', () => {
  let service;
  let mockRepository;
  let mockLogger;
  let mockDatabase;
  let mockConfig;
  let tempDir;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bundle-test-'));
    
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
   * Property 3: Build Size Validation Accuracy
   * For any build output, size validation should correctly identify when bundle sizes exceed configured thresholds
   */
  describe('Property 3: Build Size Validation Accuracy', () => {
    test('should correctly identify when total bundle size exceeds threshold', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate files with controlled sizes
          fc.record({
            largeFiles: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 10 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.js'),
                size: fc.integer({ min: 2000000, max: 3000000 }) // 2-3MB files
              }),
              { minLength: 1, maxLength: 3 }
            ),
            smallFiles: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 10 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.css'),
                size: fc.integer({ min: 1000, max: 10000 }) // 1-10KB files
              }),
              { minLength: 0, maxLength: 5 }
            )
          }),
          async (testData) => {
            const buildDir = path.join(tempDir, 'size-test');
            await fs.mkdir(buildDir, { recursive: true });

            const allFiles = [...testData.largeFiles, ...testData.smallFiles];
            const filePaths = [];
            let expectedTotalSize = 0;

            // Create test files with exact sizes
            for (const file of allFiles) {
              const filePath = path.join(buildDir, file.name);
              const content = 'x'.repeat(file.size);
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
              expectedTotalSize += file.size;
            }

            // Run bundle analysis
            const result = await service.analyzeBundleSize(filePaths);

            // Verify size calculation accuracy
            expect(result.details.bundleSize.total).toBe(expectedTotalSize);

            // Check threshold detection (default threshold is 5MB)
            const threshold = 5 * 1024 * 1024; // 5MB
            const shouldHaveWarning = expectedTotalSize > threshold;
            const hasWarning = result.status === 'warning' && 
                              result.details.warnings.some(w => w.includes('Total bundle size'));

            expect(hasWarning).toBe(shouldHaveWarning);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should correctly categorize file sizes by type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            jsFiles: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 8 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.js'),
                size: fc.integer({ min: 1000, max: 100000 })
              }),
              { minLength: 1, maxLength: 3 }
            ),
            cssFiles: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 8 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.css'),
                size: fc.integer({ min: 1000, max: 50000 })
              }),
              { minLength: 1, maxLength: 3 }
            ),
            otherFiles: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 8 })
                  .filter(s => s.trim().length > 0)
                  .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.png'),
                size: fc.integer({ min: 1000, max: 200000 })
              }),
              { minLength: 0, maxLength: 2 }
            )
          }),
          async (testData) => {
            const buildDir = path.join(tempDir, 'categorize-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];
            let expectedJsSize = 0;
            let expectedCssSize = 0;
            let expectedAssetsSize = 0;

            // Create JS files
            for (const file of testData.jsFiles) {
              const filePath = path.join(buildDir, file.name);
              const content = 'x'.repeat(file.size);
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
              expectedJsSize += file.size;
            }

            // Create CSS files
            for (const file of testData.cssFiles) {
              const filePath = path.join(buildDir, file.name);
              const content = 'x'.repeat(file.size);
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
              expectedCssSize += file.size;
            }

            // Create other files
            for (const file of testData.otherFiles) {
              const filePath = path.join(buildDir, file.name);
              const content = 'x'.repeat(file.size);
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
              expectedAssetsSize += file.size;
            }

            // Run bundle analysis
            const result = await service.analyzeBundleSize(filePaths);

            // Verify categorization accuracy
            expect(result.details.bundleSize.javascript).toBe(expectedJsSize);
            expect(result.details.bundleSize.css).toBe(expectedCssSize);
            expect(result.details.bundleSize.assets).toBe(expectedAssetsSize);
            expect(result.details.bundleSize.total).toBe(expectedJsSize + expectedCssSize + expectedAssetsSize);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should detect JavaScript bundle size threshold violations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            largeJsSize: fc.integer({ min: 2500000, max: 4000000 }), // 2.5-4MB (exceeds 2MB threshold)
            smallJsSize: fc.integer({ min: 100000, max: 500000 }), // 100-500KB (under threshold)
            testLargeFile: fc.boolean()
          }),
          async (testData) => {
            const buildDir = path.join(tempDir, 'js-threshold-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];
            const fileSize = testData.testLargeFile ? testData.largeJsSize : testData.smallJsSize;
            
            // Create a single JS file with controlled size
            const filePath = path.join(buildDir, 'bundle.js');
            const content = 'x'.repeat(fileSize);
            await fs.writeFile(filePath, content);
            filePaths.push(filePath);

            // Run bundle analysis
            const result = await service.analyzeBundleSize(filePaths);

            // Check JavaScript threshold detection (default threshold is 2MB)
            const jsThreshold = 2 * 1024 * 1024; // 2MB
            const shouldHaveJsWarning = fileSize > jsThreshold;
            const hasJsWarning = result.details.warnings.some(w => 
              w.includes('JavaScript bundle size') && w.includes('exceeds recommended limit')
            );

            expect(hasJsWarning).toBe(shouldHaveJsWarning);
            
            // Verify the size calculation is accurate
            expect(result.details.bundleSize.javascript).toBe(fileSize);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should detect CSS bundle size threshold violations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            largeCssSize: fc.integer({ min: 600000, max: 1000000 }), // 600KB-1MB (exceeds 500KB threshold)
            smallCssSize: fc.integer({ min: 10000, max: 100000 }), // 10-100KB (under threshold)
            testLargeFile: fc.boolean()
          }),
          async (testData) => {
            const buildDir = path.join(tempDir, 'css-threshold-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];
            const fileSize = testData.testLargeFile ? testData.largeCssSize : testData.smallCssSize;
            
            // Create a single CSS file with controlled size
            const filePath = path.join(buildDir, 'styles.css');
            const content = 'x'.repeat(fileSize);
            await fs.writeFile(filePath, content);
            filePaths.push(filePath);

            // Run bundle analysis
            const result = await service.analyzeBundleSize(filePaths);

            // Check CSS threshold detection (default threshold is 500KB)
            const cssThreshold = 500 * 1024; // 500KB
            const shouldHaveCssWarning = fileSize > cssThreshold;
            const hasCssWarning = result.details.warnings.some(w => 
              w.includes('CSS bundle size') && w.includes('exceeds recommended limit')
            );

            expect(hasCssWarning).toBe(shouldHaveCssWarning);
            
            // Verify the size calculation is accurate
            expect(result.details.bundleSize.css).toBe(fileSize);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should handle empty file arrays gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant([]), // Empty array
          async (emptyArray) => {
            // Create an empty dist directory to avoid scanning errors
            const emptyDistDir = path.join(tempDir, 'empty-dist');
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
              // Run bundle analysis with empty array
              const result = await service.analyzeBundleSize(emptyArray);

              // Should handle gracefully
              expect(result.name).toBe('bundle_analysis');
              expect(result.details.bundleSize.total).toBe(0);
              expect(result.details.bundleSize.javascript).toBe(0);
              expect(result.details.bundleSize.css).toBe(0);
              expect(result.details.bundleSize.assets).toBe(0);
              expect(result.details.bundleSize.files).toHaveLength(0);
              expect(result.details.warnings).toHaveLength(0);
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

    test('should maintain size calculation consistency across multiple runs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 10 })
                .filter(s => s.trim().length > 0)
                .map(s => s.replace(/[<>:"|?*\\/]/g, '_').trim() + '.js'),
              size: fc.integer({ min: 10000, max: 500000 })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (testFiles) => {
            const buildDir = path.join(tempDir, 'consistency-test');
            await fs.mkdir(buildDir, { recursive: true });

            const filePaths = [];
            let expectedTotal = 0;

            // Create test files
            for (const file of testFiles) {
              const filePath = path.join(buildDir, file.name);
              const content = 'x'.repeat(file.size);
              await fs.writeFile(filePath, content);
              filePaths.push(filePath);
              expectedTotal += file.size;
            }

            // Run analysis multiple times
            const result1 = await service.analyzeBundleSize(filePaths);
            const result2 = await service.analyzeBundleSize(filePaths);

            // Results should be identical
            expect(result1.details.bundleSize.total).toBe(result2.details.bundleSize.total);
            expect(result1.details.bundleSize.javascript).toBe(result2.details.bundleSize.javascript);
            expect(result1.details.bundleSize.css).toBe(result2.details.bundleSize.css);
            expect(result1.details.bundleSize.assets).toBe(result2.details.bundleSize.assets);
            expect(result1.details.warnings.length).toBe(result2.details.warnings.length);
            expect(result1.status).toBe(result2.status);
            
            // And match expected total
            expect(result1.details.bundleSize.total).toBe(expectedTotal);
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});