# Comprehensive Test Suite

This directory contains end-to-end (E2E) tests and performance tests for the scalable architecture refactor.

## Test Structure

```
__tests__/
├── e2e/                          # End-to-end integration tests
│   ├── auth.e2e.test.js         # Authentication flow tests
│   ├── workflow.e2e.test.js     # Complete user workflow tests
│   └── data-consistency.e2e.test.js  # Data consistency tests
└── performance/                  # Performance and load tests
    ├── load-test.perf.test.js   # Load testing and response times
    ├── comparison.perf.test.js  # Old vs new architecture comparison
    └── query-optimization.perf.test.js  # Database query optimization tests
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Run Performance Tests Only
```bash
npm run test:perf
```

### Run All Tests Sequentially
```bash
npm run test:all
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## E2E Tests

### Authentication Tests (`auth.e2e.test.js`)
Tests the complete authentication flow:
- User registration with validation
- User login with credentials
- Protected route access with JWT tokens
- Token refresh mechanism
- Logout functionality

### Workflow Tests (`workflow.e2e.test.js`)
Tests a complete user workflow from start to finish:
1. Create a client
2. Create a project for the client
3. Create tasks for the project
4. Track time on tasks
5. Create and manage invoices
6. Complete tasks and projects
7. View dashboard and reports
8. Verify data integrity

### Data Consistency Tests (`data-consistency.e2e.test.js`)
Tests data consistency and integrity:
- Concurrent updates handling
- Transaction rollback on errors
- Cascade operations
- Cross-module reference validation
- Data consistency across updates

## Performance Tests

### Load Tests (`load-test.perf.test.js`)
Tests system performance under load:
- Endpoint response times (< 200-500ms targets)
- Concurrent request handling (10-15 concurrent requests)
- Pagination performance with large datasets
- Search performance with wildcards
- Complex query performance (dashboard, reports)
- Database connection pool performance

### Comparison Tests (`comparison.perf.test.js`)
Compares old vs new architecture performance:
- GET endpoint comparison
- POST endpoint comparison
- Query optimization comparison
- Memory usage comparison
- Error handling performance
- Transaction performance

### Query Optimization Tests (`query-optimization.perf.test.js`)
Tests database query performance:
- Index usage verification
- Join performance
- Aggregation performance
- Bulk operations (insert, update, delete)
- Complex query performance
- Connection pool efficiency

## Performance Targets

| Operation | Target Time |
|-----------|-------------|
| Simple GET | < 200ms |
| Simple POST | < 300ms |
| Dashboard | < 500ms |
| Reports | < 1000ms |
| Search | < 250ms |
| Pagination | < 200ms |
| Error Response | < 100ms |

## Prerequisites

Before running tests:

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Test Database**
   - Ensure PostgreSQL is running
   - Configure test database connection in `.env`
   - Run migrations if needed

3. **Environment Variables**
   ```
   PG_HOST=localhost
   PG_PORT=5432
   PG_DATABASE=freelancer_test
   PG_USER=postgres
   PG_PASSWORD=your_password
   JWT_SECRET=test_secret
   ```

## Test Data Management

- Tests create their own test data with unique identifiers
- All tests clean up after themselves in `afterAll` hooks
- Test users have email patterns like `*-test@example.com`
- Tests run in isolation and don't interfere with each other

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Tests run sequentially (`--runInBand`) to avoid database conflicts
- 30-second timeout for long-running E2E tests
- Automatic cleanup prevents test data accumulation
- Clear error messages for debugging failures

## Troubleshooting

### Tests Timing Out
- Increase `testTimeout` in `jest.config.js`
- Check database connection
- Verify server is starting correctly

### Database Connection Errors
- Ensure PostgreSQL is running
- Check environment variables
- Verify database exists and user has permissions

### Test Data Not Cleaning Up
- Check `afterAll` hooks are executing
- Verify database transactions are completing
- Look for errors in cleanup code

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data in `afterAll`
3. **Unique Data**: Use unique identifiers for test data
4. **Assertions**: Use specific assertions with clear messages
5. **Performance**: Keep performance targets realistic
6. **Documentation**: Document complex test scenarios

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Add cleanup in `afterAll` hooks
3. Use descriptive test names
4. Document complex scenarios
5. Update this README if adding new test categories
