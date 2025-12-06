/**
 * Property-Based Test: Path Parameter Matching
 * 
 * **Feature: route-matching-improvement, Property 1: Path parameter matching**
 * 
 * For any path containing numeric IDs, UUIDs, or ObjectIds, when compared with a path 
 * containing Express-style parameters (:id, :userId, etc.) or template literal parameters 
 * (${id}, ${userId}, etc.) in the same positions, the paths should match.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 */

const fc = require('fast-check');
const { pathsMatch, isParameter, extractParameterNames } = require('../utils/pathNormalizer');

describe('Property 1: Path parameter matching', () => {
  /**
   * Test that paths with numeric IDs match paths with Express-style parameters
   */
  test('for any path with numeric ID, it should match path with Express-style parameter', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
          paramName: fc.constantFrom('id', 'userId', 'taskId', 'clientId'),
          numericId: fc.integer({ min: 1, max: 999999 })
        }),
        ({ basePath, paramName, numericId }) => {
          const pathWithId = `${basePath}/${numericId}`;
          const pathWithParam = `${basePath}/:${paramName}`;
          
          expect(pathsMatch(pathWithId, pathWithParam)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with UUIDs match paths with Express-style parameters
   */
  test('for any path with UUID, it should match path with Express-style parameter', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
          paramName: fc.constantFrom('id', 'uuid', 'taskId'),
          uuid: fc.uuid()
        }),
        ({ basePath, paramName, uuid }) => {
          const pathWithUuid = `${basePath}/${uuid}`;
          const pathWithParam = `${basePath}/:${paramName}`;
          
          expect(pathsMatch(pathWithUuid, pathWithParam)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with MongoDB ObjectIds match paths with Express-style parameters
   */
  test('for any path with ObjectId, it should match path with Express-style parameter', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
          paramName: fc.constantFrom('id', 'objectId', 'taskId'),
          // Generate valid MongoDB ObjectId (24 hex characters)
          objectId: fc.stringMatching(/^[a-f0-9]{24}$/)
        }),
        ({ basePath, paramName, objectId }) => {
          const pathWithObjectId = `${basePath}/${objectId}`;
          const pathWithParam = `${basePath}/:${paramName}`;
          
          expect(pathsMatch(pathWithObjectId, pathWithParam)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with numeric IDs match paths with template literal parameters
   */
  test('for any path with numeric ID, it should match path with template literal parameter', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
          paramName: fc.constantFrom('id', 'userId', 'taskId', 'clientId'),
          numericId: fc.integer({ min: 1, max: 999999 })
        }),
        ({ basePath, paramName, numericId }) => {
          const pathWithId = `${basePath}/${numericId}`;
          const pathWithTemplateLiteral = `${basePath}/\${${paramName}}`;
          
          expect(pathsMatch(pathWithId, pathWithTemplateLiteral)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that Express-style and template literal parameters match each other
   */
  test('for any path, Express-style and template literal parameters should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          basePath: fc.constantFrom('/api/tasks', '/api/invoices', '/api/clients', '/api/projects'),
          paramName: fc.constantFrom('id', 'userId', 'taskId', 'clientId')
        }),
        ({ basePath, paramName }) => {
          const pathWithExpressParam = `${basePath}/:${paramName}`;
          const pathWithTemplateLiteral = `${basePath}/\${${paramName}}`;
          
          expect(pathsMatch(pathWithExpressParam, pathWithTemplateLiteral)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that paths with multiple parameters match correctly
   */
  test('for any path with multiple parameters, all positions should match', () => {
    fc.assert(
      fc.property(
        fc.record({
          id1: fc.integer({ min: 1, max: 999999 }),
          id2: fc.integer({ min: 1, max: 999999 })
        }),
        ({ id1, id2 }) => {
          const pathWithIds = `/api/time-tracking/duration/task/${id1}/entry/${id2}`;
          const pathWithParams = `/api/time-tracking/duration/task/:taskId/entry/:entryId`;
          
          expect(pathsMatch(pathWithIds, pathWithParams)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test isParameter function with various parameter formats
   */
  test('isParameter should correctly identify Express-style parameters', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('id', 'userId', 'taskId', 'clientId', 'projectId'),
        (paramName) => {
          const expressParam = `:${paramName}`;
          expect(isParameter(expressParam)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test isParameter function with template literal parameters
   */
  test('isParameter should correctly identify template literal parameters', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('id', 'userId', 'taskId', 'clientId', 'projectId'),
        (paramName) => {
          const templateLiteralParam = `\${${paramName}}`;
          expect(isParameter(templateLiteralParam)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test isParameter function with numeric IDs
   */
  test('isParameter should correctly identify numeric IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999999 }),
        (numericId) => {
          expect(isParameter(numericId.toString())).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test isParameter function with UUIDs
   */
  test('isParameter should correctly identify UUIDs', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (uuid) => {
          expect(isParameter(uuid)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test isParameter function with MongoDB ObjectIds
   */
  test('isParameter should correctly identify MongoDB ObjectIds', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-f0-9]{24}$/),
        (objectId) => {
          expect(isParameter(objectId)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test isParameter function with non-parameter segments
   */
  test('isParameter should return false for non-parameter segments', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('tasks', 'invoices', 'clients', 'projects', 'api', 'users'),
        (segment) => {
          expect(isParameter(segment)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test extractParameterNames with Express-style parameters
   */
  test('extractParameterNames should extract Express-style parameter names', () => {
    fc.assert(
      fc.property(
        fc.record({
          param1: fc.constantFrom('id', 'userId', 'taskId'),
          param2: fc.constantFrom('commentId', 'entryId', 'itemId')
        }),
        ({ param1, param2 }) => {
          const path = `/api/tasks/:${param1}/comments/:${param2}`;
          const paramNames = extractParameterNames(path);
          
          expect(paramNames).toEqual([param1, param2]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test extractParameterNames with template literal parameters
   */
  test('extractParameterNames should extract template literal parameter names', () => {
    fc.assert(
      fc.property(
        fc.record({
          param1: fc.constantFrom('id', 'userId', 'taskId'),
          param2: fc.constantFrom('commentId', 'entryId', 'itemId')
        }),
        ({ param1, param2 }) => {
          const path = `/api/tasks/\${${param1}}/comments/\${${param2}}`;
          const paramNames = extractParameterNames(path);
          
          expect(paramNames).toEqual([param1, param2]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test extractParameterNames with mixed parameter formats
   */
  test('extractParameterNames should handle mixed parameter formats', () => {
    fc.assert(
      fc.property(
        fc.record({
          param1: fc.constantFrom('id', 'userId', 'taskId'),
          param2: fc.constantFrom('commentId', 'entryId', 'itemId')
        }),
        ({ param1, param2 }) => {
          const path = `/api/tasks/:${param1}/comments/\${${param2}}`;
          const paramNames = extractParameterNames(path);
          
          expect(paramNames).toEqual([param1, param2]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
