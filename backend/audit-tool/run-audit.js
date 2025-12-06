#!/usr/bin/env node

/**
 * CLI script to run the full system audit
 * 
 * Usage:
 *   node run-audit.js [options]
 * 
 * Options:
 *   --quick              Run quick audit (no verification)
 *   --modules <names>    Audit specific modules only (comma-separated)
 *   --skip-db            Skip database verification
 *   --use-cache          Use cached discovery results
 *   --save-cache <path>  Save cache to specified path
 *   --load-cache <path>  Load cache from specified path
 *   --help               Show help
 */

const { AuditOrchestrator, config } = require('./index');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    quick: false,
    modules: [],
    skipDb: false,
    useCache: false,
    saveCache: null,
    loadCache: null,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--quick':
        options.quick = true;
        break;
      
      case '--modules':
        if (i + 1 < args.length) {
          options.modules = args[i + 1].split(',').map(m => m.trim());
          i++;
        }
        break;
      
      case '--skip-db':
        options.skipDb = true;
        break;
      
      case '--use-cache':
        options.useCache = true;
        break;
      
      case '--save-cache':
        if (i + 1 < args.length) {
          options.saveCache = args[i + 1];
          i++;
        }
        break;
      
      case '--load-cache':
        if (i + 1 < args.length) {
          options.loadCache = args[i + 1];
          i++;
        }
        break;
      
      case '--help':
      case '-h':
        options.help = true;
        break;
      
      default:
        console.warn(`Unknown option: ${arg}`);
    }
  }
  
  return options;
}

// Show help message
function showHelp() {
  console.log(`
Full System Audit Tool
======================

Usage:
  node run-audit.js [options]

Options:
  --quick              Run quick audit (discovery and matching only, no verification)
  --modules <names>    Audit specific modules only (comma-separated)
                       Example: --modules clients,projects,tasks
  --skip-db            Skip database verification
  --use-cache          Use cached discovery results for faster re-runs
  --save-cache <path>  Save cache to specified path after audit
  --load-cache <path>  Load cache from specified path before audit
  --help, -h           Show this help message

Examples:
  # Run full audit
  node run-audit.js

  # Run quick audit (no verification)
  node run-audit.js --quick

  # Audit specific modules only
  node run-audit.js --modules clients,projects

  # Use cache for faster re-runs
  node run-audit.js --use-cache --save-cache ./audit-cache.json

  # Load cache and run audit
  node run-audit.js --load-cache ./audit-cache.json

Reports will be saved to: ${config.reporting.outputPath}
  `);
}

// Format time duration
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

// Main function
async function main() {
  const options = parseArgs();
  
  // Show help if requested
  if (options.help) {
    showHelp();
    return;
  }
  
  console.log('Full System Audit Tool');
  console.log('======================\n');
  
  const orchestrator = new AuditOrchestrator(config);
  
  // Set up progress tracking
  let lastProgress = 0;
  orchestrator.on('progress', (progress) => {
    // Only show progress updates every 5%
    if (progress.overallProgress - lastProgress >= 5 || progress.overallProgress === 100) {
      const bar = '█'.repeat(Math.floor(progress.overallProgress / 2));
      const empty = '░'.repeat(50 - Math.floor(progress.overallProgress / 2));
      
      process.stdout.write(`\r[${bar}${empty}] ${progress.overallProgress.toFixed(1)}% - ${progress.message}`);
      
      lastProgress = progress.overallProgress;
      
      if (progress.overallProgress === 100) {
        console.log(''); // New line after completion
      }
    }
  });
  
  // Set up phase completion tracking
  orchestrator.on('phase:complete', (event) => {
    console.log(`\n✅ ${event.phase} phase completed`);
  });
  
  // Set up error tracking
  orchestrator.on('phase:error', (event) => {
    console.error(`\n❌ Error in ${event.phase} phase: ${event.error}`);
  });
  
  try {
    // Load cache if specified
    if (options.loadCache) {
      console.log(`Loading cache from ${options.loadCache}...`);
      const loaded = await orchestrator.loadCache(options.loadCache);
      if (loaded) {
        console.log('✅ Cache loaded successfully\n');
        options.useCache = true;
      } else {
        console.log('⚠️ Failed to load cache, will run full discovery\n');
      }
    }
    
    // Run audit based on options
    let result;
    
    if (options.quick) {
      console.log('Running quick audit (no verification)...\n');
      result = await orchestrator.runQuickAudit();
    } else if (options.modules.length > 0) {
      console.log(`Running incremental audit for modules: ${options.modules.join(', ')}...\n`);
      result = await orchestrator.runIncrementalAudit(options.modules, {
        skipDatabase: options.skipDb,
        useCache: options.useCache
      });
    } else {
      console.log('Running full audit...\n');
      result = await orchestrator.runFullAudit({
        skipDatabase: options.skipDb,
        useCache: options.useCache
      });
    }
    
    // Save cache if specified
    if (options.saveCache) {
      console.log(`\nSaving cache to ${options.saveCache}...`);
      await orchestrator.saveCache(options.saveCache);
      console.log('✅ Cache saved successfully');
    }
    
    // Display results
    console.log('\n' + '='.repeat(50));
    console.log('Audit Complete');
    console.log('='.repeat(50));
    console.log(`\nExecution time: ${formatDuration(result.executionTime)}`);
    console.log(`\nResults:`);
    console.log(`  Total routes: ${result.results.summary.totalRoutes}`);
    console.log(`  Frontend API calls: ${result.results.summary.totalFrontendCalls}`);
    console.log(`  Matched routes: ${result.results.summary.matchedRoutes}`);
    console.log(`  Unmatched routes: ${result.results.summary.unmatchedRoutes}`);
    
    if (!options.quick) {
      console.log(`  Tests passed: ${result.results.summary.passedTests}`);
      console.log(`  Tests failed: ${result.results.summary.failedTests}`);
    }
    
    console.log(`  Issues found: ${result.results.summary.issues}`);
    
    // Show issue breakdown
    if (result.results.issues.length > 0) {
      const critical = result.results.issues.filter(i => i.severity === 'CRITICAL').length;
      const high = result.results.issues.filter(i => i.severity === 'HIGH').length;
      const medium = result.results.issues.filter(i => i.severity === 'MEDIUM').length;
      const low = result.results.issues.filter(i => i.severity === 'LOW').length;
      
      console.log(`\nIssue Breakdown:`);
      if (critical > 0) console.log(`  🔴 Critical: ${critical}`);
      if (high > 0) console.log(`  🟠 High: ${high}`);
      if (medium > 0) console.log(`  🟡 Medium: ${medium}`);
      if (low > 0) console.log(`  🟢 Low: ${low}`);
    }
    
    // Show error summary
    const errorSummary = orchestrator.getErrorSummary();
    if (errorSummary.totalErrors > 0) {
      console.log(`\n⚠️ ${errorSummary.totalErrors} error(s) occurred during audit`);
      console.log('See audit logs for details');
    }
    
    // Show report locations
    console.log(`\nReports saved to: ${config.reporting.outputPath}`);
    console.log(`  - Summary: ${config.reporting.summaryFileName}`);
    console.log(`  - Routes: ${config.reporting.routeReportFileName}`);
    console.log(`  - Issues: ${config.reporting.issueReportFileName}`);
    
    // Cleanup
    await orchestrator.cleanup();
    
    // Exit with appropriate code
    const exitCode = result.results.summary.issues > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('\n❌ Audit failed:', error.message);
    console.error(error.stack);
    
    // Try to cleanup
    try {
      await orchestrator.cleanup();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
