/**
 * AuditOrchestrator
 * 
 * Coordinates all phases of the audit process:
 * - Discovery: Scan backend routes and frontend API calls
 * - Matching: Match frontend calls to backend routes
 * - Verification: Test endpoints and database operations
 * - Analysis: Analyze results and identify issues
 * - Reporting: Generate comprehensive reports
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./utils/logger');
const BackendRouteScanner = require('./scanners/BackendRouteScanner');
const FrontendAPIScanner = require('./scanners/FrontendAPIScanner');
const RouteMatcher = require('./matchers/RouteMatcher');
const DatabaseVerifier = require('./verifiers/DatabaseVerifier');
const EndpointVerifier = require('./verifiers/EndpointVerifier');
const ModuleStructureVerifier = require('./verifiers/ModuleStructureVerifier');
const ReportGenerator = require('./reporters/ReportGenerator');
const { createAuditResults } = require('./models/AuditResults');
const { createIssue } = require('./models/Issue');

/**
 * Audit phases
 */
const PHASES = {
  DISCOVERY: 'discovery',
  MATCHING: 'matching',
  VERIFICATION: 'verification',
  ANALYSIS: 'analysis',
  REPORTING: 'reporting'
};

/**
 * Audit Orchestrator class
 * Extends EventEmitter to emit progress events
 */
class AuditOrchestrator extends EventEmitter {
  /**
   * Creates a new AuditOrchestrator instance
   * @param {Object} config - Audit configuration
   */
  constructor(config) {
    super();
    this.config = config;
    
    // Initialize components
    this.backendScanner = new BackendRouteScanner(config);
    this.frontendScanner = new FrontendAPIScanner(config);
    this.routeMatcher = new RouteMatcher(config);
    this.databaseVerifier = new DatabaseVerifier(config.database);
    this.endpointVerifier = new EndpointVerifier({
      baseURL: config.backend.baseURL,
      timeout: config.verification.timeout,
      retries: config.verification.retries
    });
    this.moduleStructureVerifier = new ModuleStructureVerifier({
      modulesPath: config.backend.modulesPath
    });
    this.reportGenerator = new ReportGenerator();
    
    // Audit state
    this.currentPhase = null;
    this.startTime = null;
    this.errors = [];
    this.cache = {
      routes: null,
      frontendCalls: null,
      matches: null
    };
    
    // Progress tracking
    this.progress = {
      currentPhase: null,
      phaseProgress: 0,
      overallProgress: 0,
      phaseTimes: {},
      estimatedTimeRemaining: null
    };
    
    // Phase weights for overall progress calculation
    this.phaseWeights = {
      [PHASES.DISCOVERY]: 20,
      [PHASES.MATCHING]: 15,
      [PHASES.VERIFICATION]: 40,
      [PHASES.ANALYSIS]: 15,
      [PHASES.REPORTING]: 10
    };
  }

  /**
   * Runs a full audit of the system
   * @param {Object} options - Audit options
   * @param {Array<string>} [options.modules] - Specific modules to audit (empty = all)
   * @param {boolean} [options.skipVerification] - Skip endpoint verification
   * @param {boolean} [options.skipDatabase] - Skip database verification
   * @param {boolean} [options.useCache] - Use cached discovery results
   * @returns {Promise<Object>} Audit results
   */
  async runFullAudit(options = {}) {
    this.startTime = Date.now();
    const {
      modules = [],
      skipVerification = false,
      skipDatabase = false,
      useCache = false
    } = options;

    logger.info('Starting full system audit', { options });
    this.emit('audit:start', { timestamp: new Date().toISOString() });

    try {
      // Phase 1: Discovery
      const discoveryResults = await this._runDiscoveryPhase(useCache);
      
      // Phase 2: Matching
      const matchingResults = await this._runMatchingPhase(discoveryResults, useCache);
      
      // Phase 3: Verification (optional)
      let verificationResults = {
        database: null,
        endpoints: [],
        moduleStructure: null
      };
      
      if (!skipVerification) {
        verificationResults = await this._runVerificationPhase(
          discoveryResults,
          matchingResults,
          { skipDatabase, modules }
        );
      }
      
      // Phase 4: Analysis
      const analysisResults = await this._runAnalysisPhase(
        discoveryResults,
        matchingResults,
        verificationResults
      );
      
      // Phase 5: Reporting
      const reports = await this._runReportingPhase(analysisResults);
      
      // Calculate execution time
      const executionTime = Date.now() - this.startTime;
      
      logger.info('Full audit completed', {
        executionTime: `${(executionTime / 1000).toFixed(2)}s`,
        totalRoutes: analysisResults.summary.totalRoutes,
        totalIssues: analysisResults.summary.issues
      });
      
      this.emit('audit:complete', {
        timestamp: new Date().toISOString(),
        executionTime,
        results: analysisResults
      });
      
      return {
        success: true,
        executionTime,
        results: analysisResults,
        reports
      };
      
    } catch (error) {
      logger.error('Audit failed', { error: error.message, stack: error.stack });
      
      this.emit('audit:error', {
        timestamp: new Date().toISOString(),
        error: error.message,
        phase: this.currentPhase
      });
      
      throw error;
    }
  }

  /**
   * Runs the discovery phase
   * @param {boolean} useCache - Use cached results
   * @returns {Promise<Object>} Discovery results
   * @private
   */
  async _runDiscoveryPhase(useCache) {
    this.currentPhase = PHASES.DISCOVERY;
    logger.info('Starting discovery phase');
    
    this._startPhase(PHASES.DISCOVERY);
    
    try {
      // Check cache
      if (useCache && this.cache.routes && this.cache.frontendCalls) {
        logger.info('Using cached discovery results');
        this._updateProgress(PHASES.DISCOVERY, 100, 'Using cached results');
        
        return {
          routes: this.cache.routes,
          frontendCalls: this.cache.frontendCalls
        };
      }
      
      // Scan backend routes
      this._updateProgress(PHASES.DISCOVERY, 20, 'Scanning legacy routes...');
      
      const legacyRoutes = this.backendScanner.scanLegacyRoutes();
      
      this._updateProgress(PHASES.DISCOVERY, 40, 'Scanning modular routes...');
      
      // Scan modular routes - need to bootstrap the app to get the container
      let modularRoutes = [];
      try {
        // Load environment variables before bootstrap
        const backendPath = path.resolve(__dirname, '..');
        require('dotenv').config({ path: path.join(backendPath, '.env') });
        
        const { bootstrap } = require(path.join(backendPath, 'src/core/bootstrap'));
        const { container } = await bootstrap({ createApp: false });
        modularRoutes = this.backendScanner.scanModuleRoutes(container);
        logger.info(`Discovered ${modularRoutes.length} modular routes`);
      } catch (error) {
        logger.warn('Could not scan modular routes', { error: error.message });
        // Continue with empty modular routes array
      }
      
      this._updateProgress(PHASES.DISCOVERY, 60, 'Scanning frontend API calls...');
      
      // Scan frontend API calls
      const frontendCalls = this.frontendScanner.scanAPICalls();
      
      this._updateProgress(PHASES.DISCOVERY, 80, 'Consolidating results...');
      
      // Combine all routes
      const allRoutes = [...legacyRoutes, ...modularRoutes];
      
      // Separate modular and legacy routes (already separated, just use the arrays we have)
      const onlyLegacyRoutes = legacyRoutes;
      const onlyModularRoutes = modularRoutes;
      
      const results = {
        routes: {
          all: allRoutes,
          modular: onlyModularRoutes,
          legacy: onlyLegacyRoutes
        },
        frontendCalls
      };
      
      // Cache results
      this.cache.routes = results.routes;
      this.cache.frontendCalls = frontendCalls;
      
      this._completePhase(PHASES.DISCOVERY);
      
      this.emit('phase:complete', {
        phase: PHASES.DISCOVERY,
        timestamp: new Date().toISOString(),
        results: {
          totalRoutes: allRoutes.length,
          modularRoutes: modularRoutes.length,
          legacyRoutes: onlyLegacyRoutes.length,
          frontendCalls: frontendCalls.length
        }
      });
      
      logger.info('Discovery phase complete', {
        totalRoutes: allRoutes.length,
        frontendCalls: frontendCalls.length
      });
      
      return results;
      
    } catch (error) {
      this._handlePhaseError(PHASES.DISCOVERY, error);
      throw error;
    }
  }

  /**
   * Runs the matching phase
   * @param {Object} discoveryResults - Results from discovery phase
   * @param {boolean} useCache - Use cached results
   * @returns {Promise<Object>} Matching results
   * @private
   */
  async _runMatchingPhase(discoveryResults, useCache) {
    this.currentPhase = PHASES.MATCHING;
    logger.info('Starting matching phase');
    
    this._startPhase(PHASES.MATCHING);
    
    try {
      // Check cache
      if (useCache && this.cache.matches) {
        logger.info('Using cached matching results');
        this._updateProgress(PHASES.MATCHING, 100, 'Using cached results');
        
        return this.cache.matches;
      }
      
      this._updateProgress(PHASES.MATCHING, 33, 'Matching frontend calls to backend routes...');
      
      // Match routes
      const matches = this.routeMatcher.matchRoutes(
        discoveryResults.frontendCalls,
        discoveryResults.routes.all
      );
      
      this._updateProgress(PHASES.MATCHING, 66, 'Detecting duplicate prefixes...');
      
      // Detect duplicate prefixes
      const duplicatePrefixes = this.routeMatcher.detectDuplicatePrefixes(
        discoveryResults.frontendCalls
      );
      
      const results = {
        ...matches,
        duplicatePrefixes
      };
      
      // Cache results
      this.cache.matches = results;
      
      this._completePhase(PHASES.MATCHING);
      
      this.emit('phase:complete', {
        phase: PHASES.MATCHING,
        timestamp: new Date().toISOString(),
        results: {
          matched: matches.matched.length,
          unmatchedFrontend: matches.unmatchedFrontend.length,
          unmatchedBackend: matches.unmatchedBackend.length,
          duplicatePrefixes: duplicatePrefixes.length
        }
      });
      
      logger.info('Matching phase complete', {
        matched: matches.matched.length,
        unmatchedFrontend: matches.unmatchedFrontend.length,
        unmatchedBackend: matches.unmatchedBackend.length
      });
      
      return results;
      
    } catch (error) {
      this._handlePhaseError(PHASES.MATCHING, error);
      throw error;
    }
  }

  /**
   * Runs the verification phase
   * @param {Object} discoveryResults - Results from discovery phase
   * @param {Object} matchingResults - Results from matching phase
   * @param {Object} options - Verification options
   * @returns {Promise<Object>} Verification results
   * @private
   */
  async _runVerificationPhase(discoveryResults, matchingResults, options = {}) {
    this.currentPhase = PHASES.VERIFICATION;
    logger.info('Starting verification phase');
    
    this._startPhase(PHASES.VERIFICATION);
    
    const results = {
      database: null,
      endpoints: [],
      moduleStructure: null
    };
    
    try {
      let progress = 0;
      const totalSteps = options.skipDatabase ? 2 : 3;
      
      // Step 1: Database verification (optional)
      if (!options.skipDatabase) {
        this._updateProgress(
          PHASES.VERIFICATION,
          (progress / totalSteps) * 100,
          'Verifying database connection...'
        );
        
        try {
          const dbConnection = await this.databaseVerifier.verifyConnection();
          const dbTables = await this.databaseVerifier.verifyTables();
          
          results.database = {
            connection: dbConnection,
            tables: dbTables
          };
          
          logger.info('Database verification complete', {
            connected: dbConnection.connected,
            tablesFound: dbTables.tables?.length || 0
          });
        } catch (error) {
          logger.error('Database verification failed', { error: error.message });
          this.errors.push({
            phase: PHASES.VERIFICATION,
            step: 'database',
            error: error.message
          });
          // Continue with audit even if database verification fails
        }
        
        progress++;
      }
      
      // Step 2: Module structure verification
      this._updateProgress(
        PHASES.VERIFICATION,
        (progress / totalSteps) * 100,
        'Verifying module structure...'
      );
      
      try {
        results.moduleStructure = await this.moduleStructureVerifier.verifyAllModules();
        
        logger.info('Module structure verification complete', {
          totalModules: results.moduleStructure.totalModules,
          passed: results.moduleStructure.passedModules,
          failed: results.moduleStructure.failedModules
        });
      } catch (error) {
        logger.error('Module structure verification failed', { error: error.message });
        this.errors.push({
          phase: PHASES.VERIFICATION,
          step: 'module-structure',
          error: error.message
        });
        // Continue with audit
      }
      
      progress++;
      
      // Step 3: Endpoint verification (sample only to avoid overwhelming the system)
      this._updateProgress(
        PHASES.VERIFICATION,
        (progress / totalSteps) * 100,
        'Verifying endpoints (sample)...'
      );
      
      try {
        // Verify authentication flow first
        const authResult = await this.endpointVerifier.verifyAuthFlow();
        results.endpoints.push({
          type: 'auth-flow',
          result: authResult
        });
        
        // Sample a few matched routes for verification
        const sampleSize = Math.min(5, matchingResults.matched.length);
        const sampledRoutes = matchingResults.matched.slice(0, sampleSize);
        
        for (const match of sampledRoutes) {
          try {
            const verificationResult = await this.endpointVerifier.verifyEndpoint(
              match.backend,
              { token: this.endpointVerifier.authToken }
            );
            
            results.endpoints.push({
              type: 'endpoint',
              route: match.backend,
              result: verificationResult
            });
          } catch (error) {
            logger.warn(`Failed to verify endpoint ${match.backend.path}`, {
              error: error.message
            });
            this.errors.push({
              phase: PHASES.VERIFICATION,
              step: 'endpoint',
              route: match.backend.path,
              error: error.message
            });
          }
        }
        
        logger.info('Endpoint verification complete', {
          endpointsVerified: results.endpoints.length
        });
      } catch (error) {
        logger.error('Endpoint verification failed', { error: error.message });
        this.errors.push({
          phase: PHASES.VERIFICATION,
          step: 'endpoints',
          error: error.message
        });
        // Continue with audit
      }
      
      progress++;
      
      this._completePhase(PHASES.VERIFICATION);
      
      this.emit('phase:complete', {
        phase: PHASES.VERIFICATION,
        timestamp: new Date().toISOString(),
        results: {
          databaseVerified: results.database !== null,
          moduleStructureVerified: results.moduleStructure !== null,
          endpointsVerified: results.endpoints.length
        }
      });
      
      logger.info('Verification phase complete');
      
      return results;
      
    } catch (error) {
      this._handlePhaseError(PHASES.VERIFICATION, error);
      // Don't throw - continue with audit even if verification fails
      return results;
    }
  }

  /**
   * Runs the analysis phase
   * @param {Object} discoveryResults - Results from discovery phase
   * @param {Object} matchingResults - Results from matching phase
   * @param {Object} verificationResults - Results from verification phase
   * @returns {Promise<Object>} Analysis results (AuditResults)
   * @private
   */
  async _runAnalysisPhase(discoveryResults, matchingResults, verificationResults) {
    this.currentPhase = PHASES.ANALYSIS;
    logger.info('Starting analysis phase');
    
    this._startPhase(PHASES.ANALYSIS);
    
    try {
      this._updateProgress(PHASES.ANALYSIS, 25, 'Analyzing results...');
      
      // Collect all issues
      const issues = [];
      
      // Issues from unmatched routes
      for (const unmatchedFrontend of matchingResults.unmatchedFrontend) {
        issues.push(createIssue({
          type: 'ROUTE_MISMATCH',
          severity: 'HIGH',
          title: `Frontend call without backend route: ${unmatchedFrontend.method.toUpperCase()} ${unmatchedFrontend.path}`,
          description: `Frontend component "${unmatchedFrontend.component}" makes an API call that has no corresponding backend route.`,
          location: {
            file: unmatchedFrontend.file,
            line: unmatchedFrontend.line
          },
          suggestedFix: `Create a backend route for ${unmatchedFrontend.method.toUpperCase()} ${unmatchedFrontend.path} or update the frontend call to use an existing route.`,
          relatedRoutes: []
        }));
      }
      
      for (const unmatchedBackend of matchingResults.unmatchedBackend) {
        issues.push(createIssue({
          type: 'MISSING_ROUTE',
          severity: 'MEDIUM',
          title: `Backend route without frontend call: ${unmatchedBackend.method} ${unmatchedBackend.path}`,
          description: `Backend route exists but is not called by any frontend component. This may be unused code.`,
          location: {
            file: unmatchedBackend.file,
            line: 0
          },
          suggestedFix: `Either add frontend integration for this route or remove it if it's no longer needed.`,
          relatedRoutes: [unmatchedBackend]
        }));
      }
      
      this._updateProgress(PHASES.ANALYSIS, 50, 'Analyzing duplicate prefixes...');
      
      // Issues from duplicate prefixes
      for (const duplicate of matchingResults.duplicatePrefixes) {
        issues.push(createIssue({
          type: 'DUPLICATE_PREFIX',
          severity: duplicate.severity,
          title: `Duplicate /api prefix: ${duplicate.path}`,
          description: duplicate.issue,
          location: {
            file: duplicate.file,
            line: duplicate.line
          },
          suggestedFix: duplicate.suggestedFix,
          relatedRoutes: []
        }));
      }
      
      this._updateProgress(PHASES.ANALYSIS, 75, 'Analyzing verification results...');
      
      // Issues from module structure verification
      if (verificationResults.moduleStructure) {
        for (const issue of verificationResults.moduleStructure.issues) {
          issues.push(createIssue({
            type: issue.type,
            severity: issue.severity,
            title: issue.message,
            description: issue.message,
            location: {
              file: issue.location || 'unknown',
              line: 0
            },
            suggestedFix: issue.suggestedFix || 'See module structure verification report for details.',
            relatedRoutes: []
          }));
        }
      }
      
      // Calculate summary statistics
      const passedTests = verificationResults.endpoints.filter(e => 
        e.result.success || (e.result.register?.success && e.result.login?.success)
      ).length;
      
      const failedTests = verificationResults.endpoints.filter(e => 
        !e.result.success && !(e.result.register?.success && e.result.login?.success)
      ).length;
      
      const auditResults = createAuditResults({
        summary: {
          totalRoutes: discoveryResults.routes.all.length,
          totalFrontendCalls: discoveryResults.frontendCalls.length,
          matchedRoutes: matchingResults.matched.length,
          unmatchedRoutes: matchingResults.unmatchedFrontend.length + matchingResults.unmatchedBackend.length,
          passedTests,
          failedTests,
          issues: issues.length
        },
        routes: discoveryResults.routes,
        frontendCalls: discoveryResults.frontendCalls,
        matches: {
          matched: matchingResults.matched,
          unmatchedFrontend: matchingResults.unmatchedFrontend,
          unmatchedBackend: matchingResults.unmatchedBackend
        },
        verificationResults: verificationResults.endpoints.map(e => e.result),
        issues,
        timestamp: new Date().toISOString()
      });
      
      this._completePhase(PHASES.ANALYSIS);
      
      this.emit('phase:complete', {
        phase: PHASES.ANALYSIS,
        timestamp: new Date().toISOString(),
        results: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
          highIssues: issues.filter(i => i.severity === 'HIGH').length
        }
      });
      
      logger.info('Analysis phase complete', {
        totalIssues: issues.length
      });
      
      return auditResults;
      
    } catch (error) {
      this._handlePhaseError(PHASES.ANALYSIS, error);
      throw error;
    }
  }

  /**
   * Runs the reporting phase
   * @param {Object} auditResults - Audit results from analysis phase
   * @returns {Promise<Object>} Generated reports
   * @private
   */
  async _runReportingPhase(auditResults) {
    this.currentPhase = PHASES.REPORTING;
    logger.info('Starting reporting phase');
    
    this._startPhase(PHASES.REPORTING);
    
    try {
      this._updateProgress(PHASES.REPORTING, 25, 'Generating summary report...');
      
      // Generate reports
      const summaryReport = this.reportGenerator.generateSummaryReport(auditResults);
      
      this._updateProgress(PHASES.REPORTING, 50, 'Generating route report...');
      
      const routeReport = this.reportGenerator.generateRouteReport(auditResults);
      
      this._updateProgress(PHASES.REPORTING, 75, 'Generating issue report...');
      
      const issueReport = this.reportGenerator.generateIssueReport(auditResults);
      
      // Ensure reports directory exists
      await fs.mkdir(this.config.reporting.outputPath, { recursive: true });
      
      // Write reports to files
      const summaryPath = path.join(
        this.config.reporting.outputPath,
        this.config.reporting.summaryFileName
      );
      const routePath = path.join(
        this.config.reporting.outputPath,
        this.config.reporting.routeReportFileName
      );
      const issuePath = path.join(
        this.config.reporting.outputPath,
        this.config.reporting.issueReportFileName
      );
      
      await Promise.all([
        fs.writeFile(summaryPath, summaryReport, 'utf8'),
        fs.writeFile(routePath, routeReport, 'utf8'),
        fs.writeFile(issuePath, issueReport, 'utf8')
      ]);
      
      const reports = {
        summary: {
          content: summaryReport,
          path: summaryPath
        },
        routes: {
          content: routeReport,
          path: routePath
        },
        issues: {
          content: issueReport,
          path: issuePath
        }
      };
      
      this._completePhase(PHASES.REPORTING);
      
      this.emit('phase:complete', {
        phase: PHASES.REPORTING,
        timestamp: new Date().toISOString(),
        results: {
          reportsGenerated: 3,
          outputPath: this.config.reporting.outputPath
        }
      });
      
      logger.info('Reporting phase complete', {
        outputPath: this.config.reporting.outputPath
      });
      
      return reports;
      
    } catch (error) {
      this._handlePhaseError(PHASES.REPORTING, error);
      throw error;
    }
  }

  /**
   * Handles phase errors
   * @param {string} phase - Phase name
   * @param {Error} error - Error object
   * @private
   */
  _handlePhaseError(phase, error) {
    logger.error(`Error in ${phase} phase`, {
      error: error.message,
      stack: error.stack
    });
    
    this.errors.push({
      phase,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    this.emit('phase:error', {
      phase,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Gets all errors that occurred during the audit
   * @returns {Array<Object>} Array of error objects
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Gets errors grouped by phase
   * @returns {Object} Errors grouped by phase
   */
  getErrorsByPhase() {
    const errorsByPhase = {};
    
    for (const error of this.errors) {
      if (!errorsByPhase[error.phase]) {
        errorsByPhase[error.phase] = [];
      }
      errorsByPhase[error.phase].push(error);
    }
    
    return errorsByPhase;
  }

  /**
   * Gets errors grouped by type
   * @returns {Object} Errors grouped by type
   */
  getErrorsByType() {
    const errorsByType = {};
    
    for (const error of this.errors) {
      const type = error.step || 'general';
      
      if (!errorsByType[type]) {
        errorsByType[type] = [];
      }
      errorsByType[type].push(error);
    }
    
    return errorsByType;
  }

  /**
   * Generates an error summary
   * @returns {Object} Error summary
   */
  getErrorSummary() {
    const summary = {
      totalErrors: this.errors.length,
      errorsByPhase: {},
      errorsByType: {},
      criticalErrors: [],
      timestamp: new Date().toISOString()
    };
    
    // Count errors by phase
    for (const error of this.errors) {
      const phase = error.phase || 'unknown';
      summary.errorsByPhase[phase] = (summary.errorsByPhase[phase] || 0) + 1;
      
      const type = error.step || 'general';
      summary.errorsByType[type] = (summary.errorsByType[type] || 0) + 1;
      
      // Identify critical errors (those that stopped the audit)
      if (error.critical) {
        summary.criticalErrors.push(error);
      }
    }
    
    return summary;
  }

  /**
   * Gets current progress information
   * @returns {Object} Progress information
   */
  getProgress() {
    return {
      ...this.progress,
      elapsedTime: this.startTime ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Updates phase progress and calculates overall progress
   * @param {string} phase - Current phase
   * @param {number} phaseProgress - Progress within phase (0-100)
   * @param {string} message - Progress message
   * @private
   */
  _updateProgress(phase, phaseProgress, message) {
    // Update phase progress
    this.progress.currentPhase = phase;
    this.progress.phaseProgress = phaseProgress;
    
    // Calculate overall progress based on phase weights
    const completedPhases = Object.keys(PHASES).filter(p => {
      const phaseValue = PHASES[p];
      const currentPhaseIndex = Object.values(PHASES).indexOf(phase);
      const phaseIndex = Object.values(PHASES).indexOf(phaseValue);
      return phaseIndex < currentPhaseIndex;
    });
    
    let overallProgress = 0;
    
    // Add weight of completed phases
    for (const completedPhase of completedPhases) {
      overallProgress += this.phaseWeights[PHASES[completedPhase]];
    }
    
    // Add current phase progress
    overallProgress += (this.phaseWeights[phase] * phaseProgress) / 100;
    
    this.progress.overallProgress = Math.min(100, overallProgress);
    
    // Estimate time remaining
    if (this.startTime && overallProgress > 0) {
      const elapsedTime = Date.now() - this.startTime;
      const estimatedTotalTime = (elapsedTime / overallProgress) * 100;
      this.progress.estimatedTimeRemaining = Math.max(0, estimatedTotalTime - elapsedTime);
    }
    
    // Emit progress event
    this.emit('progress', {
      phase,
      phaseProgress,
      overallProgress: this.progress.overallProgress,
      estimatedTimeRemaining: this.progress.estimatedTimeRemaining,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Marks a phase as started
   * @param {string} phase - Phase name
   * @private
   */
  _startPhase(phase) {
    this.progress.phaseTimes[phase] = {
      startTime: Date.now(),
      endTime: null,
      duration: null
    };
    
    this._updateProgress(phase, 0, `Starting ${phase} phase`);
  }

  /**
   * Marks a phase as completed
   * @param {string} phase - Phase name
   * @private
   */
  _completePhase(phase) {
    if (this.progress.phaseTimes[phase]) {
      this.progress.phaseTimes[phase].endTime = Date.now();
      this.progress.phaseTimes[phase].duration = 
        this.progress.phaseTimes[phase].endTime - this.progress.phaseTimes[phase].startTime;
    }
    
    this._updateProgress(phase, 100, `Completed ${phase} phase`);
  }

  /**
   * Clears the cache
   */
  clearCache() {
    this.cache = {
      routes: null,
      frontendCalls: null,
      matches: null
    };
    logger.info('Cache cleared');
  }

  /**
   * Runs an incremental audit on specific modules only
   * @param {Array<string>} modules - Module names to audit
   * @param {Object} options - Audit options
   * @returns {Promise<Object>} Audit results
   */
  async runIncrementalAudit(modules, options = {}) {
    logger.info('Starting incremental audit', { modules });
    
    if (!modules || modules.length === 0) {
      throw new Error('No modules specified for incremental audit');
    }
    
    // Run full audit with module filter
    return this.runFullAudit({
      ...options,
      modules,
      useCache: true // Use cached discovery results
    });
  }

  /**
   * Re-runs failed verifications only
   * @param {Object} previousResults - Previous audit results
   * @returns {Promise<Object>} Re-verification results
   */
  async rerunFailedVerifications(previousResults) {
    logger.info('Re-running failed verifications');
    
    if (!previousResults || !previousResults.results) {
      throw new Error('No previous results provided');
    }
    
    const failedEndpoints = previousResults.results.verificationResults.filter(
      result => !result.success
    );
    
    if (failedEndpoints.length === 0) {
      logger.info('No failed verifications to re-run');
      return {
        success: true,
        message: 'No failed verifications found',
        results: []
      };
    }
    
    logger.info(`Re-running ${failedEndpoints.length} failed verifications`);
    
    const rerunResults = [];
    
    for (const failedResult of failedEndpoints) {
      try {
        const result = await this.endpointVerifier.verifyEndpoint(
          failedResult.route,
          { token: this.endpointVerifier.authToken }
        );
        
        rerunResults.push({
          route: failedResult.route,
          previousResult: failedResult,
          newResult: result,
          fixed: result.success
        });
      } catch (error) {
        logger.error(`Failed to re-run verification for ${failedResult.route.path}`, {
          error: error.message
        });
        
        rerunResults.push({
          route: failedResult.route,
          previousResult: failedResult,
          newResult: null,
          fixed: false,
          error: error.message
        });
      }
    }
    
    const fixedCount = rerunResults.filter(r => r.fixed).length;
    const stillFailingCount = rerunResults.filter(r => !r.fixed).length;
    
    logger.info('Re-verification complete', {
      total: rerunResults.length,
      fixed: fixedCount,
      stillFailing: stillFailingCount
    });
    
    return {
      success: true,
      results: rerunResults,
      summary: {
        total: rerunResults.length,
        fixed: fixedCount,
        stillFailing: stillFailingCount
      }
    };
  }

  /**
   * Saves cache to disk for later use
   * @param {string} cachePath - Path to save cache file
   * @returns {Promise<void>}
   */
  async saveCache(cachePath) {
    try {
      const cacheData = {
        routes: this.cache.routes,
        frontendCalls: this.cache.frontendCalls,
        matches: this.cache.matches,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeFile(
        cachePath,
        JSON.stringify(cacheData, null, 2),
        'utf8'
      );
      
      logger.info('Cache saved', { path: cachePath });
    } catch (error) {
      logger.error('Failed to save cache', { error: error.message });
      throw error;
    }
  }

  /**
   * Loads cache from disk
   * @param {string} cachePath - Path to cache file
   * @returns {Promise<boolean>} True if cache was loaded successfully
   */
  async loadCache(cachePath) {
    try {
      const cacheData = await fs.readFile(cachePath, 'utf8');
      const parsed = JSON.parse(cacheData);
      
      this.cache.routes = parsed.routes;
      this.cache.frontendCalls = parsed.frontendCalls;
      this.cache.matches = parsed.matches;
      
      logger.info('Cache loaded', {
        path: cachePath,
        timestamp: parsed.timestamp
      });
      
      return true;
    } catch (error) {
      logger.warn('Failed to load cache', { error: error.message });
      return false;
    }
  }

  /**
   * Runs a quick audit (discovery and matching only, no verification)
   * @returns {Promise<Object>} Quick audit results
   */
  async runQuickAudit() {
    logger.info('Starting quick audit (no verification)');
    
    return this.runFullAudit({
      skipVerification: true,
      skipDatabase: true
    });
  }

  /**
   * Closes all connections and cleans up resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    logger.info('Cleaning up audit orchestrator resources');
    
    try {
      // Close database connection
      if (this.databaseVerifier) {
        await this.databaseVerifier.close();
      }
      
      // Clear cache
      this.clearCache();
      
      logger.info('Cleanup complete');
    } catch (error) {
      logger.error('Error during cleanup', { error: error.message });
    }
  }
}

module.exports = AuditOrchestrator;
