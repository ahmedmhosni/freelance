/**
 * Analyze Unmatched Routes
 * 
 * Categorizes the 51 unmatched backend routes to determine:
 * - Which are legitimate and should stay
 * - Which are unused and can be deprecated
 * - Which need frontend implementation
 */

const fs = require('fs');
const path = require('path');

// Read the route inventory
const inventoryPath = path.join(__dirname, 'backend/audit-tool/reports/route-inventory.md');
const content = fs.readFileSync(inventoryPath, 'utf8');

// Extract unmatched backend routes section
const unmatchedSection = content.split('## Unmatched Backend Routes')[1];
if (!unmatchedSection) {
  console.log('Could not find unmatched routes section');
  process.exit(1);
}

// Parse the table
const routes = [];
const lines = unmatchedSection.split('\n');
let inTable = false;

lines.forEach(line => {
  if (line.startsWith('|') && line.includes('GET') || line.includes('POST') || line.includes('PUT') || line.includes('DELETE')) {
    const parts = line.split('|').map(p => p.trim()).filter(p => p);
    if (parts.length >= 4) {
      routes.push({
        method: parts[0],
        path: parts[1],
        module: parts[2],
        handler: parts[3]
      });
    }
  }
});

console.log(`\n📊 Analyzing ${routes.length} unmatched backend routes\n`);

// Categorize routes
const categories = {
  admin: [],
  gdpr: [],
  health: [],
  files: [],
  legal: [],
  preferences: [],
  profile: [],
  userPreferences: [],
  feedback: [],
  other: []
};

routes.forEach(route => {
  const path = route.path.toLowerCase();
  
  if (path.includes('admin')) {
    categories.admin.push(route);
  } else if (path.includes('gdpr')) {
    categories.gdpr.push(route);
  } else if (path.includes('health') || path.includes('ping')) {
    categories.health.push(route);
  } else if (path.includes('files')) {
    categories.files.push(route);
  } else if (path.includes('legal')) {
    categories.legal.push(route);
  } else if (path.includes('preferences') && !path.includes('userpreferences')) {
    categories.preferences.push(route);
  } else if (path.includes('profile')) {
    categories.profile.push(route);
  } else if (path.includes('userpreferences')) {
    categories.userPreferences.push(route);
  } else if (path.includes('feedback')) {
    categories.feedback.push(route);
  } else {
    categories.other.push(route);
  }
});

// Display analysis
console.log('📋 Route Categories:\n');

Object.keys(categories).forEach(category => {
  const count = categories[category].length;
  if (count > 0) {
    console.log(`\n### ${category.toUpperCase()} (${count} routes)`);
    console.log('─'.repeat(50));
    
    categories[category].forEach(route => {
      console.log(`  ${route.method.padEnd(6)} ${route.path}`);
    });
  }
});

// Recommendations
console.log('\n\n📝 RECOMMENDATIONS:\n');
console.log('═'.repeat(70));

console.log('\n✅ KEEP - Essential System Routes:');
console.log('  • Health/Ping endpoints - monitoring');
console.log('  • Admin routes - system management');
console.log('  • GDPR routes - legal compliance');
console.log('  • Profile routes - user management');
console.log(`  Total: ~${categories.health.length + categories.admin.length + categories.gdpr.length + categories.profile.length} routes\n`);

console.log('⚠️  REVIEW - May Need Frontend:');
console.log('  • Feedback routes - if feedback feature is used');
console.log('  • Files routes - if file management is needed');
console.log('  • Legal routes - if legal docs are managed');
console.log(`  Total: ~${categories.feedback.length + categories.files.length + categories.legal.length} routes\n`);

console.log('🔄 CONSOLIDATE - Duplicate Functionality:');
console.log('  • preferences vs userPreferences - same thing?');
console.log(`  Total: ~${categories.preferences.length + categories.userPreferences.length} routes\n`);

console.log('❓ INVESTIGATE - Unknown Purpose:');
console.log('  • Other routes - need to check if used');
console.log(`  Total: ~${categories.other.length} routes\n`);

// Summary
console.log('\n📊 SUMMARY:\n');
console.log(`  Total Unmatched: ${routes.length}`);
console.log(`  Essential (Keep): ~${categories.health.length + categories.admin.length + categories.gdpr.length + categories.profile.length}`);
console.log(`  Review Needed: ~${categories.feedback.length + categories.files.length + categories.legal.length}`);
console.log(`  Consolidate: ~${categories.preferences.length + categories.userPreferences.length}`);
console.log(`  Investigate: ~${categories.other.length}\n`);

console.log('🎯 NEXT STEPS:\n');
console.log('  1. Keep essential system routes (health, admin, GDPR)');
console.log('  2. Check if feedback/files/legal features are actively used');
console.log('  3. Consolidate preferences routes');
console.log('  4. Investigate "other" routes for deprecation\n');
