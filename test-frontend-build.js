#!/usr/bin/env node

/**
 * Frontend Build Testing
 * Tests frontend build process and validates output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function runTest(name, testFn) {
  testsTotal++;
  try {
    const result = testFn();
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

console.log('🏗️  Starting Frontend Build Testing...\n');

// 1. Pre-build checks
log.section('Pre-build Validation');

runTest('Frontend directory exists', () => {
  return fs.existsSync('frontend');
});

runTest('Package.json exists', () => {
  return fs.existsSync('frontend/package.json');
});

runTest('Node modules installed', () => {
  return fs.existsSync('frontend/node_modules');
});

runTest('Vite config exists', () => {
  return fs.existsSync('frontend/vite.config.js');
});

runTest('Environment file exists', () => {
  return fs.existsSync('frontend/.env');
});

runTest('Source directory structure', () => {
  const requiredDirs = [
    'frontend/src',
    'frontend/src/features',
    'frontend/src/shared',
    'frontend/public'
  ];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      return `Missing directory: ${dir}`;
    }
  }
  return true;
});

// 2. Environment configuration
log.section('Environment Configuration');

runTest('Production environment variables', () => {
  const envPath = 'frontend/.env.production';
  
  // Check if production env exists, if not use regular .env
  const envFile = fs.existsSync(envPath) ? envPath : 'frontend/.env';
  
  if (!fs.existsSync(envFile)) {
    return 'No environment file found';
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  // Check for required variables
  if (!envContent.includes('VITE_API_URL')) {
    return 'VITE_API_URL not configured';
  }
  
  log.info(`Using environment file: ${envFile}`);
  return true;
});

// 3. Build process
log.section('Build Process');

runTest('Clean previous build', () => {
  const distPath = 'frontend/dist';
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    log.info('Cleaned previous build directory');
  }
  return true;
});

runTest('Run build command', () => {
  try {
    log.info('Running npm run build...');
    const output = execSync('npm run build', { 
      cwd: 'frontend', 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Check for build warnings or errors in output
    if (output.includes('ERROR') || output.includes('Failed')) {
      return `Build completed with errors: ${output}`;
    }
    
    if (output.includes('WARNING') || output.includes('warn')) {
      log.warning('Build completed with warnings');
    }
    
    log.info('Build completed successfully');
    return true;
  } catch (error) {
    return `Build failed: ${error.message}`;
  }
});

// 4. Build output validation
log.section('Build Output Validation');

runTest('Build directory created', () => {
  return fs.existsSync('frontend/dist');
});

runTest('Index.html generated', () => {
  const indexPath = 'frontend/dist/index.html';
  if (!fs.existsSync(indexPath)) {
    return 'index.html not found in build output';
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // Check for essential elements
  if (!content.includes('<html')) {
    return 'Invalid HTML structure in index.html';
  }
  
  if (!content.includes('<div id="root"')) {
    return 'React root element not found';
  }
  
  return true;
});

runTest('JavaScript bundles generated', () => {
  const distPath = 'frontend/dist';
  const files = fs.readdirSync(distPath, { recursive: true });
  
  const jsFiles = files.filter(file => 
    typeof file === 'string' && file.endsWith('.js')
  );
  
  if (jsFiles.length === 0) {
    return 'No JavaScript bundles found';
  }
  
  log.info(`Found ${jsFiles.length} JavaScript files`);
  return true;
});

runTest('CSS files generated', () => {
  const distPath = 'frontend/dist';
  const files = fs.readdirSync(distPath, { recursive: true });
  
  const cssFiles = files.filter(file => 
    typeof file === 'string' && file.endsWith('.css')
  );
  
  if (cssFiles.length === 0) {
    log.warning('No CSS files found - this might be expected if using CSS-in-JS');
    return true;
  }
  
  log.info(`Found ${cssFiles.length} CSS files`);
  return true;
});

runTest('Assets directory structure', () => {
  const distPath = 'frontend/dist';
  const stats = fs.statSync(distPath);
  
  if (!stats.isDirectory()) {
    return 'Build output is not a directory';
  }
  
  // Check for assets
  const files = fs.readdirSync(distPath);
  const hasAssets = files.some(file => 
    file === 'assets' || file.includes('.')
  );
  
  if (!hasAssets) {
    return 'No assets found in build output';
  }
  
  return true;
});

// 5. Build size analysis
log.section('Build Size Analysis');

runTest('Build size validation', () => {
  const distPath = 'frontend/dist';
  
  function getDirectorySize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += fs.statSync(filePath).size;
      }
    }
    
    return totalSize;
  }
  
  const totalSize = getDirectorySize(distPath);
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  log.info(`Total build size: ${sizeMB} MB`);
  
  // Warn if build is too large
  if (totalSize > 50 * 1024 * 1024) { // 50MB
    log.warning('Build size is quite large (>50MB)');
  }
  
  return true;
});

// 6. Production readiness
log.section('Production Readiness');

runTest('Static web app configuration', () => {
  const configPath = 'frontend/staticwebapp.config.json';
  
  if (!fs.existsSync(configPath)) {
    log.warning('staticwebapp.config.json not found - may be needed for Azure Static Web Apps');
    return true; // Not critical
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Check for SPA routing configuration
  if (!config.navigationFallback) {
    log.warning('No navigationFallback configured for SPA routing');
  }
  
  return true;
});

runTest('Build artifacts validation', () => {
  const indexPath = 'frontend/dist/index.html';
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // Check for production optimizations
  const checks = [
    { name: 'Minified HTML', test: () => !content.includes('  ') || content.length < 2000 },
    { name: 'Asset references', test: () => content.includes('assets/') || content.includes('.js') },
    { name: 'No dev references', test: () => !content.includes('localhost') && !content.includes('127.0.0.1') }
  ];
  
  const failedChecks = checks.filter(check => !check.test());
  
  if (failedChecks.length > 0) {
    return `Failed production checks: ${failedChecks.map(c => c.name).join(', ')}`;
  }
  
  return true;
});

// Summary
log.section('Frontend Build Testing Summary');

console.log(`\n📊 Results: ${testsPassed}/${testsTotal} tests passed\n`);

if (issues.length > 0) {
  log.error('Issues found:');
  issues.forEach(issue => {
    console.log(`   • ${issue}`);
  });
  console.log('');
}

if (testsPassed === testsTotal) {
  log.success('🎉 Frontend build successful! Ready for production deployment.');
  
  // Show build info
  const distPath = 'frontend/dist';
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    log.info(`Build output contains ${files.length} files/directories`);
    log.info(`Build location: ${path.resolve(distPath)}`);
  }
  
} else if (testsPassed / testsTotal >= 0.8) {
  log.warning('⚠️  Build mostly successful, but some issues need attention.');
} else {
  log.error('❌ Build failed or has critical issues.');
}

// Next steps
log.section('Next Steps');

if (testsPassed === testsTotal) {
  console.log('1. ✅ Test the built application locally');
  console.log('2. ✅ Deploy to Azure Static Web Apps');
  console.log('3. ✅ Verify production deployment');
} else {
  console.log('1. 🔧 Fix the build issues listed above');
  console.log('2. 🔄 Re-run the build test');
  console.log('3. ✅ Proceed with deployment once build is successful');
}

console.log('\n🏁 Frontend build testing complete!\n');

// Exit with appropriate code
process.exit(testsPassed === testsTotal ? 0 : 1);