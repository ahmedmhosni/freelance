const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend', 'src');
const EXCLUDE_FILES = ['logger.js', 'productionLogger.js'];

let filesFixed = 0;

function getRelativeLoggerPath(filePath) {
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(FRONTEND_DIR, 'shared', 'utils', 'logger.js');
  
  let relativePath = path.relative(fileDir, loggerPath);
  relativePath = relativePath.replace(/\\/g, '/');
  relativePath = relativePath.replace(/\.js$/, '');
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  return relativePath;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses logger but doesn't have proper import
  const usesLogger = /\blogger\.(log|error|warn|info|debug)\(/.test(content);
  const hasLoggerImport = /^import\s+\{\s*logger\s*\}\s+from\s+['"].*logger['"];?\s*$/m.test(content);
  
  if (usesLogger && !hasLoggerImport) {
    const lines = content.split('\n');
    let lastImportIndex = -1;
    let inMultilineImport = false;
    
    // Find the last complete import statement
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if we're entering a multiline import
      if (line.startsWith('import ') && line.includes('{') && !line.includes('}')) {
        inMultilineImport = true;
      }
      
      // Check if we're exiting a multiline import
      if (inMultilineImport && line.includes('}')) {
        inMultilineImport = false;
        lastImportIndex = i;
      }
      
      // Single line import
      if (!inMultilineImport && line.startsWith('import ') && (line.includes(';') || line.includes('from'))) {
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
      console.log(`✓ Fixed: ${path.relative(__dirname, filePath)}`);
      return true;
    }
  }
  
  return false;
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

console.log('\n=== Fixing Logger Imports Properly ===\n');
scanDirectory(FRONTEND_DIR);
console.log(`\n✅ Fixed ${filesFixed} files\n`);
