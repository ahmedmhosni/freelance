const ModuleStructureVerifier = require('./verifiers/ModuleStructureVerifier');
const path = require('path');

async function checkModuleStructure() {
  const verifier = new ModuleStructureVerifier({
    modulesPath: path.join(__dirname, '../src/modules')
  });

  console.log('Checking module structure...\n');
  
  const results = await verifier.verifyAllModules();
  
  console.log(`\n=== Module Structure Verification Results ===`);
  console.log(`Total Modules: ${results.totalModules}`);
  console.log(`Passed: ${results.passedModules}`);
  console.log(`Failed: ${results.failedModules}\n`);
  
  for (const moduleResult of results.modules) {
    console.log(`\n--- ${moduleResult.moduleName} ---`);
    console.log(`Status: ${moduleResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log('\nDirectories:');
    for (const [dir, exists] of Object.entries(moduleResult.structure.directories)) {
      console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
    }
    
    console.log('\nFiles:');
    for (const [file, exists] of Object.entries(moduleResult.structure.files)) {
      console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    }
    
    if (moduleResult.issues.length > 0) {
      console.log('\nIssues:');
      for (const issue of moduleResult.issues) {
        console.log(`  [${issue.severity}] ${issue.type}: ${issue.message}`);
        if (issue.suggestedFix) {
          console.log(`    Fix: ${issue.suggestedFix}`);
        }
      }
    }
  }
  
  if (results.issues.length > 0) {
    console.log('\n\n=== Summary of All Issues ===');
    for (const issue of results.issues) {
      console.log(`\n[${issue.severity}] ${issue.type}`);
      console.log(`  Module: ${issue.location}`);
      console.log(`  Issue: ${issue.message}`);
      console.log(`  Fix: ${issue.suggestedFix}`);
    }
  }
}

checkModuleStructure().catch(console.error);
