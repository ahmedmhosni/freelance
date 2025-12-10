/**
 * Property-Based Tests for MonitoringService Integration
 * **Feature: system-health-deployment, Property 12: Monitoring Integration Reliability**
 * **Validates: Requirements 6.4, 6.5**
 */

const fc = require('fast-check');
const MonitoringService = require('../../services/MonitoringService');

describe('MonitoringService Integration Property Tests', () => {
  let mockDatabase;
  let mockLogger;
  let mockConfig;
  let mockNotificationService;
  let mockAnalyticsService;
  let monitoringService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    mockDatabase = {
      query: jest.fn().mockResolvedValue([{ result: 1 }])
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };

    mockConfig = {
      monitoring: {
        enabled: true,
        checkInterval: 1000
      }
    };

    mockNotificationService = {
      createSystemNotification: jest.fn().mockResolvedValue({ id: 'notification-123' })
    };

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
   * Property 12: Monitoring Integration Reliability
   * For any production deployment, monitoring integration should consistently collect and report telemetry data
   */
  test('Property 12: Monitoring integration should consistently collect and report telemetry data', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate deployment configurations
        fc.record({
          deploymentId: fc.string({ minLength: 1, maxLength: 50 }),
          environment: fc.constantFrom('development', 'staging', 'production'),
          version: fc.string({ minLength: 1, maxLength: 20 }),
          duration: fc.integer({ min: 1000, max: 300000 }), // 1s to 5min
          backendDeployed: fc.boolean(),
          frontendDeployed: fc.boolean(),
          databaseMigrated: fc.boolean(),
          allHealthChecksPass: fc.boolean()
        }),
        // Generate Application Insights configurations
        fc.record({
          connectionString: fc.string({ minLength: 10, maxLength: 200 }),
          instrumentationKey: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
          samplingPercentage: fc.integer({ min: 1, max: 100 }),
          enableAutoCollection: fc.boolean(),
          enableDependencyTracking: fc.boolean(),
          enablePerformanceTracking: fc.boolean()
        }),
        async (deploymentInfo, appInsightsConfig) => {
          // Setup Application Insights
          const setupResult = await monitoringService.setupApplicationInsights(appInsightsConfig);
          
          // Verify setup result structure
          expect(setupResult).toHaveProperty('status', 'configured');
          expect(setupResult).toHaveProperty('config');
          expect(setupResult).toHaveProperty('timestamp');
          expect(setupResult.config.connectionString).toBe(appInsightsConfig.connectionString);

          // Track deployment metrics
          const trackingResult = await monitoringService.trackDeploymentMetrics(deploymentInfo.deploymentId);
          
          // Verify tracking result structure
          expect(trackingResult).toHaveProperty('status', 'tracked');
          expect(trackingResult).toHaveProperty('deploymentId', deploymentInfo.deploymentId);
          expect(trackingResult).toHaveProperty('metrics');
          expect(trackingResult).toHaveProperty('timestamp');

          // Verify analytics service integration
          expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
            'deployment_metrics',
            'system',
            null,
            expect.objectContaining({
              deploymentId: deploymentInfo.deploymentId
            })
          );

          // Track deployment success
          const successResult = await monitoringService.trackDeploymentSuccess(deploymentInfo);
          
          // Verify success tracking structure
          expect(successResult).toHaveProperty('deploymentId', deploymentInfo.deploymentId);
          expect(successResult).toHaveProperty('environment', deploymentInfo.environment);
          expect(successResult).toHaveProperty('status', 'success');
          expect(successResult).toHaveProperty('metrics');
          expect(successResult.metrics).toHaveProperty('backendDeployed', deploymentInfo.backendDeployed);
          expect(successResult.metrics).toHaveProperty('frontendDeployed', deploymentInfo.frontendDeployed);

          // Verify analytics tracking for success
          expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
            'deployment_success',
            'system',
            null,
            expect.objectContaining({
              deploymentId: deploymentInfo.deploymentId,
              environment: deploymentInfo.environment,
              status: 'success'
            })
          );

          // Monitor system health
          const healthResult = await monitoringService.monitorSystemHealth();
          
          // Verify health monitoring structure
          expect(healthResult).toHaveProperty('timestamp');
          expect(healthResult).toHaveProperty('checks');
          expect(healthResult).toHaveProperty('status');
          expect(healthResult).toHaveProperty('duration');
          expect(Array.isArray(healthResult.checks)).toBe(true);
          expect(healthResult.checks.length).toBeGreaterThan(0);

          // Verify each health check has required properties
          healthResult.checks.forEach(check => {
            expect(check).toHaveProperty('metric');
            expect(check).toHaveProperty('status');
            expect(check).toHaveProperty('timestamp');
            expect(['healthy', 'warning', 'critical', 'unknown']).toContain(check.status);
          });

          // Create performance monitoring
          const perfResult = await monitoringService.createPerformanceMonitoring(deploymentInfo.deploymentId);
          
          // Verify performance monitoring structure
          expect(perfResult).toHaveProperty('deploymentId', deploymentInfo.deploymentId);
          expect(perfResult).toHaveProperty('metrics');
          expect(perfResult).toHaveProperty('alerts');
          expect(perfResult).toHaveProperty('samplingRate');
          expect(perfResult).toHaveProperty('retentionDays');

          // Verify performance metrics structure
          const expectedMetrics = ['responseTime', 'errorRate', 'throughput', 'cpuUsage', 'memoryUsage', 'databaseQueryTime'];
          expectedMetrics.forEach(metric => {
            expect(perfResult.metrics).toHaveProperty(metric);
            expect(perfResult.metrics[metric]).toHaveProperty('threshold');
            expect(perfResult.metrics[metric]).toHaveProperty('unit');
            expect(perfResult.metrics[metric]).toHaveProperty('tracked', true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: Alert generation should integrate consistently with notification service', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate alert conditions
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom('system_alert', 'deployment_alert', 'performance_alert'),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            message: fc.string({ minLength: 10, maxLength: 200 }),
            severity: fc.constantFrom('info', 'warning', 'error', 'critical'),
            triggered: fc.boolean()
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (conditions) => {
          // Reset mocks before each test run
          mockNotificationService.createSystemNotification.mockClear();
          mockAnalyticsService.trackEvent.mockClear();

          // Generate alerts
          const alerts = await monitoringService.generateAlerts(conditions);
          
          // Verify alert generation consistency
          const triggeredConditions = conditions.filter(c => c.triggered);
          expect(alerts.length).toBe(triggeredConditions.length);

          // Verify each alert structure
          alerts.forEach((alert, index) => {
            const condition = triggeredConditions[index];
            
            expect(alert).toHaveProperty('id');
            expect(alert).toHaveProperty('type');
            expect(alert).toHaveProperty('title', condition.title);
            expect(alert).toHaveProperty('message', condition.message);
            expect(alert).toHaveProperty('severity', condition.severity);
            expect(alert).toHaveProperty('timestamp');
            expect(alert).toHaveProperty('condition', condition.name);
            
            // Verify ID format
            expect(alert.id).toMatch(/^alert_\d+_[a-z0-9]+$/);
          });

          // Verify notification service integration
          const expectedNotificationCalls = triggeredConditions.length;
          expect(mockNotificationService.createSystemNotification).toHaveBeenCalledTimes(expectedNotificationCalls);

          // Verify analytics service integration
          expect(mockAnalyticsService.trackEvent).toHaveBeenCalledTimes(expectedNotificationCalls);

          // Verify notification calls match alerts
          triggeredConditions.forEach((condition, index) => {
            expect(mockNotificationService.createSystemNotification).toHaveBeenNthCalledWith(
              index + 1,
              expect.objectContaining({
                type: 'system_alert',
                title: condition.title,
                message: condition.message,
                severity: condition.severity,
                metadata: expect.objectContaining({
                  alertId: expect.stringMatching(/^alert_\d+_[a-z0-9]+$/),
                  condition: condition.name
                })
              })
            );
          });

          // Verify analytics calls match alerts
          triggeredConditions.forEach((condition, index) => {
            expect(mockAnalyticsService.trackEvent).toHaveBeenNthCalledWith(
              index + 1,
              'system_alert',
              'system',
              null,
              expect.objectContaining({
                alertId: expect.stringMatching(/^alert_\d+_[a-z0-9]+$/),
                severity: condition.severity,
                condition: condition.name
              })
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: Post-deployment health monitoring should provide consistent status reporting', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          deploymentId: fc.string({ minLength: 1, maxLength: 50 }),
          checkInterval: fc.integer({ min: 50, max: 200 }), // Reduced for faster tests
          maxChecks: fc.integer({ min: 1, max: 3 }) // Reduced for test performance
        }),
        async (monitoringConfig) => {
          // Monitor post-deployment health
          const healthResult = await monitoringService.monitorPostDeploymentHealth(
            monitoringConfig.deploymentId,
            {
              checkInterval: monitoringConfig.checkInterval,
              maxChecks: monitoringConfig.maxChecks
            }
          );
          
          // Verify result structure
          expect(healthResult).toHaveProperty('deploymentId', monitoringConfig.deploymentId);
          expect(healthResult).toHaveProperty('overallStatus');
          expect(healthResult).toHaveProperty('checksPerformed');
          expect(healthResult).toHaveProperty('healthChecks');
          expect(healthResult).toHaveProperty('timestamp');

          // Verify overall status values
          expect(['healthy', 'degraded']).toContain(healthResult.overallStatus);

          // Verify checks performed is within expected range
          expect(healthResult.checksPerformed).toBeGreaterThan(0);
          expect(healthResult.checksPerformed).toBeLessThanOrEqual(monitoringConfig.maxChecks);

          // Verify health checks array
          expect(Array.isArray(healthResult.healthChecks)).toBe(true);
          expect(healthResult.healthChecks.length).toBe(healthResult.checksPerformed);

          // Verify each health check structure
          healthResult.healthChecks.forEach((check, index) => {
            expect(check).toHaveProperty('checkNumber', index + 1);
            expect(check).toHaveProperty('status');
            expect(check).toHaveProperty('timestamp');
            expect(['healthy', 'warning', 'critical', 'degraded', 'error']).toContain(check.status);
          });

          // Verify consistency: if any check is healthy, overall status should reflect that
          const hasHealthyCheck = healthResult.healthChecks.some(c => c.status === 'healthy');
          if (hasHealthyCheck) {
            expect(healthResult.overallStatus).toBe('healthy');
          }
        }
      ),
      { numRuns: 20, timeout: 10000 } // Reduced runs and added timeout
    );
  }, 15000); // Increased test timeout

  test('Property 12: Dashboard creation should provide consistent monitoring interface', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // No input needed for dashboard creation
        async () => {
          // Create dashboards
          const dashboardResult = await monitoringService.createDashboards();
          
          // Verify result structure
          expect(dashboardResult).toHaveProperty('status', 'created');
          expect(dashboardResult).toHaveProperty('dashboards');
          expect(dashboardResult).toHaveProperty('timestamp');

          // Verify dashboard structure
          const { dashboards } = dashboardResult;
          expect(dashboards).toHaveProperty('systemHealth');
          expect(dashboards).toHaveProperty('deploymentMetrics');
          expect(dashboards).toHaveProperty('alerts');

          // Verify system health dashboard
          const systemHealthDashboard = dashboards.systemHealth;
          expect(systemHealthDashboard).toHaveProperty('name', 'System Health Dashboard');
          expect(systemHealthDashboard).toHaveProperty('widgets');
          expect(Array.isArray(systemHealthDashboard.widgets)).toBe(true);
          expect(systemHealthDashboard.widgets.length).toBeGreaterThan(0);

          // Verify required system health widgets
          const expectedMetrics = ['cpu_usage', 'memory_usage', 'disk_usage', 'database_health', 'api_health'];
          expectedMetrics.forEach(metric => {
            const widget = systemHealthDashboard.widgets.find(w => w.metric === metric);
            expect(widget).toBeDefined();
            expect(widget).toHaveProperty('type', 'metric');
            expect(widget).toHaveProperty('title');
          });

          // Verify deployment metrics dashboard
          const deploymentDashboard = dashboards.deploymentMetrics;
          expect(deploymentDashboard).toHaveProperty('name', 'Deployment Metrics Dashboard');
          expect(deploymentDashboard).toHaveProperty('widgets');
          expect(Array.isArray(deploymentDashboard.widgets)).toBe(true);

          // Verify alerts dashboard
          const alertsDashboard = dashboards.alerts;
          expect(alertsDashboard).toHaveProperty('name', 'Alerts Dashboard');
          expect(alertsDashboard).toHaveProperty('widgets');
          expect(Array.isArray(alertsDashboard.widgets)).toBe(true);

          // Verify all widgets have required properties
          Object.values(dashboards).forEach(dashboard => {
            dashboard.widgets.forEach(widget => {
              expect(widget).toHaveProperty('type');
              expect(widget).toHaveProperty('title');
              expect(['metric', 'chart', 'table', 'list']).toContain(widget.type);
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});