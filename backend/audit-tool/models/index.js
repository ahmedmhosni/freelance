/**
 * Data models for the audit tool
 */

const { createRouteInfo } = require('./RouteInfo');
const { createAPICallInfo } = require('./APICallInfo');
const { createVerificationResult } = require('./VerificationResult');
const { createIssue } = require('./Issue');
const { createAuditResults } = require('./AuditResults');

module.exports = {
  createRouteInfo,
  createAPICallInfo,
  createVerificationResult,
  createIssue,
  createAuditResults
};
