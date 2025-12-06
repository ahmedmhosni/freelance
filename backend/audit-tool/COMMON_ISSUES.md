# Common Issues and Fixes

**Version:** 1.0.0  
**Last Updated:** December 6, 2025

This document provides a knowledge base of common issues discovered during system audits, their root causes, and proven fix patterns.

---

## Table of Contents

1. [Route Discovery Issues](#route-discovery-issues)
2. [Path Matching Issues](#path-matching-issues)
3. [Authentication Issues](#authentication-issues)
4. [Database Issues](#database-issues)
5. [Module Structure Issues](#module-structure-issues)
6. [Frontend Integration Issues](#frontend-integration-issues)
7. [Configuration Issues](#configuration-issues)
8. [Performance Issues](#performance-issues)

---

## Route Discovery Issues

### Issue: Zero Modular Routes Discovered

**Severity:** Critical  
**Symptom:** Audit reports 0 modular routes despite modules existing in codebase

**Root Causes:**
1. Bootstrap process not being called during discovery
2. Path resolution issues when loading bootstrap module
3. DI container not properly initialized
4. Environment variables not loaded before bootstrap

**Fix Pattern:**

```javascript
// In AuditOrchestrator._runDiscoveryPhase()

// Load environment variables BEFORE bootstrap
const backendPath = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(backendPath, '.env') });

// Bootstrap with correct path resolution
const { bootstrap } = require(path.join(backendPath, 'src/core/bootstrap'));
const { container } = await bootstrap({ createApp: false });

// Scan modular routes
const modularRoutes = this.backendScanner.scanModuleRoutes(container);
```

**Verification:**
```bash
node run-audit.js --quick
# Should show: "Discovered X modular routes" where X > 0
```

**Prevention:**
- Always test audit tool after bootstrap changes
- Include modular route count in CI/CD checks
- Document bootstrap dependencies

---

### Issue: Duplicate Routes Detected

**Severity:** High  
**Symptom:** Same route registered multiple times with different handlers

**Root Causes:**
1. Route registered in both modular and legacy systems
2. Module imported multiple times
3. Route file executed multiple times

**Fix Pattern:**

```javascript
// Option 1: Remove from legacy routes
// Delete or comment out in backend/src/routes/

// Option 2: Remove from modular routes
// Remove route registration from module controller

// Option 3: Use route prefix to differentiate
// Modular: /api/v2/clients
// Legacy: /api/clients
```

**Example Fix:**
```javascript
// Before: Duplicate registration
// In routes/clients.js
router.get('/api/clients', handler);

// In modules/clients/index.js
router.get('/clients', handler);

// After: Remove legacy route
// Delete routes/clients.js or remove route registration
```

**Verification:**
```bash
# Check for duplicates in audit report
grep "DUPLICATE_ROUTE" reports/issues.md
```

**Prevention:**
- Maintain route inventory document
- Use route prefixes to separate systems
- Add duplicate detection to CI/CD

---

### Issue: Routes Not Registered in Server

**Severity:** High  
**Symptom:** Module exists but routes not accessible

**Root Causes:**
1. Module not imported in server.js
2. Module index.js not exporting routes correctly
3. Route registration order issue
4. Middleware blocking route registration

**Fix Pattern:**

```javascript
// 1. Verify module exports routes
// In modules/clients/index.js
module.exports = (container) => {
  const router = express.Router();
  const controller = container.resolve('clientController');
  
  router.get('/', controller.getAll.bind(controller));
  router.post('/', controller.create.bind(controller));
  
  return router; // MUST return router
};

// 2. Verify module registered in server
// In src/server.js or bootstrap
const clientsModule = require('./modules/clients');
app.use('/api/clients', clientsModule(container));
```

**Verification:**
```bash
# Test route directly
curl http://localhost:5000/api/clients

# Check audit results
node run-audit.js --quick
```

**Prevention:**
- Use consistent module registration pattern
- Document module registration process
- Add route registration tests

---

## Path Matching Issues

### Issue: Template Literal API Calls Not Matching

**Severity:** High  
**Symptom:** Frontend calls like `${apiUrl}/clients` don't match backend routes

**Root Causes:**
1. Scanner detects `:apiUrl` as literal string
2. Path normalization doesn't handle template variables
3. Frontend uses multiple API URL construction patterns

**Fix Pattern:**

```javascript
// Option 1: Update frontend to use configured API client (RECOMMENDED)
// Before:
const apiUrl = import.meta.env.VITE_API_URL || '';
const response = await axios.get(`${apiUrl}/clients`);

// After:
import api from '../utils/api';
const response = await api.get('/clients');

// Option 2: Enhance path normalizer (if frontend changes not possible)
// In utils/pathNormalizer.js
function normalizePath(path) {
  // Handle :apiUrl prefix
  if (path.startsWith(':apiUrl/')) {
    path = '/api/' + path.substring(9);
  }
  // ... rest of normalization
}
```

**Affected Files:**
- AppFooter.jsx
- Layout.jsx
- Home.jsx
- Changelog.jsx
- Announcements.jsx
- AdminGDPR.jsx
- EmailPreferences.jsx
- DataPrivacy.jsx

**Bulk Fix Script:**
```bash
# Find all template literal API calls
grep -r "\${apiUrl}" frontend/src/

# Replace with configured API client
# (Manual review recommended for each file)
```

**Verification:**
```bash
# Run audit and check match rate
node run-audit.js --quick
# Match rate should increase by 10-15%
```

**Prevention:**
- Enforce API client usage in code reviews
- Add ESLint rule to prevent direct axios calls
- Document API call standards

---

### Issue: Query Parameters Treated as Path

**Severity:** Medium  
**Symptom:** Routes with query params don't match: `/clients?status=active`

**Root Causes:**
1. Path matcher includes query string in comparison
2. Frontend scanner captures full URL including params
3. Backend routes don't include query params in path

**Fix Pattern:**

```javascript
// In utils/pathNormalizer.js
function normalizePath(path) {
  // Strip query parameters
  const queryIndex = path.indexOf('?');
  if (queryIndex !== -1) {
    path = path.substring(0, queryIndex);
  }
  
  // Strip hash fragments
  const hashIndex = path.indexOf('#');
  if (hashIndex !== -1) {
    path = path.substring(0, hashIndex);
  }
  
  // ... rest of normalization
}
```

**Verification:**
```javascript
// Test cases
normalizePath('/clients?status=active') === '/clients'
normalizePath('/clients#section') === '/clients'
normalizePath('/clients?a=1&b=2') === '/clients'
```

**Prevention:**
- Always strip query params before path matching
- Document query parameter handling
- Add test cases for query params

---

### Issue: Inconsistent /api Prefix Usage

**Severity:** Medium  
**Symptom:** Some calls use `/api/clients`, others use `/clients`

**Root Causes:**
1. Frontend uses multiple base URL configurations
2. Some components add `/api` prefix manually
3. Backend routes registered with different prefixes

**Fix Pattern:**

```javascript
// Standardize on ONE pattern:

// Option 1: Backend adds /api prefix (RECOMMENDED)
// In server.js
app.use('/api/clients', clientsRouter);
app.use('/api/projects', projectsRouter);

// Frontend uses paths without /api
api.get('/clients')  // Calls /api/clients

// Option 2: Frontend adds /api prefix
// In utils/api.js
const api = axios.create({
  baseURL: process.env.VITE_API_URL + '/api'
});

// Backend routes without /api
app.use('/clients', clientsRouter);
```

**Migration Steps:**
1. Choose one pattern (Option 1 recommended)
2. Update all backend route registrations
3. Update all frontend API calls
4. Update API client configuration
5. Run audit to verify

**Verification:**
```bash
# All routes should have consistent prefix
node run-audit.js --quick
grep "DUPLICATE_PREFIX" reports/issues.md
# Should return no results
```

**Prevention:**
- Document API prefix standard
- Use consistent route registration
- Add prefix validation to CI/CD

---

## Authentication Issues

### Issue: Protected Routes Missing Auth Middleware

**Severity:** Critical  
**Symptom:** Protected routes accessible without authentication

**Root Causes:**
1. Auth middleware not applied to route
2. Middleware applied in wrong order
3. Auth middleware not working correctly

**Fix Pattern:**

```javascript
// Apply auth middleware to protected routes
const { authenticate } = require('../middleware/auth');

// Option 1: Apply to individual routes
router.get('/clients', authenticate, controller.getAll);
router.post('/clients', authenticate, controller.create);

// Option 2: Apply to all routes in router
router.use(authenticate);
router.get('/clients', controller.getAll);
router.post('/clients', controller.create);

// Option 3: Apply at module registration
app.use('/api/clients', authenticate, clientsRouter);
```

**Verification:**
```bash
# Test without token (should fail)
curl http://localhost:5000/api/clients
# Expected: 401 Unauthorized

# Test with token (should succeed)
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/clients
# Expected: 200 OK
```

**Prevention:**
- Default to requiring authentication
- Use route groups for public routes
- Add authentication tests to CI/CD

---

### Issue: Token Validation Failing

**Severity:** High  
**Symptom:** Valid tokens rejected, users logged out unexpectedly

**Root Causes:**
1. JWT secret mismatch between environments
2. Token expiration too short
3. Token format incorrect
4. Clock skew between servers

**Fix Pattern:**

```javascript
// 1. Verify JWT secret is consistent
// In .env
JWT_SECRET=your-secret-key-here

// 2. Verify token expiration is reasonable
// In auth service
const token = jwt.sign(payload, secret, {
  expiresIn: '24h'  // Not too short
});

// 3. Add clock tolerance
jwt.verify(token, secret, {
  clockTolerance: 60  // 60 seconds tolerance
});

// 4. Add better error handling
try {
  const decoded = jwt.verify(token, secret);
  return decoded;
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    throw new Error('Token expired');
  } else if (error.name === 'JsonWebTokenError') {
    throw new Error('Invalid token');
  }
  throw error;
}
```

**Verification:**
```bash
# Generate token and test
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 1 }, 'your-secret', { expiresIn: '1h' });
console.log(token);
"

# Test with generated token
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/clients
```

**Prevention:**
- Use environment variables for secrets
- Document token expiration policy
- Add token validation tests
- Monitor token rejection rates

---

## Database Issues

### Issue: Foreign Key Constraint Violations

**Severity:** High  
**Symptom:** Cannot create/delete records due to constraint violations

**Root Causes:**
1. Trying to create record with invalid foreign key
2. Trying to delete record with dependent records
3. Cascading deletes not configured
4. Foreign key constraints not properly defined

**Fix Pattern:**

```javascript
// 1. Validate foreign keys before insert
async create(data) {
  // Check if client exists
  const client = await this.clientRepo.findById(data.clientId);
  if (!client) {
    throw new Error('Client not found');
  }
  
  return this.projectRepo.create(data);
}

// 2. Handle cascading deletes
// In migration
ALTER TABLE projects
ADD CONSTRAINT fk_client
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;  // Delete projects when client deleted

// 3. Check for dependencies before delete
async delete(id) {
  const projects = await this.projectRepo.findByClientId(id);
  if (projects.length > 0) {
    throw new Error('Cannot delete client with active projects');
  }
  
  return this.clientRepo.delete(id);
}
```

**Verification:**
```javascript
// Test foreign key validation
try {
  await projectRepo.create({ clientId: 99999 });
  // Should throw error
} catch (error) {
  console.log('Foreign key validation working');
}

// Test cascading delete
const client = await clientRepo.create({ name: 'Test' });
const project = await projectRepo.create({ clientId: client.id });
await clientRepo.delete(client.id);
const deletedProject = await projectRepo.findById(project.id);
// deletedProject should be null
```

**Prevention:**
- Always validate foreign keys
- Document cascading delete behavior
- Add foreign key tests
- Use database constraints

---

### Issue: Transaction Rollback Not Working

**Severity:** High  
**Symptom:** Partial data saved when operation should be atomic

**Root Causes:**
1. Not using transactions for multi-step operations
2. Transaction not properly rolled back on error
3. Connection not in transaction mode
4. Autocommit enabled

**Fix Pattern:**

```javascript
// Use transactions for multi-step operations
async createInvoiceWithItems(invoiceData, items) {
  const client = await this.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Step 1: Create invoice
    const invoiceResult = await client.query(
      'INSERT INTO invoices (client_id, total) VALUES ($1, $2) RETURNING id',
      [invoiceData.clientId, invoiceData.total]
    );
    const invoiceId = invoiceResult.rows[0].id;
    
    // Step 2: Create invoice items
    for (const item of items) {
      await client.query(
        'INSERT INTO invoice_items (invoice_id, description, amount) VALUES ($1, $2, $3)',
        [invoiceId, item.description, item.amount]
      );
    }
    
    await client.query('COMMIT');
    return invoiceId;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

**Verification:**
```javascript
// Test rollback on error
try {
  await createInvoiceWithItems(
    { clientId: 1, total: 100 },
    [{ description: 'Item 1', amount: 100 }]
  );
  
  // Cause error in second item
  await createInvoiceWithItems(
    { clientId: 1, total: 100 },
    [
      { description: 'Item 1', amount: 50 },
      { description: null, amount: 50 }  // Will fail
    ]
  );
} catch (error) {
  // Verify no partial data saved
  const invoices = await getInvoicesByClient(1);
  // Should only have first invoice
}
```

**Prevention:**
- Always use transactions for multi-step operations
- Test rollback scenarios
- Document transaction boundaries
- Add transaction tests

---

## Module Structure Issues

### Issue: Missing Required Directories

**Severity:** Medium  
**Symptom:** Module structure verification fails

**Root Causes:**
1. Module created without standard structure
2. Directories deleted accidentally
3. Incomplete module scaffolding

**Fix Pattern:**

```bash
# Standard module structure
modules/
└── module-name/
    ├── controllers/
    │   └── ModuleController.js
    ├── services/
    │   └── ModuleService.js
    ├── repositories/
    │   └── ModuleRepository.js
    ├── models/
    │   └── Module.js
    ├── validators/
    │   └── moduleValidator.js
    ├── __tests__/
    │   └── module.test.js
    └── index.js

# Create missing directories
mkdir -p modules/module-name/{controllers,services,repositories,models,validators,__tests__}

# Create index.js if missing
cat > modules/module-name/index.js << 'EOF'
const express = require('express');

module.exports = (container) => {
  const router = express.Router();
  const controller = container.resolve('moduleController');
  
  // Define routes
  router.get('/', controller.getAll.bind(controller));
  router.post('/', controller.create.bind(controller));
  
  return router;
};
EOF
```

**Verification:**
```bash
# Run module structure verifier
node audit-tool/verifiers/ModuleStructureVerifier.js

# Or run full audit
node run-audit.js
```

**Prevention:**
- Use module scaffolding script
- Document module structure standard
- Add structure validation to CI/CD

---

### Issue: Inconsistent Naming Conventions

**Severity:** Low  
**Symptom:** Files named inconsistently across modules

**Root Causes:**
1. No naming convention documented
2. Multiple developers with different styles
3. Legacy code not updated

**Fix Pattern:**

```bash
# Standard naming conventions:
# - Controllers: PascalCase + "Controller" suffix
# - Services: PascalCase + "Service" suffix
# - Repositories: PascalCase + "Repository" suffix
# - Files: Match class name

# Examples:
ClientController.js    # ✅ Correct
clientController.js    # ❌ Wrong case
Client.controller.js   # ❌ Wrong format

# Rename files to match standard
mv clientController.js ClientController.js
mv client.service.js ClientService.js
mv clientRepo.js ClientRepository.js
```

**Verification:**
```bash
# Check naming conventions
find modules/ -name "*.js" | grep -v "^[A-Z]"
# Should return no results
```

**Prevention:**
- Document naming conventions
- Use linting rules for file names
- Add naming checks to CI/CD
- Use code generation templates

---

## Frontend Integration Issues

### Issue: API Client Not Configured

**Severity:** High  
**Symptom:** Frontend API calls fail with CORS or connection errors

**Root Causes:**
1. Base URL not configured
2. Environment variable not set
3. API client not imported correctly

**Fix Pattern:**

```javascript
// 1. Configure API client
// In frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// 2. Set environment variable
// In frontend/.env
VITE_API_URL=http://localhost:5000

// 3. Use API client in components
// In components
import api from '../utils/api';

const fetchClients = async () => {
  const response = await api.get('/clients');
  return response.data;
};
```

**Verification:**
```bash
# Test API call
curl http://localhost:5000/api/clients

# Check frontend console for errors
# Should see successful API calls
```

**Prevention:**
- Document API client setup
- Add API client tests
- Validate environment variables on startup

---

### Issue: CORS Errors

**Severity:** High  
**Symptom:** Browser blocks API requests with CORS error

**Root Causes:**
1. CORS not configured on backend
2. Frontend origin not allowed
3. Credentials not included in requests

**Fix Pattern:**

```javascript
// 1. Configure CORS on backend
// In server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Include credentials in frontend requests
// In frontend/src/utils/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true  // Include cookies
});

// 3. For development, allow all origins
// In server.js (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: '*' }));
}
```

**Verification:**
```bash
# Check CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:5000/api/clients

# Should see Access-Control-Allow-Origin header
```

**Prevention:**
- Configure CORS early in development
- Document CORS configuration
- Test from different origins

---

## Configuration Issues

### Issue: Environment Variables Not Loaded

**Severity:** High  
**Symptom:** Application uses default values instead of configured values

**Root Causes:**
1. .env file not in correct location
2. dotenv not loaded before use
3. Environment variable names incorrect
4. .env file not committed (for non-sensitive vars)

**Fix Pattern:**

```javascript
// 1. Load environment variables early
// At the top of server.js or index.js
require('dotenv').config();

// 2. Verify .env file location
// Should be in project root or backend directory
backend/
├── .env          # ✅ Correct location
├── src/
│   └── .env      # ❌ Wrong location
└── package.json

// 3. Use consistent naming
// In .env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret

// 4. Validate required variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

**Verification:**
```javascript
// Test environment variables
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
// Should show configured values, not undefined
```

**Prevention:**
- Document all environment variables
- Provide .env.example file
- Validate environment on startup
- Add environment checks to CI/CD

---

### Issue: Configuration File Not Found

**Severity:** Medium  
**Symptom:** Audit tool cannot find configuration file

**Root Causes:**
1. Config file in wrong location
2. Config file name incorrect
3. Path resolution issue

**Fix Pattern:**

```javascript
// 1. Use standard config file location
backend/audit-tool/
└── audit.config.js  # ✅ Standard location

// 2. Use absolute path resolution
const path = require('path');
const configPath = path.resolve(__dirname, './audit.config.js');
const config = require(configPath);

// 3. Support custom config path
const configPath = process.env.AUDIT_CONFIG || './audit.config.js';
const config = require(path.resolve(configPath));

// 4. Provide default config
const defaultConfig = {
  backend: { port: 5000 },
  database: { host: 'localhost' }
};

let config;
try {
  config = require('./audit.config.js');
} catch (error) {
  console.warn('Config file not found, using defaults');
  config = defaultConfig;
}
```

**Verification:**
```bash
# Test config loading
node -e "const config = require('./audit.config.js'); console.log(config);"

# Should output config object
```

**Prevention:**
- Use standard config file location
- Document config file requirements
- Provide example config file

---

## Performance Issues

### Issue: Audit Takes Too Long

**Severity:** Medium  
**Symptom:** Audit takes >5 minutes to complete

**Root Causes:**
1. Too many parallel requests
2. No request timeout
3. Verification phase testing all routes
4. No caching of discovery results

**Fix Pattern:**

```javascript
// 1. Limit parallel requests
const config = {
  verification: {
    parallelRequests: 5,  // Reduce if too high
    timeout: 5000,        // Add timeout
    requestDelay: 100     // Add delay between requests
  }
};

// 2. Use caching
// First run
node run-audit.js --save-cache ./cache.json

// Subsequent runs
node run-audit.js --load-cache ./cache.json

// 3. Sample routes instead of testing all
// In verification phase
const sampleSize = Math.min(10, routes.length);
const sampledRoutes = routes.slice(0, sampleSize);

// 4. Skip verification for quick audits
node run-audit.js --quick
```

**Verification:**
```bash
# Time the audit
time node run-audit.js --quick
# Should complete in <5 seconds

time node run-audit.js
# Should complete in <60 seconds
```

**Prevention:**
- Use quick audits during development
- Use caching for repeated runs
- Optimize verification phase
- Monitor audit execution time

---

### Issue: High Memory Usage

**Severity:** Medium  
**Symptom:** Audit tool uses excessive memory (>500MB)

**Root Causes:**
1. Loading entire codebase into memory
2. Not releasing resources
3. Memory leaks in scanners
4. Large log files

**Fix Pattern:**

```javascript
// 1. Stream large files instead of loading all at once
const fs = require('fs');
const readline = require('readline');

async function scanLargeFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    // Process line by line
  }
}

// 2. Release resources after use
async cleanup() {
  if (this.databaseVerifier) {
    await this.databaseVerifier.close();
  }
  this.cache = null;
  this.errors = null;
}

// 3. Limit log file size
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'audit.log',
      maxsize: 10485760,  // 10MB
      maxFiles: 5
    })
  ]
});
```

**Verification:**
```bash
# Monitor memory usage
node --max-old-space-size=512 run-audit.js
# Should not exceed 512MB
```

**Prevention:**
- Monitor memory usage
- Release resources promptly
- Use streaming for large files
- Rotate log files

---

## Quick Reference

### Issue Priority Guide

- **Critical (P0):** System cannot function - fix immediately
- **High (P1):** Core features broken - fix within 1-2 days
- **Medium (P2):** Secondary features affected - fix within 1 week
- **Low (P3):** Minor issues - fix when convenient

### Common Fix Patterns

1. **Route not found:** Check registration in server.js
2. **Path mismatch:** Standardize API call pattern
3. **Auth failure:** Verify middleware applied
4. **Database error:** Check foreign keys and transactions
5. **Config error:** Verify environment variables

### Diagnostic Commands

```bash
# Check route registration
node -e "require('./src/server.js')" 2>&1 | grep "Registered"

# Test API endpoint
curl -v http://localhost:5000/api/clients

# Check database connection
psql -h localhost -U postgres -d roastify -c "SELECT 1"

# View audit logs
tail -f audit-tool/logs/audit.log

# Run quick audit
node audit-tool/run-audit.js --quick
```

---

## Getting Help

If you encounter an issue not covered here:

1. Check the [User Guide](./USER_GUIDE.md)
2. Review audit logs in `logs/audit.log`
3. Run audit with `--verbose` flag
4. Check the [Maintenance Guide](./MAINTENANCE_GUIDE.md)
5. Contact the development team

---

**Last Updated:** December 6, 2025  
**Maintainer:** Backend Team

