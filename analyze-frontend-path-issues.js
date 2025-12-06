/**
 * Analyze Frontend Path Issues
 * 
 * This script analyzes the unmatched frontend calls to identify patterns
 * and suggest fixes for path standardization.
 */

const fs = require('fs');
const path = require('path');

// Read the issues report
const issuesPath = path.join(__dirname, 'backend/audit-tool/reports/issues.md');
const issuesContent = fs.readFileSync(issuesPath, 'utf8');

// Extract unmatched frontend calls
const unmatchedCalls = [];
const issueRegex = /### Issue \d+: Frontend call without backend route: (GET|POST|PUT|DELETE) (.+?)\n/g;

let match;
while ((match = issueRegex.exec(issuesContent)) !== null) {
  const method = match[1];
  const path = match[2];
  unmatchedCalls.push({ method, path });
}

console.log(`\n📊 Found ${unmatchedCalls.length} unmatched frontend calls\n`);

// Categorize the issues
const categories = {
  missingApiPrefix: [],
  legacyPaths: [],
  invoiceItems: [],
  other: []
};

unmatchedCalls.forEach(call => {
  const { method, path } = call;
  
  // Check if it's a core module path missing /api prefix
  if (/^\/(clients|projects|tasks|invoices|time-tracking|notifications|reports)/.test(path)) {
    categories.missingApiPrefix.push(call);
  }
  // Check if it's invoice items (special case)
  else if (path.includes('/invoices/') && path.includes('/items')) {
    categories.invoiceItems.push(call);
  }
  // Check if it's a legacy path
  else if (/^\/(dashboard|changelog|feedback|quotes|profile|legal|maintenance|status|announcements)/.test(path)) {
    categories.legacyPaths.push(call);
  }
  else {
    categories.other.push(call);
  }
});

console.log('📋 Issue Categories:\n');
console.log(`  🔴 Missing /api prefix: ${categories.missingApiPrefix.length}`);
console.log(`  🟡 Legacy paths: ${categories.legacyPaths.length}`);
console.log(`  🟠 Invoice items: ${categories.invoiceItems.length}`);
console.log(`  ⚪ Other: ${categories.other.length}\n`);

// Show missing /api prefix calls (easy wins)
if (categories.missingApiPrefix.length > 0) {
  console.log('🎯 EASY WINS - Missing /api prefix:\n');
  
  const grouped = {};
  categories.missingApiPrefix.forEach(call => {
    const module = call.path.split('/')[1];
    if (!grouped[module]) grouped[module] = [];
    grouped[module].push(call);
  });
  
  Object.keys(grouped).sort().forEach(module => {
    console.log(`  ${module}: ${grouped[module].length} calls`);
    grouped[module].forEach(call => {
      console.log(`    ${call.method} ${call.path}`);
    });
    console.log('');
  });
}

// Show invoice items (need backend implementation)
if (categories.invoiceItems.length > 0) {
  console.log('⚠️  NEEDS BACKEND - Invoice items:\n');
  categories.invoiceItems.forEach(call => {
    console.log(`  ${call.method} ${call.path}`);
  });
  console.log('');
}

// Summary and recommendations
console.log('📝 RECOMMENDATIONS:\n');
console.log('1. Fix Missing /api Prefix (EASY):');
console.log('   - Update frontend API calls to use /api prefix');
console.log(`   - Estimated gain: ~${categories.missingApiPrefix.length} matches\n`);

console.log('2. Legacy Paths (MEDIUM):');
console.log('   - These are legacy routes, may not need fixing');
console.log(`   - Count: ${categories.legacyPaths.length}\n`);

console.log('3. Invoice Items (HARD):');
console.log('   - Need to implement invoice items endpoints');
console.log(`   - Count: ${categories.invoiceItems.length}\n`);

// Calculate potential match rate improvement
const currentMatches = 99;
const totalRoutes = 150;
const potentialNewMatches = categories.missingApiPrefix.length;
const newMatchRate = ((currentMatches + potentialNewMatches) / totalRoutes * 100).toFixed(1);

console.log(`📈 POTENTIAL IMPROVEMENT:\n`);
console.log(`  Current: ${currentMatches}/${totalRoutes} = 66.0%`);
console.log(`  After fix: ${currentMatches + potentialNewMatches}/${totalRoutes} = ${newMatchRate}%`);
console.log(`  Gain: +${potentialNewMatches} matches (+${(potentialNewMatches / currentMatches * 100).toFixed(1)}%)\n`);
