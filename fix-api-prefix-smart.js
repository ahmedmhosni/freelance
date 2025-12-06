/**
 * Smart API Prefix Fixer
 * Only adds /api prefix where it's actually missing
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
      } catch (err) {}
    });
  } catch (err) {}
  return results;
}

const frontendDir = path.join(__dirname, 'frontend/src');
const files = findFiles(frontendDir, /\.(jsx?|tsx?)$/);

console.log(`\n🔍 Scanning ${files.length} files...\n`);

const coreModules = ['clients', 'projects', 'tasks', 'invoices', 'time-tracking', 'notifications', 'reports'];
let totalFixed = 0;
const fixedFiles = [];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let fixes = 0;
  
  coreModules.forEach(module => {
    // Look for patterns like: '/module' or '/module/' or '/module?'
    // But NOT '/api/module'
    const lines = content.split('\n');
    const newLines = lines.map((line, index) => {
      // Skip if line already contains /api/
      if (line.includes(`/api/${module}`)) {
        return line;
      }
      
      // Match API calls with the module path
      // Patterns: axios.get('/module'), fetch('/module'), api.get('/module')
      const patterns = [
        new RegExp(`(['"\`])/(${module})([/'"\`?])`, 'g')
      ];
      
      let newLine = line;
      patterns.forEach(pattern => {
        newLine = newLine.replace(pattern, (match, quote, mod, after) => {
          // Double check we're not adding /api twice
          const beforeMatch = line.substring(0, line.indexOf(match));
          if (beforeMatch.endsWith('/api')) {
            return match;
          }
          
          fixes++;
          return `${quote}/api/${mod}${after}`;
        });
      });
      
      return newLine;
    });
    
    const newContent = newLines.join('\n');
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
  fixedFiles.forEach(f => {
    console.log(`  ${f.path} (${f.fixes} fixes)`);
  });
  console.log('');
}

console.log('\n🎯 Next: Run audit to verify');
console.log('   cd backend/audit-tool && node run-audit.js --quick\n');
