# Report Generator

The Report Generator is responsible for creating comprehensive audit reports in Markdown format.

## Overview

The `ReportGenerator` class provides methods to generate various types of audit reports:

1. **Summary Report** - High-level overview with key metrics
2. **Route Report** - Detailed inventory of all routes and API calls
3. **Issue Report** - Categorized list of detected issues
4. **Fix Tracking Report** - Status tracking for issue resolution
5. **Comprehensive Report** - Combined report with all sections

## Usage

### Basic Usage

```javascript
const ReportGenerator = require('./reporters/ReportGenerator');
const generator = new ReportGenerator();

// Generate summary report
const summaryReport = generator.generateSummaryReport(auditResults);

// Generate route report
const routeReport = generator.generateRouteReport(auditResults);

// Generate issue report
const issueReport = generator.generateIssueReport(auditResults);

// Generate fix tracking report
const fixTrackingReport = generator.generateFixTrackingReport(auditResults.issues);

// Generate comprehensive report
const comprehensiveReport = generator.generateComprehensiveReport(
  auditResults,
  {
    version: '1.0.0',
    environment: 'production',
    auditType: 'full'
  }
);
```

### Saving Reports to Files

```javascript
const fs = require('fs');
const path = require('path');

// Create reports directory
const reportsDir = path.join(__dirname, '../reports');
fs.mkdirSync(reportsDir, { recursive: true });

// Generate and save reports
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPrefix = `audit-${timestamp}`;

fs.writeFileSync(
  path.join(reportsDir, `${reportPrefix}-summary.md`),
  generator.generateSummaryReport(auditResults)
);

fs.writeFileSync(
  path.join(reportsDir, `${reportPrefix}-routes.md`),
  generator.generateRouteReport(auditResults)
);

fs.writeFileSync(
  path.join(reportsDir, `${reportPrefix}-issues.md`),
  generator.generateIssueReport(auditResults)
);

fs.writeFileSync(
  path.join(reportsDir, `${reportPrefix}-fix-tracking.md`),
  generator.generateFixTrackingReport(auditResults.issues)
);

fs.writeFileSync(
  path.join(reportsDir, `${reportPrefix}-comprehensive.md`),
  generator.generateComprehensiveReport(auditResults, metadata)
);
```

## Report Types

### 1. Summary Report

Provides a quick overview with:
- Overall system health status
- Route discovery metrics
- Verification test results
- Issue counts by severity
- Recommendations

**Use case:** Quick health check, executive summary

### 2. Route Report

Provides detailed route inventory with:
- All modular routes grouped by module
- All legacy routes
- Frontend-backend matches
- Unmatched routes and API calls

**Use case:** Route documentation, integration verification

### 3. Issue Report

Provides detailed issue information with:
- Issues grouped by severity
- Issue descriptions and locations
- Related routes
- Suggested fixes

**Use case:** Bug tracking, issue resolution

### 4. Fix Tracking Report

Provides issue resolution tracking with:
- Issues grouped by status (Open, In Progress, Resolved, Won't Fix)
- Fix timestamps and descriptions
- Commit hashes and authors
- Resolution history

**Use case:** Progress tracking, team coordination

### 5. Comprehensive Report

Combines all sections with:
- Report metadata (version, environment, audit type)
- Executive summary
- All key metrics
- References to detailed reports

**Use case:** Stakeholder reviews, documentation

## Issue Management

### Marking Issues as Resolved

```javascript
const resolvedIssue = generator.markIssueResolved(issue, {
  description: 'Fixed validation rules to accept valid formats',
  commit: 'abc123def456',
  author: 'John Doe'
});
```

### Updating Issue Status

```javascript
const updatedIssue = generator.updateIssueStatus(issue, 'IN_PROGRESS');
```

## Report Formatting

### Status Icons

- ✅ Success / Good
- ⚠️ Warning / Needs Attention
- ❌ Error / Critical
- ℹ️ Information

### Severity Icons

- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🟢 Low

### Status Icons (Fix Tracking)

- 📋 Open
- 🔄 In Progress
- ✅ Resolved
- 🚫 Won't Fix

### Auth Icons

- 🔒 Requires Authentication
- 🔓 Public Access

## Example Output

See `example-usage.js` for a complete example that generates all report types with sample data.

To run the example:

```bash
node reporters/example-usage.js
```

## Report Templates

See `REPORT_TEMPLATES.md` for detailed documentation of all report structures and templates.

## Best Practices

1. **Generate all report types** - Each serves a different purpose
2. **Include metadata** - Always provide version, environment, and audit type
3. **Archive reports** - Keep historical reports for comparison
4. **Update fix tracking** - Mark issues as resolved when fixes are applied
5. **Review regularly** - Generate reports after significant changes

## API Reference

### ReportGenerator

#### Methods

##### `generateSummaryReport(results)`

Generates a high-level summary report.

**Parameters:**
- `results` (AuditResults) - Audit results object

**Returns:** String (Markdown formatted report)

##### `generateRouteReport(results)`

Generates a detailed route inventory report.

**Parameters:**
- `results` (AuditResults) - Audit results object

**Returns:** String (Markdown formatted report)

##### `generateIssueReport(results)`

Generates a categorized issue report.

**Parameters:**
- `results` (AuditResults) - Audit results object

**Returns:** String (Markdown formatted report)

##### `generateFixTrackingReport(issues)`

Generates a fix tracking report.

**Parameters:**
- `issues` (Issue[]) - Array of issues

**Returns:** String (Markdown formatted report)

##### `generateComprehensiveReport(results, metadata)`

Generates a comprehensive report with all sections.

**Parameters:**
- `results` (AuditResults) - Audit results object
- `metadata` (Object) - Report metadata
  - `version` (string) - Application version
  - `environment` (string) - Environment name
  - `auditType` (string) - Type of audit

**Returns:** String (Markdown formatted report)

##### `markIssueResolved(issue, fixInfo)`

Marks an issue as resolved and records fix information.

**Parameters:**
- `issue` (Issue) - Issue to mark as resolved
- `fixInfo` (Object) - Fix information
  - `description` (string) - Description of the fix
  - `commit` (string, optional) - Git commit hash
  - `author` (string, optional) - Person who applied the fix

**Returns:** Issue (Updated issue object)

##### `updateIssueStatus(issue, newStatus)`

Updates the status of an issue.

**Parameters:**
- `issue` (Issue) - Issue to update
- `newStatus` (string) - New status ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX')

**Returns:** Issue (Updated issue object)

## Testing

The Report Generator has comprehensive property-based tests:

- **Property 17: Verification Report Completeness** - Ensures all tested endpoints appear in reports
- **Property 19: Issue Resolution Tracking** - Ensures fix tracking works correctly

Run tests:

```bash
npm test -- verification-report-completeness.property.test.js
npm test -- issue-resolution-tracking.property.test.js
```

## Contributing

When adding new report types or modifying existing ones:

1. Update the `ReportGenerator` class
2. Add corresponding tests
3. Update `REPORT_TEMPLATES.md` with the new template
4. Update this README with usage examples
5. Run all tests to ensure nothing breaks

## License

Part of the Full System Audit Tool.
