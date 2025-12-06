# Implementation Plan

- [x] 1. Set up testing infrastructure





  - Install fast-check library for property-based testing
  - Create test directory structure for pathNormalizer and RouteMatcher tests
  - Set up Jest configuration for the audit-tool tests
  - _Requirements: All (testing foundation)_

- [x] 2. Enhance path normalization utilities





  - [x] 2.1 Enhance isParameter() to detect template literal parameters


    - Add detection for `${id}`, `${userId}`, etc. format
    - Maintain existing detection for `:id`, numeric IDs, UUIDs, ObjectIds
    - _Requirements: 1.3_

  - [x] 2.2 Write property test for parameter detection


    - **Property 1: Path parameter matching**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 2.3 Add extractParameterNames() utility function


    - Extract parameter names from paths (e.g., "/api/tasks/:id" → ["id"])
    - Support both Express-style and template literal formats
    - _Requirements: 1.1, 1.2_

  - [x] 2.4 Write property test for query parameter handling


    - **Property 3: Query parameter independence**
    - **Validates: Requirements 2.1, 2.4**

  - [x] 2.5 Write property test for exact match preservation


    - **Property 2: Exact match preservation**
    - **Validates: Requirements 1.5**

  - [x] 2.6 Write unit tests for edge cases


    - Test empty strings, null, undefined inputs
    - Test paths with multiple query parameters
    - Test paths with hash fragments
    - Test mixed parameter formats
    - _Requirements: 1.1, 1.2, 1.3, 2.1_

- [x] 3. Enhance path matching logic










  - [x] 3.1 Add pathsMatchWithReason() function



    - Return both match result and detailed reason for mismatch
    - Categorize mismatches: method-mismatch, path-structure-mismatch, parameter-count-mismatch
    - _Requirements: 4.1_

  - [x] 3.2 Write property test for method matching



    - **Property 4: Method matching requirement**
    - **Validates: Requirements 3.1**

  - [x] 3.3 Write property test for method mismatch reporting



    - **Property 5: Method mismatch reporting**
    - **Validates: Requirements 3.2**

  - [x] 3.4 Write property test for case-insensitive methods



    - **Property 6: Case-insensitive method comparison**
    - **Validates: Requirements 3.3**

  - [x] 3.5 Write unit tests for method handling



    - Test default method (GET) when not specified
    - Test case variations (GET, get, Get)
    - Test invalid methods
    - _Requirements: 3.3, 3.4_

- [x] 4. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Add detailed reporting to RouteMatcher





  - [x] 5.1 Implement analyzeUnmatchedRoutes() method


    - Categorize unmatched routes by reason
    - Generate statistics on mismatch types
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Write property test for route categorization


    - **Property 7: Unmatched route categorization**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 5.3 Implement suggestMatches() method


    - Calculate similarity scores between unmatched routes
    - Generate suggestions for routes with similarity > 0.7
    - _Requirements: 4.3_

  - [x] 5.4 Write property test for suggestion generation


    - **Property 8: Match suggestion generation**
    - **Validates: Requirements 4.3**

  - [x] 5.5 Enhance matchRoutes() to return detailed statistics


    - Add confidence levels to matches (exact, parameter-match, normalized)
    - Include improvement metrics from previous runs
    - _Requirements: 4.4_

  - [x] 5.6 Write property test for statistics completeness


    - **Property 9: Statistics completeness**
    - **Validates: Requirements 4.4**

  - [x] 5.7 Write unit tests for reporting


    - Test report structure
    - Test category grouping
    - Test suggestion format
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Validate backward compatibility




  - [x] 7.1 Create validation test with current route data


    - Export current matched routes as baseline
    - Run enhanced matcher on same data
    - Verify all existing matches are preserved
    - _Requirements: 5.1_

  - [x] 7.2 Run matcher on full codebase


    - Execute matcher against actual frontend and backend code
    - Verify match rate improvement
    - Generate before/after comparison report
    - _Requirements: 6.3, 6.4_

  - [x] 7.3 Write integration tests


    - Test end-to-end matching with real route data
    - Test performance (< 5 seconds for 150 routes)
    - Test report generation completeness
    - _Requirements: 5.1, 6.4_

- [x] 8. Validate against known route sets






  - [x] 8.1 Test core module routes (18 routes)

    - Create test data for tasks, projects, invoices, time-tracking, notifications routes
    - Verify all 18 routes match correctly
    - _Requirements: 6.1_


  - [x] 8.2 Test auth routes (4 routes)





    - Create test data for auth routes (login, logout, refresh, me)
    - Verify all 4 routes match correctly
    - _Requirements: 6.2_


  - [x] 8.3 Verify target match rate achieved




    - Run full matcher and verify >= 82% match rate (124/150 routes)
    - Generate final report with improvement metrics
    - _Requirements: 6.3_

- [x] 9. Final checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Update documentation





  - [x] 10.1 Update pathNormalizer JSDoc comments


    - Document new functions and enhanced behavior
    - Add examples for template literal parameters
    - _Requirements: All_

  - [x] 10.2 Update RouteMatcher JSDoc comments


    - Document new methods and enhanced return types
    - Add examples for detailed reporting
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 10.3 Create migration guide


    - Document changes from previous version
    - Explain new reporting features
    - Provide examples of using new functionality
    - _Requirements: All_
