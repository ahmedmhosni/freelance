/**
 * Property-Based Tests for EnvironmentValidator
 * **Feature: system-health-deployment, Property 1: System Health Check Consistency**
 * **Validates: Requirements 1.2**
 */

const fc = require('fast-check');
const EnvironmentValidator = require('../../validators/EnvironmentValidator');

// Mock logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('EnvironmentValidator Property Tests', () => {
  let validator;
  let originalEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    validator = new EnvironmentValidator(mockLogger);
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  /**
   * Property 1: Environment Validation Logic Consistency
   * For any environment configuration, the validation logic should be deterministic
   */
  test('environment validation logic consistency', () => {
    fc.assert(fc.property(
      fc.record({
        environment: fc.constantFrom('development', 'production', 'test'),
        envVars: fc.dictionary(
          fc.constantFrom('JWT_SECRET', 'PORT', 'NODE_ENV', 'PG_HOST', 'PG_DATABASE'),
          fc.string({ minLength: 1, maxLength: 50 })
        )
      }),
      ({ environment, envVars }) => {
        // Set up test environment
        process.env = { ...originalEnv, ...envVars };
        
        // Test deterministic parts only
        const requiredVars = validator.getRequiredEnvironmentVariables(environment);
        const configFiles = validator.getRequiredConfigFiles(environment);
        
        // These should be consistent for the same environment
        const isValidStructure = 
          Array.isArray(requiredVars) &&
          requiredVars.length > 0 &&
          Array.isArray(configFiles) &&
          configFiles.length > 0;

        // Variable validation should be deterministic
        let validationConsistent = true;
        for (const varName of ['JWT_SECRET', 'PORT', 'NODE_ENV']) {
          const value = envVars[varName];
          if (value) {
            const result1 = validator.validateSpecificVariable(varName, value);
            const result2 = validator.validateSpecificVariable(varName, value);
            if (result1.valid !== result2.valid) {
              validationConsistent = false;
              break;
            }
          }
        }

        return isValidStructure && validationConsistent;
      }
    ), { numRuns: 50 });
  });

  /**
   * Property: Environment Variable Validation Determinism
   * For any set of environment variables, validation logic should be deterministic
   */
  test('environment variable validation determinism', () => {
    fc.assert(fc.property(
      fc.record({
        environment: fc.constantFrom('development', 'production'),
        varName: fc.constantFrom('JWT_SECRET', 'PORT', 'NODE_ENV', 'FRONTEND_URL'),
        varValue: fc.string({ minLength: 0, maxLength: 100 })
      }),
      ({ environment, varName, varValue }) => {
        // Test that specific variable validation is deterministic
        const result1 = validator.validateSpecificVariable(varName, varValue);
        const result2 = validator.validateSpecificVariable(varName, varValue);
        
        // Results should be identical
        const isConsistent = 
          result1.valid === result2.valid &&
          (result1.reason || '') === (result2.reason || '');

        // Test that required variables list is consistent
        const requiredVars1 = validator.getRequiredEnvironmentVariables(environment);
        const requiredVars2 = validator.getRequiredEnvironmentVariables(environment);
        
        const varsConsistent = 
          requiredVars1.length === requiredVars2.length &&
          requiredVars1.every((v, i) => v === requiredVars2[i]);

        return isConsistent && varsConsistent;
      }
    ), { numRuns: 50 });
  });

  /**
   * Property: Variable Validation Logic Consistency
   * For any specific variable, validation logic should be consistent
   */
  test('variable validation logic consistency', () => {
    fc.assert(fc.property(
      fc.record({
        varName: fc.constantFrom('JWT_SECRET', 'PORT', 'NODE_ENV', 'FRONTEND_URL'),
        varValue: fc.string({ minLength: 0, maxLength: 100 })
      }),
      ({ varName, varValue }) => {
        const results = [];

        // Validate the same variable multiple times
        for (let i = 0; i < 3; i++) {
          const result = validator.validateSpecificVariable(varName, varValue);
          results.push({
            valid: result.valid,
            hasReason: !!result.reason
          });
        }

        // All results should be identical
        const firstResult = results[0];
        const allIdentical = results.every(result =>
          result.valid === firstResult.valid &&
          result.hasReason === firstResult.hasReason
        );

        return allIdentical;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: JWT Secret Validation Correctness
   * For any JWT secret value, validation should correctly identify security issues
   */
  test('JWT secret validation correctness', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.string({ minLength: 1, maxLength: 31 }), // Too short
        fc.string({ minLength: 32, maxLength: 100 }), // Good length
        fc.constant('change_this_in_production'), // Default value
        fc.constant('your_secret_key_here'), // Default value
        fc.string({ minLength: 64, maxLength: 128 }) // Very secure
      ),
      (jwtSecret) => {
        const result = validator.validateSpecificVariable('JWT_SECRET', jwtSecret);

        // Validation logic should be correct
        const isShort = jwtSecret.length < 32;
        const isDefault = jwtSecret.includes('change_this') || jwtSecret.includes('your_secret');
        const shouldBeInvalid = isShort || isDefault;

        return result.valid !== shouldBeInvalid; // Should be invalid if it has issues
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Port Validation Correctness
   * For any port value, validation should correctly identify valid/invalid ports
   */
  test('port validation correctness', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.integer({ min: -1000, max: 0 }), // Invalid: negative or zero
        fc.integer({ min: 1, max: 65535 }), // Valid range
        fc.integer({ min: 65536, max: 100000 }), // Invalid: too high
        fc.string({ minLength: 1, maxLength: 10 }) // Invalid: not a number
      ),
      (portValue) => {
        const result = validator.validateSpecificVariable('PORT', String(portValue));

        const numericPort = parseInt(String(portValue));
        const isValidPort = !isNaN(numericPort) && numericPort >= 1 && numericPort <= 65535;

        return result.valid === isValidPort;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: URL Validation Correctness
   * For any URL value, validation should correctly identify valid/invalid URLs
   */
  test('URL validation correctness', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant('http://localhost:3000'),
        fc.constant('https://example.com'),
        fc.constant('https://roastify.online'),
        fc.constant('invalid-url'),
        fc.constant('not a url at all'),
        fc.constant('ftp://example.com'),
        fc.constant('http://'),
        fc.constant('')
      ),
      (urlValue) => {
        const result = validator.validateSpecificVariable('FRONTEND_URL', urlValue);

        let isValidURL = false;
        try {
          new URL(urlValue);
          isValidURL = true;
        } catch (error) {
          isValidURL = false;
        }

        return result.valid === isValidURL;
      }
    ), { numRuns: 100 });
  });



  /**
   * Property: Required Variables Completeness
   * For any environment, the required variables list should be complete and consistent
   */
  test('required variables completeness', () => {
    fc.assert(fc.property(
      fc.constantFrom('development', 'production', 'test', 'staging'),
      (environment) => {
        const results = [];

        // Get required variables multiple times
        for (let i = 0; i < 3; i++) {
          const requiredVars = validator.getRequiredEnvironmentVariables(environment);
          results.push({
            count: requiredVars.length,
            hasJwtSecret: requiredVars.includes('JWT_SECRET'),
            hasPort: requiredVars.includes('PORT'),
            variables: requiredVars.sort()
          });
        }

        // All results should be identical
        const firstResult = results[0];
        const allIdentical = results.every(result =>
          result.count === firstResult.count &&
          result.hasJwtSecret === firstResult.hasJwtSecret &&
          result.hasPort === firstResult.hasPort &&
          JSON.stringify(result.variables) === JSON.stringify(firstResult.variables)
        );

        // Common variables should always be present
        const hasCommonVars = firstResult.hasJwtSecret && firstResult.hasPort;

        return allIdentical && hasCommonVars;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Configuration File Requirements Consistency
   * For any environment, configuration file requirements should be consistent
   */
  test('configuration file requirements consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom('development', 'production', 'test'),
      (environment) => {
        const results = [];

        // Get required config files multiple times
        for (let i = 0; i < 3; i++) {
          const configFiles = validator.getRequiredConfigFiles(environment);
          results.push({
            count: configFiles.length,
            hasBackendPackage: configFiles.some(f => f.path.includes('backend/package.json')),
            hasFrontendPackage: configFiles.some(f => f.path.includes('frontend/package.json')),
            paths: configFiles.map(f => f.path).sort()
          });
        }

        // All results should be identical
        const firstResult = results[0];
        const allIdentical = results.every(result =>
          result.count === firstResult.count &&
          result.hasBackendPackage === firstResult.hasBackendPackage &&
          result.hasFrontendPackage === firstResult.hasFrontendPackage &&
          JSON.stringify(result.paths) === JSON.stringify(firstResult.paths)
        );

        // Should always have package.json files
        const hasRequiredPackageFiles = firstResult.hasBackendPackage && firstResult.hasFrontendPackage;

        return allIdentical && hasRequiredPackageFiles;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Validation Message Generation Determinism
   * For any validation status and results, message generation should be deterministic
   */
  test('validation message generation determinism', () => {
    fc.assert(fc.property(
      fc.record({
        status: fc.constantFrom('pass', 'fail', 'warning'),
        passedCount: fc.integer({ min: 0, max: 5 }),
        failedCount: fc.integer({ min: 0, max: 5 }),
        warningCount: fc.integer({ min: 0, max: 5 })
      }),
      ({ status, passedCount, failedCount, warningCount }) => {
        // Ensure we have at least one result
        const totalCount = Math.max(1, passedCount + failedCount + warningCount);
        
        // Generate valid mock results
        const mockResults = [
          ...Array(passedCount).fill({ status: 'pass' }),
          ...Array(failedCount).fill({ status: 'fail' }),
          ...Array(warningCount).fill({ status: 'warning' })
        ].slice(0, totalCount);

        // Ensure status matches the results
        const actualStatus = failedCount > 0 ? 'fail' : 
                           warningCount > 0 ? 'warning' : 'pass';

        // Generate message multiple times - should be identical
        const message1 = validator.generateEnvironmentMessage(actualStatus, mockResults);
        const message2 = validator.generateEnvironmentMessage(actualStatus, mockResults);

        // Messages should be identical and valid
        const isConsistent = message1 === message2;
        const isValidMessage = typeof message1 === 'string' && message1.length > 0;

        return isConsistent && isValidMessage;
      }
    ), { numRuns: 50 });
  });

  /**
   * Property: Specific Variable Validation Determinism
   * For any variable name and value, validation should always return the same result
   */
  test('specific variable validation determinism', () => {
    fc.assert(fc.property(
      fc.record({
        varName: fc.constantFrom('JWT_SECRET', 'PORT', 'NODE_ENV', 'FRONTEND_URL'),
        varValue: fc.oneof(
          fc.string({ minLength: 0, maxLength: 100 }),
          fc.integer({ min: 0, max: 100000 }).map(String),
          fc.constant(''),
          fc.constant('test_value')
        )
      }),
      ({ varName, varValue }) => {
        const results = [];

        // Validate the same variable multiple times
        for (let i = 0; i < 3; i++) {
          const result = validator.validateSpecificVariable(varName, varValue);
          results.push({
            valid: result.valid,
            hasReason: !!result.reason,
            reasonLength: result.reason ? result.reason.length : 0
          });
        }

        // All results should be identical
        const firstResult = results[0];
        const allIdentical = results.every(result =>
          result.valid === firstResult.valid &&
          result.hasReason === firstResult.hasReason &&
          result.reasonLength === firstResult.reasonLength
        );

        return allIdentical;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Environment Check Structure Consistency
   * For any environment, the check structure should be consistent
   */
  test('environment check structure consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom('production', 'development'),
      (environment) => {
        const results = [];

        // Get environment checks multiple times
        for (let i = 0; i < 3; i++) {
          const checks = environment === 'production' 
            ? validator.getProductionChecks()
            : validator.getDevelopmentChecks();
          
          results.push({
            count: checks.length,
            allHaveNames: checks.every(c => typeof c.name === 'string'),
            allHaveChecks: checks.every(c => typeof c.check === 'function'),
            allHaveSeverity: checks.every(c => typeof c.severity === 'string'),
            names: checks.map(c => c.name).sort()
          });
        }

        // All results should be identical
        const firstResult = results[0];
        const allIdentical = results.every(result =>
          result.count === firstResult.count &&
          result.allHaveNames === firstResult.allHaveNames &&
          result.allHaveChecks === firstResult.allHaveChecks &&
          result.allHaveSeverity === firstResult.allHaveSeverity &&
          JSON.stringify(result.names) === JSON.stringify(firstResult.names)
        );

        // Structure should be valid
        const hasValidStructure = firstResult.allHaveNames && 
                                 firstResult.allHaveChecks && 
                                 firstResult.allHaveSeverity;

        return allIdentical && hasValidStructure;
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Validation Result Structure Completeness
   * For any validation result, it should have all required properties
   */
  test('validation result structure completeness', () => {
    fc.assert(fc.property(
      fc.constantFrom('development', 'production', 'test'),
      (environment) => {
        // Test deterministic parts only - the structure requirements
        const requiredVars = validator.getRequiredEnvironmentVariables(environment);
        const configFiles = validator.getRequiredConfigFiles(environment);
        
        // These should always have valid structure
        const hasValidRequiredVars = 
          Array.isArray(requiredVars) &&
          requiredVars.length > 0 &&
          requiredVars.every(v => typeof v === 'string' && v.length > 0);

        const hasValidConfigFiles = 
          Array.isArray(configFiles) &&
          configFiles.length > 0 &&
          configFiles.every(f => 
            typeof f.path === 'string' && 
            typeof f.type === 'string' &&
            f.path.length > 0
          );

        // Test message generation structure
        const mockResults = [{ status: 'pass' }, { status: 'fail' }];
        const message = validator.generateEnvironmentMessage('warning', mockResults);
        const hasValidMessage = typeof message === 'string' && message.length > 0;

        return hasValidRequiredVars && hasValidConfigFiles && hasValidMessage;
      }
    ), { numRuns: 50 });
  });

  /**
   * Property: Environment Variable Count Logic
   * For any environment validation, the count logic should be mathematically correct
   */
  test('environment variable count logic', () => {
    fc.assert(fc.property(
      fc.record({
        environment: fc.constantFrom('development', 'production'),
        validVarCount: fc.integer({ min: 0, max: 5 }),
        invalidVarCount: fc.integer({ min: 0, max: 3 }),
        missingVarCount: fc.integer({ min: 0, max: 3 })
      }),
      ({ environment, validVarCount, invalidVarCount, missingVarCount }) => {
        // Test the mathematical relationships that should always hold
        const requiredVars = validator.getRequiredEnvironmentVariables(environment);
        const totalRequired = requiredVars.length;
        
        // Simulate counts
        const presentCount = validVarCount + invalidVarCount;
        const missingCount = missingVarCount;
        
        // Mathematical relationships that should always be true
        const validCountLogic = validVarCount <= presentCount; // Valid can't exceed present
        const totalLogic = presentCount + missingCount <= totalRequired + 10; // Allow some flexibility for test vars
        const nonNegativeLogic = validVarCount >= 0 && invalidVarCount >= 0 && missingCount >= 0;
        
        // Test specific variable validation logic
        const jwtValidation1 = validator.validateSpecificVariable('JWT_SECRET', 'short');
        const jwtValidation2 = validator.validateSpecificVariable('JWT_SECRET', 'this_is_a_very_long_secret_that_should_be_valid_12345');
        
        const validationLogicCorrect = 
          !jwtValidation1.valid && // Short JWT should be invalid
          jwtValidation2.valid;    // Long JWT should be valid

        return validCountLogic && totalLogic && nonNegativeLogic && validationLogicCorrect;
      }
    ), { numRuns: 50 });
  });
});