# Shared Utilities

This directory contains shared code used across multiple feature modules.

## Intended Contents

### `/middleware/`
Shared Express middleware functions:
- Authentication middleware
- Rate limiting
- Request logging
- CSRF protection
- Error handling

### `/utils/`
Shared utility functions:
- Date/time helpers
- String formatting
- Validation helpers
- Common business logic

### `/types/`
Shared TypeScript types and interfaces (if migrating to TypeScript)

## Guidelines

- Only place truly shared code here
- Module-specific code belongs in the module directory
- Keep dependencies minimal
- Document all shared utilities clearly
