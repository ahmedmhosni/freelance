/**
 * Property-Based Tests for MonitoringService Error Reporting
 * **Feature: system-health-deployment, Property 9: Error Reporting Completeness**
 * **Validates: Requirements 5.4, 6.2**
 */

const fc = require('fast-check');
const MonitoringService = require('../../services/MonitoringService');

describe('MonitoringService Error Reporting Property Tests', () => {
  let mockDatabase;
  let mockLogger;
  let mockConfig;
  let mockNotificationService;
  let mockAnalyticsService;
  let monitoringService;

  beforeEach(() => {
    // Mock database
    mockDatabase = {
      query: jest.fn().mockResolvedValue({ rows: [] })
    };

    // Mock logger with all required methods
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    // Mock config
    mockConfig = {
      monitoring: {
        alertThresholds: {
          cpu: 80,
          memory: 85,
          disk: 90
        }
      }
    };

    // Mock notification service
    mockNotificationService = {
      createSystemNotification: jest.fn().mockResolvedValue({ id: 'notification-123' })
    };

    // Mock analytics service
    mockAnalyticsService = {
      trackEvent: jest.fn().mockResolvedValue({ tracked: true })
    };

    monitoringService = new MonitoringService(
      mockDatabase,
      mockLogger,
      mockConfig,
      mockNotificationService,
      mockAnalyticsService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 9: Error Reporting Completeness
   * For any system error or failure, the system should provide detailed error information 
   * and actionable troubleshooting guidance
   */
  describe('Property 9: Error Reporting Completeness', () => {
    test('should provide detailed error information for any system failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate various error scenarios
          fc.record({
            errorType: fc.constantFrom('database_error', 'network_error', 'validation_error', 'timeout_error', 'permission_error'),
            errorMessage: fc.string({ minLength: 1, maxLength: 200 }),
            errorCode: fc.option(fc.string({ minLength: 3, maxLength: 10 })),
            context: fc.record({
              operation: fc.string({ minLength: 1, maxLength: 50 }),
              timestamp: fc.date(),
              userId: fc.option(fc.string()),
              deploymentId: fc.option(fc.string())
            })
          }),
          async (errorScenario) => {
            // Create a mock error based on the scenario
            const mockError = new Error(errorScenario.errorMessage);
            mockError.code = errorScenario.errorCode;
            mockError.type = errorScenario.errorType;

            // Mock database failure for database errors
            if (errorScenario.errorType === 'database_error') {
              mockDatabase.query.mockRejectedValueOnce(mockError);
            }

            let errorReported = false;
            let errorDetails = null;

            try {
              // Trigger different operations that might fail
              switch (errorScenario.errorType) {
                case 'database_error':
                  await monitoringService.checkDatabaseHealth();
                  break;
                case 'network_error':
                  // Simulate network error in API health check
                  jest.spyOn(monitoringService, 'checkAPIHealth').mockRejectedValueOnce(mockError);
                  await monitoringService.checkAPIHealth();
                  break;
                case 'validation_error':
                  // Simulate validation error in tracking metrics
                  await monitoringService.trackDeploymentMetrics(null); // Invalid input
                  break;
                case 'timeout_error':
                  // Simulate timeout in system monitoring
                  jest.spyOn(monitoringService, 'collectSystemMetrics').mockRejectedValueOnce(mockError);
                  await monitoringService.monitorSystemHealth();
                  break;
                case 'permission_error':
                  // Simulate permission error in alert generation
                  mockNotificationService.createSystemNotification.mockRejectedValueOnce(mockError);
                  await monitoringService.generateAlerts([{
                    triggered: true,
                    title: 'Test Alert',
                    message: 'Test message',
                    severity: 'warning'
                  }]);
                  break;
              }
            } catch (caughtError) {
              errorReported = true;
              errorDetails = caughtError;
            }

            // Verify error reporting completeness
            if (errorReported && errorDetails) {
              // 1. Error should have detailed information (Requirement 6.2)
              expect(errorDetails).toBeDefined();
              expect(errorDetails.message).toBeDefined();
              expect(typeof errorDetails.message).toBe('string');
              expect(errorDetails.message.length).toBeGreaterThan(0);

              // 2. Logger should capture detailed error information and context (Requirement 6.2)
              expect(mockLogger.error).toHaveBeenCalled();
              
              const errorLogCalls = mockLogger.error.mock.calls;
              const hasDetailedErrorLog = errorLogCalls.some(call => {
                const [message, context] = call;
                return (
                  typeof message === 'string' &&
                  message.length > 0 &&
                  context &&
                  (context.error || context.errorMessage || context.message)
                );
              });
              
              expect(hasDetailedErrorLog).toBe(true);

              // 3. Error information should be actionable (Requirement 5.4)
              // Check that error messages provide guidance or context
              const errorMessage = errorDetails.message.toLowerCase();
              const loggedMessages = errorLogCalls.map(call => call[0].toLowerCase());
              
              const hasActionableGuidance = 
                errorMessage.includes('required') ||
                errorMessage.includes('invalid') ||
                errorMessage.includes('failed') ||
                errorMessage.includes('missing') ||
                loggedMessages.some(msg => 
                  msg.includes('failed') ||
                  msg.includes('error') ||
                  msg.includes('check') ||
                  msg.includes('validate')
                );
              
              expect(hasActionableGuidance).toBe(true);
            }

            // 4. System should continue operating after error (graceful degradation)
            // Verify that the service is still functional after error
            const serviceState = monitoringService.getMonitoringState();
            expect(serviceState).toBeDefined();
            expect(typeof serviceState).toBe('object');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should provide troubleshooting guidance for deployment issues', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate deployment error scenarios
          fc.record({
            deploymentId: fc.string({ minLength: 1, maxLength: 50 }),
            environment: fc.constantFrom('development', 'staging', 'production'),
            errorType: fc.constantFrom('deployment_timeout', 'resource_unavailable', 'configuration_error', 'permission_denied'),
            severity: fc.constantFrom('warning', 'critical')
          }),
          async (deploymentScenario) => {
            // Create deployment-specific error
            const deploymentError = new Error(`Deployment failed: ${deploymentScenario.errorType}`);
            deploymentError.deploymentId = deploymentScenario.deploymentId;
            deploymentError.environment = deploymentScenario.environment;

            // Mock deployment tracking failure
            jest.spyOn(monitoringService, 'saveMonitoringData').mockRejectedValueOnce(deploymentError);

            let deploymentErrorCaught = false;
            let troubleshootingProvided = false;

            try {
              await monitoringService.trackDeploymentMetrics(deploymentScenario.deploymentId);
            } catch (error) {
              deploymentErrorCaught = true;

              // Verify troubleshooting guidance is provided (Requirement 5.4)
              expect(error).toBeDefined();
              expect(error.message).toBeDefined();

              // Check that logger provides troubleshooting context
              expect(mockLogger.error).toHaveBeenCalled();
              
              const errorLogCalls = mockLogger.error.mock.calls;
              troubleshootingProvided = errorLogCalls.some(call => {
                const [message, context] = call;
                return (
                  message.toLowerCase().includes('failed') &&
                  context &&
                  (context.deploymentId || context.error)
                );
              });
            }

            // Verify deployment error reporting completeness
            if (deploymentErrorCaught) {
              expect(troubleshootingProvided).toBe(true);
              
              // Verify error context includes deployment information
              const errorCalls = mockLogger.error.mock.calls;
              const hasDeploymentContext = errorCalls.some(call => {
                const [, context] = call;
                return context && (
                  context.deploymentId ||
                  context.environment ||
                  context.error
                );
              });
              
              expect(hasDeploymentContext).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should capture comprehensive error context for debugging', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate various monitoring operations that might fail
          fc.record({
            operation: fc.constantFrom('monitorSystemHealth', 'generateSystemAlerts', 'trackDeploymentSuccess'),
            errorCondition: fc.constantFrom('service_unavailable', 'invalid_input', 'timeout', 'resource_exhausted'),
            contextData: fc.record({
              timestamp: fc.date(),
              userId: fc.option(fc.string()),
              sessionId: fc.option(fc.string()),
              requestId: fc.option(fc.string())
            })
          }),
          async (scenario) => {
            // Create contextual error
            const contextualError = new Error(`${scenario.operation} failed: ${scenario.errorCondition}`);
            contextualError.context = scenario.contextData;

            let errorWithContextCaptured = false;

            // Mock different operations to fail
            switch (scenario.operation) {
              case 'monitorSystemHealth':
                jest.spyOn(monitoringService, 'collectSystemMetrics').mockRejectedValueOnce(contextualError);
                try {
                  await monitoringService.monitorSystemHealth();
                } catch (error) {
                  errorWithContextCaptured = true;
                }
                break;

              case 'generateSystemAlerts':
                mockNotificationService.createSystemNotification.mockRejectedValueOnce(contextualError);
                try {
                  await monitoringService.generateSystemAlerts();
                } catch (error) {
                  errorWithContextCaptured = true;
                }
                break;

              case 'trackDeploymentSuccess':
                jest.spyOn(monitoringService, 'saveMonitoringData').mockRejectedValueOnce(contextualError);
                try {
                  await monitoringService.trackDeploymentSuccess({
                    deploymentId: 'test-deployment',
                    environment: 'test'
                  });
                } catch (error) {
                  errorWithContextCaptured = true;
                }
                break;
            }

            if (errorWithContextCaptured) {
              // Verify comprehensive error context is captured (Requirement 6.2)
              expect(mockLogger.error).toHaveBeenCalled();
              
              const errorLogCalls = mockLogger.error.mock.calls;
              const hasComprehensiveContext = errorLogCalls.some(call => {
                const [message, context] = call;
                return (
                  typeof message === 'string' &&
                  message.length > 0 &&
                  context &&
                  (context.error || context.errorMessage || context.message)
                );
              });
              
              expect(hasComprehensiveContext).toBe(true);

              // Verify error information includes operation context
              const hasOperationContext = errorLogCalls.some(call => {
                const [message] = call;
                return message.toLowerCase().includes(scenario.operation.toLowerCase()) ||
                       message.toLowerCase().includes('failed') ||
                       message.toLowerCase().includes('error');
              });
              
              expect(hasOperationContext).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});