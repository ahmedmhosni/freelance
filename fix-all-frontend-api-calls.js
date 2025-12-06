/**
 * Comprehensive Frontend API Call Fixer
 * Finds and fixes ALL template literal API calls across the entire frontend
 */

const fs = require('fs');
const path = require('path');

// Recursively find all JS/JSX/TS/TSX files
function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        findAllFiles(filePath, fileList);
      }
    } else if (/\.(jsx?|tsx?)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;

  // Check if file uses template literal pattern with axios
  const usesAxiosTemplate = content.includes('${apiUrl}') || 
                           content.includes('${API_URL}') ||
                           content.includes('${baseURL}');
  
  if (!usesAxiosTemplate) {
    return { modified: false, changes: [] };
  }

  const changes = [];

  // Check if file already imports api
  const hasApiImport = content.includes("import api from");
  
  // Add api import if not present
  if (!hasApiImport) {
    // Find the last import statement
    const importRegex = /import .+ from .+;/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      // Calculate relative path to api.js
      const fileDir = path.dirname(filePath);
      const apiPath = path.join('frontend', 'src', 'utils', 'api.js');
      const relativePath = path.relative(fileDir, apiPath).replace(/\\/g, '/');
      const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      
      content = content.slice(0, insertPosition) + 
                `\nimport api from '${importPath.replace('.js', '')}';` +
                content.slice(insertPosition);
      
      modified = true;
      changes.push('Added api import');
    }
  }

  // Remove apiUrl/API_URL/baseURL variable declarations
  const apiUrlDeclarations = [
    /const apiUrl = import\.meta\.env\.VITE_API_URL \|\| '';?\n?/g,
    /const API_URL = import\.meta\.env\.VITE_API_URL \|\| '';?\n?/g,
    /const baseURL = import\.meta\.env\.VITE_API_URL \|\| '';?\n?/g,
    /const apiUrl = import\.meta\.env\.VITE_API_URL;?\n?/g,
    /const API_URL = import\.meta\.env\.VITE_API_URL;?\n?/g
  ];
  
  apiUrlDeclarations.forEach(regex => {
    if (regex.test(content)) {
      content = content.replace(regex, '');
      modified = true;
      changes.push('Removed API URL variable declaration');
    }
  });

  // Replace axios calls with api calls
  const replacements = [
    // GET requests
    { 
      pattern: /axios\.get\(`\$\{apiUrl\}([^`]+)`\)/g, 
      replacement: "api.get('$1')",
      method: 'GET'
    },
    { 
      pattern: /axios\.get\(`\$\{API_URL\}([^`]+)`\)/g, 
      replacement: "api.get('$1')",
      method: 'GET'
    },
    { 
      pattern: /axios\.get\(`\$\{baseURL\}([^`]+)`\)/g, 
      replacement: "api.get('$1')",
      method: 'GET'
    },
    
    // POST requests
    { 
      pattern: /axios\.post\(`\$\{apiUrl\}([^`]+)`/g, 
      replacement: "api.post('$1'",
      method: 'POST'
    },
    { 
      pattern: /axios\.post\(`\$\{API_URL\}([^`]+)`/g, 
      replacement: "api.post('$1'",
      method: 'POST'
    },
    { 
      pattern: /axios\.post\(`\$\{baseURL\}([^`]+)`/g, 
      replacement: "api.post('$1'",
      method: 'POST'
    },
    
    // PUT requests
    { 
      pattern: /axios\.put\(`\$\{apiUrl\}([^`]+)`/g, 
      replacement: "api.put('$1'",
      method: 'PUT'
    },
    { 
      pattern: /axios\.put\(`\$\{API_URL\}([^`]+)`/g, 
      replacement: "api.put('$1'",
      method: 'PUT'
    },
    { 
      pattern: /axios\.put\(`\$\{baseURL\}([^`]+)`/g, 
      replacement: "api.put('$1'",
      method: 'PUT'
    },
    
    // DELETE requests
    { 
      pattern: /axios\.delete\(`\$\{apiUrl\}([^`]+)`/g, 
      replacement: "api.delete('$1'",
      method: 'DELETE'
    },
    { 
      pattern: /axios\.delete\(`\$\{API_URL\}([^`]+)`/g, 
      replacement: "api.delete('$1'",
      method: 'DELETE'
    },
    { 
      pattern: /axios\.delete\(`\$\{baseURL\}([^`]+)`/g, 
      replacement: "api.delete('$1'",
      method: 'DELETE'
    },
    
    // PATCH requests
    { 
      pattern: /axios\.patch\(`\$\{apiUrl\}([^`]+)`/g, 
      replacement: "api.patch('$1'",
      method: 'PATCH'
    },
    { 
      pattern: /axios\.patch\(`\$\{API_URL\}([^`]+)`/g, 
      replacement: "api.patch('$1'",
      method: 'PATCH'
    },
    { 
      pattern: /axios\.patch\(`\$\{baseURL\}([^`]+)`/g, 
      replacement: "api.patch('$1'",
      method: 'PATCH'
    }
  ];

  replacements.forEach(({ pattern, replacement, method }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      changes.push(`Replaced ${method} axios call with api client`);
    }
  });

  // Remove axios import if no longer needed
  if (!content.includes('axios.') && !content.includes('from axios')) {
    const axiosImportRemoved = content.replace(/import axios from 'axios';\n?/g, '');
    if (axiosImportRemoved !== content) {
      content = axiosImportRemoved;
      modified = true;
      changes.push('Removed unused axios import');
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return { modified, changes, originalContent, newContent: content };
}

// Main execution
console.log('='.repeat(80));
console.log('COMPREHENSIVE FRONTEND API CALL FIXER');
console.log('='.repeat(80));
console.log('\nScanning all frontend files for template literal API calls...\n');

const frontendSrc = path.join(__dirname, 'frontend', 'src');
const allFiles = findAllFiles(frontendSrc);

console.log(`Found ${allFiles.length} JavaScript/TypeScript files\n`);
console.log('='.repeat(80));

let filesModified = 0;
let totalChanges = 0;
const modifiedFiles = [];

allFiles.forEach(filePath => {
  const result = fixFile(filePath);
  
  if (result.modified) {
    filesModified++;
    totalChanges += result.changes.length;
    modifiedFiles.push({
      path: path.relative(__dirname, filePath),
      changes: result.changes
    });
    
    console.log(`\n✅ ${path.relative(__dirname, filePath)}`);
    result.changes.forEach(change => {
      console.log(`   - ${change}`);
    });
  }
});

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`\nFiles scanned: ${allFiles.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Total changes: ${totalChanges}`);

if (filesModified > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('MODIFIED FILES');
  console.log('='.repeat(80));
  modifiedFiles.forEach(({ path, changes }) => {
    console.log(`\n${path}`);
    changes.forEach(change => console.log(`  - ${change}`));
  });
}

console.log('\n' + '='.repeat(80));
console.log('NEXT STEPS');
console.log('='.repeat(80));
console.log('\n1. Review the changes above');
console.log('2. Run: node backend/audit-tool/run-audit.js --quick');
console.log('3. Check the improved match rate');
console.log('4. Test the application to ensure API calls work');
console.log('\n' + '='.repeat(80));

