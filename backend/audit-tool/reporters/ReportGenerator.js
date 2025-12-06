/**
 * ReportGenerator - Generates comprehensive audit reports in markdown format
 */

const { createIssue } = require('../models/Issue');

class ReportGenerator {
  /**
   * Generates a high-level summary report
   * @param {import('../models/AuditResults').AuditResults} results - Audit results
   * @returns {string} Markdown formatted summary report
   */
  generateSummaryReport(results) {
    const { summary, timestamp } = results;
    
    // Calculate percentages
    const matchPercentage = summary.totalRoutes > 0 
      ? ((summary.matchedRoutes / summary.totalRoutes) * 100).toFixed(1)
      : 0;
    
    const passPercentage = (summary.passedTests + summary.failedTests) > 0
      ? ((summary.passedTests / (summary.passedTests + summary.failedTests)) * 100).toFixed(1)
      : 0;
    
    // Determine overall status
    const overallStatus = this._getOverallStatus(summary);
    const statusIcon = this._getStatusIcon(overallStatus);
    
    let report = `# Audit Summary Report\n\n`;
    report += `**Generated:** ${new Date(timestamp).toLocaleString()}\n\n`;
    report += `## Overall Status: ${statusIcon} ${overallStatus}\n\n`;
    
    report += `---\n\n`;
    
    // Route Discovery Section
    report += `## 📍 Route Discovery\n\n`;
    report += `| Metric | Count | Status |\n`;
    report += `|--------|-------|--------|\n`;
    report += `| Total Routes | ${summary.totalRoutes} | ${this._getCountIcon(summary.totalRoutes)} |\n`;
    report += `| Frontend API Calls | ${summary.totalFrontendCalls} | ${this._getCountIcon(summary.totalFrontendCalls)} |\n`;
    report += `| Matched Routes | ${summary.matchedRoutes} (${matchPercentage}%) | ${this._getMatchIcon(matchPercentage)} |\n`;
    report += `| Unmatched Routes | ${summary.unmatchedRoutes} | ${this._getUnmatchedIcon(summary.unmatchedRoutes)} |\n\n`;
    
    // Verification Section
    report += `## 🧪 Verification Results\n\n`;
    report += `| Metric | Count | Status |\n`;
    report += `|--------|-------|--------|\n`;
    report += `| Tests Passed | ${summary.passedTests} (${passPercentage}%) | ${this._getTestIcon(passPercentage)} |\n`;
    report += `| Tests Failed | ${summary.failedTests} | ${summary.failedTests === 0 ? '✅' : '❌'} |\n\n`;
    
    // Issues Section
    report += `## 🔍 Issues Detected\n\n`;
    
    if (summary.issues === 0) {
      report += `✅ **No issues detected!**\n\n`;
    } else {
      const issuesBySeverity = this._groupIssuesBySeverity(results.issues);
      
      report += `| Severity | Count | Status |\n`;
      report += `|----------|-------|--------|\n`;
      report += `| 🔴 Critical | ${issuesBySeverity.CRITICAL} | ${issuesBySeverity.CRITICAL === 0 ? '✅' : '❌'} |\n`;
      report += `| 🟠 High | ${issuesBySeverity.HIGH} | ${issuesBySeverity.HIGH === 0 ? '✅' : '⚠️'} |\n`;
      report += `| 🟡 Medium | ${issuesBySeverity.MEDIUM} | ${issuesBySeverity.MEDIUM === 0 ? '✅' : '⚠️'} |\n`;
      report += `| 🟢 Low | ${issuesBySeverity.LOW} | ${issuesBySeverity.LOW === 0 ? '✅' : 'ℹ️'} |\n`;
      report += `| **Total** | **${summary.issues}** | ${summary.issues === 0 ? '✅' : '⚠️'} |\n\n`;
    }
    
    // Recommendations
    report += `---\n\n`;
    report += `## 💡 Recommendations\n\n`;
    report += this._generateRecommendations(summary, results.issues);
    
    return report;
  }

  /**
   * Groups issues by severity
   * @param {import('../models/Issue').Issue[]} issues - Issues array
   * @returns {Object} Issues grouped by severity
   * @private
   */
  _groupIssuesBySeverity(issues) {
    return {
      CRITICAL: issues.filter(i => i.severity === 'CRITICAL').length,
      HIGH: issues.filter(i => i.severity === 'HIGH').length,
      MEDIUM: issues.filter(i => i.severity === 'MEDIUM').length,
      LOW: issues.filter(i => i.severity === 'LOW').length
    };
  }

  /**
   * Determines overall audit status
   * @param {Object} summary - Summary statistics
   * @returns {string} Status description
   * @private
   */
  _getOverallStatus(summary) {
    const criticalIssues = summary.issues > 0;
    const lowMatchRate = summary.totalRoutes > 0 && (summary.matchedRoutes / summary.totalRoutes) < 0.8;
    const highFailureRate = (summary.passedTests + summary.failedTests) > 0 && 
                            (summary.failedTests / (summary.passedTests + summary.failedTests)) > 0.2;
    
    if (criticalIssues || lowMatchRate || highFailureRate) {
      return 'NEEDS ATTENTION';
    } else if (summary.unmatchedRoutes > 0 || summary.failedTests > 0) {
      return 'GOOD WITH WARNINGS';
    } else {
      return 'EXCELLENT';
    }
  }

  /**
   * Gets status icon
   * @param {string} status - Status string
   * @returns {string} Icon
   * @private
   */
  _getStatusIcon(status) {
    switch (status) {
      case 'EXCELLENT': return '✅';
      case 'GOOD WITH WARNINGS': return '⚠️';
      case 'NEEDS ATTENTION': return '❌';
      default: return 'ℹ️';
    }
  }

  /**
   * Gets icon for count metrics
   * @param {number} count - Count value
   * @returns {string} Icon
   * @private
   */
  _getCountIcon(count) {
    return count > 0 ? '✅' : '⚠️';
  }

  /**
   * Gets icon for match percentage
   * @param {number} percentage - Match percentage
   * @returns {string} Icon
   * @private
   */
  _getMatchIcon(percentage) {
    if (percentage >= 95) return '✅';
    if (percentage >= 80) return '⚠️';
    return '❌';
  }

  /**
   * Gets icon for unmatched count
   * @param {number} count - Unmatched count
   * @returns {string} Icon
   * @private
   */
  _getUnmatchedIcon(count) {
    if (count === 0) return '✅';
    if (count <= 5) return '⚠️';
    return '❌';
  }

  /**
   * Gets icon for test pass percentage
   * @param {number} percentage - Pass percentage
   * @returns {string} Icon
   * @private
   */
  _getTestIcon(percentage) {
    if (percentage >= 90) return '✅';
    if (percentage >= 70) return '⚠️';
    return '❌';
  }

  /**
   * Generates recommendations based on audit results
   * @param {Object} summary - Summary statistics
   * @param {import('../models/Issue').Issue[]} issues - Issues array
   * @returns {string} Recommendations text
   * @private
   */
  _generateRecommendations(summary, issues) {
    const recommendations = [];
    
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL').length;
    if (criticalIssues > 0) {
      recommendations.push(`- 🔴 **URGENT:** Address ${criticalIssues} critical issue(s) immediately`);
    }
    
    if (summary.unmatchedRoutes > 5) {
      recommendations.push(`- ⚠️ Review ${summary.unmatchedRoutes} unmatched routes - these may be unused or missing frontend integration`);
    }
    
    if (summary.failedTests > 0) {
      recommendations.push(`- ⚠️ Fix ${summary.failedTests} failing test(s) to ensure system reliability`);
    }
    
    const matchPercentage = summary.totalRoutes > 0 
      ? (summary.matchedRoutes / summary.totalRoutes) * 100
      : 0;
    
    if (matchPercentage < 80) {
      recommendations.push(`- ⚠️ Route matching is at ${matchPercentage.toFixed(1)}% - investigate frontend-backend integration`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- ✅ System is in good health! Continue monitoring for any changes.');
    }
    
    return recommendations.join('\n') + '\n';
  }

  /**
   * Generates detailed route inventory report
   * @param {import('../models/AuditResults').AuditResults} results - Audit results
   * @returns {string} Markdown formatted route report
   */
  generateRouteReport(results) {
    const { routes, matches, timestamp } = results;
    
    let report = `# Detailed Route Inventory Report\n\n`;
    report += `**Generated:** ${new Date(timestamp).toLocaleString()}\n\n`;
    report += `**Total Routes:** ${routes.all.length}\n`;
    report += `**Modular Routes:** ${routes.modular.length}\n`;
    report += `**Legacy Routes:** ${routes.legacy.length}\n\n`;
    
    report += `---\n\n`;
    
    // Table of Contents
    report += `## Table of Contents\n\n`;
    report += `- [Modular Routes](#modular-routes)\n`;
    report += `- [Legacy Routes](#legacy-routes)\n`;
    report += `- [Frontend-Backend Matches](#frontend-backend-matches)\n`;
    report += `- [Unmatched Backend Routes](#unmatched-backend-routes)\n`;
    report += `- [Unmatched Frontend Calls](#unmatched-frontend-calls)\n\n`;
    
    report += `---\n\n`;
    
    // Modular Routes Section
    report += `## Modular Routes\n\n`;
    
    if (routes.modular.length === 0) {
      report += `*No modular routes found.*\n\n`;
    } else {
      // Group by module
      const routesByModule = this._groupRoutesByModule(routes.modular);
      
      for (const [moduleName, moduleRoutes] of Object.entries(routesByModule)) {
        report += `### Module: ${moduleName}\n\n`;
        report += `**Routes:** ${moduleRoutes.length}\n\n`;
        
        report += `| Method | Path | Handler | Auth | Middleware |\n`;
        report += `|--------|------|---------|------|------------|\n`;
        
        for (const route of moduleRoutes) {
          const authIcon = route.requiresAuth ? '🔒' : '🔓';
          const middlewareList = route.middleware.length > 0 
            ? route.middleware.join(', ') 
            : 'none';
          
          report += `| ${route.method} | \`${route.path}\` | ${route.handler} | ${authIcon} | ${middlewareList} |\n`;
        }
        
        report += `\n`;
      }
    }
    
    report += `---\n\n`;
    
    // Legacy Routes Section
    report += `## Legacy Routes\n\n`;
    
    if (routes.legacy.length === 0) {
      report += `*No legacy routes found.*\n\n`;
    } else {
      report += `**Total Legacy Routes:** ${routes.legacy.length}\n\n`;
      
      report += `| Method | Path | Handler | Auth | File |\n`;
      report += `|--------|------|---------|------|------|\n`;
      
      for (const route of routes.legacy) {
        const authIcon = route.requiresAuth ? '🔒' : '🔓';
        const fileName = route.file.split('/').pop();
        
        report += `| ${route.method} | \`${route.path}\` | ${route.handler} | ${authIcon} | ${fileName} |\n`;
      }
      
      report += `\n`;
    }
    
    report += `---\n\n`;
    
    // Frontend-Backend Matches Section
    report += `## Frontend-Backend Matches\n\n`;
    
    if (matches.matched.length === 0) {
      report += `*No matches found.*\n\n`;
    } else {
      report += `**Total Matches:** ${matches.matched.length}\n\n`;
      
      report += `| Frontend Component | Method | Path | Backend Module | Backend Handler |\n`;
      report += `|--------------------|--------|------|----------------|------------------|\n`;
      
      for (const match of matches.matched) {
        const frontend = match.frontend;
        const backend = match.backend;
        
        report += `| ${frontend.component} | ${frontend.method.toUpperCase()} | \`${frontend.path}\` | ${backend.module || 'legacy'} | ${backend.handler} |\n`;
      }
      
      report += `\n`;
    }
    
    report += `---\n\n`;
    
    // Unmatched Backend Routes Section
    report += `## Unmatched Backend Routes\n\n`;
    
    if (matches.unmatchedBackend.length === 0) {
      report += `✅ *All backend routes have corresponding frontend calls.*\n\n`;
    } else {
      report += `⚠️ **${matches.unmatchedBackend.length} backend route(s) without frontend calls**\n\n`;
      report += `*These routes may be unused or missing frontend integration.*\n\n`;
      
      report += `| Method | Path | Module | Handler |\n`;
      report += `|--------|------|--------|----------|\n`;
      
      for (const route of matches.unmatchedBackend) {
        report += `| ${route.method} | \`${route.path}\` | ${route.module || 'legacy'} | ${route.handler} |\n`;
      }
      
      report += `\n`;
    }
    
    report += `---\n\n`;
    
    // Unmatched Frontend Calls Section
    report += `## Unmatched Frontend Calls\n\n`;
    
    if (matches.unmatchedFrontend.length === 0) {
      report += `✅ *All frontend API calls have corresponding backend routes.*\n\n`;
    } else {
      report += `⚠️ **${matches.unmatchedFrontend.length} frontend call(s) without backend routes**\n\n`;
      report += `*These calls may fail at runtime.*\n\n`;
      
      report += `| Component | Method | Path | File | Line |\n`;
      report += `|-----------|--------|------|------|------|\n`;
      
      for (const call of matches.unmatchedFrontend) {
        const fileName = call.file.split('/').pop();
        
        report += `| ${call.component} | ${call.method.toUpperCase()} | \`${call.path}\` | ${fileName} | ${call.line} |\n`;
      }
      
      report += `\n`;
    }
    
    return report;
  }

  /**
   * Groups routes by module
   * @param {import('../models/RouteInfo').RouteInfo[]} routes - Routes array
   * @returns {Object} Routes grouped by module
   * @private
   */
  _groupRoutesByModule(routes) {
    const grouped = {};
    
    for (const route of routes) {
      const moduleName = route.module || 'unknown';
      
      if (!grouped[moduleName]) {
        grouped[moduleName] = [];
      }
      
      grouped[moduleName].push(route);
    }
    
    // Sort routes within each module by path
    for (const moduleName in grouped) {
      grouped[moduleName].sort((a, b) => a.path.localeCompare(b.path));
    }
    
    return grouped;
  }

  /**
   * Generates issue report with categorized issues
   * @param {import('../models/AuditResults').AuditResults} results - Audit results
   * @returns {string} Markdown formatted issue report
   */
  generateIssueReport(results) {
    const { issues, timestamp } = results;
    
    let report = `# Issue Report\n\n`;
    report += `**Generated:** ${new Date(timestamp).toLocaleString()}\n\n`;
    report += `**Total Issues:** ${issues.length}\n\n`;
    
    if (issues.length === 0) {
      report += `✅ **No issues detected!**\n\n`;
      report += `The system audit completed successfully with no problems found.\n`;
      return report;
    }
    
    // Group issues by severity
    const issuesBySeverity = {
      CRITICAL: issues.filter(i => i.severity === 'CRITICAL'),
      HIGH: issues.filter(i => i.severity === 'HIGH'),
      MEDIUM: issues.filter(i => i.severity === 'MEDIUM'),
      LOW: issues.filter(i => i.severity === 'LOW')
    };
    
    report += `---\n\n`;
    
    // Summary by severity
    report += `## Summary by Severity\n\n`;
    report += `| Severity | Count | Icon |\n`;
    report += `|----------|-------|------|\n`;
    report += `| 🔴 Critical | ${issuesBySeverity.CRITICAL.length} | ${issuesBySeverity.CRITICAL.length > 0 ? '❌' : '✅'} |\n`;
    report += `| 🟠 High | ${issuesBySeverity.HIGH.length} | ${issuesBySeverity.HIGH.length > 0 ? '⚠️' : '✅'} |\n`;
    report += `| 🟡 Medium | ${issuesBySeverity.MEDIUM.length} | ${issuesBySeverity.MEDIUM.length > 0 ? '⚠️' : '✅'} |\n`;
    report += `| 🟢 Low | ${issuesBySeverity.LOW.length} | ${issuesBySeverity.LOW.length > 0 ? 'ℹ️' : '✅'} |\n\n`;
    
    report += `---\n\n`;
    
    // Table of Contents
    report += `## Table of Contents\n\n`;
    if (issuesBySeverity.CRITICAL.length > 0) {
      report += `- [🔴 Critical Issues](#-critical-issues)\n`;
    }
    if (issuesBySeverity.HIGH.length > 0) {
      report += `- [🟠 High Priority Issues](#-high-priority-issues)\n`;
    }
    if (issuesBySeverity.MEDIUM.length > 0) {
      report += `- [🟡 Medium Priority Issues](#-medium-priority-issues)\n`;
    }
    if (issuesBySeverity.LOW.length > 0) {
      report += `- [🟢 Low Priority Issues](#-low-priority-issues)\n`;
    }
    report += `\n---\n\n`;
    
    // Critical Issues
    if (issuesBySeverity.CRITICAL.length > 0) {
      report += `## 🔴 Critical Issues\n\n`;
      report += `**Count:** ${issuesBySeverity.CRITICAL.length}\n\n`;
      report += `⚠️ **These issues require immediate attention!**\n\n`;
      
      for (let i = 0; i < issuesBySeverity.CRITICAL.length; i++) {
        report += this._formatIssue(issuesBySeverity.CRITICAL[i], i + 1);
      }
      
      report += `---\n\n`;
    }
    
    // High Priority Issues
    if (issuesBySeverity.HIGH.length > 0) {
      report += `## 🟠 High Priority Issues\n\n`;
      report += `**Count:** ${issuesBySeverity.HIGH.length}\n\n`;
      
      for (let i = 0; i < issuesBySeverity.HIGH.length; i++) {
        report += this._formatIssue(issuesBySeverity.HIGH[i], i + 1);
      }
      
      report += `---\n\n`;
    }
    
    // Medium Priority Issues
    if (issuesBySeverity.MEDIUM.length > 0) {
      report += `## 🟡 Medium Priority Issues\n\n`;
      report += `**Count:** ${issuesBySeverity.MEDIUM.length}\n\n`;
      
      for (let i = 0; i < issuesBySeverity.MEDIUM.length; i++) {
        report += this._formatIssue(issuesBySeverity.MEDIUM[i], i + 1);
      }
      
      report += `---\n\n`;
    }
    
    // Low Priority Issues
    if (issuesBySeverity.LOW.length > 0) {
      report += `## 🟢 Low Priority Issues\n\n`;
      report += `**Count:** ${issuesBySeverity.LOW.length}\n\n`;
      
      for (let i = 0; i < issuesBySeverity.LOW.length; i++) {
        report += this._formatIssue(issuesBySeverity.LOW[i], i + 1);
      }
    }
    
    return report;
  }

  /**
   * Formats a single issue for the report
   * @param {import('../models/Issue').Issue} issue - Issue to format
   * @param {number} index - Issue index within severity group
   * @returns {string} Formatted issue text
   * @private
   */
  _formatIssue(issue, index) {
    let formatted = `### Issue ${index}: ${issue.title}\n\n`;
    
    // Issue metadata
    formatted += `**ID:** \`${issue.id}\`\n`;
    formatted += `**Type:** ${issue.type}\n`;
    formatted += `**Severity:** ${this._getSeverityIcon(issue.severity)} ${issue.severity}\n\n`;
    
    // Description
    formatted += `**Description:**\n\n`;
    formatted += `${issue.description}\n\n`;
    
    // Location
    formatted += `**Location:**\n\n`;
    formatted += `- **File:** \`${issue.location.file}\`\n`;
    if (issue.location.line > 0) {
      formatted += `- **Line:** ${issue.location.line}\n`;
    }
    formatted += `\n`;
    
    // Related routes
    if (issue.relatedRoutes && issue.relatedRoutes.length > 0) {
      formatted += `**Related Routes:**\n\n`;
      for (const route of issue.relatedRoutes) {
        formatted += `- \`${route.method} ${route.path}\` (${route.module || 'legacy'})\n`;
      }
      formatted += `\n`;
    }
    
    // Suggested fix
    if (issue.suggestedFix) {
      formatted += `**Suggested Fix:**\n\n`;
      formatted += `${issue.suggestedFix}\n\n`;
    }
    
    // Reproduction steps (if available in description)
    if (issue.description.includes('Steps to reproduce:')) {
      // Already included in description
    }
    
    formatted += `---\n\n`;
    
    return formatted;
  }

  /**
   * Gets severity icon
   * @param {string} severity - Severity level
   * @returns {string} Icon
   * @private
   */
  _getSeverityIcon(severity) {
    switch (severity) {
      case 'CRITICAL': return '🔴';
      case 'HIGH': return '🟠';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return 'ℹ️';
    }
  }

  /**
   * Generates fix tracking report
   * @param {import('../models/Issue').Issue[]} issues - Issues array
   * @returns {string} Markdown formatted fix tracking report
   */
  generateFixTrackingReport(issues) {
    let report = `# Fix Tracking Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    // Group issues by status
    const issuesByStatus = {
      OPEN: issues.filter(i => i.status === 'OPEN'),
      IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS'),
      RESOLVED: issues.filter(i => i.status === 'RESOLVED'),
      WONT_FIX: issues.filter(i => i.status === 'WONT_FIX')
    };
    
    report += `## Status Summary\n\n`;
    report += `| Status | Count | Percentage |\n`;
    report += `|--------|-------|------------|\n`;
    
    const total = issues.length;
    for (const [status, statusIssues] of Object.entries(issuesByStatus)) {
      const percentage = total > 0 ? ((statusIssues.length / total) * 100).toFixed(1) : 0;
      const icon = this._getStatusIcon(status);
      report += `| ${icon} ${status} | ${statusIssues.length} | ${percentage}% |\n`;
    }
    
    report += `\n---\n\n`;
    
    // Resolved Issues
    if (issuesByStatus.RESOLVED.length > 0) {
      report += `## ✅ Resolved Issues\n\n`;
      report += `**Count:** ${issuesByStatus.RESOLVED.length}\n\n`;
      
      for (const issue of issuesByStatus.RESOLVED) {
        report += this._formatFixedIssue(issue);
      }
      
      report += `---\n\n`;
    }
    
    // In Progress Issues
    if (issuesByStatus.IN_PROGRESS.length > 0) {
      report += `## 🔄 In Progress Issues\n\n`;
      report += `**Count:** ${issuesByStatus.IN_PROGRESS.length}\n\n`;
      
      for (const issue of issuesByStatus.IN_PROGRESS) {
        report += this._formatTrackedIssue(issue);
      }
      
      report += `---\n\n`;
    }
    
    // Open Issues
    if (issuesByStatus.OPEN.length > 0) {
      report += `## 📋 Open Issues\n\n`;
      report += `**Count:** ${issuesByStatus.OPEN.length}\n\n`;
      
      // Group by severity
      const openBySeverity = {
        CRITICAL: issuesByStatus.OPEN.filter(i => i.severity === 'CRITICAL'),
        HIGH: issuesByStatus.OPEN.filter(i => i.severity === 'HIGH'),
        MEDIUM: issuesByStatus.OPEN.filter(i => i.severity === 'MEDIUM'),
        LOW: issuesByStatus.OPEN.filter(i => i.severity === 'LOW')
      };
      
      for (const [severity, severityIssues] of Object.entries(openBySeverity)) {
        if (severityIssues.length > 0) {
          report += `### ${this._getSeverityIcon(severity)} ${severity} Priority\n\n`;
          
          for (const issue of severityIssues) {
            report += this._formatTrackedIssue(issue);
          }
        }
      }
      
      report += `---\n\n`;
    }
    
    // Won't Fix Issues
    if (issuesByStatus.WONT_FIX.length > 0) {
      report += `## 🚫 Won't Fix Issues\n\n`;
      report += `**Count:** ${issuesByStatus.WONT_FIX.length}\n\n`;
      
      for (const issue of issuesByStatus.WONT_FIX) {
        report += this._formatTrackedIssue(issue);
      }
    }
    
    return report;
  }

  /**
   * Formats a fixed issue for the tracking report
   * @param {import('../models/Issue').Issue} issue - Issue to format
   * @returns {string} Formatted issue text
   * @private
   */
  _formatFixedIssue(issue) {
    let formatted = `### ${issue.title}\n\n`;
    formatted += `**ID:** \`${issue.id}\`\n`;
    formatted += `**Severity:** ${this._getSeverityIcon(issue.severity)} ${issue.severity}\n`;
    formatted += `**Type:** ${issue.type}\n\n`;
    
    if (issue.fix) {
      formatted += `**Fix Applied:**\n\n`;
      formatted += `- **Date:** ${new Date(issue.fix.timestamp).toLocaleString()}\n`;
      formatted += `- **Description:** ${issue.fix.description}\n`;
      
      if (issue.fix.commit) {
        formatted += `- **Commit:** \`${issue.fix.commit}\`\n`;
      }
      
      if (issue.fix.author) {
        formatted += `- **Author:** ${issue.fix.author}\n`;
      }
      
      formatted += `\n`;
    }
    
    formatted += `---\n\n`;
    
    return formatted;
  }

  /**
   * Formats a tracked issue (open or in progress)
   * @param {import('../models/Issue').Issue} issue - Issue to format
   * @returns {string} Formatted issue text
   * @private
   */
  _formatTrackedIssue(issue) {
    let formatted = `### ${issue.title}\n\n`;
    formatted += `**ID:** \`${issue.id}\`\n`;
    formatted += `**Severity:** ${this._getSeverityIcon(issue.severity)} ${issue.severity}\n`;
    formatted += `**Type:** ${issue.type}\n`;
    formatted += `**Created:** ${new Date(issue.createdAt).toLocaleString()}\n`;
    formatted += `**Location:** \`${issue.location.file}\``;
    
    if (issue.location.line > 0) {
      formatted += ` (line ${issue.location.line})`;
    }
    
    formatted += `\n\n`;
    formatted += `---\n\n`;
    
    return formatted;
  }

  /**
   * Gets status icon
   * @param {string} status - Status string
   * @returns {string} Icon
   * @private
   */
  _getStatusIcon(status) {
    switch (status) {
      case 'OPEN': return '📋';
      case 'IN_PROGRESS': return '🔄';
      case 'RESOLVED': return '✅';
      case 'WONT_FIX': return '🚫';
      default: return 'ℹ️';
    }
  }

  /**
   * Marks an issue as resolved
   * @param {import('../models/Issue').Issue} issue - Issue to mark as resolved
   * @param {Object} fixInfo - Fix information
   * @param {string} fixInfo.description - Description of the fix
   * @param {string} [fixInfo.commit] - Git commit hash
   * @param {string} [fixInfo.author] - Person who applied the fix
   * @returns {import('../models/Issue').Issue} Updated issue
   */
  markIssueResolved(issue, fixInfo) {
    return {
      ...issue,
      status: 'RESOLVED',
      fix: {
        timestamp: new Date().toISOString(),
        description: fixInfo.description,
        commit: fixInfo.commit || null,
        author: fixInfo.author || null
      }
    };
  }

  /**
   * Updates issue status
   * @param {import('../models/Issue').Issue} issue - Issue to update
   * @param {string} newStatus - New status
   * @returns {import('../models/Issue').Issue} Updated issue
   */
  updateIssueStatus(issue, newStatus) {
    return {
      ...issue,
      status: newStatus
    };
  }

  /**
   * Generates a comprehensive audit report with all sections
   * @param {import('../models/AuditResults').AuditResults} results - Audit results
   * @param {Object} metadata - Report metadata
   * @param {string} [metadata.version] - Application version
   * @param {string} [metadata.environment] - Environment (dev, staging, production)
   * @param {string} [metadata.auditType] - Type of audit (full, incremental, module-specific)
   * @returns {string} Markdown formatted comprehensive report
   */
  generateComprehensiveReport(results, metadata = {}) {
    const { version = 'unknown', environment = 'unknown', auditType = 'full' } = metadata;
    
    let report = `# Comprehensive Audit Report\n\n`;
    
    // Metadata section
    report += `## Report Metadata\n\n`;
    report += `| Property | Value |\n`;
    report += `|----------|-------|\n`;
    report += `| **Generated** | ${new Date(results.timestamp).toLocaleString()} |\n`;
    report += `| **Application Version** | ${version} |\n`;
    report += `| **Environment** | ${environment} |\n`;
    report += `| **Audit Type** | ${auditType} |\n`;
    report += `| **Report ID** | \`${this._generateReportId()}\` |\n\n`;
    
    report += `---\n\n`;
    
    // Table of Contents
    report += `## Table of Contents\n\n`;
    report += `1. [Executive Summary](#executive-summary)\n`;
    report += `2. [Route Discovery](#route-discovery)\n`;
    report += `3. [Verification Results](#verification-results)\n`;
    report += `4. [Issues Detected](#issues-detected)\n`;
    report += `5. [Detailed Route Inventory](#detailed-route-inventory)\n`;
    report += `6. [Fix Tracking](#fix-tracking)\n`;
    report += `7. [Recommendations](#recommendations)\n\n`;
    
    report += `---\n\n`;
    
    // Executive Summary
    report += `## Executive Summary\n\n`;
    report += this._generateExecutiveSummary(results);
    
    report += `---\n\n`;
    
    // Route Discovery
    report += `## Route Discovery\n\n`;
    report += this._generateRouteDiscoverySection(results);
    
    report += `---\n\n`;
    
    // Verification Results
    report += `## Verification Results\n\n`;
    report += this._generateVerificationSection(results);
    
    report += `---\n\n`;
    
    // Issues Detected
    report += `## Issues Detected\n\n`;
    report += this._generateIssuesSummarySection(results);
    
    report += `---\n\n`;
    
    // Detailed Route Inventory (reference)
    report += `## Detailed Route Inventory\n\n`;
    report += `For a complete route inventory, see the separate **Route Report**.\n\n`;
    report += `**Quick Stats:**\n`;
    report += `- Total Routes: ${results.routes.all.length}\n`;
    report += `- Modular Routes: ${results.routes.modular.length}\n`;
    report += `- Legacy Routes: ${results.routes.legacy.length}\n\n`;
    
    report += `---\n\n`;
    
    // Fix Tracking (reference)
    report += `## Fix Tracking\n\n`;
    report += `For detailed fix tracking, see the separate **Fix Tracking Report**.\n\n`;
    
    const issuesByStatus = this._groupIssuesByStatus(results.issues);
    report += `**Status Overview:**\n`;
    report += `- Open: ${issuesByStatus.OPEN}\n`;
    report += `- In Progress: ${issuesByStatus.IN_PROGRESS}\n`;
    report += `- Resolved: ${issuesByStatus.RESOLVED}\n`;
    report += `- Won't Fix: ${issuesByStatus.WONT_FIX}\n\n`;
    
    report += `---\n\n`;
    
    // Recommendations
    report += `## Recommendations\n\n`;
    report += this._generateRecommendations(results.summary, results.issues);
    
    report += `---\n\n`;
    
    // Footer
    report += `## Report Information\n\n`;
    report += `This report was automatically generated by the Full System Audit Tool.\n\n`;
    report += `**Next Steps:**\n`;
    report += `1. Review critical and high-priority issues\n`;
    report += `2. Address unmatched routes and API calls\n`;
    report += `3. Fix failing tests\n`;
    report += `4. Re-run audit to verify fixes\n\n`;
    report += `For questions or issues with this report, please contact the development team.\n`;
    
    return report;
  }

  /**
   * Generates executive summary section
   * @param {import('../models/AuditResults').AuditResults} results - Audit results
   * @returns {string} Executive summary text
   * @private
   */
  _generateExecutiveSummary(results) {
    const { summary } = results;
    const overallStatus = this._getOverallStatus(summary);
    const statusIcon = this._getStatusIcon(overallStatus);
    
    let text = `**Overall System Health:** ${statusIcon} ${overallStatus}\n\n`;
    
    const matchPercentage = summary.totalRoutes > 0 
      ? ((summary.matchedRoutes / summary.totalRoutes) * 100).toFixed(1)
      : 0;
    
    const passPercentage = (summary.passedTests + summary.failedTests) > 0
      ? ((summary.passedTests / (summary.passedTests + summary.failedTests)) * 100).toFixed(1)
      : 0;
    
    text += `The audit discovered **${summary.totalRoutes} backend routes** and **${summary.totalFrontendCalls} frontend API calls**. `;
    text += `Route matching achieved **${matchPercentage}%** coverage with **${summary.matchedRoutes}** successful matches. `;
    text += `Verification testing resulted in **${passPercentage}%** pass rate with **${summary.passedTests}** passing tests and **${summary.failedTests}** failures. `;
    
    if (summary.issues > 0) {
      const criticalCount = results.issues.filter(i => i.severity === 'CRITICAL').length;
      if (criticalCount > 0) {
        text += `\n\n⚠️ **ATTENTION REQUIRED:** ${criticalCount} critical issue(s) detected that require immediate action.`;
      }
    } else {
      text += `\n\n✅ No issues were detected during the audit.`;
    }
    
    return text + '\n';
  }

  /**
   * Generates route discovery section
   * @param {import('../models/AuditResults').AuditResults} results - Audit results
   * @returns {string} Route discovery text
   * @private
   */
  _generateRouteDiscoverySection(results) {
    const { summary } = results;
    
    let text = `The audit discovered a total of **${summary.totalRoutes}** backend routes:\n\n`;
    text += `- **Modular Routes:** ${results.routes.modular.length}\n`;
    text += `- **Legacy Routes:** ${results.routes.legacy.length}\n\n`;
    
    text += `Frontend analysis identified **${summary.totalFrontendCalls}** API calls.\n\n`;
    
    text += `**Matching Results:**\n`;
    text += `- ✅ Matched: ${summary.matchedRoutes}\n`;
    text += `- ⚠️ Unmatched Backend Routes: ${results.matches.unmatchedBackend.length}\n`;
    text += `- ⚠️ Unmatched Frontend Calls: ${results.matches.unmatchedFrontend.length}\n`;
    
    return text + '\n';
  }

  /**
   * Generates verification section
   * @param {import('../models/AuditResults').AuditResults} results - Audit results
   * @returns {string} Verification text
   * @private
   */
  _generateVerificationSection(results) {
    const { summary } = results;
    const totalTests = summary.passedTests + summary.failedTests;
    
    let text = `A total of **${totalTests}** verification tests were executed:\n\n`;
    text += `- ✅ Passed: ${summary.passedTests}\n`;
    text += `- ❌ Failed: ${summary.failedTests}\n\n`;
    
    if (results.verificationResults.length > 0) {
      const avgResponseTime = results.verificationResults.reduce((sum, r) => sum + r.responseTime, 0) / results.verificationResults.length;
      text += `**Average Response Time:** ${avgResponseTime.toFixed(2)}ms\n`;
    }
    
    return text + '\n';
  }

  /**
   * Generates issues summary section
   * @param {import('../models/AuditResults').AuditResults} results - Audit results
   * @returns {string} Issues summary text
   * @private
   */
  _generateIssuesSummarySection(results) {
    const { issues } = results;
    
    if (issues.length === 0) {
      return `✅ **No issues detected!**\n\nThe system audit completed successfully with no problems found.\n`;
    }
    
    const issuesBySeverity = this._groupIssuesBySeverity(issues);
    
    let text = `A total of **${issues.length}** issue(s) were detected:\n\n`;
    text += `- 🔴 Critical: ${issuesBySeverity.CRITICAL}\n`;
    text += `- 🟠 High: ${issuesBySeverity.HIGH}\n`;
    text += `- 🟡 Medium: ${issuesBySeverity.MEDIUM}\n`;
    text += `- 🟢 Low: ${issuesBySeverity.LOW}\n\n`;
    
    text += `For detailed issue information, see the separate **Issue Report**.\n`;
    
    return text + '\n';
  }

  /**
   * Groups issues by status
   * @param {import('../models/Issue').Issue[]} issues - Issues array
   * @returns {Object} Issues grouped by status
   * @private
   */
  _groupIssuesByStatus(issues) {
    return {
      OPEN: issues.filter(i => i.status === 'OPEN').length,
      IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS').length,
      RESOLVED: issues.filter(i => i.status === 'RESOLVED').length,
      WONT_FIX: issues.filter(i => i.status === 'WONT_FIX').length
    };
  }

  /**
   * Generates a unique report ID
   * @returns {string} Report ID
   * @private
   */
  _generateReportId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `audit-${timestamp}-${random}`;
  }
}

module.exports = ReportGenerator;
