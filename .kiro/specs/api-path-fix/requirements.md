# Requirements Document

## Introduction

The frontend application is experiencing 404 errors when making API calls due to duplicate `/api/` prefixes in the request URLs. The axios instance is configured with a base URL of `http://localhost:5000/api`, but frontend code is making calls with paths like `/api/tasks`, resulting in malformed URLs like `http://localhost:5000/api/api/tasks`.

## Glossary

- **API Client**: The axios instance configured in `frontend/src/utils/api.js` that handles HTTP requests
- **Base URL**: The root URL configured in the axios instance that is prepended to all relative paths
- **API Endpoint**: A specific route on the backend server that handles requests (e.g., `/tasks`, `/projects`)
- **Frontend API Call**: Code in React components that uses the API client to make HTTP requests

## Requirements

### Requirement 1

**User Story:** As a developer, I want API calls to use correct URL paths, so that the application can successfully communicate with the backend server.

#### Acceptance Criteria

1. WHEN the API client makes a request THEN the system SHALL construct URLs without duplicate path segments
2. WHEN a frontend component calls an API endpoint THEN the system SHALL combine the base URL and endpoint path correctly
3. WHEN the base URL includes `/api` THEN the endpoint paths SHALL NOT include the `/api` prefix
4. THE system SHALL maintain consistent URL construction across all API calls
5. WHEN API calls are made THEN the system SHALL receive successful responses instead of 404 errors

### Requirement 2

**User Story:** As a developer, I want a clear pattern for API endpoint paths, so that I can write consistent and maintainable code.

#### Acceptance Criteria

1. THE system SHALL use relative paths without the `/api` prefix for all endpoint calls
2. WHEN writing new API calls THEN developers SHALL follow the pattern `api.get('/resource')` not `api.get('/api/resource')`
3. THE system SHALL document the correct pattern for making API calls
4. WHEN the base URL changes THEN only the configuration file SHALL need to be updated

### Requirement 3

**User Story:** As a developer, I want all existing API calls fixed, so that the application works correctly across all features.

#### Acceptance Criteria

1. THE system SHALL identify all files containing API calls with duplicate `/api/` prefixes
2. WHEN fixing API paths THEN the system SHALL remove the `/api/` prefix from endpoint paths
3. THE system SHALL preserve the rest of the API call syntax and parameters
4. WHEN all fixes are applied THEN the system SHALL verify no duplicate prefixes remain
5. THE system SHALL maintain functionality for all API endpoints after the fix
