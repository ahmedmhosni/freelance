/**
 * Fix Frontend API Prefix
 * 
 * This script automatically adds /api prefix to frontend API calls
 * that are missing it for core modules.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Core modules that should have /api prefix
const coreModules = [
  'clients',
  'projects',
  'tasks',
  'invoices',
  'time-tracking',
  'notifications',
  'reports'
];

// Find all frontend files
const frontendDir = path.join(__dirname, 'frontend/src');
const files = glob.sync(`${frontendDir}/**/*.{js,jsx,ts,tsx}`, {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

console.log(`\n🔍 Scanning ${files.length} frontend files...\n`);

let totalChanges = 0;
const changedFiles = [];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let fileChanges = 0;
  
  // Pattern 1: axios.get('/module/...') -> axios.get('/api/module/...')
  // Pattern 2: fetch('/module/...') -> fetch('/api/module/...')
  // Pattern 3: apiClient.get('/module/...') -> apiClient.get('/api/module/...')
  
  coreModules.forEach(module => {
    // Match API calls that start with /module (not /api/module)
    const patterns = [
      // Direct string literals
      new RegExp(`(['"\`])/(${module}[^'"\`]*)\\1`, 'g'),
      // Template literals
      new RegExp(`(['"\`])/(${module}[^'"\`]*)\\\${`, 'g')
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Check if it already has /api prefix
          if (!match.includes('/api/')) {
            const quote = match[0];
            const pathPart = match.slice(1, -1);
            
            // Skip if it's already /api/
            if (pathPart.startsWith('/api/')) return;
            
            const newMatch = `${quote}/api${pathPart}${match[match.length - 1]}`;
            content = content.replace(match, newMatch);
            changed = true;
            fileChanges++;
          }
        });
      }
    });
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalChanges += fileChanges;
    changedFiles.push({
      file: path.relative(__dirname, filePath),
      changes: fileChanges
    });
  }
});

console.log(`✅ Fixed ${totalChanges} API calls in ${changedFiles.length} files\n`);

if (changedFiles.length > 0) {
  console.log('📝 Changed files:\n');
  changedFiles.forEach(({ file, changes }) => {
    console.log(`  ${file} (${changes} changes)`);
  });
  console.log('');
}

console.log('🎯 Next steps:');
console.log('  1. Review the changes');
console.log('  2. Run the audit again to verify improvements');
console.log('  3. Test the application to ensure everything works\n');
