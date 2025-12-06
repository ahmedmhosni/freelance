/**
 * Audit Tool Entry Point
 * 
 * This is the main entry point for the full system audit tool.
 * It provides access to all audit components and utilities.
 */

const config = require('./audit.config');
const logger = require('./utils/logger');
const models = require('./models');
const BackendRouteScanner = require('./scanners/BackendRouteScanner');
const FrontendAPIScanner = require('./scanners/FrontendAPIScanner');
const RouteMatcher = require('./matchers/RouteMatcher');
const DatabaseVerifier = require('./verifiers/DatabaseVerifier');
const EndpointVerifier = require('./verifiers/EndpointVerifier');
const ModuleStructureVerifier = require('./verifiers/ModuleStructureVerifier');
const ReportGenerator = require('./reporters/ReportGenerator');
const AuditOrchestrator = require('./AuditOrchestrator');

module.exports = {
  config,
  logger,
  models,
  BackendRouteScanner,
  FrontendAPIScanner,
  RouteMatcher,
  DatabaseVerifier,
  EndpointVerifier,
  ModuleStructureVerifier,
  ReportGenerator,
  AuditOrchestrator
};
