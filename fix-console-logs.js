const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend', 'src');
const EXCLUDE_FILES = ['logger.js', 'productionLogger.js'];

let filesFixed = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace console.error with logger.error (but keep the message structure)
  const errorRegex = /console\.error\(/g;
  if (errorRegex.test(content)) {
    content = content.replace(errorRegex, 'logger.error(');
    modified = true;
  }

  // Replace console.log with logger.log
  const logRegex = /console\.log\(/g;
  if (logRegex.test(content)) {
    content = content.replace(logRegex, 'logger.log(');
    modified = true;
  }

  // Replace console.warn with logger.warn
  const warnRegex = /console\.warn\(/g;
  if (warnRegex.test(content)) {
    content = content.replace(warnRegex, 'logger.warn(');
    modified = true;
  }

  // Replace console.info with logger.info
  const infoRegex = /console\.info\(/g;
  if (infoRegex.test(content)) {
    content = content.replace(infoRegex, 'logger.info(');
    modified = true;
  }

  // Replace console.debug with logger.debug
  const debugRegex = /console\.debug\(/g;
  if (debugRegex.test(content)) {
    content = content.replace(debugRegex, 'logger.debug(');
    modified = true;
  }

  if (modified) {
    // Check if logger is already imported
    const hasLoggerImport = /import.*logger.*from/.test(content);
    
    if (!hasLoggerImport) {
      // Add logger import at the top after other imports
      const importMatch = content.match(/^(import.*\n)+/m);
      if (importMatch) {
        const lastImportIndex = importMatch[0].lastIndexOf('\n');
        const beforeImports = content.substring(0, importMatch.index + lastImportIndex + 1);
        const afterImports = content.substring(importMatch.index + lastImportIndex + 1);
        content = beforeImports + "import { logger } from '../../../shared/utils/logger';\n" + afterImports;
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    console.log(`✓ Fixed: ${path.relative(__dirname, filePath)}`);
  }
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
      
      const content = fs.readFileSync(fullPath, 'utf8');
      if (/console\.(log|error|warn|info|debug)\(/.test(content)) {
        fixFile(fullPath);
      }
    }
  }
}

console.log('\n=== Fixing Console Logs ===\n');
scanDirectory(FRONTEND_DIR);
console.log(`\n✅ Fixed ${filesFixed} files\n`);
