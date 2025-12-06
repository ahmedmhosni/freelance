/**
 * Analyze missing routes by module
 * Groups unmatched frontend calls by module to prioritize implementation
 */

const fs = require('fs');
const path = require('path');

// Read the issues report
const issuesPath = path.join(__dirname, 'backend/audit-tool/reports/issues.md');
const issuesContent = fs.readFileSync(issuesPath, 'utf8');

// Extract all "Frontend call without backend route" issues
const issueRegex = /### Issue \d+: Frontend call without backend route: (GET|POST|PUT|DELETE|PATCH) (.+?)\n/g;
const matches = [...issuesContent.matchAll(issueRegex)];

// Group by module
const moduleRoutes = {};
const otherRoutes = [];

matches.forEach(match => {
  const method = match[1];
  const path = match[2];
  
  // Extract module from path
  const pathParts = path.split('/').filter(p => p && p !== 'api');
  const module = pathParts[0] || 'unknown';
  
  if (!moduleRoutes[module]) {
    moduleRoutes[module] = [];
  }
  
  moduleRoutes[module].push({ method, path });
});

// Sort modules by number of missing routes
const sortedModules = Object.entries(moduleRoutes)
  .sort((a, b) => b[1].length - a[1].length);

console.log('='.repeat(80));
console.log('MISSING ROUTES ANALYSIS');
console.log('='.repeat(80));
console.log(`\nTotal missing routes: ${matches.length}\n`);

sortedModules.forEach(([module, routes]) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📦 ${module.toUpperCase()} MODULE`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Missing routes: ${routes.length}\n`);
  
  // Group by HTTP method
  const byMethod = {};
  routes.forEach(r => {
    if (!byMethod[r.method]) byMethod[r.method] = [];
    byMethod[r.method].push(r.path);
  });
  
  Object.entries(byMethod).forEach(([method, paths]) => {
    console.log(`${method}:`);
    paths.forEach(p => console.log(`  - ${p}`));
    console.log();
  });
});

console.log('\n' + '='.repeat(80));
console.log('IMPLEMENTATION PRIORITY');
console.log('='.repeat(80));
console.log('\nBased on number of missing routes:\n');

sortedModules.forEach(([module, routes], index) => {
  const priority = index + 1;
  console.log(`${priority}. ${module.padEnd(20)} - ${routes.length} routes`);
});

console.log('\n' + '='.repeat(80));

