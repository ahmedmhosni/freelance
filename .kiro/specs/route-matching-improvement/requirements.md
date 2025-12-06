# Requirements Document

## Introduction

This feature aims to improve the route matching system in the audit tool to achieve a 95%+ match rate between frontend API calls and backend routes. Currently, the system has 99/150 matched routes (66.0%), with 51 unmatched backend routes. Analysis shows that many of these unmatched routes are actually being called by the frontend but aren't being detected due to limitations in the route matching algorithm.

## Glossary

- **Route Matcher**: The component in the audit tool that compares frontend API calls with backend route definitions to identify matches
- **Path Parameter**: A dynamic segment in a URL path (e.g., `:id`, `:taskId`) that represents a variable value
- **Query Parameter**: URL parameters passed after the `?` symbol (e.g., `?status=active&page=1`)
- **Match Rate**: The percentage of backend routes that have corresponding frontend API calls
- **Audit Tool**: The system that scans both frontend and backend code to discover and match routes
- **Core Module Routes**: Routes belonging to primary business modules (tasks, projects, invoices, clients, notifications, time-tracking)

## Requirements

### Requirement 1

**User Story:** As a developer, I want the route matcher to correctly identify matches between frontend API calls and backend routes with path parameters, so that I can see accurate route coverage metrics.

#### Acceptance Criteria

1. WHEN the Route Matcher compares a frontend call `/api/invoices/123` with a backend route `/api/invoices/:id`, THEN the Route Matcher SHALL recognize them as a match
2. WHEN the Route Matcher compares paths with multiple parameters like `/api/time-tracking/duration/task/456` and `/api/time-tracking/duration/task/:taskId`, THEN the Route Matcher SHALL recognize them as a match
3. WHEN the Route Matcher compares paths with different parameter names (e.g., `${id}` vs `:id`), THEN the Route Matcher SHALL normalize both formats and recognize them as equivalent
4. WHEN the Route Matcher encounters nested path parameters, THEN the Route Matcher SHALL correctly match all parameter positions
5. WHEN the Route Matcher processes a route with no path parameters, THEN the Route Matcher SHALL continue to match exactly as before

### Requirement 2

**User Story:** As a developer, I want the route matcher to ignore query parameters when comparing routes, so that routes with different query strings are still recognized as the same endpoint.

#### Acceptance Criteria

1. WHEN the Route Matcher compares `/api/tasks?status=active` with `/api/tasks/`, THEN the Route Matcher SHALL recognize them as a match
2. WHEN the Route Matcher compares routes with multiple query parameters, THEN the Route Matcher SHALL strip all query parameters before comparison
3. WHEN the Route Matcher compares a frontend call with query parameters to a backend route without them, THEN the Route Matcher SHALL match based on the path only
4. WHEN the Route Matcher normalizes paths, THEN the Route Matcher SHALL preserve the base path structure while removing query strings

### Requirement 3

**User Story:** As a developer, I want the route matcher to handle HTTP method variations correctly, so that routes are matched based on both path and method.

#### Acceptance Criteria

1. WHEN the Route Matcher compares routes, THEN the Route Matcher SHALL verify both the path and HTTP method match
2. WHEN the Route Matcher finds a path match but method mismatch, THEN the Route Matcher SHALL report them as unmatched with a reason
3. WHEN the Route Matcher compares methods, THEN the Route Matcher SHALL treat method names case-insensitively
4. WHEN the Route Matcher encounters a frontend call without an explicit method, THEN the Route Matcher SHALL assume GET as the default method

### Requirement 4

**User Story:** As a developer, I want detailed reporting on why routes don't match, so that I can identify and fix matching issues efficiently.

#### Acceptance Criteria

1. WHEN the Route Matcher fails to match a route, THEN the Route Matcher SHALL provide a specific reason (path mismatch, method mismatch, or parameter mismatch)
2. WHEN the Route Matcher generates a report, THEN the Route Matcher SHALL categorize unmatched routes by reason
3. WHEN the Route Matcher identifies potential matches with minor differences, THEN the Route Matcher SHALL suggest possible corrections
4. WHEN the Route Matcher completes analysis, THEN the Route Matcher SHALL output statistics showing improvement from previous runs

### Requirement 5

**User Story:** As a developer, I want the improved route matcher to be backward compatible, so that existing matched routes remain matched after the update.

#### Acceptance Criteria

1. WHEN the Route Matcher is updated, THEN the Route Matcher SHALL maintain all previously matched routes as matched
2. WHEN the Route Matcher processes the existing route database, THEN the Route Matcher SHALL not break any existing matches
3. WHEN the Route Matcher runs on the current codebase, THEN the Route Matcher SHALL increase the match count without decreasing it
4. WHEN the Route Matcher completes, THEN the Route Matcher SHALL validate that the match rate has improved or stayed the same

### Requirement 6

**User Story:** As a developer, I want to validate the improved matcher against known route pairs, so that I can ensure the matching algorithm works correctly.

#### Acceptance Criteria

1. WHEN the Route Matcher is tested, THEN the Route Matcher SHALL correctly match all 18 core module routes identified in the analysis
2. WHEN the Route Matcher is tested against auth routes, THEN the Route Matcher SHALL correctly match the 4 auth routes
3. WHEN the Route Matcher runs on the full codebase, THEN the Route Matcher SHALL achieve at least 82% match rate (124/150 routes)
4. WHEN the Route Matcher completes validation, THEN the Route Matcher SHALL generate a report showing before/after comparison
