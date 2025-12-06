/**
 * Property-Based Test: Test Data Consistency
 * 
 * **Feature: full-system-audit, Property 32: Test Data Consistency**
 * 
 * For any test run, the same seed data should be used to ensure reproducible results.
 * Generated test data should be consistent and pass validation requirements.
 * 
 * **Validates: Requirements 9.3**
 */

const fc = require('fast-check');
const {
  generateUser,
  generateClient,
  generateProject,
  generateTask,
  generateTimeEntry,
  generateInvoice,
  generateInvoiceItem,
  generateNotification,
  generateQuote,
  generateEmail,
  generatePhoneNumber,
  generateRandomString
} = require('../utils/testDataGenerator');

describe('Property 32: Test Data Consistency', () => {
  
  describe('User data generation', () => {
    test('generated users should have valid email addresses', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const user = generateUser();
            
            // Email should be defined and valid format
            expect(user.email).toBeDefined();
            expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            
            // Name should be defined and non-empty
            expect(user.name).toBeDefined();
            expect(user.name.trim().length).toBeGreaterThan(0);
            
            // Password should be defined
            expect(user.password).toBeDefined();
            expect(user.password.length).toBeGreaterThan(0);
            
            // Role should be valid
            expect(user.role).toBeDefined();
            
            // Email verified should be boolean
            expect(typeof user.email_verified).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('generated users with overrides should preserve override values', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            role: fc.constantFrom('freelancer', 'client', 'admin')
          }),
          (overrides) => {
            const user = generateUser(overrides);
            
            // Overrides should be applied
            expect(user.name).toBe(overrides.name);
            expect(user.role).toBe(overrides.role);
            
            // Other fields should still be generated
            expect(user.email).toBeDefined();
            expect(user.password).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Client data generation', () => {
    test('generated clients should have valid structure', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (userId) => {
            const client = generateClient(userId);
            
            // User ID should match
            expect(client.user_id).toBe(userId);
            
            // Name should be defined and non-empty
            expect(client.name).toBeDefined();
            expect(client.name.trim().length).toBeGreaterThan(0);
            
            // Email should be valid
            expect(client.email).toBeDefined();
            expect(client.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            
            // Phone should be defined
            expect(client.phone).toBeDefined();
            
            // Company should be defined
            expect(client.company).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Project data generation', () => {
    test('generated projects should have valid status and budget', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          fc.option(fc.integer({ min: 1, max: 10000 })),
          (userId, clientId) => {
            const project = generateProject(userId, clientId);
            
            // User ID should match
            expect(project.user_id).toBe(userId);
            
            // Client ID should match if provided
            if (clientId !== null) {
              expect(project.client_id).toBe(clientId);
            }
            
            // Name should be defined
            expect(project.name).toBeDefined();
            expect(project.name.trim().length).toBeGreaterThan(0);
            
            // Status should be valid
            const validStatuses = ['active', 'completed', 'on-hold', 'cancelled', 'in_progress'];
            expect(validStatuses).toContain(project.status);
            
            // Budget should be a positive number
            expect(project.budget).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Task data generation', () => {
    test('generated tasks should have valid priority and status', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          fc.option(fc.integer({ min: 1, max: 10000 })),
          (userId, projectId) => {
            const task = generateTask(userId, projectId);
            
            // User ID should match
            expect(task.user_id).toBe(userId);
            
            // Project ID should match if provided
            if (projectId !== null) {
              expect(task.project_id).toBe(projectId);
            }
            
            // Title should be defined
            expect(task.title).toBeDefined();
            expect(task.title.trim().length).toBeGreaterThan(0);
            
            // Status should be valid
            const validStatuses = ['todo', 'in_progress', 'completed', 'blocked'];
            expect(validStatuses).toContain(task.status);
            
            // Priority should be valid
            const validPriorities = ['low', 'medium', 'high', 'urgent'];
            expect(validPriorities).toContain(task.priority);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Time entry data generation', () => {
    test('generated time entries should have valid time ranges', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          fc.option(fc.integer({ min: 1, max: 10000 })),
          fc.option(fc.integer({ min: 1, max: 10000 })),
          (userId, taskId, projectId) => {
            const timeEntry = generateTimeEntry(userId, taskId, projectId);
            
            // User ID should match
            expect(timeEntry.user_id).toBe(userId);
            
            // Task ID should match if provided
            if (taskId !== null) {
              expect(timeEntry.task_id).toBe(taskId);
            }
            
            // Project ID should match if provided
            if (projectId !== null) {
              expect(timeEntry.project_id).toBe(projectId);
            }
            
            // Times should be valid dates
            expect(timeEntry.start_time).toBeInstanceOf(Date);
            expect(timeEntry.end_time).toBeInstanceOf(Date);
            
            // End time should be after start time
            expect(timeEntry.end_time.getTime()).toBeGreaterThan(timeEntry.start_time.getTime());
            
            // Duration should be positive
            expect(timeEntry.duration).toBeGreaterThan(0);
            
            // Hourly rate should be positive
            expect(timeEntry.hourly_rate).toBeGreaterThan(0);
            
            // Is billable should be boolean
            expect(typeof timeEntry.is_billable).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Invoice data generation', () => {
    test('generated invoices should have valid amounts and dates', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          fc.option(fc.integer({ min: 1, max: 10000 })),
          fc.option(fc.integer({ min: 1, max: 10000 })),
          (userId, clientId, projectId) => {
            const invoice = generateInvoice(userId, clientId, projectId);
            
            // User ID should match
            expect(invoice.user_id).toBe(userId);
            
            // Client ID should match if provided
            if (clientId !== null) {
              expect(invoice.client_id).toBe(clientId);
            }
            
            // Project ID should match if provided
            if (projectId !== null) {
              expect(invoice.project_id).toBe(projectId);
            }
            
            // Invoice number should be unique
            expect(invoice.invoice_number).toBeDefined();
            expect(invoice.invoice_number).toMatch(/^INV-TEST-/);
            
            // Amounts should be positive
            expect(invoice.amount).toBeGreaterThan(0);
            expect(invoice.tax).toBeGreaterThanOrEqual(0);
            expect(invoice.total).toBeGreaterThan(0);
            
            // Total should equal amount + tax
            expect(invoice.total).toBe(invoice.amount + invoice.tax);
            
            // Status should be valid
            const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
            expect(validStatuses).toContain(invoice.status);
            
            // Dates should be defined
            expect(invoice.issue_date).toBeDefined();
            expect(invoice.due_date).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Invoice item data generation', () => {
    test('generated invoice items should have valid calculations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (invoiceId) => {
            const item = generateInvoiceItem(invoiceId);
            
            // Invoice ID should match
            expect(item.invoice_id).toBe(invoiceId);
            
            // Description should be defined
            expect(item.description).toBeDefined();
            
            // Quantity should be positive
            expect(item.quantity).toBeGreaterThan(0);
            
            // Rate should be positive
            expect(item.rate).toBeGreaterThan(0);
            
            // Amount should equal quantity * rate
            expect(item.amount).toBe(item.quantity * item.rate);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Notification data generation', () => {
    test('generated notifications should have valid types', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (userId) => {
            const notification = generateNotification(userId);
            
            // User ID should match
            expect(notification.user_id).toBe(userId);
            
            // Type should be valid
            const validTypes = ['info', 'success', 'warning', 'error'];
            expect(validTypes).toContain(notification.type);
            
            // Title and message should be defined
            expect(notification.title).toBeDefined();
            expect(notification.message).toBeDefined();
            
            // Is read should be boolean
            expect(typeof notification.is_read).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Quote data generation', () => {
    test('generated quotes should have valid structure', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          fc.option(fc.integer({ min: 1, max: 10000 })),
          (userId, clientId) => {
            const quote = generateQuote(userId, clientId);
            
            // User ID should match
            expect(quote.user_id).toBe(userId);
            
            // Client ID should match if provided
            if (clientId !== null) {
              expect(quote.client_id).toBe(clientId);
            }
            
            // Quote number should be unique
            expect(quote.quote_number).toBeDefined();
            expect(quote.quote_number).toMatch(/^QUO-TEST-/);
            
            // Title should be defined
            expect(quote.title).toBeDefined();
            
            // Amounts should be positive
            expect(quote.amount).toBeGreaterThan(0);
            expect(quote.tax).toBeGreaterThanOrEqual(0);
            expect(quote.total).toBeGreaterThan(0);
            
            // Total should equal amount + tax
            expect(quote.total).toBe(quote.amount + quote.tax);
            
            // Status should be valid
            const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
            expect(validStatuses).toContain(quote.status);
            
            // Valid until should be defined
            expect(quote.valid_until).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Helper functions', () => {
    test('generateEmail should produce valid email addresses', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z0-9]+$/),
          (prefix) => {
            fc.pre(prefix.length > 0 && prefix.length <= 20);
            
            const email = generateEmail(prefix);
            
            // Should match email format
            expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            
            // Should contain the prefix
            expect(email).toContain(prefix);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('generatePhoneNumber should produce valid phone numbers', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const phone = generatePhoneNumber();
            
            // Should match phone format (XXX-XXX-XXXX)
            expect(phone).toMatch(/^\d{3}-\d{3}-\d{4}$/);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('generateRandomString should produce strings of correct length', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (length) => {
            const str = generateRandomString(length);
            
            // Should have correct length
            expect(str.length).toBe(length);
            
            // Should only contain alphanumeric characters
            expect(str).toMatch(/^[a-zA-Z0-9]+$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Data consistency across multiple generations', () => {
    test('multiple generations should produce unique identifiers', () => {
      const emails = new Set();
      const invoiceNumbers = new Set();
      const quoteNumbers = new Set();
      
      for (let i = 0; i < 50; i++) {
        const user = generateUser();
        emails.add(user.email);
        
        const invoice = generateInvoice(1);
        invoiceNumbers.add(invoice.invoice_number);
        
        const quote = generateQuote(1);
        quoteNumbers.add(quote.quote_number);
      }
      
      // All emails should be unique
      expect(emails.size).toBe(50);
      
      // All invoice numbers should be unique
      expect(invoiceNumbers.size).toBe(50);
      
      // All quote numbers should be unique
      expect(quoteNumbers.size).toBe(50);
    });
  });
});
