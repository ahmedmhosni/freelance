# Route Matching Improvement Tests

This directory contains tests for the route matching improvement feature.

## Testing Infrastructure

### Installed Dependencies

- **fast-check** (v4.3.0) - Property-based testing library
- **jest** (v30.2.0) - Unit testing framework

### Test Directory Structure

Tests are organized in the `backend/audit-tool/__tests__/` directory:

- `*.unit.test.js` - Unit tests for specific components
- `*.property.test.js` - Property-based tests using fast-check
- `*.integration.test.js` - Integration tests

### Jest Configuration

Jest is configured in `backend/jest.config.js` with:

- Test environment: Node.js
- Test timeout: 30 seconds
- Coverage collection from `src/**/*.js`
- Test pattern: `**/__tests__/**/*.js` and `**/*.test.js`

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.js

# Run tests with coverage
npm test:coverage

# Run tests in watch mode
npm test:watch
```

### Property-Based Testing

Property-based tests use fast-check with a minimum of 100 iterations per test:

```javascript
await fc.assert(
  fc.asyncProperty(
    // arbitraries...
    async (...args) => {
      // test logic
    }
  ),
  { numRuns: 100 }
);
```

### Test Naming Convention

- Unit tests: `ComponentName.unit.test.js`
- Property tests: `property-name.property.test.js`
- Integration tests: `feature-name.integration.test.js`

## Existing Tests

The following test files already exist and are passing:

- `RouteMatcher.unit.test.js` - Unit tests for RouteMatcher (26 tests)
- `frontend-backend-matching.property.test.js` - Property tests for route matching (7 tests)
- `BackendRouteScanner.unit.test.js` - Unit tests for backend scanner
- `FrontendAPIScanner.unit.test.js` - Unit tests for frontend scanner
- And 30+ other test files for various audit tool features

## Next Steps

New tests for the route matching improvement feature will be added in subsequent tasks:

1. Property tests for path parameter matching
2. Property tests for query parameter handling
3. Property tests for method matching
4. Unit tests for edge cases
5. Integration tests for full matching flow
