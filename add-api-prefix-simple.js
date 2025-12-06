/**
 * Simple API Prefix Fixer
 * Adds /api prefix to core module paths in frontend
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern, results = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
            findFiles(filePath, pattern, results);
          }
        } else if (pattern.test(file)) {
          results.push(filePath);
        }
      } catch (err) {
        // Skip files we can't access
      }
    });
  } catch (err) {
    // Skip directories we can't access
  }
  return results;
}

const frontendDir = path.join(__dirname, 'frontend/src');
const files = findFiles(frontendDir, /\.(jsx?|tsx?)$/);

console.log(`\n🔍 Found ${files.length} files to check\n`);

const coreModules = ['clients', 'projects', 'tasks', 'invoices', 'time-tracking', 'notifications', 'reports'];
let totalFixed = 0;
const fixedFiles = [];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let fixes = 0;
  
  coreModules.forEach(module => {
    // Pattern: '/module' -> '/api/module' (but not '/api/module')
    const regex = new RegExp(`(['"\`])/(${module})([/'"\`?])`, 'g');
    
    const newContent = content.replace(regex, (match, quote, mod, after) => {
      // Check if already has /api
      const before = content.substring(Math.max(0, content.indexOf(match) - 4), content.indexOf(match));
      if (before.includes('/api')) {
        return match;
      }
      fixes++;
      return `${quote}/api/${mod}${after}`;
    });
    
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed += fixes;
    fixedFiles.push({
      path: path.relative(__dirname, filePath),
      fixes
    });
  }
});

console.log(`✅ Fixed ${totalFixed} API calls in ${fixedFiles.length} files\n`);

if (fixedFiles.length > 0) {
  console.log('📝 Modified files:\n');
  fixedFiles.slice(0, 20).forEach(f => {
    console.log(`  ${f.path} (${f.fixes} fixes)`);
  });
  if (fixedFiles.length > 20) {
    console.log(`  ... and ${fixedFiles.length - 20} more files\n`);
  }
}

console.log('\n🎯 Run audit again to see improvements!');
console.log('   cd backend/audit-tool && node run-audit.js --quick\n');
