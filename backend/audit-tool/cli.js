#!/usr/bin/env node

/**
 * Full System Audit CLI
 * 
 * A comprehensive command-line interface for running system audits.
 * Supports multiple commands, output formats, and configuration options.
 * 
 * Commands:
 *   discover  - Run discovery phase only (scan routes and API calls)
 *   verify    - Run verification phase (test endpoints and database)
 *   report    - Generate reports from previous audit results
 *   full      - Run complete audit (all phases)
 * 
 * Requirements: 5.1, 5.4
 */

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { AuditOrchestrator } = require('./index');
const ConfigLoader = require('./config/ConfigLoader');
const fs = require('fs').promises;
const path = require('path');

// Package version
const packageJson = require('../../package.json');
const VERSION = packageJson.version || '1.0.0';

// Global configuration
let config = null;

/**
 * Load configuration with validation
 * @param {Object} options - CLI options
 * @returns {Object} Loaded configuration
 */
function loadConfiguration(options) {
  if (config) {
    return config;
  }

  const spinner = ora('Loading configuration...').start();

  try {
    const configLoader = new ConfigLoader({
      configPath: options.config,
      environment: process.env.NODE_ENV || 'development'
    });

    config = configLoader.load();

    // Show warnings if any
    if (configLoader.hasWarnings()) {
      const warnings = configLoader.getValidationErrorsBySeverity('warning');
      spinner.warn(chalk.yellow(`Configuration loaded with ${warnings.length} warning(s)`));
      
      if (options.verbose) {
        warnings.forEach(warning => {
          console.log(chalk.yellow(`  ⚠ ${warning.field}: ${warning.message}`));
        });
      }
    } else {
      spinner.succeed(chalk.green('Configuration loaded'));
    }

    return config;
  } catch (error) {
    spinner.fail(chalk.red('Configuration loading failed'));
    
    if (error.name === 'ConfigValidationError') {
      console.error(chalk.red('\nConfiguration validation errors:'));
      error.errors.forEach(err => {
        const icon = err.severity === 'error' ? '✗' : '⚠';
        const color = err.severity === 'error' ? chalk.red : chalk.yellow;
        console.error(color(`  ${icon} ${err.field}: ${err.message}`));
      });
    } else {
      console.error(chalk.red('\nError:'), error.message);
    }
    
    process.exit(1);
  }
}

/**
 * Format duration in human-readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Display progress bar
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Progress message
 */
function displayProgress(progress, message) {
  const barLength = 40;
  const filled = Math.floor((progress / 100) * barLength);
  const empty = barLength - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  process.stdout.write(`\r${chalk.cyan(bar)} ${chalk.bold(progress.toFixed(1))}% ${chalk.gray(message)}`);
  
  if (progress >= 100) {
    console.log(''); // New line after completion
  }
}

/**
 * Display summary statistics
 * @param {Object} results - Audit results
 * @param {Object} options - Display options
 */
function displaySummary(results, options = {}) {
  const { verbose = false } = options;
  
  console.log('\n' + chalk.bold.cyan('='.repeat(60)));
  console.log(chalk.bold.cyan('Audit Summary'));
  console.log(chalk.bold.cyan('='.repeat(60)));
  
  console.log('\n' + chalk.bold('Discovery:'));
  console.log(`  ${chalk.gray('Total routes:')} ${chalk.white(results.summary.totalRoutes)}`);
  console.log(`  ${chalk.gray('Frontend API calls:')} ${chalk.white(results.summary.totalFrontendCalls)}`);
  console.log(`  ${chalk.gray('Matched routes:')} ${chalk.green(results.summary.matchedRoutes)}`);
  console.log(`  ${chalk.gray('Unmatched routes:')} ${chalk.yellow(results.summary.unmatchedRoutes)}`);
  
  if (results.summary.passedTests !== undefined) {
    console.log('\n' + chalk.bold('Verification:'));
    console.log(`  ${chalk.gray('Tests passed:')} ${chalk.green(results.summary.passedTests)}`);
    console.log(`  ${chalk.gray('Tests failed:')} ${chalk.red(results.summary.failedTests)}`);
  }
  
  console.log('\n' + chalk.bold('Issues:'));
  console.log(`  ${chalk.gray('Total issues:')} ${chalk.white(results.summary.issues)}`);
  
  if (results.issues && results.issues.length > 0) {
    const critical = results.issues.filter(i => i.severity === 'CRITICAL').length;
    const high = results.issues.filter(i => i.severity === 'HIGH').length;
    const medium = results.issues.filter(i => i.severity === 'MEDIUM').length;
    const low = results.issues.filter(i => i.severity === 'LOW').length;
    
    if (critical > 0) console.log(`  ${chalk.red('🔴 Critical:')} ${critical}`);
    if (high > 0) console.log(`  ${chalk.yellow('🟠 High:')} ${high}`);
    if (medium > 0) console.log(`  ${chalk.blue('🟡 Medium:')} ${medium}`);
    if (low > 0) console.log(`  ${chalk.green('🟢 Low:')} ${low}`);
  }
  
  if (verbose && results.issues && results.issues.length > 0) {
    console.log('\n' + chalk.bold('Top Issues:'));
    results.issues.slice(0, 5).forEach((issue, index) => {
      const severityColor = {
        CRITICAL: chalk.red,
        HIGH: chalk.yellow,
        MEDIUM: chalk.blue,
        LOW: chalk.green
      }[issue.severity] || chalk.white;
      
      console.log(`  ${index + 1}. ${severityColor(issue.severity)} - ${issue.title}`);
    });
    
    if (results.issues.length > 5) {
      console.log(`  ${chalk.gray(`... and ${results.issues.length - 5} more`)}`);
    }
  }
}

/**
 * Save results to JSON file
 * @param {Object} results - Audit results
 * @param {string} outputPath - Output file path
 */
async function saveResultsJSON(results, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    JSON.stringify(results, null, 2),
    'utf8'
  );
}

/**
 * Discover command - Run discovery phase only
 */
program
  .command('discover')
  .description('Run discovery phase (scan routes and API calls)')
  .option('-o, --output <format>', 'Output format (json|markdown)', 'markdown')
  .option('-v, --verbose', 'Verbose output', false)
  .option('--save-cache <path>', 'Save discovery cache to file')
  .action(async (options) => {
    const cfg = loadConfiguration(program.opts());
    const spinner = ora('Initializing audit...').start();
    
    try {
      const orchestrator = new AuditOrchestrator(cfg);
      
      // Set up progress tracking
      orchestrator.on('progress', (progress) => {
        spinner.text = progress.message;
      });
      
      spinner.text = 'Running discovery phase...';
      
      // Run quick audit (discovery + matching only)
      const result = await orchestrator.runQuickAudit();
      
      spinner.succeed(chalk.green('Discovery complete!'));
      
      // Save cache if requested
      if (options.saveCache) {
        spinner.start('Saving cache...');
        await orchestrator.saveCache(options.saveCache);
        spinner.succeed(chalk.green(`Cache saved to ${options.saveCache}`));
      }
      
      // Display results
      displaySummary(result.results, { verbose: options.verbose });
      
      // Save JSON output if requested
      if (options.output === 'json') {
        const jsonPath = path.join(cfg.reporting.outputPath, 'discovery-results.json');
        await saveResultsJSON(result.results, jsonPath);
        console.log(`\n${chalk.gray('JSON results saved to:')} ${chalk.white(jsonPath)}`);
      }
      
      console.log(`\n${chalk.gray('Reports saved to:')} ${chalk.white(cfg.reporting.outputPath)}`);
      console.log(`${chalk.gray('Execution time:')} ${chalk.white(formatDuration(result.executionTime))}`);
      
      await orchestrator.cleanup();
      process.exit(0);
      
    } catch (error) {
      spinner.fail(chalk.red('Discovery failed'));
      console.error(chalk.red('\nError:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

/**
 * Verify command - Run verification phase
 */
program
  .command('verify')
  .description('Run verification phase (test endpoints and database)')
  .option('-m, --modules <modules>', 'Comma-separated list of modules to verify')
  .option('--skip-db', 'Skip database verification', false)
  .option('--load-cache <path>', 'Load discovery cache from file')
  .option('-o, --output <format>', 'Output format (json|markdown)', 'markdown')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    const cfg = loadConfiguration(program.opts());
    const spinner = ora('Initializing audit...').start();
    
    try {
      const orchestrator = new AuditOrchestrator(cfg);
      
      // Load cache if provided
      if (options.loadCache) {
        spinner.text = 'Loading cache...';
        const loaded = await orchestrator.loadCache(options.loadCache);
        if (!loaded) {
          spinner.warn(chalk.yellow('Failed to load cache, will run full discovery'));
        } else {
          spinner.succeed(chalk.green('Cache loaded'));
        }
      }
      
      // Set up progress tracking
      let lastProgress = 0;
      orchestrator.on('progress', (progress) => {
        if (progress.overallProgress - lastProgress >= 5 || progress.overallProgress === 100) {
          displayProgress(progress.overallProgress, progress.message);
          lastProgress = progress.overallProgress;
        }
      });
      
      orchestrator.on('phase:complete', (event) => {
        console.log(`\n${chalk.green('✓')} ${event.phase} phase completed`);
      });
      
      spinner.stop();
      console.log(chalk.bold.cyan('\nRunning verification...\n'));
      
      // Parse modules if provided
      const modules = options.modules ? options.modules.split(',').map(m => m.trim()) : [];
      
      // Run audit
      let result;
      if (modules.length > 0) {
        result = await orchestrator.runIncrementalAudit(modules, {
          skipDatabase: options.skipDb,
          useCache: !!options.loadCache
        });
      } else {
        result = await orchestrator.runFullAudit({
          skipDatabase: options.skipDb,
          useCache: !!options.loadCache
        });
      }
      
      console.log(chalk.green('\n✓ Verification complete!'));
      
      // Display results
      displaySummary(result.results, { verbose: options.verbose });
      
      // Save JSON output if requested
      if (options.output === 'json') {
        const jsonPath = path.join(cfg.reporting.outputPath, 'verification-results.json');
        await saveResultsJSON(result.results, jsonPath);
        console.log(`\n${chalk.gray('JSON results saved to:')} ${chalk.white(jsonPath)}`);
      }
      
      console.log(`\n${chalk.gray('Reports saved to:')} ${chalk.white(cfg.reporting.outputPath)}`);
      console.log(`${chalk.gray('Execution time:')} ${chalk.white(formatDuration(result.executionTime))}`);
      
      await orchestrator.cleanup();
      
      // Exit with error code if issues found
      const exitCode = result.results.summary.issues > 0 ? 1 : 0;
      process.exit(exitCode);
      
    } catch (error) {
      spinner.fail(chalk.red('Verification failed'));
      console.error(chalk.red('\nError:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

/**
 * Report command - Generate reports from previous results
 */
program
  .command('report')
  .description('Generate reports from previous audit results')
  .option('-i, --input <path>', 'Input JSON results file')
  .option('-o, --output <format>', 'Output format (json|markdown|both)', 'markdown')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    const cfg = loadConfiguration(program.opts());
    const inputPath = options.input || path.join(cfg.reporting.outputPath, 'detailed-results.json');
    const spinner = ora('Loading results...').start();
    
    try {
      // Load previous results
      const resultsData = await fs.readFile(inputPath, 'utf8');
      const results = JSON.parse(resultsData);
      
      spinner.text = 'Generating reports...';
      
      const { ReportGenerator } = require('./index');
      const reportGenerator = new ReportGenerator();
      
      // Generate reports
      const summaryReport = reportGenerator.generateSummaryReport(results);
      const routeReport = reportGenerator.generateRouteReport(results);
      const issueReport = reportGenerator.generateIssueReport(results);
      
      // Ensure output directory exists
      await fs.mkdir(cfg.reporting.outputPath, { recursive: true });
      
      // Save markdown reports
      if (options.output === 'markdown' || options.output === 'both') {
        await Promise.all([
          fs.writeFile(
            path.join(cfg.reporting.outputPath, cfg.reporting.summaryFileName),
            summaryReport,
            'utf8'
          ),
          fs.writeFile(
            path.join(cfg.reporting.outputPath, cfg.reporting.routeReportFileName),
            routeReport,
            'utf8'
          ),
          fs.writeFile(
            path.join(cfg.reporting.outputPath, cfg.reporting.issueReportFileName),
            issueReport,
            'utf8'
          )
        ]);
      }
      
      // Save JSON report
      if (options.output === 'json' || options.output === 'both') {
        await saveResultsJSON(results, path.join(cfg.reporting.outputPath, 'detailed-results.json'));
      }
      
      spinner.succeed(chalk.green('Reports generated!'));
      
      // Display summary
      displaySummary(results, { verbose: options.verbose });
      
      console.log(`\n${chalk.gray('Reports saved to:')} ${chalk.white(cfg.reporting.outputPath)}`);
      
      process.exit(0);
      
    } catch (error) {
      spinner.fail(chalk.red('Report generation failed'));
      console.error(chalk.red('\nError:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

/**
 * Full command - Run complete audit
 */
program
  .command('full')
  .description('Run complete audit (all phases)')
  .option('-m, --modules <modules>', 'Comma-separated list of modules to audit')
  .option('--skip-db', 'Skip database verification', false)
  .option('--use-cache', 'Use cached discovery results', false)
  .option('--save-cache <path>', 'Save cache to file')
  .option('--load-cache <path>', 'Load cache from file')
  .option('-o, --output <format>', 'Output format (json|markdown|both)', 'markdown')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    const cfg = loadConfiguration(program.opts());
    const spinner = ora('Initializing audit...').start();
    
    try {
      const orchestrator = new AuditOrchestrator(cfg);
      
      // Load cache if provided
      if (options.loadCache) {
        spinner.text = 'Loading cache...';
        const loaded = await orchestrator.loadCache(options.loadCache);
        if (!loaded) {
          spinner.warn(chalk.yellow('Failed to load cache, will run full discovery'));
        } else {
          spinner.succeed(chalk.green('Cache loaded'));
          options.useCache = true;
        }
      }
      
      // Set up progress tracking
      let lastProgress = 0;
      orchestrator.on('progress', (progress) => {
        if (progress.overallProgress - lastProgress >= 5 || progress.overallProgress === 100) {
          displayProgress(progress.overallProgress, progress.message);
          lastProgress = progress.overallProgress;
        }
      });
      
      orchestrator.on('phase:complete', (event) => {
        console.log(`\n${chalk.green('✓')} ${event.phase} phase completed`);
      });
      
      orchestrator.on('phase:error', (event) => {
        console.log(`\n${chalk.red('✗')} Error in ${event.phase} phase: ${event.error}`);
      });
      
      spinner.stop();
      console.log(chalk.bold.cyan('\nRunning full audit...\n'));
      
      // Parse modules if provided
      const modules = options.modules ? options.modules.split(',').map(m => m.trim()) : [];
      
      // Run audit
      let result;
      if (modules.length > 0) {
        result = await orchestrator.runIncrementalAudit(modules, {
          skipDatabase: options.skipDb,
          useCache: options.useCache
        });
      } else {
        result = await orchestrator.runFullAudit({
          skipDatabase: options.skipDb,
          useCache: options.useCache
        });
      }
      
      // Save cache if requested
      if (options.saveCache) {
        console.log(`\n${chalk.gray('Saving cache...')}`);
        await orchestrator.saveCache(options.saveCache);
        console.log(chalk.green(`✓ Cache saved to ${options.saveCache}`));
      }
      
      console.log(chalk.green('\n✓ Audit complete!'));
      
      // Display results
      displaySummary(result.results, { verbose: options.verbose });
      
      // Save JSON output if requested
      if (options.output === 'json' || options.output === 'both') {
        const jsonPath = path.join(cfg.reporting.outputPath, 'detailed-results.json');
        await saveResultsJSON(result.results, jsonPath);
        console.log(`\n${chalk.gray('JSON results saved to:')} ${chalk.white(jsonPath)}`);
      }
      
      // Show error summary if errors occurred
      const errorSummary = orchestrator.getErrorSummary();
      if (errorSummary.totalErrors > 0) {
        console.log(`\n${chalk.yellow('⚠')} ${errorSummary.totalErrors} error(s) occurred during audit`);
        if (options.verbose) {
          console.log(chalk.gray('See audit logs for details'));
        }
      }
      
      console.log(`\n${chalk.gray('Reports saved to:')} ${chalk.white(cfg.reporting.outputPath)}`);
      console.log(`${chalk.gray('Execution time:')} ${chalk.white(formatDuration(result.executionTime))}`);
      
      await orchestrator.cleanup();
      
      // Exit with error code if issues found
      const exitCode = result.results.summary.issues > 0 ? 1 : 0;
      process.exit(exitCode);
      
    } catch (error) {
      spinner.fail(chalk.red('Audit failed'));
      console.error(chalk.red('\nError:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Configure program
program
  .name('audit')
  .description('Full System Audit Tool - Comprehensive system verification and analysis')
  .version(VERSION)
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--no-color', 'Disable colored output');

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
