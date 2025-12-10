/**
 * Unit Tests for HealthCheckService
 * Tests service instantiation, DI integration, and error handling
 */

const HealthCheckService = require('../../services/HealthCheckService');
const HealthCheckResult = require('../../models/HealthCheckResult');

// Mock dependencies
const mockDatabase = {
  query: jest.fn(),
  queryOne: jest.fn(),
  queryMany: jest.fn(),
  healthCheck: jest.fn(),
  getPoolStats: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockConfig = {
  getDatabaseConfig: jest.fn(() => ({})),
  logging: { logQueries: false }
};

const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  exists: jest.fn()
};

describe('HealthCheckService', () => {
  let healthCheckService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create service instance
    healthCheckService = new HealthCheckService(
      mockDatabase,
      mockLogger,
      mockConfig,
      mockRepository
    );
  });

  describe('Constructor and DI Integration', () => {
    test('should instantiate with all required dependencies', () => {
      expect(healthCheckService).toBeInstanceOf(HealthCheckService);
      expect(healthCheckService.database).toBe(mockDatabase);
      expect(healthCheckService.logger).toBe(mockLogger);
      expect(healthCheckService.config).toBe(mockConfig);
      expect(healthCheckService.repository).toBe(mockRepository);
    });

    test('should throw error if repository is missing', () => {
      expect(() => {
        new HealthCheckService(mockDatabase, mockLogger, mockConfig, null);
      }).toThrow('Repository instance is required');
    });

    test('should inherit from BaseService', () => {
      // Check that it has BaseService methods
      expect(typeof healthCheckService.getById).toBe('function');
      expect(typeof healthCheckService.getAll).toBe('function');
      expect(typeof healthCheckService.create).toBe('function');
      expect(typeof healthCheckService.update).toBe('function');
      expect(typeof healthCheckService.delete).toBe('function');
    });
  });

  describe('Database Integration', () => {
    test('should use database for connectivity testing', async () => {
      // Mock successful database response
      mockDatabase.query.mockResolvedValue({
        rows: [{ current_time: new Date(), db_version: 'PostgreSQL 13.0' }]
      });
      mockDatabase.healthCheck.mockResolvedValue(true);
      mockDatabase.getPoolStats.mockReturnValue({ total: 10, idle: 5, waiting: 0 });

      const result = await healthCheckService.testDatabaseConnectivity();

      expect(mockDatabase.query).toHaveBeenCalledWith('SELECT NOW() as current_time, version() as db_version');
      expect(mockDatabase.healthCheck).toHaveBeenCalled();
      expect(result.status).toBe('pass');
      expect(result.name).toBe('Database Connectivity');
    });

    test('should handle database connection errors', async () => {
      // Mock database error
      mockDatabase.query.mockRejectedValue(new Error('Connection failed'));

      const result = await healthCheckService.testDatabaseConnectivity();

      expect(result.status).toBe('fail');
      expect(result.message).toContain('Database connection failed');
      expect(result.details.error).toBe('Connection failed');
    });
  });

  describe('Logging Integration', () => {
    test('should log system check start and completion', async () => {
      // Mock all dependencies to succeed
      mockDatabase.query.mockResolvedValue({
        rows: [{ current_time: new Date(), db_version: 'PostgreSQL 13.0' }]
      });
      mockDatabase.healthCheck.mockResolvedValue(true);
      mockDatabase.getPoolStats.mockReturnValue({ total: 10, idle: 5, waiting: 0 });
      mockRepository.create.mockResolvedValue({ id: 1 });

      // Mock file system access
      const fs = require('fs').promises;
      jest.spyOn(fs, 'access').mockResolvedValue();

      await healthCheckService.runSystemCheck();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting comprehensive system health check',
        expect.any(Object)
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'System health check completed',
        expect.objectContaining({
          status: expect.any(String),
          duration: expect.any(Number)
        })
      );
    });

    test('should log errors when system check fails', async () => {
      // Mock database error
      mockDatabase.query.mockRejectedValue(new Error('Database error'));

      await expect(healthCheckService.runSystemCheck()).rejects.toThrow('Database error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'System health check failed',
        expect.any(Error)
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle file system validation errors gracefully', async () => {
      const result = await healthCheckService.validateFileStructure(['nonexistent/path']);

      expect(result.status).toBe('fail');
      expect(result.name).toBe('File Structure Validation');
      expect(result.details.missingPaths).toHaveLength(1);
    });

    test('should handle environment validation errors gracefully', async () => {
      // Clear environment variables
      const originalEnv = process.env;
      process.env = {};

      const result = await healthCheckService.checkEnvironmentConfig('production');

      expect(result.status).toBe('fail');
      expect(result.name).toBe('Environment Configuration');
      expect(result.details.missingVars.length).toBeGreaterThan(0);

      // Restore environment
      process.env = originalEnv;
    });

    test('should handle dependency validation errors gracefully', async () => {
      const result = await healthCheckService.validateDependencies('nonexistent/path');

      expect(result.status).toBe('fail');
      expect(result.name).toBe('Dependencies Validation');
      expect(result.message).toContain('Dependencies validation failed');
    });

    test('should handle security validation errors gracefully', async () => {
      const result = await healthCheckService.validateSecurityConfig();

      expect(result.name).toBe('Security Configuration');
      expect(['pass', 'warning', 'fail']).toContain(result.status);
    });
  });

  describe('Report Generation', () => {
    test('should generate comprehensive health report', () => {
      const checks = [
        { name: 'Test 1', status: 'pass', duration: 100 },
        { name: 'Test 2', status: 'fail', duration: 200 },
        { name: 'Test 3', status: 'warning', duration: 150 }
      ];

      const report = healthCheckService.generateHealthReport(checks, Date.now() - 1000);

      expect(report.overallStatus).toBe('fail'); // Has failed checks
      expect(report.summary.total).toBe(3);
      expect(report.summary.passed).toBe(1);
      expect(report.summary.failed).toBe(1);
      expect(report.summary.warnings).toBe(1);
      expect(report.duration).toBeGreaterThan(0);
      expect(report.checks).toEqual(checks);
    });

    test('should determine overall status correctly', () => {
      // All pass
      let checks = [
        { name: 'Test 1', status: 'pass' },
        { name: 'Test 2', status: 'pass' }
      ];
      let report = healthCheckService.generateHealthReport(checks, Date.now());
      expect(report.overallStatus).toBe('pass');

      // Has warnings
      checks = [
        { name: 'Test 1', status: 'pass' },
        { name: 'Test 2', status: 'warning' }
      ];
      report = healthCheckService.generateHealthReport(checks, Date.now());
      expect(report.overallStatus).toBe('warning');

      // Has failures
      checks = [
        { name: 'Test 1', status: 'pass' },
        { name: 'Test 2', status: 'fail' }
      ];
      report = healthCheckService.generateHealthReport(checks, Date.now());
      expect(report.overallStatus).toBe('fail');
    });
  });

  describe('Repository Integration', () => {
    test('should save health check results to repository', async () => {
      // Mock successful dependencies
      mockDatabase.query.mockResolvedValue({
        rows: [{ current_time: new Date(), db_version: 'PostgreSQL 13.0' }]
      });
      mockDatabase.healthCheck.mockResolvedValue(true);
      mockDatabase.getPoolStats.mockReturnValue({ total: 10, idle: 5, waiting: 0 });
      mockRepository.create.mockResolvedValue({ id: 1 });

      // Mock file system access
      const fs = require('fs').promises;
      jest.spyOn(fs, 'access').mockResolvedValue();

      await healthCheckService.runSystemCheck({ environment: 'test' });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Date),
          environment: 'test',
          overall_status: expect.any(String),
          checks: expect.any(String),
          summary: expect.any(String),
          duration: expect.any(Number)
        })
      );
    });

    test('should handle repository errors gracefully', async () => {
      // Mock repository error
      mockRepository.create.mockRejectedValue(new Error('Database save failed'));
      
      // Mock other dependencies to succeed
      mockDatabase.query.mockResolvedValue({
        rows: [{ current_time: new Date(), db_version: 'PostgreSQL 13.0' }]
      });
      mockDatabase.healthCheck.mockResolvedValue(true);
      mockDatabase.getPoolStats.mockReturnValue({ total: 10, idle: 5, waiting: 0 });

      // Mock file system access
      const fs = require('fs').promises;
      jest.spyOn(fs, 'access').mockResolvedValue();

      await expect(healthCheckService.runSystemCheck()).rejects.toThrow('Database save failed');
    });
  });
});