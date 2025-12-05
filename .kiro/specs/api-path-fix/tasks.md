# Implementation Plan

- [x] 1. Create fix script to remove duplicate API prefixes



  - Write PowerShell script that scans `frontend/src/` directory recursively
  - Implement regex patterns to match `api.get('/api/`, `api.post('/api/`, `api.put('/api/`, `api.delete('/api/`, `api.patch('/api/`
  - Replace matched patterns by removing the `/api/` prefix from the endpoint path
  - Use negative lookahead in regex to prevent double-fixing already correct paths
  - Add logging to show which files are being modified
  - _Requirements: 3.1, 3.2, 3.3_


- [x] 1.1 Write property test for fix script path transformation

  - **Property 3: Fix script removes API prefix**
  - **Validates: Requirements 3.2**

- [x] 1.2 Write property test for fix script syntax preservation

  - **Property 2: Fix script preserves call syntax**
  - **Validates: Requirements 3.3**

- [x] 2. Run fix script on frontend codebase





  - Execute the PowerShell script from the project root
  - Review the console output to see which files were modified
  - _Requirements: 3.2_

- [ ] 3. Verify no duplicate prefixes remain
  - Create verification script that scans for any remaining `api.{method}('/api/` patterns
  - Run verification script and confirm zero matches
  - _Requirements: 3.4_

- [ ] 3.1 Write property test for API path patterns
  - **Property 1: No API prefix in endpoint paths**
  - **Validates: Requirements 1.3, 2.1**

- [ ] 4. Test the application manually
  - Start backend server
  - Start frontend development server
  - Open browser console and navigate to dashboard
  - Verify no 404 errors with `/api/api/` paths appear
  - Test key features: tasks, projects, time tracking, admin panel
  - Confirm all data loads successfully
  - _Requirements: 1.5, 3.5_

- [ ] 5. Update developer documentation
  - Add section to README or developer guide explaining API call patterns
  - Document that baseURL includes `/api` prefix
  - Provide examples of correct API call syntax
  - Include common mistakes to avoid
  - _Requirements: 2.3_
