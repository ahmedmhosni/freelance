const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(80));
console.log('🔍 SCANNING FOR HARDCODED VALUES');
console.log('='.repeat(80));
console.log(`Time: ${new Date().toISOString()}`);
console.log('='.repeat(80) + '\n');

// Files to scan for hardcoded values
const filesToScan = [
  'backend/src/db/postgresql.js',
  'backend/src/core/database/Database.js',
  'backend/src/routes/announcements.js',
  'backend/src/routes/quotes.js',
  'backend/src/routes/changelog.js',
  'backend/src/routes/legal.js',
  'backend/src/routes/feedback.js',
  'backend/src/routes/admin-activity.js',
  'backend/src/routes/admin-gdpr.js',
  'backend/src/server.js',
  'backend/src/core/bootstrap.js'
];

// Patterns to look for
const patterns = [
  {
    name: 'Database Host',
    regex: /host\s*[:=]\s*['"`]([^'"`]+)['"`]/gi,
    description: 'Database host configurations'
  },
  {
    name: 'Database Name',
    regex: /database\s*[:=]\s*['"`]([^'"`]+)['"`]/gi,
    description: 'Database name configurations'
  },
  {
    name: 'Database User',
    regex: /user\s*[:=]\s*['"`]([^'"`]+)['"`]/gi,
    description: 'Database user configurations'
  },
  {
    name: 'Database Password',
    regex: /password\s*[:=]\s*['"`]([^'"`]+)['"`]/gi,
    description: 'Database password configurations'
  },
  {
    name: 'API URLs',
    regex: /https?:\/\/[^\s'"`,)]+/gi,
    description: 'Hardcoded API URLs'
  },
  {
    name: 'Environment Variables',
    regex: /process\.env\.([A-Z_]+)/gi,
    description: 'Environment variable usage'
  }
];

let foundIssues = [];

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n📁 Scanning: ${filePath}`);
  console.log('-'.repeat(60));

  let fileHasIssues = false;

  patterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern.regex)];
    if (matches.length > 0) {
      console.log(`\n🔍 ${pattern.name}:`);
      matches.forEach((match, index) => {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        console.log(`   Line ${lineNumber}: ${match[0]}`);
        
        // Check for potential issues
        if (pattern.name === 'Database Host' && match[1] && !match[1].includes('process.env')) {
          foundIssues.push({
            file: filePath,
            line: lineNumber,
            issue: `Hardcoded database host: ${match[1]}`,
            severity: 'HIGH'
          });
          fileHasIssues = true;
        }
        
        if (pattern.name === 'API URLs' && match[0].includes('roastify')) {
          foundIssues.push({
            file: filePath,
            line: lineNumber,
            issue: `Hardcoded API URL: ${match[0]}`,
            severity: 'MEDIUM'
          });
          fileHasIssues = true;
        }
      });
    }
  });

  if (!fileHasIssues) {
    console.log('✅ No hardcoded values found');
  }
}

// Scan all files
filesToScan.forEach(scanFile);

console.log('\n' + '='.repeat(80));
console.log('📊 SCAN RESULTS');
console.log('='.repeat(80));

if (foundIssues.length === 0) {
  console.log('✅ No hardcoded values found in application code!');
  console.log('\nThis means the issue is likely:');
  console.log('1. Environment variables not set correctly in Azure');
  console.log('2. App not restarted after setting environment variables');
  console.log('3. Database connection logic not working as expected');
} else {
  console.log(`❌ Found ${foundIssues.length} potential issues:\n`);
  
  foundIssues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.severity}] ${issue.file}:${issue.line}`);
    console.log(`   ${issue.issue}\n`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('🔧 RECOMMENDED ACTIONS');
console.log('='.repeat(80));

console.log('\n1. VERIFY AZURE ENVIRONMENT VARIABLES:');
console.log('   Go to Azure Portal → App Services → roastify-webapp-api → Configuration');
console.log('   Ensure these are set:');
console.log('   • DB_HOST = roastifydbpost.postgres.database.azure.com');
console.log('   • DB_PORT = 5432');
console.log('   • DB_NAME = roastifydb');
console.log('   • DB_USER = adminuser');
console.log('   • DB_PASSWORD = AHmed#123456');
console.log('   • NODE_ENV = production');

console.log('\n2. RESTART THE APP:');
console.log('   After setting environment variables, restart the app:');
console.log('   Azure Portal → App Services → roastify-webapp-api → Restart');

console.log('\n3. CHECK APP LOGS:');
console.log('   Azure Portal → App Services → roastify-webapp-api → Log stream');
console.log('   Look for database connection messages');

console.log('\n4. TEST DATABASE CONNECTION:');
console.log('   Run: node verify-database-fix.js');
console.log('   This will test if the APIs are now returning data');

console.log('\n' + '='.repeat(80) + '\n');