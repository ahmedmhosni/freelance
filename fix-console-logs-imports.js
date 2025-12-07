const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend', 'src');
const EXCLUDE_FILES = ['logger.js', 'productionLogger.js'];

let filesFixed = 0;

function getRelativeLoggerPath(filePath) {
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(FRONTEND_DIR, 'shared', 'utils', 'logger.js');
  
  let relativePath = path.relative(fileDir, loggerPath);
  // Convert Windows backslashes to forward slashes
  relativePath = relativePath.replace(/\\/g, '/');
  // Remove .js extension
  relativePath = relativePath.replace(/\.js$/, '');
  // Ensure it starts with ./
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  return relativePath;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file uses logger but doesn't import it
  const usesLogger = /\blogger\.(log|error|warn|info|debug)\(/.test(content);
  const hasLoggerImport = /import.*logger.*from/.test(content);
  
  if (usesLogger && !hasLoggerImport) {
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      const loggerImportPath = getRelativeLoggerPath(filePath);
      const loggerImport = `import { logger } from '${loggerImportPath}';`;
      
      // Insert after the last import
      lines.splice(lastImportIndex + 1, 0, loggerImport);
      content = lines.join('\n');
      
      fs.writeFileSync(filePath, content, 'utf8');
      filesFixed++;
      console.log(`✓ Added logger import: ${path.relative(__dirname, filePath)}`);
      modified = true;
    }
  }
  
  return modified;
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      if (EXCLUDE_FILES.includes(entry.name)) continue;
      fixFile(fullPath);
    }
  }
}

console.log('\n=== Adding Missing Logger Imports ===\n');
scanDirectory(FRONTEND_DIR);
console.log(`\n✅ Fixed ${filesFixed} files\n`);
