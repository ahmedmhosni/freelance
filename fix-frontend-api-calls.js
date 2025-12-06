/**
 * Script to fix frontend API calls
 * Replaces template literal API calls with configured API client
 */

const fs = require('fs');
const path = require('path');

// Files that need fixing based on audit results
const filesToFix = [
  'frontend/src/components/AppFooter.jsx',
  'frontend/src/components/Layout.jsx',
  'frontend/src/pages/Home.jsx',
  'frontend/src/components/ChangelogEditor.jsx',
  'frontend/src/components/AnnouncementsManager.jsx',
  'frontend/src/pages/AdminGDPR.jsx',
  'frontend/src/components/EmailPreferences.jsx',
  'frontend/src/components/DataPrivacy.jsx',
];

function fixFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found, skipping`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file already imports api
  const hasApiImport = content.includes("import api from");
  
  // Pattern 1: const apiUrl = import.meta.env.VITE_API_URL || '';
  // Pattern 2: await axios.get(`${apiUrl}/path`)
  
  // Check if file uses template literal pattern
  const usesTemplatePattern = content.includes('${apiUrl}') || content.includes('${API_URL}');
  
  if (!usesTemplatePattern) {
    console.log(`  ✅ No template literal API calls found`);
    return;
  }

  console.log(`  🔧 Found template literal API calls, fixing...`);

  // Add api import if not present
  if (!hasApiImport) {
    // Find the last import statement
    const importRegex = /import .+ from .+;/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + 
                "\nimport api from '../utils/api';" +
                content.slice(insertPosition);
      
      modified = true;
      console.log(`  ✅ Added api import`);
    }
  }

  // Remove apiUrl variable declaration
  content = content.replace(/const apiUrl = import\.meta\.env\.VITE_API_URL \|\| '';?\n?/g, '');
  content = content.replace(/const API_URL = import\.meta\.env\.VITE_API_URL \|\| '';?\n?/g, '');
  
  // Replace axios calls with api calls
  // Pattern: axios.get(`${apiUrl}/path`) -> api.get('/path')
  content = content.replace(/axios\.get\(`\$\{apiUrl\}([^`]+)`\)/g, "api.get('$1')");
  content = content.replace(/axios\.post\(`\$\{apiUrl\}([^`]+)`/g, "api.post('$1'");
  content = content.replace(/axios\.put\(`\$\{apiUrl\}([^`]+)`/g, "api.put('$1'");
  content = content.replace(/axios\.delete\(`\$\{apiUrl\}([^`]+)`/g, "api.delete('$1'");
  content = content.replace(/axios\.patch\(`\$\{apiUrl\}([^`]+)`/g, "api.patch('$1'");

  // Also handle API_URL variant
  content = content.replace(/axios\.get\(`\$\{API_URL\}([^`]+)`\)/g, "api.get('$1')");
  content = content.replace(/axios\.post\(`\$\{API_URL\}([^`]+)`/g, "api.post('$1'");
  content = content.replace(/axios\.put\(`\$\{API_URL\}([^`]+)`/g, "api.put('$1'");
  content = content.replace(/axios\.delete\(`\$\{API_URL\}([^`]+)`/g, "api.delete('$1'");
  content = content.replace(/axios\.patch\(`\$\{API_URL\}([^`]+)`/g, "api.patch('$1'");

  // Remove axios import if no longer needed
  if (!content.includes('axios.')) {
    content = content.replace(/import axios from 'axios';\n?/g, '');
    console.log(`  ✅ Removed unused axios import`);
  }

  modified = true;

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ File updated successfully`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }
}

console.log('='.repeat(60));
console.log('Frontend API Call Fixer');
console.log('='.repeat(60));
console.log('\nThis script will:');
console.log('1. Replace template literal API calls with configured API client');
console.log('2. Add api import where needed');
console.log('3. Remove unused axios imports');
console.log('\n' + '='.repeat(60));

filesToFix.forEach(fixFile);

console.log('\n' + '='.repeat(60));
console.log('✅ All files processed!');
console.log('='.repeat(60));
console.log('\nNext steps:');
console.log('1. Review the changes');
console.log('2. Run: node backend/audit-tool/run-audit.js --quick');
console.log('3. Check improved match rate');
console.log('='.repeat(60));

