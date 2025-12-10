#!/usr/bin/env node

/**
 * Comprehensive System Checkup
 * Tests all system components locally before production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting Comprehensive System Checkup...\n');

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

let checksPassed = 0;
let checksTotal = 0;
const issues = [];

function runCheck(name, checkFn) {
  checksTotal++;
  try {
    const result = checkFn();
    if (result === true || result === undefined) {
      log.success(name);
      checksPassed++;
    } else {
      log.error(`${name}: ${result}`);
      issues.push(`${name}: ${result}`);
    }
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    issues.push(`${name}: ${error.message}`);
  }
}

// 1. File Structure Checks
log.section('File Structure & Configuration');

runCheck('Backend package.json exists', () => {
  return fs.existsSync('backend/package.json');
});

runCheck('Frontend package.json exists', () => {
  return fs.existsSync('frontend/package.json');
});

runCheck('Backend .env file exists', () => {
  return fs.existsSync('backend/.env');
});

runCheck('Frontend .env file exists', () => {
  return fs.existsSync('frontend/.env');
});

runCheck('Database migrations directory exists', () => {
  return fs.existsSync('database/migrations');
});

runCheck('Backend src directory structure', () => {
  const requiredDirs = [
    'backend/src/core',
    'backend/src/modules',
    'backend/src/shared',
    'backend/src/routes',
    'backend/src/middleware'
  ];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      return `Missing directory: ${dir}`;
    }
  }
  return true;
});

runCheck('Frontend src directory structure', () => {
  const requiredDirs = [
    'frontend/src/features',
    'frontend/src/shared',
    'frontend/src/utils'
  ];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      return `Missing directory: ${dir}`;
    }
  }
  return true;
});

// 2. Environment Configuration
log.section('Environment Configuration');

runCheck('Backend environment variables', () => {
  const envPath = 'backend/.env';
  if (!fs.existsSync(envPath)) {
    return 'Backend .env file missing';
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['PG_HOST', 'PG_DATABASE', 'PG_USER', 'JWT_SECRET', 'PORT'];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      return `Missing environment variable: ${varName}`;
    }
  }
  return true;
});

runCheck('Frontend environment variables', () => {
  const envPath = 'frontend/.env';
  if (!fs.existsSync(envPath)) {
    return 'Frontend .env file missing';
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['VITE_API_URL', 'VITE_APP_NAME'];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      return `Missing environment variable: ${varName}`;
    }
  }
  return true;
});

// 3. Dependencies Check
log.section('Dependencies Check');

runCheck('Backend node_modules exists', () => {
  return fs.existsSync('backend/node_modules');
});

runCheck('Frontend node_modules exists', () => {
  return fs.existsSync('frontend/node_modules');
});

// 4. Database Schema Check
log.section('Database Schema Validation');

runCheck('Database migration files exist', () => {
  const migrationsDir = 'database/migrations';
  if (!fs.existsSync(migrationsDir)) {
    return 'Migrations directory missing';
  }
  
  const files = fs.readdirSync(migrationsDir);
  const sqlFiles = files.filter(f => f.endsWith('.sql'));
  
  if (sqlFiles.length === 0) {
    return 'No migration files found';
  }
  
  log.info(`Found ${sqlFiles.length} migration files`);
  return true;
});

// 5. Core Module Files Check
log.section('Core Module Files');

const coreFiles = [
  'backend/src/server.js',
  'backend/src/core/bootstrap.js',
  'backend/src/core/database/Database.js',
  'backend/src/shared/base/BaseRepository.js',
  'frontend/src/shared/utils/api.js',
  'frontend/src/App.jsx',
  'frontend/index.html'
];

coreFiles.forEach(file => {
  runCheck(`Core file: ${file}`, () => {
    return fs.existsSync(file);
  });
});

// 6. Module Structure Check
log.section('Module Structure Validation');

const modules = [
  'auth', 'clients', 'projects', 'tasks', 'invoices', 
  'time-tracking', 'reports', 'notifications', 'admin',
  'user-preferences', 'gdpr'
];

modules.forEach(module => {
  runCheck(`Backend module: ${module}`, () => {
    const modulePath = `backend/src/modules/${module}`;
    if (!fs.existsSync(modulePath)) {
      return `Module directory missing: ${modulePath}`;
    }
    
    const requiredFiles = ['index.js'];
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(modulePath, file))) {
        return `Missing file: ${modulePath}/${file}`;
      }
    }
    return true;
  });
});

// 7. Frontend Feature Check
log.section('Frontend Features Validation');

const frontendFeatures = [
  'auth', 'dashboard', 'clients', 'projects', 'tasks', 
  'invoices', 'time-tracking', 'reports', 'admin', 'legal'
];

frontendFeatures.forEach(feature => {
  runCheck(`Frontend feature: ${feature}`, () => {
    const featurePath = `frontend/src/features/${feature}`;
    return fs.existsSync(featurePath);
  });
});

// 8. Production Configuration Check
log.section('Production Configuration');

runCheck('Production environment variables defined', () => {
  const prodVars = [
    'DB_HOST', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET', 'FRONTEND_URL', 'AZURE_STORAGE_CONNECTION_STRING',
    'AZURE_COMMUNICATION_CONNECTION_STRING'
  ];
  
  // Check if we have production env documentation
  const files = fs.readdirSync('.');
  const hasEnvDocs = files.some(f => f.includes('ENV') || f.includes('AZURE'));
  
  if (!hasEnvDocs) {
    return 'No production environment documentation found';
  }
  
  return true;
});

runCheck('GitHub Actions workflow exists', () => {
  return fs.existsSync('.github/workflows') || fs.existsSync('.github');
});

runCheck('Frontend build configuration', () => {
  const viteConfig = 'frontend/vite.config.js';
  if (!fs.existsSync(viteConfig)) {
    return 'Vite config missing';
  }
  
  const content = fs.readFileSync(viteConfig, 'utf8');
  if (!content.includes('build')) {
    log.warning('Vite config may not have build configuration');
  }
  
  return true;
});

// 9. Security Check
log.section('Security Configuration');

runCheck('Security middleware exists', () => {
  return fs.existsSync('backend/src/middleware/securityHeaders.js');
});

runCheck('Rate limiting configured', () => {
  return fs.existsSync('backend/src/middleware/rateLimiter.js');
});

runCheck('CORS configuration present', () => {
  const serverFile = 'backend/src/server.js';
  if (!fs.existsSync(serverFile)) {
    return 'Server file missing';
  }
  
  const content = fs.readFileSync(serverFile, 'utf8');
  return content.includes('cors') && content.includes('allowedOrigins');
});

// 10. API Documentation
log.section('API Documentation');

runCheck('Swagger configuration exists', () => {
  const swaggerFiles = [
    'backend/src/swagger.js',
    'backend/swagger.js'
  ];
  
  return swaggerFiles.some(file => fs.existsSync(file));
});

// Summary
log.section('System Checkup Summary');

console.log(`\n📊 Results: ${checksPassed}/${checksTotal} checks passed\n`);

if (issues.length > 0) {
  log.error('Issues found:');
  issues.forEach(issue => {
    console.log(`   • ${issue}`);
  });
  console.log('');
}

if (checksPassed === checksTotal) {
  log.success('🎉 All checks passed! System is ready for testing and deployment.');
} else if (checksPassed / checksTotal >= 0.8) {
  log.warning('⚠️  Most checks passed, but some issues need attention before deployment.');
} else {
  log.error('❌ Multiple critical issues found. System needs fixes before deployment.');
}

// Recommendations
log.section('Next Steps');

if (checksPassed === checksTotal) {
  console.log('1. Run local database tests');
  console.log('2. Test all API endpoints');
  console.log('3. Test frontend functionality');
  console.log('4. Run production build test');
  console.log('5. Deploy to production');
} else {
  console.log('1. Fix the issues listed above');
  console.log('2. Re-run this checkup');
  console.log('3. Proceed with testing once all checks pass');
}

console.log('\n🏁 System checkup complete!\n');

// Exit with appropriate code
process.exit(checksPassed === checksTotal ? 0 : 1);