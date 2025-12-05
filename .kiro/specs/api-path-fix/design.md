# Design Document

## Overview

This design addresses the duplicate `/api/` prefix issue in frontend API calls. The axios instance is configured with a base URL that already includes `/api`, but many frontend files are making calls with paths like `/api/tasks`, resulting in malformed URLs like `http://localhost:5000/api/api/tasks`. The solution involves removing the `/api/` prefix from all endpoint paths in the frontend code.

## Architecture

The fix operates at the application layer, modifying frontend API call patterns:

```
Current (Broken):
baseURL: 'http://localhost:5000/api'
+ endpoint: '/api/tasks'
= 'http://localhost:5000/api/api/tasks' ❌

Fixed:
baseURL: 'http://localhost:5000/api'
+ endpoint: '/tasks'
= 'http://localhost:5000/api/tasks' ✓
```

The architecture maintains the existing axios configuration while updating all API call sites to use relative paths without the `/api` prefix.

## Components and Interfaces

### API Client Configuration
- **Location**: `frontend/src/utils/api.js`
- **Current State**: Correctly configured with `baseURL: 'http://localhost:5000/api'`
- **Action**: No changes needed

### Frontend API Calls
- **Location**: Various files in `frontend/src/`
- **Current State**: Many calls include `/api/` prefix (e.g., `api.get('/api/tasks')`)
- **Action**: Remove `/api/` prefix from all endpoint paths

### Fix Script
- **Location**: Root directory
- **Purpose**: Automated script to find and fix all duplicate prefixes
- **Implementation**: PowerShell script using regex pattern matching

## Data Models

No data model changes required. This is purely a URL path correction.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: No API prefix in endpoint paths
*For any* API call in the frontend codebase, the endpoint path argument should not include the `/api/` prefix
**Validates: Requirements 1.3, 2.1**

### Property 2: Fix script preserves call syntax
*For any* API call that the fix script processes, all parts of the call except the path should remain unchanged (method name, parameters, options)
**Validates: Requirements 3.3**

### Property 3: Fix script removes API prefix
*For any* API call with a `/api/` prefix in the endpoint path, applying the fix script should result in the prefix being removed
**Validates: Requirements 3.2**

## Error Handling

### Detection
- 404 errors in browser console indicate duplicate prefix issues
- Pattern: `GET http://localhost:5000/api/api/...` in error messages

### Prevention
- Establish clear documentation on correct API call patterns
- Use linting rules to catch `/api/` prefixes in API calls (future enhancement)

### Recovery
- The fix script can be run multiple times safely (idempotent)
- Regex patterns use negative lookahead to avoid double-fixing

## Testing Strategy

### Unit Testing
- Test that the axios base URL is correctly configured
- Verify sample API calls construct correct URLs

### Integration Testing
- After applying fixes, test each major feature area:
  - Dashboard (tasks, projects, time tracking summary)
  - Admin panel (reports)
  - Authentication flows
  - All CRUD operations

### Property-Based Testing

We will use a simple validation approach rather than a full PBT library for this fix:

1. **Pattern Validation**: Scan all frontend files to ensure no `api.get('/api/`, `api.post('/api/`, etc. patterns exist
2. **URL Construction Test**: For a sample set of endpoints, verify that combining baseURL + endpoint produces correct URLs without duplication

The validation will be implemented as a verification script that can be run after applying fixes.

### Manual Testing
- Load the application and verify no 404 errors in console
- Navigate through key features to ensure API calls succeed
- Check that data loads correctly on dashboard, admin panel, and other pages

## Implementation Approach

### Phase 1: Create Fix Script
Create a PowerShell script that:
1. Scans all `.js` and `.jsx` files in `frontend/src/`
2. Identifies patterns like `api.get('/api/`, `api.post('/api/`, etc.
3. Removes the `/api/` prefix from the endpoint path
4. Preserves the rest of the call syntax

### Phase 2: Apply Fixes
1. Run the fix script
2. Review changes to ensure correctness
3. Commit changes

### Phase 3: Verification
1. Start the backend server
2. Start the frontend development server
3. Open browser console and navigate through the application
4. Verify no 404 errors with duplicate `/api/api/` paths
5. Confirm all features load data correctly

### Phase 4: Documentation
Update developer documentation to clarify:
- The axios instance includes `/api` in the base URL
- All endpoint paths should be relative without `/api` prefix
- Correct pattern: `api.get('/tasks')` not `api.get('/api/tasks')`
