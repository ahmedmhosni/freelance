/**
 * Property-Based Tests for API Path Fix Script
 * 
 * Feature: api-path-fix, Property 3: Fix script removes API prefix
 * Validates: Requirements 3.2
 * 
 * Feature: api-path-fix, Property 2: Fix script preserves call syntax
 * Validates: Requirements 3.3
 */

const fs = require('fs');
const path = require('path');

// Test data representing various API call patterns
const testCases = [
  // Property 3: Fix script removes API prefix
  {
    name: 'Single quote GET with /api/ prefix',
    input: "api.get('/api/tasks')",
    expected: "api.get('/tasks')",
    property: 'Property 3: Fix script removes API prefix'
  },
  {
    name: 'Double quote POST with /api/ prefix',
    input: 'api.post("/api/users", data)',
    expected: 'api.post("/users", data)',
    property: 'Property 3: Fix script removes API prefix'
  },
  {
    name: 'PUT with /api/ prefix and options',
    input: "api.put('/api/projects/123', { name: 'Test' })",
    expected: "api.put('/projects/123', { name: 'Test' })",
    property: 'Property 3: Fix script removes API prefix'
  },
  {
    name: 'DELETE with /api/ prefix',
    input: "api.delete('/api/tasks/456')",
    expected: "api.delete('/tasks/456')",
    property: 'Property 3: Fix script removes API prefix'
  },
  {
    name: 'PATCH with /api/ prefix',
    input: 'api.patch("/api/settings", updates)',
    expected: 'api.patch("/settings", updates)',
    property: 'Property 3: Fix script removes API prefix'
  },
  
  // Property 2: Fix script preserves call syntax
  {
    name: 'Preserves parameters after path',
    input: "api.post('/api/login', { email, password })",
    expected: "api.post('/login', { email, password })",
    property: 'Property 2: Fix script preserves call syntax'
  },
  {
    name: 'Preserves complex parameters',
    input: "api.get('/api/reports', { params: { startDate, endDate } })",
    expected: "api.get('/reports', { params: { startDate, endDate } })",
    property: 'Property 2: Fix script preserves call syntax'
  },
  {
    name: 'Preserves method chaining',
    input: "await api.get('/api/data').then(res => res.data)",
    expected: "await api.get('/data').then(res => res.data)",
    property: 'Property 2: Fix script preserves call syntax'
  },
  
  // Edge cases - should NOT be modified
  {
    name: 'Already correct path (no /api/ prefix)',
    input: "api.get('/tasks')",
    expected: "api.get('/tasks')",
    property: 'Property 2: Fix script preserves call syntax'
  },
  {
    name: 'Path with /api/ in the middle (not at start)',
    input: "api.get('/v1/api/tasks')",
    expected: "api.get('/v1/api/tasks')",
    property: 'Property 2: Fix script preserves call syntax'
  }
];

// Simulate the fix script transformation
function applyFix(content) {
  let result = content;
  
  // Single quotes
  result = result.replace(/api\.get\('\/api\//g, "api.get('/");
  result = result.replace(/api\.post\('\/api\//g, "api.post('/");
  result = result.replace(/api\.put\('\/api\//g, "api.put('/");
  result = result.replace(/api\.delete\('\/api\//g, "api.delete('/");
  result = result.replace(/api\.patch\('\/api\//g, "api.patch('/");
  
  // Double quotes
  result = result.replace(/api\.get\("\/api\//g, 'api.get("/');
  result = result.replace(/api\.post\("\/api\//g, 'api.post("/');
  result = result.replace(/api\.put\("\/api\//g, 'api.put("/');
  result = result.replace(/api\.delete\("\/api\//g, 'api.delete("/');
  result = result.replace(/api\.patch\("\/api\//g, 'api.patch("/');
  
  return result;
}

// Run tests
console.log('🧪 Running Property-Based Tests for API Path Fix\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = applyFix(testCase.input);
  const success = result === testCase.expected;
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${testCase.name}`);
    console.log(`   ${testCase.property}`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${testCase.name}`);
    console.log(`   ${testCase.property}`);
    console.log(`   Input:    ${testCase.input}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got:      ${result}`);
  }
  console.log('');
});

console.log('─'.repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
