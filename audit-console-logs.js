const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend', 'src');
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git'];
const EXCLUDE_FILES = ['logger.js', 'productionLogger.js'];

let totalFiles = 0;
let filesWithConsole = 0;
const issues = [];

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      if (EXCLUDE_FILES.includes(entry.name)) continue;
      
      totalFiles++;
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      const consoleUsages = [];
      lines.forEach((line, index) => {
        // Match console.log, console.error, etc. but not in comments
        const match = line.match(/(?<!\/\/.*)\bconsole\.(log|error|warn|info|debug|trace)\s*\(/);
        if (match) {
          consoleUsages.push({
            line: index + 1,
            code: line.trim(),
            type: match[1]
          });
        }
      });

      if (consoleUsages.length > 0) {
        filesWithConsole++;
        const relativePath = path.relative(__dirname, fullPath);
        issues.push({
          file: relativePath,
          usages: consoleUsages
        });
      }
    }
  }
}

console.log('\n=== Auditing Console Logs in Frontend ===\n');
console.log('Scanning for direct console usage...\n');

scanDirectory(FRONTEND_DIR);

console.log(`Total files scanned: ${totalFiles}`);
console.log(`Files with console statements: ${filesWithConsole}\n`);

if (issues.length > 0) {
  console.log('⚠️  Found console statements in the following files:\n');
  
  issues.forEach(issue => {
    console.log(`📄 ${issue.file}`);
    issue.usages.forEach(usage => {
      console.log(`   Line ${usage.line}: console.${usage.type}()`);
      console.log(`   Code: ${usage.code}`);
    });
    console.log('');
  });

  console.log('\n📋 Recommendations:');
  console.log('1. Replace console.error() with logger.error()');
  console.log('2. Replace console.log() with logger.log()');
  console.log('3. Replace console.warn() with logger.warn()');
  console.log('4. Remove or replace console.debug() and console.info()');
  console.log('\n⚠️  These will be visible in production browser console!');
  
} else {
  console.log('✅ No direct console usage found!');
  console.log('All logging is using the logger utility.');
}

console.log('\n=== Audit Complete ===\n');
