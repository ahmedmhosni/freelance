# Requirements Document

## Introduction

The invoice items API endpoint is currently missing from the backend, causing 404 errors when the frontend attempts to fetch line items for existing invoices. This feature will implement the backend API endpoint to support CRUD operations for invoice line items, enabling proper invoice management with detailed billing information.

## Glossary

- **Invoice Items API**: RESTful API endpoints for managing line items associated with invoices
- **Line Item**: A single billable entry on an invoice containing description, quantity, rate, and amount information
- **Invoice System**: The existing invoice management system that tracks client billing
- **Backend API**: The Node.js/Express server handling HTTP requests
- **Frontend Client**: The React application consuming the API

## Requirements

### Requirement 1

**User Story:** As a frontend developer, I want to fetch invoice items for a specific invoice, so that I can display detailed billing information to users.

#### Acceptance Criteria

1. WHEN the frontend requests GET /api/invoices/:id/items THEN the Backend API SHALL return all line items associated with that invoice
2. WHEN the invoice has no items THEN the Backend API SHALL return an empty array with 200 status
3. WHEN the invoice does not exist THEN the Backend API SHALL return a 404 error with appropriate message
4. WHEN the response is returned THEN the Backend API SHALL include item details: description, quantity, unit_price, hours_worked, rate_per_hour, project_id, task_id, and calculated amounts

### Requirement 2

**User Story:** As a user creating an invoice, I want to add line items to the invoice, so that I can specify what services or products are being billed.

#### Acceptance Criteria

1. WHEN the frontend sends POST /api/invoices/:id/items with valid item data THEN the Backend API SHALL create a new line item and return it with 201 status
2. WHEN required fields are missing THEN the Backend API SHALL return a 400 error with validation details
3. WHEN the invoice does not exist THEN the Backend API SHALL return a 404 error
4. WHEN the item is created THEN the Backend API SHALL calculate base_amount, tax_amount, and total amount based on provided data

### Requirement 3

**User Story:** As a user editing an invoice, I want to update existing line items, so that I can correct billing information or adjust quantities.

#### Acceptance Criteria

1. WHEN the frontend sends PUT /api/invoices/:invoiceId/items/:itemId with valid data THEN the Backend API SHALL update the line item and return the updated item
2. WHEN the item does not exist THEN the Backend API SHALL return a 404 error
3. WHEN validation fails THEN the Backend API SHALL return a 400 error with details
4. WHEN amounts are recalculated THEN the Backend API SHALL update base_amount, tax_amount, and total amount

### Requirement 4

**User Story:** As a user managing invoices, I want to delete line items, so that I can remove incorrect or unwanted billing entries.

#### Acceptance Criteria

1. WHEN the frontend sends DELETE /api/invoices/:invoiceId/items/:itemId THEN the Backend API SHALL remove the line item and return 204 status
2. WHEN the item does not exist THEN the Backend API SHALL return a 404 error
3. WHEN the item is deleted THEN the Backend API SHALL maintain referential integrity with the invoice

### Requirement 5

**User Story:** As a system administrator, I want invoice items to be properly validated, so that data integrity is maintained across the system.

#### Acceptance Criteria

1. WHEN item data is received THEN the Backend API SHALL validate that description is a non-empty string
2. WHEN fixed-price items are submitted THEN the Backend API SHALL validate that quantity and unit_price are positive numbers
3. WHEN hourly items are submitted THEN the Backend API SHALL validate that hours_worked and rate_per_hour are positive numbers
4. WHEN tax is applied THEN the Backend API SHALL validate that tax_rate is between 0 and 100
5. WHEN project_id or task_id are provided THEN the Backend API SHALL validate they reference existing records

### Requirement 6

**User Story:** As a developer, I want consistent error handling across invoice items endpoints, so that the frontend can provide clear feedback to users.

#### Acceptance Criteria

1. WHEN validation errors occur THEN the Backend API SHALL return structured error responses with field-level details
2. WHEN database errors occur THEN the Backend API SHALL return 500 status with generic error message
3. WHEN authentication fails THEN the Backend API SHALL return 401 status
4. WHEN authorization fails THEN the Backend API SHALL return 403 status
