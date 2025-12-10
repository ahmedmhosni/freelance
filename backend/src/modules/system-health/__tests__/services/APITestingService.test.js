const APITestingService = require('../../services/APITestingService');

describe('APITestingService', () => {
  let apiTestingService;
  let mockDatabase;
  let mockLogger;
  let mockAuthService;
  let mockClientService;
  let mockProjectService;

  beforeEach(() => {
    mockDatabase = {
      queryOne: jest.fn(),
      execute: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    };

    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyToken: jest.fn()
    };

    mockClientService = {
      getAllForUser: jest.fn(),
      create: jest.fn(),
      getByIdForUser: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockProjectService = {
      getAllForUser: jest.fn(),
      createForUser: jest.fn(),
      getByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn()
    };

    apiTestingService = new APITestingService(
      mockDatabase,
      mockLogger,
      mockAuthService,
      mockClientService,
      mockProjectService
    );
  });

  describe('testDatabaseConnectivity', () => {
    it('should pass when database connection is successful', async () => {
      mockDatabase.queryOne.mockResolvedValue({ test: 1 });

      const result = await apiTestingService.testDatabaseConnectivity();

      expect(result.status).toBe('pass');
      expect(result.name).toBe('Database Connectivity');
      expect(result.message).toBe('Database connection successful');
      expect(mockDatabase.queryOne).toHaveBeenCalledWith('SELECT 1 as test');
    });

    it('should fail when database query returns unexpected result', async () => {
      mockDatabase.queryOne.mockResolvedValue({ test: 2 });

      const result = await apiTestingService.testDatabaseConnectivity();

      expect(result.status).toBe('fail');
      expect(result.message).toBe('Database query returned unexpected result');
    });

    it('should fail when database connection throws error', async () => {
      const error = new Error('Connection failed');
      mockDatabase.queryOne.mockRejectedValue(error);

      const result = await apiTestingService.testDatabaseConnectivity();

      expect(result.status).toBe('fail');
      expect(result.message).toBe('Database connection failed: Connection failed');
    });
  });

  describe('testClientsEndpoints', () => {
    it('should test all client CRUD operations successfully', async () => {
      const userId = 1;
      const mockClient = { id: 1, name: 'Test Client' };

      mockClientService.getAllForUser.mockResolvedValue({ data: [mockClient] });
      mockClientService.create.mockResolvedValue(mockClient);
      mockClientService.getByIdForUser.mockResolvedValue(mockClient);
      mockClientService.update.mockResolvedValue(mockClient);
      mockClientService.delete.mockResolvedValue(true);

      const results = await apiTestingService.testClientsEndpoints(userId);

      expect(results).toHaveLength(5);
      expect(results.every(r => r.status === 'pass')).toBe(true);
      expect(results.map(r => r.name)).toEqual([
        'Clients - Get All',
        'Clients - Create',
        'Clients - Get By ID',
        'Clients - Update',
        'Clients - Delete'
      ]);
    });

    it('should handle client service errors gracefully', async () => {
      const userId = 1;
      const error = new Error('Service error');
      mockClientService.getAllForUser.mockRejectedValue(error);

      const results = await apiTestingService.testClientsEndpoints(userId);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('fail');
      expect(results[0].name).toBe('Clients Module');
      expect(results[0].message).toBe('Clients testing failed: Service error');
    });
  });

  describe('testProjectsEndpoints', () => {
    it('should test all project CRUD operations successfully', async () => {
      const userId = 1;
      const mockProject = { id: 1, name: 'Test Project' };

      mockProjectService.getAllForUser.mockResolvedValue([mockProject]);
      mockProjectService.createForUser.mockResolvedValue(mockProject);
      mockProjectService.getByIdForUser.mockResolvedValue(mockProject);
      mockProjectService.updateForUser.mockResolvedValue(mockProject);
      mockProjectService.deleteForUser.mockResolvedValue(true);

      const results = await apiTestingService.testProjectsEndpoints(userId);

      expect(results).toHaveLength(5);
      expect(results.every(r => r.status === 'pass')).toBe(true);
      expect(results.map(r => r.name)).toEqual([
        'Projects - Get All',
        'Projects - Create',
        'Projects - Get By ID',
        'Projects - Update',
        'Projects - Delete'
      ]);
    });

    it('should handle project service errors gracefully', async () => {
      const userId = 1;
      const error = new Error('Service error');
      mockProjectService.getAllForUser.mockRejectedValue(error);

      const results = await apiTestingService.testProjectsEndpoints(userId);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('fail');
      expect(results[0].name).toBe('Projects Module');
      expect(results[0].message).toBe('Projects testing failed: Service error');
    });
  });

  describe('testAuthenticationFlow', () => {
    beforeEach(() => {
      // Mock getOrCreateTestUser
      mockDatabase.queryOne.mockResolvedValue({
        id: 1,
        email: 'apitest@example.com'
      });
    });

    it('should test authentication flow successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockLoginResult = { user: mockUser, token: 'test-token' };
      const mockDecoded = { id: 1, email: 'test@example.com' };

      mockAuthService.register.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockLoginResult);
      mockAuthService.verifyToken.mockResolvedValue(mockDecoded);

      const results = await apiTestingService.testAuthenticationFlow();

      expect(results.length).toBeGreaterThan(0);
      const passedTests = results.filter(r => r.status === 'pass');
      expect(passedTests.length).toBeGreaterThan(0);
    });
  });

  describe('testSecurityValidation', () => {
    it('should test CORS headers configuration', async () => {
      const originalEnv = process.env.CORS_ORIGIN;
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      const results = await apiTestingService.testSecurityValidation();

      expect(results.length).toBeGreaterThan(0);
      const corsTest = results.find(r => r.name === 'Security - CORS Headers');
      expect(corsTest).toBeDefined();
      expect(corsTest.status).toBe('pass');

      process.env.CORS_ORIGIN = originalEnv;
    });

    it('should test rate limiting configuration', async () => {
      const results = await apiTestingService.testSecurityValidation();

      const rateLimitTest = results.find(r => r.name === 'Security - Rate Limiting');
      expect(rateLimitTest).toBeDefined();
      expect(['pass', 'warning', 'fail']).toContain(rateLimitTest.status);
    });

    it('should test authentication middleware integration', async () => {
      const results = await apiTestingService.testSecurityValidation();

      const authTest = results.find(r => r.name === 'Security - Auth Middleware');
      expect(authTest).toBeDefined();
      expect(authTest.status).toBe('pass');
      expect(authTest.details.authService).toBe(true);
    });

    it('should test security headers configuration', async () => {
      const results = await apiTestingService.testSecurityValidation();

      const securityHeadersTest = results.find(r => r.name === 'Security - Security Headers');
      expect(securityHeadersTest).toBeDefined();
      expect(['pass', 'warning', 'fail']).toContain(securityHeadersTest.status);
    });

    it('should handle security validation errors gracefully', async () => {
      // Mock logger to throw error
      mockLogger.info.mockImplementation(() => {
        throw new Error('Logging error');
      });

      const results = await apiTestingService.testSecurityValidation();

      expect(results.length).toBeGreaterThan(0);
      const errorTest = results.find(r => r.name === 'Security Validation');
      expect(errorTest).toBeDefined();
      expect(errorTest.status).toBe('fail');
    });
  });

  describe('testErrorHandling', () => {
    it('should test not found error handling', async () => {
      mockClientService.getByIdForUser.mockRejectedValue(new Error('Client not found'));

      const results = await apiTestingService.testErrorHandling();

      expect(results.length).toBeGreaterThan(0);
      const notFoundTest = results.find(r => r.name === 'Error Handling - Not Found');
      expect(notFoundTest).toBeDefined();
      expect(['pass', 'warning', 'fail']).toContain(notFoundTest.status);
    });

    it('should test validation error handling', async () => {
      mockClientService.create.mockRejectedValue(new Error('Validation failed'));

      const results = await apiTestingService.testErrorHandling();

      expect(results.length).toBeGreaterThan(0);
      const validationTest = results.find(r => r.name === 'Error Handling - Validation');
      expect(validationTest).toBeDefined();
      expect(['pass', 'warning', 'fail']).toContain(validationTest.status);
    });

    it('should test error response format', async () => {
      const results = await apiTestingService.testErrorHandling();

      const responseFormatTest = results.find(r => r.name === 'Error Handling - Response Format');
      expect(responseFormatTest).toBeDefined();
      expect(responseFormatTest.status).toBe('pass');
    });

    it('should test error logging', async () => {
      const results = await apiTestingService.testErrorHandling();

      const loggingTest = results.find(r => r.name === 'Error Handling - Logging');
      expect(loggingTest).toBeDefined();
      expect(loggingTest.status).toBe('pass');
      expect(loggingTest.details.loggerAvailable).toBe(true);
    });

    it('should handle error handling test failures gracefully', async () => {
      mockLogger.info.mockImplementation(() => {
        throw new Error('Logger error');
      });

      const results = await apiTestingService.testErrorHandling();

      expect(results.length).toBeGreaterThan(0);
      const errorTest = results.find(r => r.name === 'Error Handling');
      expect(errorTest).toBeDefined();
      expect(errorTest.status).toBe('fail');
    });
  });

  describe('runComprehensiveTest', () => {
    beforeEach(() => {
      // Mock all dependencies for comprehensive test
      mockDatabase.queryOne.mockResolvedValue({ test: 1 });
      mockAuthService.login.mockResolvedValue({
        user: { id: 1, email: 'test@example.com' },
        token: 'test-token'
      });
      mockAuthService.verifyToken.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockClientService.getAllForUser.mockResolvedValue({ data: [] });
      mockProjectService.getAllForUser.mockResolvedValue([]);
    });

    it('should run comprehensive API testing', async () => {
      const results = await apiTestingService.runComprehensiveTest();

      expect(results).toHaveProperty('timestamp');
      expect(results).toHaveProperty('overallStatus');
      expect(results).toHaveProperty('tests');
      expect(results).toHaveProperty('summary');
      expect(results.tests.length).toBeGreaterThan(0);
      expect(results.summary.total).toBe(results.tests.length);
    });

    it('should calculate summary statistics correctly', async () => {
      const results = await apiTestingService.runComprehensiveTest();

      expect(results.summary.passed + results.summary.failed + results.summary.warnings)
        .toBe(results.summary.total);
    });
  });
});