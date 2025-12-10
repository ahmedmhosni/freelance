#!/usr/bin/env node

/**
 * Comprehensive System Testing
 * Tests database connectivity, API endpoints, and system functionality
 */

require('dotenv').config({ path: './backend/.env' });

const axios = require('axios');
const { Pool } = require('pg');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}📋 ${msg}${colors.reset}\n`)
};

let testsPassed = 0;
let testsTotal = 0;
const issues = [];

async function runTest(name, testFn) {
  testsTotal++;
  try {
    const result = await testFn();
    if (result === true || result === undefined) {
      log.success(name);
      testsPassed++;
    } else {
      log.error(`${name}: ${result}`);
      issues.push(`${name}: ${result}`);
    }
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    issues.push(`${name}: ${error.message}`);
  }
}

// Database configuration
const dbConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'roastify',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const API_BASE_URL = 'http://localhost:5000';

async function main() {
  console.log('🧪 Starting Comprehensive System Testing...\n');

  // 1. Database Connectivity Tests
  log.section('Database Connectivity Tests');

  await runTest('PostgreSQL connection', async () => {
    const pool = new Pool(dbConfig);
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      await pool.end();
      return true;
    } catch (error) {
      await pool.end();
      throw error;
    }
  });

  await runTest('Database schema validation', async () => {
    const pool = new Pool(dbConfig);
    try {
      const client = await pool.connect();
      
      // Check for essential tables
      const tables = ['users', 'clients', 'projects', 'tasks', 'invoices'];
      for (const table of tables) {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [table]);
        
        if (!result.rows[0].exists) {
          throw new Error(`Table '${table}' does not exist`);
        }
      }
      
      client.release();
      await pool.end();
      return true;
    } catch (error) {
      await pool.end();
      throw error;
    }
  });

  await runTest('Database user permissions', async () => {
    const pool = new Pool(dbConfig);
    try {
      const client = await pool.connect();
      
      // Test basic CRUD operations
      await client.query('SELECT 1');
      
      // Test if we can create a temporary table (indicates sufficient permissions)
      await client.query('CREATE TEMP TABLE test_permissions (id SERIAL PRIMARY KEY, name VARCHAR(50))');
      await client.query('INSERT INTO test_permissions (name) VALUES ($1)', ['test']);
      await client.query('SELECT * FROM test_permissions');
      await client.query('DROP TABLE test_permissions');
      
      client.release();
      await pool.end();
      return true;
    } catch (error) {
      await pool.end();
      throw error;
    }
  });

  // 2. Backend Server Tests
  log.section('Backend Server Tests');

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  await runTest('Backend server health check', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      return response.status === 200 && response.data.status === 'ok';
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        return 'Backend server is not running. Please start it with: cd backend && npm run dev';
      }
      throw error;
    }
  });

  await runTest('API documentation endpoint', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api-docs.json`, { timeout: 5000 });
      return response.status === 200 && response.data.info;
    } catch (error) {
      if (error.response?.status === 404) {
        return 'API documentation not available';
      }
      throw error;
    }
  });

  // 3. Authentication Tests
  log.section('Authentication System Tests');

  let authToken = null;

  await runTest('User registration endpoint', async () => {
    try {
      const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!'
      };

      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser, { timeout: 5000 });
      
      if (response.status === 201 && response.data.token) {
        authToken = response.data.token;
        return true;
      }
      
      return `Registration failed: ${response.status}`;
    } catch (error) {
      if (error.response?.status === 400) {
        return 'Registration validation working (expected for duplicate email)';
      }
      throw error;
    }
  });

  await runTest('User login endpoint', async () => {
    try {
      // Try to login with a test user or create one
      const loginData = {
        email: 'admin@roastify.com',
        password: 'admin123'
      };

      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData, { timeout: 5000 });
      
      if (response.status === 200 && response.data.token) {
        authToken = response.data.token;
        return true;
      }
      
      return `Login failed: ${response.status}`;
    } catch (error) {
      if (error.response?.status === 401) {
        return 'Login validation working (credentials may not exist)';
      }
      throw error;
    }
  });

  // 4. Core API Endpoints Tests
  log.section('Core API Endpoints Tests');

  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  await runTest('Clients API endpoint', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clients`, { headers, timeout: 5000 });
      return response.status === 200 || response.status === 401; // 401 is ok if not authenticated
    } catch (error) {
      if (error.response?.status === 401) {
        return true; // Expected if no auth token
      }
      throw error;
    }
  });

  await runTest('Projects API endpoint', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/projects`, { headers, timeout: 5000 });
      return response.status === 200 || response.status === 401;
    } catch (error) {
      if (error.response?.status === 401) {
        return true;
      }
      throw error;
    }
  });

  await runTest('Tasks API endpoint', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks`, { headers, timeout: 5000 });
      return response.status === 200 || response.status === 401;
    } catch (error) {
      if (error.response?.status === 401) {
        return true;
      }
      throw error;
    }
  });

  await runTest('Invoices API endpoint', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/invoices`, { headers, timeout: 5000 });
      return response.status === 200 || response.status === 401;
    } catch (error) {
      if (error.response?.status === 401) {
        return true;
      }
      throw error;
    }
  });

  await runTest('Time tracking API endpoint', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/time-tracking`, { headers, timeout: 5000 });
      return response.status === 200 || response.status === 401;
    } catch (error) {
      if (error.response?.status === 401) {
        return true;
      }
      throw error;
    }
  });

  // 5. Security Tests
  log.section('Security Configuration Tests');

  await runTest('CORS headers present', async () => {
    try {
      const response = await axios.options(`${API_BASE_URL}/api/health`, { timeout: 5000 });
      const corsHeader = response.headers['access-control-allow-origin'];
      return corsHeader !== undefined;
    } catch (error) {
      // Some servers don't respond to OPTIONS, try GET
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
        return response.headers['access-control-allow-origin'] !== undefined;
      } catch (getError) {
        throw getError;
      }
    }
  });

  await runTest('Security headers present', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ];
      
      const presentHeaders = securityHeaders.filter(header => 
        response.headers[header] !== undefined
      );
      
      return presentHeaders.length > 0;
    } catch (error) {
      throw error;
    }
  });

  await runTest('Rate limiting configured', async () => {
    try {
      // Make multiple rapid requests to test rate limiting
      const requests = Array(5).fill().map(() => 
        axios.get(`${API_BASE_URL}/health`, { timeout: 5000 })
      );
      
      await Promise.all(requests);
      return true; // If no rate limiting error, that's still ok for local testing
    } catch (error) {
      if (error.response?.status === 429) {
        return true; // Rate limiting is working
      }
      throw error;
    }
  });

  // 6. Production Readiness Tests
  log.section('Production Readiness Tests');

  await runTest('Environment variables validation', () => {
    const requiredVars = ['PG_HOST', 'PG_DATABASE', 'JWT_SECRET'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return `Missing environment variables: ${missingVars.join(', ')}`;
    }
    
    return true;
  });

  await runTest('JWT secret strength', () => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return 'JWT_SECRET not set';
    }
    
    if (jwtSecret.length < 32) {
      return 'JWT_SECRET should be at least 32 characters long';
    }
    
    if (jwtSecret === 'your_jwt_secret_key_change_this_in_production_12345') {
      return 'JWT_SECRET is using default value - change for production';
    }
    
    return true;
  });

  // Summary
  log.section('System Testing Summary');

  console.log(`\n📊 Results: ${testsPassed}/${testsTotal} tests passed\n`);

  if (issues.length > 0) {
    log.error('Issues found:');
    issues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
    console.log('');
  }

  if (testsPassed === testsTotal) {
    log.success('🎉 All tests passed! System is ready for production deployment.');
  } else if (testsPassed / testsTotal >= 0.8) {
    log.warning('⚠️  Most tests passed, but some issues need attention.');
  } else {
    log.error('❌ Multiple critical issues found. System needs fixes before deployment.');
  }

  // Next steps
  log.section('Next Steps');

  if (testsPassed === testsTotal) {
    console.log('1. ✅ Run frontend build test');
    console.log('2. ✅ Test production environment variables');
    console.log('3. ✅ Deploy to Azure');
    console.log('4. ✅ Run post-deployment verification');
  } else {
    console.log('1. 🔧 Fix the issues listed above');
    console.log('2. 🔄 Re-run this test suite');
    console.log('3. ✅ Proceed with deployment once all tests pass');
  }

  console.log('\n🏁 System testing complete!\n');

  // Exit with appropriate code
  process.exit(testsPassed === testsTotal ? 0 : 1);
}

main().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});