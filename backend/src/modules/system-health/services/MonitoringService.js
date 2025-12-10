/**
 * Monitoring Service
 * Continuous monitoring and alerting integrated with existing notification system
 */

const BaseService = require('../../../shared/base/BaseService');

class MonitoringService extends BaseService {
  constructor(database, logger, config, notificationService, analyticsService) {
    super(database);
    this.database = database;
    this.logger = logger;
    this.config = config;
    this.notificationService = notificationService;
    this.analyticsService = analyticsService;
    this.monitoringState = {
      isMonitoring: false,
      lastCheck: null,
      metrics: {},
      alerts: []
    };
  }

  /**
   * Setup Application Insights configuration
   * @param {Object} config - Application Insights configuration
   * @returns {Promise<Object>} Setup result
   */
  async setupApplicationInsights(config) {
    try {
      this.logger.info('Setting up Application Insights', { config });

      if (!config || !config.connectionString) {
        throw new Error('Application Insights connection string is required');
      }

      const appInsightsConfig = {
        connectionString: config.connectionString,
        instrumentationKey: config.instrumentationKey || '',
        samplingPercentage: config.samplingPercentage || 100,
        enableAutoCollection: config.enableAutoCollection !== false,
        enableDependencyTracking: config.enableDependencyTracking !== false,
        enablePerformanceTracking: config.enablePerformanceTracking !== false
      };

      this.monitoringState.appInsightsConfig = appInsightsConfig;

      this.logger.info('Application Insights configured successfully');

      return {
        status: 'configured',
        config: appInsightsConfig,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to setup Application Insights', { error: error.message });
      throw error;
    }
  }

  /**
   * Monitor system health continuously
   * @param {Object} options - Monitoring options
   * @returns {Promise<Object>} Monitoring result
   */
  async monitorSystemHealth(options = {}) {
    const startTime = Date.now();

    try {
      this.logger.info('Starting system health monitoring', { options });

      this.monitoringState.isMonitoring = true;

      const healthMetrics = {
        timestamp: new Date(),
        checks: [],
        status: 'healthy'
      };

      // Check CPU usage
      const cpuMetric = await this.checkCPUUsage();
      healthMetrics.checks.push(cpuMetric);

      // Check memory usage
      const memoryMetric = await this.checkMemoryUsage();
      healthMetrics.checks.push(memoryMetric);

      // Check disk usage
      const diskMetric = await this.checkDiskUsage();
      healthMetrics.checks.push(diskMetric);

      // Check database connectivity
      const dbMetric = await this.checkDatabaseHealth();
      healthMetrics.checks.push(dbMetric);

      // Check API responsiveness
      const apiMetric = await this.checkAPIHealth();
      healthMetrics.checks.push(apiMetric);

      // Determine overall status
      const failedChecks = healthMetrics.checks.filter(c => c.status === 'critical');
      const warningChecks = healthMetrics.checks.filter(c => c.status === 'warning');

      if (failedChecks.length > 0) {
        healthMetrics.status = 'critical';
      } else if (warningChecks.length > 0) {
        healthMetrics.status = 'warning';
      }

      // Store metrics
      this.monitoringState.metrics = healthMetrics;
      this.monitoringState.lastCheck = new Date();

      const duration = Date.now() - startTime;

      this.logger.info('System health monitoring completed', {
        status: healthMetrics.status,
        duration
      });

      return {
        ...healthMetrics,
        duration
      };
    } catch (error) {
      this.logger.error('System health monitoring failed', { error: error.message });
      this.monitoringState.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Check CPU usage
   * @returns {Promise<Object>} CPU metric
   */
  async checkCPUUsage() {
    try {
      const os = require('os');
      const cpus = os.cpus();
      const avgLoad = os.loadavg()[0];
      const cpuCount = cpus.length;
      const cpuUsagePercent = (avgLoad / cpuCount) * 100;

      const threshold = 80;
      const status = cpuUsagePercent > threshold ? 'warning' : 'healthy';

      return {
        metric: 'cpu_usage',
        value: cpuUsagePercent.toFixed(2),
        unit: 'percent',
        threshold,
        status,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to check CPU usage', { error: error.message });
      return {
        metric: 'cpu_usage',
        status: 'unknown',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check memory usage
   * @returns {Promise<Object>} Memory metric
   */
  async checkMemoryUsage() {
    try {
      const os = require('os');
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      const threshold = 85;
      const status = memoryUsagePercent > threshold ? 'warning' : 'healthy';

      return {
        metric: 'memory_usage',
        value: memoryUsagePercent.toFixed(2),
        unit: 'percent',
        threshold,
        status,
        details: {
          total: totalMemory,
          used: usedMemory,
          free: freeMemory
        },
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to check memory usage', { error: error.message });
      return {
        metric: 'memory_usage',
        status: 'unknown',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check disk usage
   * @returns {Promise<Object>} Disk metric
   */
  async checkDiskUsage() {
    try {
      // Simplified disk check - in production would use actual disk API
      const diskUsagePercent = 45; // Placeholder

      const threshold = 90;
      const status = diskUsagePercent > threshold ? 'warning' : 'healthy';

      return {
        metric: 'disk_usage',
        value: diskUsagePercent.toFixed(2),
        unit: 'percent',
        threshold,
        status,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to check disk usage', { error: error.message });
      return {
        metric: 'disk_usage',
        status: 'unknown',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check database health
   * @returns {Promise<Object>} Database metric
   */
  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();

      // Test database connectivity
      if (this.database && this.database.query) {
        await this.database.query('SELECT 1');
      }

      const responseTime = Date.now() - startTime;
      const threshold = 1000; // 1 second
      const status = responseTime > threshold ? 'warning' : 'healthy';

      return {
        metric: 'database_health',
        value: responseTime,
        unit: 'ms',
        threshold,
        status,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to check database health', { error: error.message });
      return {
        metric: 'database_health',
        status: 'critical',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check API health
   * @returns {Promise<Object>} API metric
   */
  async checkAPIHealth() {
    try {
      // Simplified API health check
      const responseTime = 150; // Placeholder

      const threshold = 500; // 500ms
      const status = responseTime > threshold ? 'warning' : 'healthy';

      return {
        metric: 'api_health',
        value: responseTime,
        unit: 'ms',
        threshold,
        status,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to check API health', { error: error.message });
      return {
        metric: 'api_health',
        status: 'critical',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Track deployment metrics
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object>} Tracking result
   */
  async trackDeploymentMetrics(deploymentId) {
    try {
      this.logger.info('Tracking deployment metrics', { deploymentId });

      if (!deploymentId) {
        throw new Error('Deployment ID is required');
      }

      const metrics = await this.collectSystemMetrics();

      // Use existing analytics service
      if (this.analyticsService && this.analyticsService.trackEvent) {
        await this.analyticsService.trackEvent(
          'deployment_metrics',
          'system',
          null,
          {
            deploymentId,
            ...metrics
          }
        );
      }

      // Store in database
      const monitoringData = {
        deployment_id: deploymentId,
        metrics: JSON.stringify(metrics),
        timestamp: new Date()
      };

      // Save to database if repository available
      if (this.repository) {
        try {
          await this.repository.create(monitoringData);
        } catch (dbError) {
          this.logger.warn('Failed to save monitoring data to database', dbError);
        }
      }

      this.logger.info('Deployment metrics tracked successfully', { deploymentId });

      return {
        status: 'tracked',
        deploymentId,
        metrics,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to track deployment metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Collect system metrics
   * @returns {Promise<Object>} System metrics
   */
  async collectSystemMetrics() {
    try {
      const cpuMetric = await this.checkCPUUsage();
      const memoryMetric = await this.checkMemoryUsage();
      const diskMetric = await this.checkDiskUsage();
      const dbMetric = await this.checkDatabaseHealth();
      const apiMetric = await this.checkAPIHealth();

      return {
        cpu: cpuMetric,
        memory: memoryMetric,
        disk: diskMetric,
        database: dbMetric,
        api: apiMetric,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to collect system metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate alerts based on conditions
   * @param {Array} conditions - Alert conditions
   * @returns {Promise<Array>} Generated alerts
   */
  async generateAlerts(conditions) {
    try {
      this.logger.info('Generating alerts', { conditionCount: conditions?.length || 0 });

      if (!conditions || !Array.isArray(conditions)) {
        return [];
      }

      const alerts = [];

      for (const condition of conditions) {
        try {
          if (condition.triggered) {
            const alert = {
              id: this.generateAlertId(),
              type: condition.type || 'system_alert',
              title: condition.title,
              message: condition.message,
              severity: condition.severity || 'info',
              timestamp: new Date(),
              condition: condition.name
            };

            alerts.push(alert);

            // Use existing notification service
            if (this.notificationService) {
              try {
                await this.notificationService.createSystemNotification({
                  type: 'system_alert',
                  title: alert.title,
                  message: alert.message,
                  severity: alert.severity,
                  metadata: {
                    alertId: alert.id,
                    condition: condition.name
                  }
                });
              } catch (notifyError) {
                this.logger.warn('Failed to send alert notification', notifyError);
              }
            }

            // Track alert in analytics
            if (this.analyticsService && this.analyticsService.trackEvent) {
              try {
                await this.analyticsService.trackEvent(
                  'system_alert',
                  'system',
                  null,
                  {
                    alertId: alert.id,
                    severity: alert.severity,
                    condition: condition.name
                  }
                );
              } catch (analyticsError) {
                this.logger.warn('Failed to track alert in analytics', analyticsError);
              }
            }

            // Store alert
            this.monitoringState.alerts.push(alert);
          }
        } catch (conditionError) {
          this.logger.error('Failed to process alert condition', { error: conditionError.message });
        }
      }

      this.logger.info('Alerts generated', { alertCount: alerts.length });

      return alerts;
    } catch (error) {
      this.logger.error('Failed to generate alerts', { error: error.message });
      throw error;
    }
  }

  /**
   * Check alert conditions against current system metrics
   * @param {Object} metrics - Current system metrics
   * @returns {Promise<Array>} Alert conditions with triggered status
   */
  async checkAlertConditions(metrics) {
    try {
      this.logger.info('Checking alert conditions');

      if (!metrics) {
        throw new Error('Metrics are required for alert condition checking');
      }

      const conditions = [
        // CPU Usage Alert
        {
          name: 'high_cpu_usage',
          type: 'performance_alert',
          title: 'High CPU Usage Detected',
          message: `CPU usage is ${metrics.cpu?.value}%, exceeding threshold of ${metrics.cpu?.threshold}%`,
          severity: 'warning',
          triggered: metrics.cpu?.status === 'warning' || metrics.cpu?.status === 'critical',
          threshold: metrics.cpu?.threshold || 80,
          currentValue: metrics.cpu?.value || 0
        },
        // Memory Usage Alert
        {
          name: 'high_memory_usage',
          type: 'performance_alert',
          title: 'High Memory Usage Detected',
          message: `Memory usage is ${metrics.memory?.value}%, exceeding threshold of ${metrics.memory?.threshold}%`,
          severity: 'warning',
          triggered: metrics.memory?.status === 'warning' || metrics.memory?.status === 'critical',
          threshold: metrics.memory?.threshold || 85,
          currentValue: metrics.memory?.value || 0
        },
        // Database Connectivity Alert
        {
          name: 'database_connectivity_issue',
          type: 'system_alert',
          title: 'Database Connectivity Issue',
          message: `Database response time is ${metrics.database?.value}ms, exceeding threshold of ${metrics.database?.threshold}ms`,
          severity: metrics.database?.status === 'critical' ? 'critical' : 'warning',
          triggered: metrics.database?.status === 'warning' || metrics.database?.status === 'critical',
          threshold: metrics.database?.threshold || 1000,
          currentValue: metrics.database?.value || 0
        },
        // API Performance Alert
        {
          name: 'api_performance_degradation',
          type: 'performance_alert',
          title: 'API Performance Degradation',
          message: `API response time is ${metrics.api?.value}ms, exceeding threshold of ${metrics.api?.threshold}ms`,
          severity: 'warning',
          triggered: metrics.api?.status === 'warning' || metrics.api?.status === 'critical',
          threshold: metrics.api?.threshold || 500,
          currentValue: metrics.api?.value || 0
        },
        // Disk Usage Alert
        {
          name: 'high_disk_usage',
          type: 'system_alert',
          title: 'High Disk Usage Detected',
          message: `Disk usage is ${metrics.disk?.value}%, exceeding threshold of ${metrics.disk?.threshold}%`,
          severity: 'critical',
          triggered: metrics.disk?.status === 'warning' || metrics.disk?.status === 'critical',
          threshold: metrics.disk?.threshold || 90,
          currentValue: metrics.disk?.value || 0
        }
      ];

      this.logger.info('Alert conditions checked', { 
        totalConditions: conditions.length,
        triggeredConditions: conditions.filter(c => c.triggered).length
      });

      return conditions;
    } catch (error) {
      this.logger.error('Failed to check alert conditions', { error: error.message });
      throw error;
    }
  }

  /**
   * Process alert escalation based on severity and frequency
   * @param {Array} alerts - Generated alerts
   * @returns {Promise<Array>} Escalated alerts
   */
  async processAlertEscalation(alerts) {
    try {
      this.logger.info('Processing alert escalation', { alertCount: alerts.length });

      if (!alerts || !Array.isArray(alerts)) {
        return [];
      }

      const escalatedAlerts = [];

      for (const alert of alerts) {
        try {
          // Check if this alert type has been triggered recently
          const recentAlerts = this.monitoringState.alerts.filter(a => 
            a.condition === alert.condition &&
            a.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
          );

          let escalationLevel = 'normal';
          let escalatedSeverity = alert.severity;

          // Escalate based on frequency
          if (recentAlerts.length >= 5) {
            escalationLevel = 'high';
            escalatedSeverity = 'critical';
          } else if (recentAlerts.length >= 3) {
            escalationLevel = 'medium';
            escalatedSeverity = alert.severity === 'info' ? 'warning' : 'critical';
          }

          // Escalate based on severity
          if (alert.severity === 'critical') {
            escalationLevel = 'high';
          }

          const escalatedAlert = {
            ...alert,
            escalationLevel,
            severity: escalatedSeverity,
            escalationReason: recentAlerts.length > 0 ? 
              `Alert repeated ${recentAlerts.length} times in 15 minutes` : 
              'Initial alert',
            originalSeverity: alert.severity
          };

          // Send escalated notifications for high-priority alerts
          if (escalationLevel === 'high' && this.notificationService) {
            try {
              await this.notificationService.createSystemNotification({
                type: 'escalated_alert',
                title: `ESCALATED: ${alert.title}`,
                message: `${alert.message} (Escalation: ${escalatedAlert.escalationReason})`,
                severity: escalatedSeverity,
                metadata: {
                  alertId: alert.id,
                  escalationLevel,
                  originalSeverity: alert.severity,
                  condition: alert.condition
                }
              });
            } catch (notifyError) {
              this.logger.warn('Failed to send escalated alert notification', notifyError);
            }
          }

          escalatedAlerts.push(escalatedAlert);

        } catch (alertError) {
          this.logger.error('Failed to process alert escalation', { 
            alertId: alert.id, 
            error: alertError.message 
          });
          escalatedAlerts.push(alert); // Include original alert if escalation fails
        }
      }

      this.logger.info('Alert escalation processed', { 
        originalAlerts: alerts.length,
        escalatedAlerts: escalatedAlerts.length,
        highPriorityAlerts: escalatedAlerts.filter(a => a.escalationLevel === 'high').length
      });

      return escalatedAlerts;
    } catch (error) {
      this.logger.error('Failed to process alert escalation', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate comprehensive alerts from system metrics
   * @param {Object} options - Alert generation options
   * @returns {Promise<Object>} Alert generation result
   */
  async generateSystemAlerts(options = {}) {
    try {
      this.logger.info('Generating system alerts');

      // Collect current system metrics
      const metrics = await this.collectSystemMetrics();

      // Check alert conditions
      const conditions = await this.checkAlertConditions(metrics);

      // Generate alerts for triggered conditions
      const alerts = await this.generateAlerts(conditions);

      // Process alert escalation
      const escalatedAlerts = options.enableEscalation !== false ? 
        await this.processAlertEscalation(alerts) : alerts;

      // Save alert data
      if (alerts.length > 0) {
        await this.saveMonitoringData({
          type: 'alert_generation',
          metrics: JSON.stringify(metrics),
          conditions: JSON.stringify(conditions),
          alerts: JSON.stringify(escalatedAlerts),
          alertCount: alerts.length,
          escalatedAlertCount: escalatedAlerts.filter(a => a.escalationLevel !== 'normal').length
        });
      }

      const result = {
        metrics,
        conditions,
        alerts: escalatedAlerts,
        summary: {
          totalConditions: conditions.length,
          triggeredConditions: conditions.filter(c => c.triggered).length,
          alertsGenerated: alerts.length,
          escalatedAlerts: escalatedAlerts.filter(a => a.escalationLevel !== 'normal').length,
          criticalAlerts: escalatedAlerts.filter(a => a.severity === 'critical').length
        },
        timestamp: new Date()
      };

      this.logger.info('System alerts generated', result.summary);

      return result;
    } catch (error) {
      this.logger.error('Failed to generate system alerts', { error: error.message });
      throw error;
    }
  }

  /**
   * Get active alerts
   * @param {Object} options - Filter options
   * @returns {Array} Active alerts
   */
  getActiveAlerts(options = {}) {
    try {
      let alerts = [...this.monitoringState.alerts];

      // Filter by severity
      if (options.severity) {
        alerts = alerts.filter(alert => alert.severity === options.severity);
      }

      // Filter by time range
      if (options.since) {
        const sinceDate = new Date(options.since);
        alerts = alerts.filter(alert => alert.timestamp >= sinceDate);
      }

      // Filter by condition
      if (options.condition) {
        alerts = alerts.filter(alert => alert.condition === options.condition);
      }

      // Sort by timestamp (newest first)
      alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Limit results
      if (options.limit) {
        alerts = alerts.slice(0, options.limit);
      }

      return alerts;
    } catch (error) {
      this.logger.error('Failed to get active alerts', { error: error.message });
      return [];
    }
  }

  /**
   * Clear old alerts
   * @param {Object} options - Clear options
   * @returns {Object} Clear result
   */
  clearOldAlerts(options = {}) {
    try {
      const maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
      const cutoffTime = new Date(Date.now() - maxAge);

      const initialCount = this.monitoringState.alerts.length;
      this.monitoringState.alerts = this.monitoringState.alerts.filter(
        alert => alert.timestamp > cutoffTime
      );
      const clearedCount = initialCount - this.monitoringState.alerts.length;

      this.logger.info('Old alerts cleared', { 
        clearedCount, 
        remainingCount: this.monitoringState.alerts.length 
      });

      return {
        clearedCount,
        remainingCount: this.monitoringState.alerts.length,
        cutoffTime
      };
    } catch (error) {
      this.logger.error('Failed to clear old alerts', { error: error.message });
      throw error;
    }
  }

  /**
   * Create dashboards
   * @returns {Promise<Object>} Dashboard configuration
   */
  async createDashboards() {
    try {
      this.logger.info('Creating monitoring dashboards');

      const dashboards = {
        systemHealth: {
          name: 'System Health Dashboard',
          widgets: [
            { type: 'metric', metric: 'cpu_usage', title: 'CPU Usage' },
            { type: 'metric', metric: 'memory_usage', title: 'Memory Usage' },
            { type: 'metric', metric: 'disk_usage', title: 'Disk Usage' },
            { type: 'metric', metric: 'database_health', title: 'Database Health' },
            { type: 'metric', metric: 'api_health', title: 'API Health' }
          ]
        },
        deploymentMetrics: {
          name: 'Deployment Metrics Dashboard',
          widgets: [
            { type: 'chart', metric: 'deployment_success_rate', title: 'Deployment Success Rate' },
            { type: 'chart', metric: 'deployment_duration', title: 'Deployment Duration' },
            { type: 'table', metric: 'recent_deployments', title: 'Recent Deployments' }
          ]
        },
        alerts: {
          name: 'Alerts Dashboard',
          widgets: [
            { type: 'list', metric: 'active_alerts', title: 'Active Alerts' },
            { type: 'chart', metric: 'alert_trends', title: 'Alert Trends' }
          ]
        }
      };

      this.logger.info('Dashboards created successfully');

      return {
        status: 'created',
        dashboards,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to create dashboards', { error: error.message });
      throw error;
    }
  }

  /**
   * Save monitoring data
   * @param {Object} data - Monitoring data
   * @returns {Promise<Object>} Save result
   */
  async saveMonitoringData(data) {
    try {
      this.logger.info('Saving monitoring data');

      if (!data) {
        throw new Error('Monitoring data is required');
      }

      const monitoringRecord = {
        metrics: JSON.stringify(data.metrics || {}),
        status: data.status || 'recorded',
        timestamp: new Date(),
        ...data
      };

      // Save to database if repository available
      if (this.repository) {
        try {
          const result = await this.repository.create(monitoringRecord);
          this.logger.info('Monitoring data saved successfully');
          return result;
        } catch (dbError) {
          this.logger.warn('Failed to save monitoring data to database', dbError);
          return monitoringRecord;
        }
      }

      return monitoringRecord;
    } catch (error) {
      this.logger.error('Failed to save monitoring data', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate alert ID
   * @returns {string} Alert ID
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track deployment success metrics
   * @param {Object} deploymentInfo - Deployment information
   * @returns {Promise<Object>} Success metrics
   */
  async trackDeploymentSuccess(deploymentInfo) {
    try {
      this.logger.info('Tracking deployment success metrics', { deploymentId: deploymentInfo?.deploymentId || deploymentInfo?.id });

      if (!deploymentInfo) {
        throw new Error('Deployment information is required');
      }

      const successMetrics = {
        deploymentId: deploymentInfo.deploymentId || deploymentInfo.id,
        environment: deploymentInfo.environment,
        version: deploymentInfo.version,
        status: 'success',
        duration: deploymentInfo.duration || 0,
        timestamp: new Date(),
        metrics: {
          backendDeployed: deploymentInfo.backendDeployed !== false,
          frontendDeployed: deploymentInfo.frontendDeployed !== false,
          databaseMigrated: deploymentInfo.databaseMigrated !== false,
          allHealthChecksPass: deploymentInfo.allHealthChecksPass !== false
        }
      };

      // Track in analytics
      if (this.analyticsService && this.analyticsService.trackEvent) {
        await this.analyticsService.trackEvent(
          'deployment_success',
          'system',
          null,
          successMetrics
        );
      }

      // Save metrics
      await this.saveMonitoringData(successMetrics);

      this.logger.info('Deployment success metrics tracked', { deploymentId: successMetrics.deploymentId });

      return successMetrics;
    } catch (error) {
      this.logger.error('Failed to track deployment success metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Monitor system health post-deployment
   * @param {string} deploymentId - Deployment ID
   * @param {Object} options - Monitoring options
   * @returns {Promise<Object>} Post-deployment health status
   */
  async monitorPostDeploymentHealth(deploymentId, options = {}) {
    try {
      this.logger.info('Monitoring post-deployment health', { deploymentId });

      if (!deploymentId) {
        throw new Error('Deployment ID is required');
      }

      const healthChecks = [];
      const checkInterval = options.checkInterval || 5000; // 5 seconds
      const maxChecks = options.maxChecks || 12; // 1 minute total

      for (let i = 0; i < maxChecks; i++) {
        try {
          const healthStatus = await this.monitorSystemHealth();

          healthChecks.push({
            checkNumber: i + 1,
            status: healthStatus.status,
            metrics: healthStatus.checks,
            timestamp: new Date()
          });

          // If system is healthy, we can stop checking
          if (healthStatus.status === 'healthy') {
            this.logger.info('Post-deployment health check passed', { deploymentId });
            break;
          }

          // Wait before next check
          if (i < maxChecks - 1) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
          }
        } catch (checkError) {
          this.logger.warn('Post-deployment health check failed', { error: checkError.message });
          healthChecks.push({
            checkNumber: i + 1,
            status: 'error',
            error: checkError.message,
            timestamp: new Date()
          });
        }
      }

      const overallStatus = healthChecks.some(c => c.status === 'healthy') ? 'healthy' : 'degraded';

      const result = {
        deploymentId,
        overallStatus,
        checksPerformed: healthChecks.length,
        healthChecks,
        timestamp: new Date()
      };

      // Save post-deployment health data
      await this.saveMonitoringData({
        deployment_id: deploymentId,
        type: 'post_deployment_health',
        ...result
      });

      this.logger.info('Post-deployment health monitoring completed', {
        deploymentId,
        overallStatus
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to monitor post-deployment health', { error: error.message });
      throw error;
    }
  }

  /**
   * Create performance monitoring
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object>} Performance monitoring setup
   */
  async createPerformanceMonitoring(deploymentId) {
    try {
      this.logger.info('Creating performance monitoring', { deploymentId });

      if (!deploymentId) {
        throw new Error('Deployment ID is required');
      }

      const performanceMonitoring = {
        deploymentId,
        metrics: {
          responseTime: {
            threshold: 500, // ms
            unit: 'milliseconds',
            tracked: true
          },
          errorRate: {
            threshold: 1, // percent
            unit: 'percent',
            tracked: true
          },
          throughput: {
            threshold: 100, // requests per second
            unit: 'rps',
            tracked: true
          },
          cpuUsage: {
            threshold: 80, // percent
            unit: 'percent',
            tracked: true
          },
          memoryUsage: {
            threshold: 85, // percent
            unit: 'percent',
            tracked: true
          },
          databaseQueryTime: {
            threshold: 1000, // ms
            unit: 'milliseconds',
            tracked: true
          }
        },
        alerts: {
          enabled: true,
          escalationEnabled: true,
          notificationChannels: ['system_notification', 'analytics']
        },
        samplingRate: 100, // percent
        retentionDays: 30,
        timestamp: new Date()
      };

      // Save performance monitoring configuration
      await this.saveMonitoringData({
        deployment_id: deploymentId,
        type: 'performance_monitoring',
        ...performanceMonitoring
      });

      this.logger.info('Performance monitoring created', { deploymentId });

      return performanceMonitoring;
    } catch (error) {
      this.logger.error('Failed to create performance monitoring', { error: error.message });
      throw error;
    }
  }

  /**
   * Get monitoring state
   * @returns {Object} Current monitoring state
   */
  getMonitoringState() {
    return {
      ...this.monitoringState,
      timestamp: new Date()
    };
  }

  /**
   * Stop monitoring
   * @returns {Object} Stop result
   */
  stopMonitoring() {
    this.monitoringState.isMonitoring = false;
    this.logger.info('Monitoring stopped');
    return {
      status: 'stopped',
      timestamp: new Date()
    };
  }
}

module.exports = MonitoringService;
