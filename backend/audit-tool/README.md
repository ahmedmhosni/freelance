# Full System Audit Tool

This tool provides comprehensive auditing and verification of the Freelance Management application after modular architecture refactoring.

## Overview

The audit tool systematically verifies:
- All backend routes are properly registered and accessible
- Frontend API calls match backend routes
- Endpoints function correctly with proper authentication
- Database operations maintain data integrity
- Module structure follows consistent patterns

## Directory Structure

```
audit-tool/
├── models/              # Data models and type definitions
│   ├── RouteInfo.js     # Backend route information
│   ├── APICallInfo.js   # Frontend API call information
│   ├── VerificationResult.js  # Endpoint verification results
│   ├── Issue.js         # Issue tracking
│   ├── AuditResults.js  # Complete audit results
│   └── index.js         # Models export
├── scanners/            # Route and API call discovery
│   ├── BackendRouteScanner.js   # Backend route scanner
│   └── FrontendAPIScanner.js    # Frontend API scanner
├── matchers/            # Route matching logic
│   └── RouteMatcher.js  # Frontend-backend route matcher
├── verifiers/           # Endpoint and database verification
│   ├── EndpointVerifier.js      # Endpoint testing
│   ├── DatabaseVerifier.js      # Database operations testing
│   └── ModuleStructureVerifier.js # Module structure verification
├── reporters/           # Report generation
│   ├── ReportGenerator.js       # Report generator class
│   ├── README.md                # Reporter documentation
│   ├── REPORT_TEMPLATES.md      # Report templates
│   └── example-usage.js         # Usage examples
├── utils/               # Utility functions
│   ├── logger.js        # Logging infrastructure
│   └── pathNormalizer.js # Path normalization utilities
├── __tests__/           # Property-based and unit tests
├── reports/             # Generated audit reports (created at runtime)
├── logs/                # Audit logs (created at runtime)
├── audit.config.js      # Configuration file
├── index.js             # Main entry point
└── README.md            # This file
```

## Configuration

The audit tool is configured via `audit.config.js`. Key configuration options include:

- **Backend**: Server paths, module locations, port
- **Frontend**: Source paths, API configuration
- **Database**: Connection settings, test database
- **Verification**: Timeout, retries, parallel requests
- **Reporting**: Output format, file paths
- **Logging**: Log level, file output, console output

Environment variables can override configuration values. See `audit.config.js` for details.

## Data Models

### RouteInfo
Represents a backend route with method, path, handler, middleware, and module information.

### APICallInfo
Represents a frontend API call with file location, method, path, and component information.

### VerificationResult
Contains the results of testing an endpoint, including request/response details and errors.

### Issue
Represents a discovered issue with type, severity, location, and suggested fix.

### AuditResults
Complete audit results including summary statistics, routes, matches, verification results, and issues.

## Logging

The audit tool includes a comprehensive logging system with:
- Multiple log levels (debug, info, warn, error)
- Console output with colors
- File output for persistent logs
- Operation tracking (start, complete, fail)

Example usage:
```javascript
const logger = require('./utils/logger');

logger.info('Starting audit');
logger.debug('Scanning routes', { count: 10 });
logger.warn('Unmatched route found', { path: '/api/test' });
logger.error('Verification failed', { error: 'Connection timeout' });
```

## Usage

The audit tool consists of several components that work together:

1. **BackendRouteScanner** - Discovers all backend routes ✅
2. **FrontendAPIScanner** - Discovers all frontend API calls ✅
3. **RouteMatcher** - Matches frontend calls to backend routes ✅
4. **EndpointVerifier** - Tests endpoint functionality ✅
5. **DatabaseVerifier** - Verifies database operations ✅
6. **ModuleStructureVerifier** - Verifies module structure consistency ✅
7. **ReportGenerator** - Generates audit reports ✅
8. **AuditOrchestrator** - Coordinates the entire audit process ✅

### Running a Full Audit

The easiest way to run an audit is using the CLI script:

```bash
# Run full audit
node backend/audit-tool/run-audit.js

# Run quick audit (no verification)
node backend/audit-tool/run-audit.js --quick

# Audit specific modules only
node backend/audit-tool/run-audit.js --modules clients,projects

# Use cache for faster re-runs
node backend/audit-tool/run-audit.js --use-cache --save-cache ./audit-cache.json

# Show help
node backend/audit-tool/run-audit.js --help
```

### Using the AuditOrchestrator Programmatically

```javascript
const { AuditOrchestrator, config } = require('./backend/audit-tool');

async function runAudit() {
  const orchestrator = new AuditOrchestrator(config);
  
  // Listen to progress events
  orchestrator.on('progress', (progress) => {
    console.log(`${progress.phase}: ${progress.phaseProgress}%`);
    console.log(`Overall: ${progress.overallProgress}%`);
  });
  
  // Listen to phase completion
  orchestrator.on('phase:complete', (event) => {
    console.log(`Phase ${event.phase} completed`);
  });
  
  try {
    // Run full audit
    const result = await orchestrator.runFullAudit();
    
    console.log(`Audit complete in ${result.executionTime}ms`);
    console.log(`Total routes: ${result.results.summary.totalRoutes}`);
    console.log(`Issues found: ${result.results.summary.issues}`);
    
    // Cleanup
    await orchestrator.cleanup();
  } catch (error) {
    console.error('Audit failed:', error);
  }
}
```

### AuditOrchestrator Features

The AuditOrchestrator provides several audit modes:

#### Full Audit
Runs all phases: discovery, matching, verification, analysis, and reporting.

```javascript
const result = await orchestrator.runFullAudit({
  skipVerification: false,  // Include endpoint verification
  skipDatabase: false,      // Include database verification
  useCache: false          // Use cached discovery results
});
```

#### Quick Audit
Runs discovery and matching only (no verification).

```javascript
const result = await orchestrator.runQuickAudit();
```

#### Incremental Audit
Audits specific modules only.

```javascript
const result = await orchestrator.runIncrementalAudit(['clients', 'projects']);
```

#### Re-run Failed Verifications
Re-tests only the endpoints that failed in a previous audit.

```javascript
const rerunResult = await orchestrator.rerunFailedVerifications(previousResult);
```

### Progress Tracking

The orchestrator emits progress events throughout the audit:

```javascript
orchestrator.on('progress', (progress) => {
  console.log(`Phase: ${progress.phase}`);
  console.log(`Phase Progress: ${progress.phaseProgress}%`);
  console.log(`Overall Progress: ${progress.overallProgress}%`);
  console.log(`Estimated Time Remaining: ${progress.estimatedTimeRemaining}ms`);
  console.log(`Message: ${progress.message}`);
});
```

### Error Handling

The orchestrator collects all errors that occur during the audit:

```javascript
// Get all errors
const errors = orchestrator.getErrors();

// Get errors grouped by phase
const errorsByPhase = orchestrator.getErrorsByPhase();

// Get error summary
const errorSummary = orchestrator.getErrorSummary();
console.log(`Total errors: ${errorSummary.totalErrors}`);
console.log(`Errors by phase:`, errorSummary.errorsByPhase);
```

### Caching

Cache discovery results for faster re-runs:

```javascript
// Save cache
await orchestrator.saveCache('./audit-cache.json');

// Load cache
await orchestrator.loadCache('./audit-cache.json');

// Run audit with cache
const result = await orchestrator.runFullAudit({ useCache: true });
```

### Examples

See `example-orchestrator-usage.js` for complete examples of:
- Full audit with progress tracking
- Quick audit
- Incremental audit
- Using cache
- Re-running failed verifications

### Generating Reports

The ReportGenerator provides multiple report types:

```javascript
const ReportGenerator = require('./reporters/ReportGenerator');
const generator = new ReportGenerator();

// Generate summary report
const summaryReport = generator.generateSummaryReport(auditResults);

// Generate detailed route report
const routeReport = generator.generateRouteReport(auditResults);

// Generate issue report
const issueReport = generator.generateIssueReport(auditResults);

// Generate fix tracking report
const fixTrackingReport = generator.generateFixTrackingReport(auditResults.issues);

// Generate comprehensive report
const comprehensiveReport = generator.generateComprehensiveReport(
  auditResults,
  {
    version: '1.0.0',
    environment: 'production',
    auditType: 'full'
  }
);
```

See `reporters/README.md` for detailed documentation and `reporters/example-usage.js` for complete examples.

## Development

To add new functionality:

1. Create new components in appropriate directories
2. Update models if new data structures are needed
3. Use the logger for all logging operations
4. Follow JSDoc conventions for type definitions
5. Update this README with new features

## Testing

Property-based tests and unit tests will be implemented to verify:
- Route registration completeness
- Path matching accuracy
- Verification result correctness
- Issue detection and reporting

See the design document for complete testing strategy.
