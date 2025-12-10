/**
 * Property-Based Test: Rollback Operation Safety
 * Feature: system-health-deployment, Property 10: Rollback Operation Safety
 * Validates: Requirements 5.5
 * 
 * For any deployment rollback operation, the system should safely revert to the 
 * previous working state without data loss
 */

const fc = require('fast-check');
const DeploymentService = require('../../services/DeploymentService');

// Mock dependencies
class MockDatabase {
  async query() { return []; }
  async queryOne() { return null; }
  async queryMany() { return []; }
}

class MockLogger {
  info() {}
  error() {}
  warn() {}
  debug() {}
}

class MockNotificationService {
  async createSystemNotification() {}
}

class MockDeploymentLogRepository {
  constructor() {
    this.deployments = [];
  }

  async create(data) {
    const id = this.deployments.length + 1;
    const record = { id, ...data };
    this.deployments.push(record);
    return record;
  }

  async findMany(query, options) {
    let results = this.deployments.filter(d => {
      if (query.environment && d.environment !== query.environment) return false;
      if (query.status && d.status !== query.status) return false;
      return true;
    });

    if (options?.orderBy === 'created_at' && options?.order === 'DESC') {
      results = results.reverse();
    }

    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async count() { return this.deployments.length; }
  async getLatestDeployment() { return this.deployments[this.deployments.length - 1] || null; }
  async getDeploymentByVersion(version) { return this.deployments.find(d => d.version === version) || null; }
  async findDeploymentsByStatus(status) { return this.deployments.filter(d => d.status === status); }
  async findDeploymentsByType(type) { return this.deployments.filter(d => d.type === type); }
  async getDeploymentHistory() { return this.deployments; }
  async countByEnvironmentAndStatus() { return this.deployments.length; }
  async getDeploymentStats() { return {}; }
}

// Arbitraries for generating test data
const versionArbitrary = fc.string({ minLength: 10, maxLength: 20 });

const previousDeploymentArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  version: versionArbitrary,
  environment: fc.constantFrom('development', 'staging', 'production'),
  status: fc.constant('success'),
  timestamp: fc.date(),
  details: fc.record({
    status: fc.constant('success'),
    steps: fc.array(
      fc.record({
        step: fc.string({ minLength: 1, maxLength: 50 }),
        status: fc.constant('completed')
      }),
      { minLength: 1, maxLength: 6 }
    )
  })
});

describe('DeploymentService - Property 10: Rollback Operation Safety', () => {
  let deploymentService;
  let mockRepository;

  beforeEach(() => {
    const mockDatabase = new MockDatabase();
    const mockLogger = new MockLogger();
    const mockConfig = {};
    const mockNotificationService = new MockNotificationService();
    mockRepository = new MockDeploymentLogRepository();

    deploymentService = new DeploymentService(
      mockDatabase,
      mockLogger,
      mockConfig,
      mockNotificationService,
      mockRepository
    );
  });

  test('Property 10: Rollback result contains required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        versionArbitrary,
        previousDeploymentArbitrary,
        async (environment, version, previousDeployment) => {
          // Setup: Add a previous deployment to the repository
          await mockRepository.create({
            ...previousDeployment,
            version,
            environment,
            status: 'success'
          });

          const rollbackResult = await deploymentService.rollbackDeployment(environment, version);

          // Rollback result must have required fields
          expect(rollbackResult).toHaveProperty('status');
          expect(rollbackResult).toHaveProperty('environment');
          expect(rollbackResult).toHaveProperty('rolledBackTo');
          expect(rollbackResult).toHaveProperty('timestamp');
          expect(rollbackResult).toHaveProperty('duration');
          expect(rollbackResult).toHaveProperty('steps');

          // Status must be success
          expect(rollbackResult.status).toBe('success');

          // Environment must match
          expect(rollbackResult.environment).toBe(environment);

          // Rolled back to version must match
          expect(rollbackResult.rolledBackTo).toBe(version);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Rollback steps are executed in order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        versionArbitrary,
        previousDeploymentArbitrary,
        async (environment, version, previousDeployment) => {
          // Setup: Add a previous deployment
          await mockRepository.create({
            ...previousDeployment,
            version,
            environment,
            status: 'success'
          });

          const rollbackResult = await deploymentService.rollbackDeployment(environment, version);

          // Steps must be in expected order
          const expectedSteps = ['backup_current', 'restore_backend', 'restore_frontend', 'verify_rollback'];
          expect(rollbackResult.steps.length).toBe(expectedSteps.length);

          for (let i = 0; i < expectedSteps.length; i++) {
            expect(rollbackResult.steps[i].step).toBe(expectedSteps[i]);
            expect(rollbackResult.steps[i].status).toBe('completed');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: All rollback steps complete successfully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        versionArbitrary,
        previousDeploymentArbitrary,
        async (environment, version, previousDeployment) => {
          // Setup: Add a previous deployment
          await mockRepository.create({
            ...previousDeployment,
            version,
            environment,
            status: 'success'
          });

          const rollbackResult = await deploymentService.rollbackDeployment(environment, version);

          // All steps must be completed
          const allCompleted = rollbackResult.steps.every(s => s.status === 'completed');
          expect(allCompleted).toBe(true);

          // No steps should have failed
          const anyFailed = rollbackResult.steps.some(s => s.status === 'failed');
          expect(anyFailed).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Rollback timestamp is valid and recent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        versionArbitrary,
        previousDeploymentArbitrary,
        async (environment, version, previousDeployment) => {
          // Setup: Add a previous deployment
          await mockRepository.create({
            ...previousDeployment,
            version,
            environment,
            status: 'success'
          });

          const rollbackResult = await deploymentService.rollbackDeployment(environment, version);

          // Timestamp must be a Date
          expect(rollbackResult.timestamp instanceof Date).toBe(true);

          // Timestamp should be recent (within last minute)
          const now = new Date();
          const diff = now.getTime() - rollbackResult.timestamp.getTime();
          expect(diff).toBeGreaterThanOrEqual(0);
          expect(diff).toBeLessThan(60000); // Within 60 seconds
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Rollback duration is positive', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        versionArbitrary,
        previousDeploymentArbitrary,
        async (environment, version, previousDeployment) => {
          // Setup: Add a previous deployment
          await mockRepository.create({
            ...previousDeployment,
            version,
            environment,
            status: 'success'
          });

          const rollbackResult = await deploymentService.rollbackDeployment(environment, version);

          // Duration must be positive
          expect(typeof rollbackResult.duration).toBe('number');
          expect(rollbackResult.duration).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Rollback logs deployment event', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        versionArbitrary,
        previousDeploymentArbitrary,
        async (environment, version, previousDeployment) => {
          // Setup: Add a previous deployment
          await mockRepository.create({
            ...previousDeployment,
            version,
            environment,
            status: 'success'
          });

          const initialCount = mockRepository.deployments.length;
          await deploymentService.rollbackDeployment(environment, version);
          const finalCount = mockRepository.deployments.length;

          // Should have logged the rollback event
          expect(finalCount).toBeGreaterThan(initialCount);

          // Last logged event should be rollback
          const lastEvent = mockRepository.deployments[mockRepository.deployments.length - 1];
          expect(lastEvent.type).toBe('rollback');
          expect(lastEvent.status).toBe('success');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Rollback fails gracefully when version not found', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        versionArbitrary,
        async (environment, version) => {
          // Don't add any previous deployment
          // Attempt rollback should fail
          try {
            await deploymentService.rollbackDeployment(environment, version);
            // If we get here, the rollback should have failed
            expect(false).toBe(true); // Force failure if no error thrown
          } catch (error) {
            // Expected to throw error
            expect(error).toBeDefined();
            expect(error.message).toContain('No previous deployment found');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Rollback requires valid environment', async () => {
    await fc.assert(
      fc.asyncProperty(versionArbitrary, async (version) => {
        // Try with empty environment
        try {
          await deploymentService.rollbackDeployment('', version);
          expect(false).toBe(true); // Force failure if no error thrown
        } catch (error) {
          expect(error).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10: Rollback requires valid version', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        async (environment) => {
          // Try with empty version
          try {
            await deploymentService.rollbackDeployment(environment, '');
            expect(false).toBe(true); // Force failure if no error thrown
          } catch (error) {
            expect(error).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Rollback step results contain expected data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('development', 'staging', 'production'),
        versionArbitrary,
        previousDeploymentArbitrary,
        async (environment, version, previousDeployment) => {
          // Setup: Add a previous deployment
          await mockRepository.create({
            ...previousDeployment,
            version,
            environment,
            status: 'success'
          });

          const rollbackResult = await deploymentService.rollbackDeployment(environment, version);

          // Each step should have a result
          for (const step of rollbackResult.steps) {
            expect(step).toHaveProperty('result');
            expect(typeof step.result).toBe('object');
            expect(step.result).not.toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
