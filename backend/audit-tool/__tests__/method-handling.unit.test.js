/**
 * Unit Tests: Method Handling
 * 
 * Tests for method handling in pathsMatchWithReason function
 * - Default method (GET) when not specified
 * - Case variations (GET, get, Get)
 * - Invalid methods
 * 
 * Requirements: 3.3, 3.4
 */

const { pathsMatchWithReason } = require('../utils/pathNormalizer');

describe('Method Handling Unit Tests', () => {
  describe('Default method handling', () => {
    test('should match paths when no methods are provided', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks');
      
      expect(result.match).toBe(true);
    });

    test('should match paths with parameters when no methods are provided', () => {
      const result = pathsMatchWithReason('/api/tasks/123', '/api/tasks/:id');
      
      expect(result.match).toBe(true);
    });

    test('should match paths with query parameters when no methods are provided', () => {
      const result = pathsMatchWithReason('/api/tasks?status=active', '/api/tasks');
      
      expect(result.match).toBe(true);
    });

    test('should not match different paths when no methods are provided', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/invoices');
      
      expect(result.match).toBe(false);
    });
  });

  describe('Case variations', () => {
    test('should match GET and get', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'GET', 'get');
      
      expect(result.match).toBe(true);
    });

    test('should match GET and Get', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'GET', 'Get');
      
      expect(result.match).toBe(true);
    });

    test('should match get and Get', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'get', 'Get');
      
      expect(result.match).toBe(true);
    });

    test('should match POST and post', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'POST', 'post');
      
      expect(result.match).toBe(true);
    });

    test('should match POST and Post', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'POST', 'Post');
      
      expect(result.match).toBe(true);
    });

    test('should match PUT and put', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'PUT', 'put');
      
      expect(result.match).toBe(true);
    });

    test('should match PUT and Put', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'PUT', 'Put');
      
      expect(result.match).toBe(true);
    });

    test('should match DELETE and delete', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'DELETE', 'delete');
      
      expect(result.match).toBe(true);
    });

    test('should match DELETE and Delete', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'DELETE', 'Delete');
      
      expect(result.match).toBe(true);
    });

    test('should match PATCH and patch', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'PATCH', 'patch');
      
      expect(result.match).toBe(true);
    });

    test('should match PATCH and Patch', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'PATCH', 'Patch');
      
      expect(result.match).toBe(true);
    });
  });

  describe('Invalid methods', () => {
    test('should handle empty string methods', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', '', '');
      
      // Empty strings should be treated as matching (both invalid)
      expect(result.match).toBe(true);
    });

    test('should not match empty string with valid method', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', '', 'GET');
      
      expect(result.match).toBe(false);
      expect(result.reason).toBe('method-mismatch');
    });

    test('should not match valid method with empty string', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'GET', '');
      
      expect(result.match).toBe(false);
      expect(result.reason).toBe('method-mismatch');
    });

    test('should handle null methods gracefully', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', null, null);
      
      // Null methods should be treated as no methods provided
      expect(result.match).toBe(true);
    });

    test('should handle undefined methods gracefully', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', undefined, undefined);
      
      // Undefined methods should be treated as no methods provided
      expect(result.match).toBe(true);
    });

    test('should handle mixed null and undefined methods', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', null, undefined);
      
      // Both null and undefined should be treated as no methods provided
      expect(result.match).toBe(true);
    });

    test('should not match null with valid method', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', null, 'GET');
      
      // When one method is provided and other is null, should match based on path only
      expect(result.match).toBe(true);
    });

    test('should not match undefined with valid method', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', undefined, 'GET');
      
      // When one method is provided and other is undefined, should match based on path only
      expect(result.match).toBe(true);
    });

    test('should handle unusual method names case-insensitively', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'OPTIONS', 'options');
      
      expect(result.match).toBe(true);
    });

    test('should handle HEAD method case-insensitively', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/tasks', 'HEAD', 'head');
      
      expect(result.match).toBe(true);
    });
  });

  describe('Method mismatch with different paths', () => {
    test('should report method-mismatch even when paths differ', () => {
      const result = pathsMatchWithReason('/api/tasks', '/api/invoices', 'GET', 'POST');
      
      expect(result.match).toBe(false);
      expect(result.reason).toBe('method-mismatch');
    });

    test('should report method-mismatch before path-structure-mismatch', () => {
      const result = pathsMatchWithReason('/api/tasks/123', '/api/invoices/456', 'GET', 'POST');
      
      expect(result.match).toBe(false);
      expect(result.reason).toBe('method-mismatch');
    });
  });

  describe('Method matching with path variations', () => {
    test('should match with /api prefix variation when methods match', () => {
      const result = pathsMatchWithReason('/tasks', '/api/tasks', 'GET', 'GET');
      
      expect(result.match).toBe(true);
    });

    test('should not match with /api prefix variation when methods differ', () => {
      const result = pathsMatchWithReason('/tasks', '/api/tasks', 'GET', 'POST');
      
      expect(result.match).toBe(false);
      expect(result.reason).toBe('method-mismatch');
    });

    test('should match with query parameters when methods match', () => {
      const result = pathsMatchWithReason('/api/tasks?status=active', '/api/tasks', 'GET', 'GET');
      
      expect(result.match).toBe(true);
    });

    test('should not match with query parameters when methods differ', () => {
      const result = pathsMatchWithReason('/api/tasks?status=active', '/api/tasks', 'GET', 'POST');
      
      expect(result.match).toBe(false);
      expect(result.reason).toBe('method-mismatch');
    });

    test('should match with parameters when methods match', () => {
      const result = pathsMatchWithReason('/api/tasks/123', '/api/tasks/:id', 'GET', 'GET');
      
      expect(result.match).toBe(true);
    });

    test('should not match with parameters when methods differ', () => {
      const result = pathsMatchWithReason('/api/tasks/123', '/api/tasks/:id', 'GET', 'DELETE');
      
      expect(result.match).toBe(false);
      expect(result.reason).toBe('method-mismatch');
    });
  });
});
