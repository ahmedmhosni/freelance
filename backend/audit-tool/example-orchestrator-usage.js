/**
 * Example usage of the AuditOrchestrator
 * 
 * This file demonstrates how to use the AuditOrchestrator to run
 * a full system audit with progress tracking and error handling.
 */

const { AuditOrchestrator, config } = require('./index');

/**
 * Example 1: Run a full audit with progress tracking
 */
async function runFullAuditExample() {
  console.log('=== Example 1: Full Audit with Progress Tracking ===\n');
  
  const orchestrator = new AuditOrchestrator(config);
  
  // Listen to progress events
  orchestrator.on('progress', (progress) => {
    console.log(`[${progress.phase}] ${progress.phaseProgress.toFixed(1)}% - ${progress.message}`);
    console.log(`Overall: ${progress.overallProgress.toFixed(1)}%`);
    
    if (progress.estimatedTimeRemaining) {
      const seconds = (progress.estimatedTimeRemaining / 1000).toFixed(0);
      console.log(`Estimated time remaining: ${seconds}s`);
    }
    
    console.log('');
  });
  
  // Listen to phase completion events
  orchestrator.on('phase:complete', (event) => {
    console.log(`✅ Phase ${event.phase} completed`);
    console.log(JSON.stringify(event.results, null, 2));
    console.log('');
  });
  
  // Listen to errors
  orchestrator.on('phase:error', (event) => {
    console.error(`❌ Error in phase ${event.phase}: ${event.error}`);
  });
  
  try {
    const result = await orchestrator.runFullAudit();
    
    console.log('\n=== Audit Complete ===');
    console.log(`Execution time: ${(result.executionTime / 1000).toFixed(2)}s`);
    console.log(`Total routes: ${result.results.summary.totalRoutes}`);
    console.log(`Total issues: ${result.results.summary.issues}`);
    console.log(`Reports saved to: ${config.reporting.outputPath}`);
    
    // Get error summary
    const errorSummary = orchestrator.getErrorSummary();
    if (errorSummary.totalErrors > 0) {
      console.log(`\n⚠️ ${errorSummary.totalErrors} error(s) occurred during audit`);
      console.log(JSON.stringify(errorSummary, null, 2));
    }
    
    // Cleanup
    await orchestrator.cleanup();
    
  } catch (error) {
    console.error('Audit failed:', error.message);
    console.error(error.stack);
  }
}

/**
 * Example 2: Run a quick audit (no verification)
 */
async function runQuickAuditExample() {
  console.log('\n=== Example 2: Quick Audit (No Verification) ===\n');
  
  const orchestrator = new AuditOrchestrator(config);
  
  try {
    const result = await orchestrator.runQuickAudit();
    
    console.log('Quick audit complete');
    console.log(`Execution time: ${(result.executionTime / 1000).toFixed(2)}s`);
    console.log(`Matched routes: ${result.results.summary.matchedRoutes}`);
    console.log(`Unmatched routes: ${result.results.summary.unmatchedRoutes}`);
    
    await orchestrator.cleanup();
    
  } catch (error) {
    console.error('Quick audit failed:', error.message);
  }
}

/**
 * Example 3: Run incremental audit on specific modules
 */
async function runIncrementalAuditExample() {
  console.log('\n=== Example 3: Incremental Audit (Specific Modules) ===\n');
  
  const orchestrator = new AuditOrchestrator(config);
  
  // Audit only clients and projects modules
  const modulesToAudit = ['clients', 'projects'];
  
  try {
    const result = await orchestrator.runIncrementalAudit(modulesToAudit);
    
    console.log(`Incremental audit complete for modules: ${modulesToAudit.join(', ')}`);
    console.log(`Execution time: ${(result.executionTime / 1000).toFixed(2)}s`);
    
    await orchestrator.cleanup();
    
  } catch (error) {
    console.error('Incremental audit failed:', error.message);
  }
}

/**
 * Example 4: Use cache for faster re-runs
 */
async function runAuditWithCacheExample() {
  console.log('\n=== Example 4: Audit with Cache ===\n');
  
  const orchestrator = new AuditOrchestrator(config);
  const cachePath = './audit-cache.json';
  
  try {
    // Try to load cache
    const cacheLoaded = await orchestrator.loadCache(cachePath);
    
    if (cacheLoaded) {
      console.log('✅ Cache loaded successfully');
    } else {
      console.log('ℹ️ No cache found, will create new cache');
    }
    
    // Run audit with cache
    const result = await orchestrator.runFullAudit({ useCache: true });
    
    console.log('Audit complete');
    console.log(`Execution time: ${(result.executionTime / 1000).toFixed(2)}s`);
    
    // Save cache for next run
    await orchestrator.saveCache(cachePath);
    console.log('✅ Cache saved for next run');
    
    await orchestrator.cleanup();
    
  } catch (error) {
    console.error('Audit with cache failed:', error.message);
  }
}

/**
 * Example 5: Re-run failed verifications
 */
async function rerunFailedVerificationsExample() {
  console.log('\n=== Example 5: Re-run Failed Verifications ===\n');
  
  const orchestrator = new AuditOrchestrator(config);
  
  try {
    // First, run a full audit
    console.log('Running initial audit...');
    const initialResult = await orchestrator.runFullAudit();
    
    // Check if there are any failed verifications
    const failedCount = initialResult.results.summary.failedTests;
    
    if (failedCount > 0) {
      console.log(`\n⚠️ ${failedCount} verification(s) failed`);
      console.log('Re-running failed verifications...\n');
      
      // Re-run failed verifications
      const rerunResult = await orchestrator.rerunFailedVerifications(initialResult);
      
      console.log('Re-verification complete');
      console.log(`Fixed: ${rerunResult.summary.fixed}`);
      console.log(`Still failing: ${rerunResult.summary.stillFailing}`);
      
      // Show details of fixed verifications
      const fixed = rerunResult.results.filter(r => r.fixed);
      if (fixed.length > 0) {
        console.log('\n✅ Fixed verifications:');
        fixed.forEach(r => {
          console.log(`  - ${r.route.method} ${r.route.path}`);
        });
      }
      
      // Show details of still failing verifications
      const stillFailing = rerunResult.results.filter(r => !r.fixed);
      if (stillFailing.length > 0) {
        console.log('\n❌ Still failing verifications:');
        stillFailing.forEach(r => {
          console.log(`  - ${r.route.method} ${r.route.path}`);
          if (r.error) {
            console.log(`    Error: ${r.error}`);
          }
        });
      }
    } else {
      console.log('✅ All verifications passed!');
    }
    
    await orchestrator.cleanup();
    
  } catch (error) {
    console.error('Re-run failed verifications example failed:', error.message);
  }
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('AuditOrchestrator Usage Examples\n');
  console.log('================================\n');
  
  // Uncomment the example you want to run:
  
  await runFullAuditExample();
  // await runQuickAuditExample();
  // await runIncrementalAuditExample();
  // await runAuditWithCacheExample();
  // await rerunFailedVerificationsExample();
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runFullAuditExample,
  runQuickAuditExample,
  runIncrementalAuditExample,
  runAuditWithCacheExample,
  rerunFailedVerificationsExample
};
