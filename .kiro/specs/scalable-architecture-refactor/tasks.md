# Implementation Plan

This plan outlines the step-by-step implementation of the scalable architecture refactor. Each task builds incrementally on previous work, allowing you to test locally at every step before deploying to AWS.

## Phase 1: Core Infrastructure

- [x] 1. Set up new directory structure and core infrastructure





  - Create `backend/src/core/` directory with subdirectories: `container/`, `database/`, `errors/`, `logger/`, `config/`
  - Create `backend/src/modules/` directory for feature modules
  - Create `backend/src/shared/` directory for shared utilities
  - _Requirements: 1.1, 1.2, 8.1_

- [x] 2. Implement Dependency Injection Container






  - [x] 2.1 Create Container class with registration and resolution methods

    - Implement `register()`, `resolve()`, `registerSingleton()`, `registerTransient()` methods
    - Add circular dependency detection
    - Add error handling for missing dependencies
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [x] 2.2 Write unit tests for DI container


    - Test singleton vs transient lifecycles
    - Test dependency resolution
    - Test circular dependency detection
    - Test error cases
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 3. Implement PostgreSQL Database Layer


  - [x] 3.1 Create Database class with connection pooling


    - Implement connection pool using `pg` library
    - Add `query()`, `queryOne()`, `queryMany()`, `execute()` methods
    - Implement transaction support with `transaction()` callback
    - Add connection retry logic with exponential backoff
    - Support both local PostgreSQL and AWS RDS configuration
    - _Requirements: 4.1, 4.2, 4.3, 4.5_


  - [x] 3.2 Add query logging and error handling


    - Log queries in development mode
    - Normalize database errors with context
    - Add connection health checks
    - _Requirements: 4.4, 9.1, 9.2_

  - [x] 3.3 Write unit tests for database layer


    - Test connection pooling
    - Test transaction rollback on errors
    - Test query methods
    - Test error handling
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Create Base Classes


  - [x] 4.1 Implement BaseRepository class


    - Create abstract base with common CRUD methods
    - Implement `findById()`, `findAll()`, `create()`, `update()`, `delete()`, `count()`, `exists()`
    - Add filtering and pagination support
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 4.2 Implement BaseService class


    - Create abstract base with common business logic patterns
    - Implement standard CRUD operations that call repository methods
    - Add validation hooks
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 4.3 Implement BaseController class


    - Create abstract base with common HTTP handling
    - Implement `handleRequest()` wrapper for error handling
    - Add standard REST endpoints: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
    - _Requirements: 3.1, 6.5_

- [x] 5. Implement Error Handling Infrastructure


  - [x] 5.1 Create custom error classes


    - Implement `ApplicationError` base class
    - Create specific errors: `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `DatabaseError`
    - Add HTTP status code mapping
    - _Requirements: 6.1, 6.2, 6.3, 6.4_


  - [x] 5.2 Create centralized error handler middleware

    - Implement error handler that catches all errors
    - Log errors with context
    - Return consistent JSON error responses
    - Handle different error types appropriately
    - _Requirements: 6.5, 9.2_

- [x] 6. Setup Configuration Management




  - [x] 6.1 Create configuration loader

    - Load environment variables with validation
    - Provide typed configuration object
    - Add defaults for development
    - Support both local and AWS RDS database configs
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 6.2 Add configuration validation

    - Validate required configuration on startup
    - Fail fast with clear error messages
    - Never log sensitive values
    - _Requirements: 8.3, 8.4_

- [x] 7. Enhance Logging System





  - [x] 7.1 Extend Winston logger configuration


    - Configure log levels per environment
    - Add structured logging with metadata
    - Add correlation IDs for request tracking
    - Configure log rotation
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [x] 7.2 Create logging middleware


    - Log all incoming requests with correlation ID
    - Log response times and status codes
    - Add request/response logging
    - _Requirements: 9.3_

## Phase 2: First Module Migration (Clients)

- [x] 8. Create Clients Module Structure


  - Create `backend/src/modules/clients/` directory
  - Create subdirectories: `controllers/`, `services/`, `repositories/`, `models/`, `validators/`, `dto/`
  - Create `index.js` for module registration
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 9. Implement Client Domain Model and DTOs


  - [x] 9.1 Create Client domain model class

    - Define Client class with properties and methods
    - Add `isValid()` business logic
    - Add `toJSON()` serialization
    - _Requirements: 2.2_


  - [x] 9.2 Create Client DTOs

    - Create `CreateClientDTO` for creation
    - Create `UpdateClientDTO` for updates
    - Create `ClientResponseDTO` for API responses
    - _Requirements: 7.1, 7.2_

- [x] 10. Implement Client Repository







  - [x] 10.1 Create ClientRepository extending BaseRepository

    - Implement all CRUD operations using new Database layer
    - Add client-specific queries (search, filter by user)
    - Use parameterized queries for security
    - Map database rows to Client domain models
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


  - [x] 10.2 Write unit tests for ClientRepository

    - Test CRUD operations
    - Test search and filtering
    - Test error handling
    - Use in-memory database or mocks
    - _Requirements: 10.2, 10.3_

- [x] 11. Implement Client Service





  - [x] 11.1 Create ClientService extending BaseService

    - Inject ClientRepository via constructor
    - Implement business logic for client operations
    - Add validation for business rules
    - Handle transactions where needed
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 11.2 Write unit tests for ClientService





    - Test business logic in isolation
    - Mock repository dependencies
    - Test validation rules
    - Test error scenarios
    - _Requirements: 10.1, 10.2_


- [x] 12. Implement Client Validators




  - [x] 12.1 Create validation middleware for client endpoints


    - Validate client creation input
    - Validate client update input
    - Validate query parameters
    - Use express-validator or similar
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 13. Implement Client Controller




  - [x] 13.1 Create ClientController extending BaseController


    - Inject ClientService via constructor
    - Implement REST endpoints using service methods
    - Add proper error handling
    - Return consistent response format
    - _Requirements: 3.1, 6.5_


  - [x] 13.2 Create Express router for client endpoints

    - Define routes: GET /clients, GET /clients/:id, POST /clients, PUT /clients/:id, DELETE /clients/:id
    - Apply authentication middleware
    - Apply validation middleware
    - Apply rate limiting
    - _Requirements: 1.2, 7.1_


- [x] 14. Register Clients Module in DI Container

  - Register Database as singleton
  - Register ClientRepository as singleton
  - Register ClientService as transient
  - Register ClientController as singleton
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 15. Add New Client Routes to Server


  - Mount new client routes at `/api/v2/clients`
  - Keep old routes at `/api/clients` working
  - Both routes work in parallel
  - _Requirements: 11.1, 11.2, 12.1_

- [x] 16. Integration Testing for Clients Module

  - [x] 16.1 Write integration tests comparing old vs new endpoints

    - Test that both endpoints return same data
    - Test all CRUD operations
    - Test error cases
    - Test authentication and authorization
    - _Requirements: 10.4, 11.3_


- [x] 17. Checkpoint - Verify Clients Module


  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Projects Module Migration

- [x] 18. Create Projects Module Structure


  - Create `backend/src/modules/projects/` with full structure
  - Create subdirectories: `controllers/`, `services/`, `repositories/`, `models/`, `validators/`, `dto/`
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 19. Implement Project Domain Model and DTOs



  - [x] 19.1 Create Project domain model class


    - Define Project class with properties
    - Add business logic methods
    - Add relationship handling (client, tasks)
    - _Requirements: 2.2_

  - [x] 19.2 Create Project DTOs



    - Create DTOs for create, update, and response
    - _Requirements: 7.1, 7.2_

- [x] 20. Implement Project Repository





  - [x] 20.1 Create ProjectRepository extending BaseRepository


    - Implement CRUD operations
    - Add project-specific queries (by client, by status, by deadline)
    - Handle relationships with clients
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 20.2 Write unit tests for ProjectRepository


    - Test CRUD operations
    - Test filtering and relationships
    - _Requirements: 10.2, 10.3_

- [x] 21. Implement Project Service


  - [x] 21.1 Create ProjectService extending BaseService


    - Inject ProjectRepository and ClientRepository
    - Implement business logic
    - Validate project-client relationships
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 21.2 Write unit tests for ProjectService


    - Test business logic
    - Mock dependencies
    - _Requirements: 10.1, 10.2_

- [x] 22. Implement Project Validators and Controller


  - [x] 22.1 Create validation middleware


    - Validate project input
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 22.2 Create ProjectController


    - Implement REST endpoints
    - Apply middleware
    - _Requirements: 3.1, 6.5_

- [x] 23. Register Projects Module and Add Routes


  - Register in DI container
  - Mount at `/api/v2/projects`
  - Keep old routes working
  - _Requirements: 5.1, 5.2, 11.1, 11.2_

- [x] 24. Checkpoint - Verify Projects Module



  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Tasks Module Migration

- [x] 25. Create Tasks Module Structure


  - Create `backend/src/modules/tasks/` with full structure
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 26. Implement Task Domain Model and DTOs




  - [x] 26.1 Create Task domain model class


    - Define Task class with status, priority, due dates
    - Add business logic for status transitions
    - _Requirements: 2.2_


  - [x] 26.2 Create Task DTOs


    - Create DTOs for create, update, and response
    - _Requirements: 7.1, 7.2_

- [x] 27. Implement Task Repository


  - [x] 27.1 Create TaskRepository extending BaseRepository


    - Implement CRUD operations
    - Add task-specific queries (by status, by priority, by project, overdue)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 27.2 Write unit tests for TaskRepository


    - Test CRUD and filtering
    - _Requirements: 10.2, 10.3_

- [x] 28. Implement Task Service



  - [x] 28.1 Create TaskService extending BaseService


    - Inject TaskRepository and ProjectRepository
    - Implement business logic for task management
    - Handle status transitions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 28.2 Write unit tests for TaskService


    - Test business logic
    - _Requirements: 10.1, 10.2_

- [x] 29. Implement Task Validators and Controller


  - [x] 29.1 Create validation middleware


    - Validate task input
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 29.2 Create TaskController


    - Implement REST endpoints
    - _Requirements: 3.1, 6.5_

- [x] 30. Register Tasks Module and Add Routes


  - Register in DI container
  - Mount at `/api/v2/tasks`
  - _Requirements: 5.1, 5.2, 11.1, 11.2_

- [x] 31. Checkpoint - Verify Tasks Module



  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Invoices Module Migration

- [x] 32. Create Invoices Module Structure


  - Create `backend/src/modules/invoices/` with full structure
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 33. Implement Invoice Domain Model and DTOs

  - [x] 33.1 Create Invoice domain model class


    - Define Invoice class with status, amounts, due dates
    - Add business logic for status transitions and calculations
    - _Requirements: 2.2_

  - [x] 33.2 Create Invoice DTOs


    - Create DTOs for create, update, and response
    - _Requirements: 7.1, 7.2_

- [x] 34. Implement Invoice Repository

  - [x] 34.1 Create InvoiceRepository extending BaseRepository



    - Implement CRUD operations
    - Add invoice-specific queries (by status, by client, overdue, revenue calculations)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 34.2 Write unit tests for InvoiceRepository


    - Test CRUD and calculations
    - _Requirements: 10.2, 10.3_

- [x] 35. Implement Invoice Service

  - [x] 35.1 Create InvoiceService extending BaseService


    - Inject InvoiceRepository and ClientRepository
    - Implement business logic for invoice management
    - Handle invoice number generation
    - Calculate totals and status updates
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 35.2 Write unit tests for InvoiceService

    - Test business logic and calculations
    - _Requirements: 10.1, 10.2_

- [x] 36. Implement Invoice Validators and Controller

  - [x] 36.1 Create validation middleware

    - Validate invoice input
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 36.2 Create InvoiceController

    - Implement REST endpoints
    - _Requirements: 3.1, 6.5_

- [x] 37. Register Invoices Module and Add Routes

  - Register in DI container
  - Mount at `/api/v2/invoices`
  - _Requirements: 5.1, 5.2, 11.1, 11.2_

- [x] 38. Checkpoint - Verify Invoices Module

  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Time Tracking Module Migration

- [x] 39. Create Time Tracking Module Structure


  - Create `backend/src/modules/time-tracking/` with full structure
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 40. Implement TimeEntry Domain Model and DTOs


  - [x] 40.1 Create TimeEntry domain model class


    - Define TimeEntry class with duration calculations
    - Add business logic for running timers
    - _Requirements: 2.2_

  - [x] 40.2 Create TimeEntry DTOs


    - Create DTOs for create, update, and response
    - _Requirements: 7.1, 7.2_

- [x] 41. Implement TimeEntry Repository



  - [x] 41.1 Create TimeEntryRepository extending BaseRepository

    - Implement CRUD operations
    - Add time-tracking queries (by task, by date range, running timers, duration sums)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 41.2 Write unit tests for TimeEntryRepository


    - Test CRUD and time calculations
    - _Requirements: 10.2, 10.3_



- [x] 42. Implement TimeEntry Service

  - [x] 42.1 Create TimeEntryService extending BaseService

    - Inject TimeEntryRepository and TaskRepository
    - Implement business logic for time tracking
    - Handle timer start/stop logic
    - Calculate durations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


  - [x] 42.2 Write unit tests for TimeEntryService

    - Test timer logic
    - _Requirements: 10.1, 10.2_

- [x] 43. Implement TimeEntry Validators and Controller



  - [x] 43.1 Create validation middleware

    - Validate time entry input
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 43.2 Create TimeEntryController


    - Implement REST endpoints
    - _Requirements: 3.1, 6.5_

- [x] 44. Register Time Tracking Module and Add Routes


  - Register in DI container
  - Mount at `/api/v2/time-tracking`
  - _Requirements: 5.1, 5.2, 11.1, 11.2_

- [x] 45. Checkpoint - Verify Time Tracking Module



  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Remaining Modules Migration

- [x] 46. Migrate Dashboard Module

  - Create module structure
  - Implement DashboardService that aggregates data from other services
  - Implement DashboardController
  - Register and mount at `/api/v2/dashboard`
  - _Requirements: 1.1, 1.2, 3.1, 3.5_


- [x] 47. Migrate Reports Module





  - Create module structure
  - Implement ReportsService with analytics logic
  - Implement ReportsController
  - Register and mount at `/api/v2/reports`
  - _Requirements: 1.1, 1.2, 3.1, 3.5_


- [x] 48. Migrate Notifications Module


  - Create module structure
  - Implement NotificationRepository and NotificationService
  - Implement NotificationController
  - Integrate with WebSocket for real-time updates
  - Register and mount at `/api/v2/notifications`

  - _Requirements: 1.1, 1.2, 2.1, 3.1_

- [x] 49. Migrate Authentication Module


  - Create module structure
  - Implement AuthService with JWT logic
  - Implement AuthController
  - Keep existing auth middleware compatible

  - Register and mount at `/api/v2/auth`
  - _Requirements: 1.1, 1.2, 3.1_

- [x] 50. Migrate Admin Module



  - Create module structure
  - Implement AdminService

  - Implement AdminController
  - Register and mount at `/api/v2/admin`
  - _Requirements: 1.1, 1.2, 3.1_

- [x] 51. Checkpoint - Verify All Modules

  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Frontend Integration

- [x] 52. Update Frontend API Service Layer





  - [x] 52.1 Create feature-specific API service files

    - Create `frontend/src/features/clients/services/clientApi.js`
    - Create similar files for projects, tasks, invoices, time-tracking
    - Encapsulate all API calls in service functions
    - _Requirements: 13.3_


  - [x] 52.2 Update API calls to use new v2 endpoints

    - Update all API calls to point to `/api/v2/*` endpoints
    - Test each feature thoroughly
    - Ensure backward compatibility during transition
    - _Requirements: 11.1, 11.2_

- [x] 53. Organize Frontend by Feature Modules





  - [x] 53.1 Restructure frontend directories


    - Create `frontend/src/features/` directory
    - Move components, hooks, and services into feature folders
    - Create `frontend/src/shared/` for shared components
    - _Requirements: 13.1, 13.2_

  - [x] 53.2 Update imports and routing


    - Update all import paths
    - Organize routes by feature
    - Add lazy loading for feature modules
    - _Requirements: 13.5_

## Phase 9: Testing and Documentation

- [x] 54. Comprehensive Testing






  - [x] 54.1 Write end-to-end tests

    - Test complete user workflows
    - Test authentication flows
    - Test data creation and updates across modules
    - _Requirements: 10.4_


  - [x] 54.2 Performance testing

    - Load test new endpoints
    - Compare performance with old endpoints
    - Optimize slow queries
    - _Requirements: 10.4_





- [x] 55. Documentation





  - [x] 55.1 Update API documentation



    - Document all new v2 endpoints in Swagger


    - Add request/response examples
    - Document error codes
    - _Requirements: 15.2_




  - [x] 55.2 Create architecture documentation

    - Document module structure
    - Create architecture decision records (ADRs)
    - Write developer onboarding guide
    - _Requirements: 15.3, 15.4, 15.5_

  - [x] 55.3 Add code documentation


    - Add JSDoc comments to all public methods
    - Document complex business logic
    - Add inline comments for clarity
    - _Requirements: 15.1_

## Phase 10: Cleanup and Deployment

- [x] 56. Switch to New Architecture as Default






  - [x] 56.1 Update frontend to use v2 endpoints exclusively


    - Remove fallbacks to old endpoints
    - Test thoroughly in local environment
    - _Requirements: 11.4_


  - [x] 56.2 Remove `/api/v2/` prefix

    - Make new architecture the default at `/api/*`
    - Update all frontend API calls
    - _Requirements: 12.2, 12.4_

- [x] 57. Remove Old Code




  - [x] 57.1 Archive old route files

    - Move old routes to `backend/src/routes-old/` for reference
    - Remove old route registrations from server.js
    - _Requirements: 11.5_

  - [x] 57.2 Clean up old database connection code


    - Remove old database connection logic
    - Ensure only new Database layer is used
    - _Requirements: 11.5_

- [ ] 58. AWS Deployment Preparation
  - [x] 58.1 Create AWS deployment configuration





    - Setup AWS RDS PostgreSQL instance
    - Configure security groups and VPC
    - Setup AWS EC2 or ECS for backend
    - Configure environment variables for production
    - _Requirements: 8.1, 8.5_

  - [ ] 58.2 Setup CI/CD pipeline
    - Configure automated deployments
    - Add deployment scripts
    - Setup staging environment for testing
    - _Requirements: 11.1_

  - [ ] 58.3 Deploy frontend to AWS S3 + CloudFront
    - Build frontend for production
    - Upload to S3
    - Configure CloudFront distribution
    - Setup custom domain
    - _Requirements: 13.1_

- [ ] 59. Final Checkpoint - Production Deployment
  - Ensure all tests pass, ask the user if questions arise.

## Phase 11: Code Generation Tools (Optional Enhancement)

- [ ] 60. Create Module Generator CLI
  - [ ] 60.1 Build CLI tool for generating new modules
    - Create command: `npm run generate:module <name>`
    - Generate complete module structure with templates
    - Auto-generate repository, service, controller, validators
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 60.2 Create customizable templates
    - Allow developers to modify generation templates
    - Support different module types
    - _Requirements: 14.4, 14.5_
