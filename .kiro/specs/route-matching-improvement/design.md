# Design Document

## Overview

This design improves the route matching system in the audit tool to achieve 95%+ match rate between frontend API calls and backend routes. The current implementation already has good foundations with path normalization and parameter detection, but needs enhancements to handle more complex matching scenarios that are causing 51 routes to remain unmatched.

The key insight from the analysis is that many unmatched routes (particularly the 18 core module routes) are likely being called by the frontend but aren't being detected due to subtle differences in how paths are represented. By improving the matching algorithm's intelligence while maintaining backward compatibility, we can significantly increase the match rate.

## Architecture

The route matching system consists of three main components:

1. **RouteMatcher** - Orchestrates the matching process between frontend calls and backend routes
2. **pathNormalizer** - Provides utilities for normalizing and comparing paths
3. **Scanners** - Discover routes from frontend and backend code (not modified in this design)

The improvements will focus on enhancing the pathNormalizer utilities and adding better reporting to RouteMatcher.

### Current Flow

```
Frontend Calls → RouteMatcher.matchRoutes() → pathsMatch() → comparePathSegments() → Match Result
Backend Routes ↗
```

### Enhanced Flow

```
Frontend Calls → RouteMatcher.matchRoutes() → Enhanced pathsMatch() → Match Result + Reason
Backend Routes ↗                                    ↓
                                          Detailed Mismatch Analysis
```

## Components and Interfaces

### Enhanced pathNormalizer Module

The pathNormalizer module will be enhanced with improved parameter detection and query string handling.

**Current Interface (maintained):**
```javascript
{
  normalizePath(path: string): string
  pathsMatch(path1: string, path2: string): boolean
  isParameter(segment: string): boolean
  // ... other existing functions
}
```

**Enhanced Functions:**

```javascript
/**
 * Enhanced normalizePath - Now handles more edge cases
 * - Strips query parameters (already implemented)
 * - Strips hash fragments (already implemented)
 * - Handles template literals like ${id}
 * - Normalizes trailing slashes
 */
function normalizePath(path: string): string

/**
 * Enhanced isParameter - Detects more parameter formats
 * - Express-style: :id, :userId (already supported)
 * - Template literals: ${id}, ${userId}
 * - Numeric IDs (already supported)
 * - UUIDs (already supported)
 * - MongoDB ObjectIds (already supported)
 */
function isParameter(segment: string): boolean

/**
 * New function: Extracts parameter names from path
 * Returns array of parameter names found in path
 * Example: "/api/tasks/:id/comments/:commentId" → ["id", "commentId"]
 */
function extractParameterNames(path: string): string[]

/**
 * New function: Compares paths with detailed mismatch reason
 * Returns { match: boolean, reason: string }
 */
function pathsMatchWithReason(path1: string, path2: string): MatchResult
```

### Enhanced RouteMatcher Class

The RouteMatcher will be enhanced to provide detailed mismatch reporting.

**Current Interface (maintained):**
```javascript
class RouteMatcher {
  matchRoutes(frontendCalls, backendRoutes): MatchResult
  detectDuplicatePrefixes(calls): DuplicateIssue[]
}
```

**Enhanced Interface:**

```javascript
class RouteMatcher {
  // Existing method - enhanced internally
  matchRoutes(frontendCalls, backendRoutes): EnhancedMatchResult
  
  // Existing method - maintained
  detectDuplicatePrefixes(calls): DuplicateIssue[]
  
  // New method: Provides detailed analysis of why routes don't match
  analyzeUnmatchedRoutes(unmatchedFrontend, unmatchedBackend): UnmatchedAnalysis
  
  // New method: Suggests potential matches for unmatched routes
  suggestMatches(unmatchedFrontend, unmatchedBackend): MatchSuggestion[]
}
```

### Data Models

**EnhancedMatchResult:**
```javascript
{
  matched: Array<{
    frontend: APICallInfo,
    backend: RouteInfo,
    confidence: 'exact' | 'parameter-match' | 'normalized'
  }>,
  unmatchedFrontend: Array<APICallInfo>,
  unmatchedBackend: Array<RouteInfo>,
  statistics: {
    totalFrontend: number,
    totalBackend: number,
    matchedCount: number,
    matchRate: number,
    improvementFromPrevious: number
  },
  analysis: UnmatchedAnalysis
}
```

**UnmatchedAnalysis:**
```javascript
{
  byReason: {
    'method-mismatch': Array<{frontend, backend, details}>,
    'path-structure-mismatch': Array<{frontend, backend, details}>,
    'parameter-count-mismatch': Array<{frontend, backend, details}>,
    'no-candidate': Array<{route, type: 'frontend' | 'backend'}>
  },
  suggestions: Array<MatchSuggestion>
}
```

**MatchSuggestion:**
```javascript
{
  frontend: APICallInfo,
  backend: RouteInfo,
  similarity: number, // 0-1 score
  reason: string,
  suggestedAction: string
}
```

## Data Models

### APICallInfo (existing, not modified)
```javascript
{
  method: string,
  path: string,
  fullPath: string,
  file: string,
  line: number,
  hasBaseURL: boolean
}
```

### RouteInfo (existing, not modified)
```javascript
{
  method: string,
  path: string,
  file: string,
  line: number,
  controller: string,
  handler: string
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Path parameter matching

*For any* path containing numeric IDs, UUIDs, or ObjectIds, when compared with a path containing Express-style parameters (`:id`, `:userId`, etc.) or template literal parameters (`${id}`, `${userId}`, etc.) in the same positions, the paths should match.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Exact match preservation

*For any* two paths without parameters, when compared, they should match if and only if they are identical after normalization (ignoring trailing slashes, query parameters, and case differences in /api prefix).

**Validates: Requirements 1.5**

### Property 3: Query parameter independence

*For any* path with query parameters, when normalized, the resulting path should be identical to the same path without query parameters.

**Validates: Requirements 2.1, 2.4**

### Property 4: Method matching requirement

*For any* two routes with matching paths, they should be considered matched if and only if their HTTP methods also match (case-insensitively).

**Validates: Requirements 3.1**

### Property 5: Method mismatch reporting

*For any* two routes where paths match but methods differ, the matcher should report them as unmatched with reason "method-mismatch".

**Validates: Requirements 3.2**

### Property 6: Case-insensitive method comparison

*For any* HTTP method string, when compared with the same method in different case (e.g., "GET" vs "get" vs "Get"), they should be considered equal.

**Validates: Requirements 3.3**

### Property 7: Unmatched route categorization

*For any* set of unmatched routes, the analysis should categorize each route into exactly one category: method-mismatch, path-structure-mismatch, parameter-count-mismatch, or no-candidate.

**Validates: Requirements 4.1, 4.2**

### Property 8: Match suggestion generation

*For any* unmatched route, if there exists another route with similarity score > 0.7, a suggestion should be generated.

**Validates: Requirements 4.3**

### Property 9: Statistics completeness

*For any* match result, the statistics object should contain all required fields: totalFrontend, totalBackend, matchedCount, matchRate, and improvementFromPrevious.

**Validates: Requirements 4.4**

## Error Handling

### Path Normalization Errors

- **Invalid input types**: If `normalizePath()` receives non-string input, return empty string
- **Malformed URLs**: If path contains invalid characters, normalize what's possible and log warning
- **Empty paths**: Treat empty paths as "/" after normalization

### Matching Errors

- **Null/undefined routes**: Skip routes with missing required fields (method, path) and log warning
- **Circular references**: Not applicable - routes are simple objects
- **Performance issues**: If matching takes > 10 seconds, log warning and continue

### Reporting Errors

- **Missing data**: If statistics cannot be calculated, use 0 as default and mark as incomplete
- **Suggestion generation failures**: If similarity calculation fails, skip suggestion and log error

## Testing Strategy

### Unit Testing

We will use **Jest** as the testing framework for unit tests.

Unit tests will cover:

1. **Path normalization edge cases**
   - Empty strings, null, undefined
   - Paths with multiple query parameters
   - Paths with hash fragments
   - Paths with template literals
   - Paths with mixed parameter formats

2. **Parameter detection**
   - Express-style parameters (`:id`)
   - Template literals (`${id}`)
   - Numeric IDs
   - UUIDs
   - MongoDB ObjectIds
   - Non-parameter segments

3. **Method comparison**
   - Case variations (GET, get, Get)
   - Default method handling
   - Invalid methods

4. **Report structure**
   - Statistics object completeness
   - Category structure
   - Suggestion format

### Property-Based Testing

We will use **fast-check** as the property-based testing library for JavaScript.

Each property-based test will run a minimum of 100 iterations to ensure thorough coverage.

Property-based tests will verify:

1. **Property 1: Path parameter matching**
   - Generate random paths with parameters
   - Generate corresponding paths with IDs
   - Verify they match
   - **Feature: route-matching-improvement, Property 1: Path parameter matching**

2. **Property 2: Exact match preservation**
   - Generate random paths without parameters
   - Verify they only match themselves
   - **Feature: route-matching-improvement, Property 2: Exact match preservation**

3. **Property 3: Query parameter independence**
   - Generate random paths
   - Add random query parameters
   - Verify normalization produces same result
   - **Feature: route-matching-improvement, Property 3: Query parameter independence**

4. **Property 4: Method matching requirement**
   - Generate random routes with matching paths
   - Vary methods
   - Verify match only when methods match
   - **Feature: route-matching-improvement, Property 4: Method matching requirement**

5. **Property 5: Method mismatch reporting**
   - Generate routes with matching paths, different methods
   - Verify reason is "method-mismatch"
   - **Feature: route-matching-improvement, Property 5: Method mismatch reporting**

6. **Property 6: Case-insensitive method comparison**
   - Generate random method strings
   - Vary case
   - Verify they match
   - **Feature: route-matching-improvement, Property 6: Case-insensitive method comparison**

7. **Property 7: Unmatched route categorization**
   - Generate random unmatched routes
   - Verify each has exactly one category
   - **Feature: route-matching-improvement, Property 7: Unmatched route categorization**

8. **Property 8: Match suggestion generation**
   - Generate similar routes
   - Verify suggestions are generated
   - **Feature: route-matching-improvement, Property 8: Match suggestion generation**

9. **Property 9: Statistics completeness**
   - Generate random match results
   - Verify statistics object has all fields
   - **Feature: route-matching-improvement, Property 9: Statistics completeness**

### Integration Testing

Integration tests will verify:

1. **End-to-end matching** - Run matcher on real frontend/backend route data
2. **Backward compatibility** - Verify existing matches are preserved
3. **Performance** - Ensure matching completes in reasonable time (< 5 seconds for 150 routes)
4. **Report generation** - Verify complete reports are generated with all sections

### Validation Testing

Validation tests will use the actual codebase data:

1. **Core module routes** - Verify all 18 core module routes match
2. **Auth routes** - Verify all 4 auth routes match
3. **Match rate target** - Verify at least 82% match rate (124/150 routes)
4. **Before/after comparison** - Verify improvement from current 66% match rate

## Implementation Notes

### Backward Compatibility

To ensure backward compatibility:

1. **Maintain existing function signatures** - All public functions keep same parameters and return types
2. **Additive changes only** - New functions added, existing functions enhanced internally
3. **Default behavior preserved** - Routes that currently match will continue to match
4. **Opt-in enhancements** - New features (detailed reporting) are additions, not replacements

### Performance Considerations

1. **Caching normalized paths** - Cache normalization results to avoid repeated computation
2. **Early exit on exact match** - Check exact match before parameter matching
3. **Limit suggestion generation** - Only generate suggestions for routes with similarity > 0.5
4. **Batch processing** - Process routes in batches if count exceeds 1000

### Migration Path

1. **Phase 1**: Enhance pathNormalizer utilities (no breaking changes)
2. **Phase 2**: Update RouteMatcher to use enhanced utilities
3. **Phase 3**: Add detailed reporting and suggestions
4. **Phase 4**: Validate against real codebase data

## Dependencies

- **fast-check** (^3.15.0) - Property-based testing library
- **jest** (existing) - Unit testing framework
- **Node.js** (existing) - Runtime environment

## Success Criteria

1. ✅ All property-based tests pass with 100+ iterations
2. ✅ All unit tests pass
3. ✅ Match rate improves from 66% to at least 82%
4. ✅ All 18 core module routes are matched
5. ✅ All 4 auth routes are matched
6. ✅ No existing matches are broken
7. ✅ Detailed mismatch reporting is generated
8. ✅ Performance remains under 5 seconds for 150 routes
