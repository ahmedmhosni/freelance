/**
 * Unit Tests for HealthCheckResult Model
 * Tests model validation, data transformation, and business logic
 */

const HealthCheckResult = require('../../models/HealthCheckResult');

describe('HealthCheckResult Model', () => {
  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const result = new HealthCheckResult();

      expect(result.id).toBeNull();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.environment).toBe('development');
      expect(result.overallStatus).toBe('unknown');
      expect(result.checks).toEqual([]);
      expect(result.summary).toEqual({});
      expect(result.duration).toBe(0);
    });

    test('should create instance with provided data', () => {
      const data = {
        id: 1,
        timestamp: new Date('2023-01-01'),
        environment: 'production',
        overall_status: 'pass',
        checks: [{ name: 'test', status: 'pass' }],
        summary: { total: 1, passed: 1 },
        duration: 1000
      };

      const result = new HealthCheckResult(data);

      expect(result.id).toBe(1);
      expect(result.timestamp).toEqual(new Date('2023-01-01'));
      expect(result.environment).toBe('production');
      expect(result.overallStatus).toBe('pass');
      expect(result.checks).toEqual([{ name: 'test', status: 'pass' }]);
      expect(result.summary).toEqual({ total: 1, passed: 1 });
      expect(result.duration).toBe(1000);
    });

    test('should handle both snake_case and camelCase properties', () => {
      const snakeCaseData = {
        overall_status: 'pass',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-02')
      };

      const camelCaseData = {
        overallStatus: 'fail',
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-02')
      };

      const snakeResult = new HealthCheckResult(snakeCaseData);
      const camelResult = new HealthCheckResult(camelCaseData);

      expect(snakeResult.overallStatus).toBe('pass');
      expect(camelResult.overallStatus).toBe('fail');
    });
  });

  describe('Validation', () => {
    test('should validate required fields', () => {
      expect(() => {
        HealthCheckResult.validate({});
      }).toThrow('Validation failed: timestamp is required, environment is required, overall_status is required');
    });

    test('should validate overall status values', () => {
      expect(() => {
        HealthCheckResult.validate({
          timestamp: new Date(),
          environment: 'development',
          overall_status: 'invalid'
        });
      }).toThrow('overall_status must be one of: pass, fail, warning, unknown');
    });

    test('should validate environment values', () => {
      expect(() => {
        HealthCheckResult.validate({
          timestamp: new Date(),
          environment: 'invalid',
          overall_status: 'pass'
        });
      }).toThrow('environment must be one of: development, staging, production, test');
    });

    test('should validate checks array type', () => {
      expect(() => {
        HealthCheckResult.validate({
          timestamp: new Date(),
          environment: 'development',
          overall_status: 'pass',
          checks: 'not an array'
        });
      }).toThrow('checks must be an array');
    });

    test('should validate summary object type', () => {
      expect(() => {
        HealthCheckResult.validate({
          timestamp: new Date(),
          environment: 'development',
          overall_status: 'pass',
          summary: 'not an object'
        });
      }).toThrow('summary must be an object');
    });

    test('should validate duration as non-negative number', () => {
      expect(() => {
        HealthCheckResult.validate({
          timestamp: new Date(),
          environment: 'development',
          overall_status: 'pass',
          duration: -100
        });
      }).toThrow('duration must be a non-negative number');

      expect(() => {
        HealthCheckResult.validate({
          timestamp: new Date(),
          environment: 'development',
          overall_status: 'pass',
          duration: 'not a number'
        });
      }).toThrow('duration must be a non-negative number');
    });

    test('should pass validation with valid data', () => {
      const validData = {
        timestamp: new Date(),
        environment: 'production',
        overall_status: 'pass',
        checks: [{ name: 'test', status: 'pass' }],
        summary: { total: 1, passed: 1 },
        duration: 1000
      };

      expect(() => {
        HealthCheckResult.validate(validData);
      }).not.toThrow();
    });
  });

  describe('Static Methods', () => {
    test('create should validate and return new instance', () => {
      const validData = {
        timestamp: new Date(),
        environment: 'development',
        overall_status: 'pass'
      };

      const result = HealthCheckResult.create(validData);

      expect(result).toBeInstanceOf(HealthCheckResult);
      expect(result.overallStatus).toBe('pass');
    });

    test('create should throw on invalid data', () => {
      expect(() => {
        HealthCheckResult.create({ invalid: 'data' });
      }).toThrow('Validation failed');
    });

    test('fromDatabase should parse JSON fields', () => {
      const dbData = {
        id: 1,
        timestamp: new Date(),
        environment: 'production',
        overall_status: 'pass',
        checks: '[{"name":"test","status":"pass"}]',
        summary: '{"total":1,"passed":1}',
        duration: 1000
      };

      const result = HealthCheckResult.fromDatabase(dbData);

      expect(result.checks).toEqual([{ name: 'test', status: 'pass' }]);
      expect(result.summary).toEqual({ total: 1, passed: 1 });
    });

    test('fromDatabase should handle invalid JSON gracefully', () => {
      const dbData = {
        id: 1,
        timestamp: new Date(),
        environment: 'production',
        overall_status: 'pass',
        checks: 'invalid json',
        summary: 'invalid json',
        duration: 1000
      };

      const result = HealthCheckResult.fromDatabase(dbData);

      expect(result.checks).toEqual([]);
      expect(result.summary).toEqual({});
    });
  });

  describe('Database Conversion', () => {
    test('toDatabase should convert to database format', () => {
      const result = new HealthCheckResult({
        timestamp: new Date('2023-01-01'),
        environment: 'production',
        overallStatus: 'pass',
        checks: [{ name: 'test', status: 'pass' }],
        summary: { total: 1, passed: 1 },
        duration: 1000
      });

      const dbFormat = result.toDatabase();

      expect(dbFormat.overall_status).toBe('pass');
      expect(dbFormat.checks).toBe('[{"name":"test","status":"pass"}]');
      expect(dbFormat.summary).toBe('{"total":1,"passed":1}');
    });

    test('toDatabase should handle string fields', () => {
      const result = new HealthCheckResult({
        timestamp: new Date(),
        environment: 'production',
        overallStatus: 'pass',
        checks: '[{"name":"test"}]',
        summary: '{"total":1}',
        duration: 1000
      });

      const dbFormat = result.toDatabase();

      expect(dbFormat.checks).toBe('[{"name":"test"}]');
      expect(dbFormat.summary).toBe('{"total":1}');
    });
  });

  describe('Business Logic Methods', () => {
    test('getSummary should return summary or calculate from checks', () => {
      // With provided summary
      const resultWithSummary = new HealthCheckResult({
        summary: { total: 5, passed: 3, failed: 1, warnings: 1 }
      });
      expect(resultWithSummary.getSummary()).toEqual({ total: 5, passed: 3, failed: 1, warnings: 1 });

      // Calculate from checks
      const resultWithChecks = new HealthCheckResult({
        checks: [
          { status: 'pass' },
          { status: 'pass' },
          { status: 'fail' },
          { status: 'warning' }
        ]
      });
      expect(resultWithChecks.getSummary()).toEqual({ total: 4, passed: 2, failed: 1, warnings: 1 });

      // No summary or checks
      const emptyResult = new HealthCheckResult();
      expect(emptyResult.getSummary()).toEqual({ total: 0, passed: 0, failed: 0, warnings: 0 });
    });

    test('status check methods should work correctly', () => {
      const passedResult = new HealthCheckResult({ overallStatus: 'pass' });
      const failedResult = new HealthCheckResult({ overallStatus: 'fail' });
      const warningResult = new HealthCheckResult({ overallStatus: 'warning' });

      expect(passedResult.isPassed()).toBe(true);
      expect(passedResult.isFailed()).toBe(false);
      expect(passedResult.hasWarnings()).toBe(false);

      expect(failedResult.isPassed()).toBe(false);
      expect(failedResult.isFailed()).toBe(true);
      expect(failedResult.hasWarnings()).toBe(false);

      expect(warningResult.isPassed()).toBe(false);
      expect(warningResult.isFailed()).toBe(false);
      expect(warningResult.hasWarnings()).toBe(true);
    });

    test('getFailedChecks should return only failed checks', () => {
      const result = new HealthCheckResult({
        checks: [
          { name: 'test1', status: 'pass' },
          { name: 'test2', status: 'fail' },
          { name: 'test3', status: 'warning' },
          { name: 'test4', status: 'fail' }
        ]
      });

      const failedChecks = result.getFailedChecks();
      expect(failedChecks).toHaveLength(2);
      expect(failedChecks[0].name).toBe('test2');
      expect(failedChecks[1].name).toBe('test4');
    });

    test('getWarningChecks should return only warning checks', () => {
      const result = new HealthCheckResult({
        checks: [
          { name: 'test1', status: 'pass' },
          { name: 'test2', status: 'fail' },
          { name: 'test3', status: 'warning' },
          { name: 'test4', status: 'warning' }
        ]
      });

      const warningChecks = result.getWarningChecks();
      expect(warningChecks).toHaveLength(2);
      expect(warningChecks[0].name).toBe('test3');
      expect(warningChecks[1].name).toBe('test4');
    });
  });

  describe('JSON Conversion', () => {
    test('toJSON should return complete JSON representation', () => {
      const result = new HealthCheckResult({
        id: 1,
        timestamp: new Date('2023-01-01'),
        environment: 'production',
        overallStatus: 'pass',
        checks: [{ name: 'test', status: 'pass' }],
        summary: { total: 1, passed: 1 },
        duration: 1000
      });

      const json = result.toJSON();

      expect(json).toEqual({
        id: 1,
        timestamp: new Date('2023-01-01'),
        environment: 'production',
        overallStatus: 'pass',
        checks: [{ name: 'test', status: 'pass' }],
        summary: { total: 1, passed: 1 },
        duration: 1000,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });
});