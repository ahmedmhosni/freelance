const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');

const routeFiles = [
  'admin.js',
  'clients.js',
  'dashboard.js',
  'files.js',
  'invoices.js',
  'invoiceItems.js',
  'notifications.js',
  'profile.js',
  'projects.js',
  'quotes.js',
  'reports.js',
  'tasks.js',
  'timeTracking.js',
  'userPreferences.js'
];

const oldImport = `const queries = require('../db/queries');`;
const newImport = `const queries = process.env.USE_POSTGRES === 'true' 
  ? require('../db/queries-pg') 
  : require('../db/queries');`;

console.log('🔧 Fixing PostgreSQL imports in route files...\n');

let fixed = 0;
let skipped = 0;
let errors = 0;

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} - File not found, skipping`);
      skipped++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file} - Fixed`);
      fixed++;
    } else if (content.includes('queries-pg')) {
      console.log(`✓  ${file} - Already using PostgreSQL queries`);
      skipped++;
    } else if (content.includes("require('../db/queries')")) {
      console.log(`⚠️  ${file} - Has queries import but different format`);
      skipped++;
    } else {
      console.log(`ℹ️  ${file} - No queries import found`);
      skipped++;
    }
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`);
    errors++;
  }
});

console.log('\n═══════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════');
console.log(`✅ Fixed: ${fixed}`);
console.log(`⚠️  Skipped: ${skipped}`);
console.log(`❌ Errors: ${errors}`);
console.log('═══════════════════════════════════════\n');

if (fixed > 0) {
  console.log('🎉 Routes updated successfully!');
  console.log('\nNext steps:');
  console.log('1. Restart the backend server');
  console.log('2. Test with: node backend/test-login.js');
  console.log('3. Check frontend - 500 errors should be resolved\n');
} else {
  console.log('ℹ️  No changes needed\n');
}
