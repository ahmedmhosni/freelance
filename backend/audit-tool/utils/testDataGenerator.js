/**
 * Test Data Generator
 * 
 * Generates realistic test data for each entity type in the system.
 * Supports parameterized data generation and ensures generated data passes validation.
 */

const bcrypt = require('bcryptjs');

/**
 * Generates a random string of specified length
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
function generateRandomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a random email address
 * @param {string} prefix - Optional prefix for the email
 * @returns {string} Email address
 */
function generateEmail(prefix = 'test') {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * Generates a random phone number
 * @returns {string} Phone number
 */
function generatePhoneNumber() {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `${areaCode}-${prefix}-${lineNumber}`;
}

/**
 * Generates test data for a user
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} User test data
 */
function generateUser(overrides = {}) {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  
  return {
    name: `Test User ${random}`,
    email: generateEmail('user'),
    password: 'TestPassword123!',
    role: 'freelancer',
    email_verified: true,
    ...overrides
  };
}

/**
 * Generates test data for a client
 * @param {number} userId - User ID for the client
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} Client test data
 */
function generateClient(userId, overrides = {}) {
  const random = generateRandomString(6);
  
  return {
    user_id: userId,
    name: `Test Client ${random}`,
    email: generateEmail('client'),
    phone: generatePhoneNumber(),
    company: `Company ${random}`,
    notes: `Test notes for client ${random}`,
    ...overrides
  };
}

/**
 * Generates test data for a project
 * @param {number} userId - User ID for the project
 * @param {number} clientId - Optional client ID for the project
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} Project test data
 */
function generateProject(userId, clientId = null, overrides = {}) {
  const random = generateRandomString(6);
  const statuses = ['active', 'completed', 'on-hold', 'cancelled', 'in_progress'];
  
  const data = {
    user_id: userId,
    name: `Test Project ${random}`,
    description: `Test project description ${random}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    budget: Math.floor(Math.random() * 100000) + 1000,
    ...overrides
  };
  
  if (clientId) {
    data.client_id = clientId;
  }
  
  return data;
}

/**
 * Generates test data for a task
 * @param {number} userId - User ID for the task
 * @param {number} projectId - Optional project ID for the task
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} Task test data
 */
function generateTask(userId, projectId = null, overrides = {}) {
  const random = generateRandomString(6);
  const statuses = ['todo', 'in_progress', 'completed', 'blocked'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  const data = {
    user_id: userId,
    title: `Test Task ${random}`,
    description: `Test task description ${random}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    ...overrides
  };
  
  if (projectId) {
    data.project_id = projectId;
  }
  
  return data;
}

/**
 * Generates test data for a time entry
 * @param {number} userId - User ID for the time entry
 * @param {number} taskId - Optional task ID for the time entry
 * @param {number} projectId - Optional project ID for the time entry
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} Time entry test data
 */
function generateTimeEntry(userId, taskId = null, projectId = null, overrides = {}) {
  const random = generateRandomString(6);
  const now = new Date();
  const startTime = new Date(now);
  startTime.setHours(9, 0, 0, 0);
  const endTime = new Date(startTime);
  endTime.setHours(12, 30, 0, 0);
  const duration = 210; // 3.5 hours in minutes
  
  const data = {
    user_id: userId,
    description: `Test time entry ${random}`,
    start_time: startTime,
    end_time: endTime,
    duration: duration,
    is_billable: true,
    hourly_rate: 85,
    ...overrides
  };
  
  if (taskId) {
    data.task_id = taskId;
  }
  
  if (projectId) {
    data.project_id = projectId;
  }
  
  return data;
}

/**
 * Generates test data for an invoice
 * @param {number} userId - User ID for the invoice
 * @param {number} clientId - Optional client ID for the invoice
 * @param {number} projectId - Optional project ID for the invoice
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} Invoice test data
 */
function generateInvoice(userId, clientId = null, projectId = null, overrides = {}) {
  const random = generateRandomString(6);
  const timestamp = Date.now();
  const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
  
  const amount = Math.floor(Math.random() * 50000) + 1000;
  const tax = Math.floor(amount * 0.1);
  const total = amount + tax;
  
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  
  const data = {
    user_id: userId,
    invoice_number: `INV-TEST-${timestamp}-${random}`,
    amount: amount,
    tax: tax,
    total: total,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    issue_date: issueDate.toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    ...overrides
  };
  
  if (clientId) {
    data.client_id = clientId;
  }
  
  if (projectId) {
    data.project_id = projectId;
  }
  
  return data;
}

/**
 * Generates test data for an invoice item
 * @param {number} invoiceId - Invoice ID for the item
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} Invoice item test data
 */
function generateInvoiceItem(invoiceId, overrides = {}) {
  const random = generateRandomString(6);
  const quantity = Math.floor(Math.random() * 100) + 1;
  const rate = Math.floor(Math.random() * 500) + 50;
  const amount = quantity * rate;
  
  return {
    invoice_id: invoiceId,
    description: `Test invoice item ${random}`,
    quantity: quantity,
    rate: rate,
    amount: amount,
    ...overrides
  };
}

/**
 * Generates test data for a notification
 * @param {number} userId - User ID for the notification
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} Notification test data
 */
function generateNotification(userId, overrides = {}) {
  const random = generateRandomString(6);
  const types = ['info', 'success', 'warning', 'error'];
  
  return {
    user_id: userId,
    type: types[Math.floor(Math.random() * types.length)],
    title: `Test Notification ${random}`,
    message: `Test notification message ${random}`,
    is_read: false,
    ...overrides
  };
}

/**
 * Generates test data for a quote
 * @param {number} userId - User ID for the quote
 * @param {number} clientId - Optional client ID for the quote
 * @param {Object} overrides - Optional field overrides
 * @returns {Object} Quote test data
 */
function generateQuote(userId, clientId = null, overrides = {}) {
  const random = generateRandomString(6);
  const timestamp = Date.now();
  const statuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
  
  const amount = Math.floor(Math.random() * 50000) + 1000;
  const tax = Math.floor(amount * 0.1);
  const total = amount + tax;
  
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  
  const data = {
    user_id: userId,
    quote_number: `QUO-TEST-${timestamp}-${random}`,
    title: `Test Quote ${random}`,
    description: `Test quote description ${random}`,
    amount: amount,
    tax: tax,
    total: total,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    valid_until: validUntil.toISOString().split('T')[0],
    ...overrides
  };
  
  if (clientId) {
    data.client_id = clientId;
  }
  
  return data;
}

/**
 * Generates a complete test dataset with related entities
 * @param {Object} pool - Database connection pool
 * @returns {Promise<Object>} Generated test data with IDs
 */
async function generateCompleteTestDataset(pool) {
  const dataset = {
    user: null,
    clients: [],
    projects: [],
    tasks: [],
    timeEntries: [],
    invoices: [],
    notifications: [],
    quotes: []
  };
  
  try {
    // Generate and insert user
    const userData = generateUser();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, role, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userData.name, userData.email, hashedPassword, userData.role, userData.email_verified]
    );
    dataset.user = userResult.rows[0];
    
    // Generate and insert clients
    for (let i = 0; i < 2; i++) {
      const clientData = generateClient(dataset.user.id);
      const clientResult = await pool.query(
        `INSERT INTO clients (user_id, name, email, phone, company, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [clientData.user_id, clientData.name, clientData.email, clientData.phone, clientData.company, clientData.notes]
      );
      dataset.clients.push(clientResult.rows[0]);
    }
    
    // Generate and insert projects
    for (let i = 0; i < 2; i++) {
      const projectData = generateProject(dataset.user.id, dataset.clients[i % dataset.clients.length].id);
      const projectResult = await pool.query(
        `INSERT INTO projects (user_id, client_id, name, description, status, budget)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectData.user_id, projectData.client_id, projectData.name, projectData.description, projectData.status, projectData.budget]
      );
      dataset.projects.push(projectResult.rows[0]);
    }
    
    // Generate and insert tasks
    for (let i = 0; i < 3; i++) {
      const taskData = generateTask(dataset.user.id, dataset.projects[i % dataset.projects.length].id);
      const taskResult = await pool.query(
        `INSERT INTO tasks (user_id, project_id, title, description, status, priority)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [taskData.user_id, taskData.project_id, taskData.title, taskData.description, taskData.status, taskData.priority]
      );
      dataset.tasks.push(taskResult.rows[0]);
    }
    
    // Generate and insert time entries
    for (let i = 0; i < 5; i++) {
      const task = dataset.tasks[i % dataset.tasks.length];
      const timeEntryData = generateTimeEntry(dataset.user.id, task.id, task.project_id);
      const timeEntryResult = await pool.query(
        `INSERT INTO time_entries (user_id, task_id, project_id, description, start_time, end_time, duration, is_billable, hourly_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [timeEntryData.user_id, timeEntryData.task_id, timeEntryData.project_id, timeEntryData.description, 
         timeEntryData.start_time, timeEntryData.end_time, timeEntryData.duration, timeEntryData.is_billable, timeEntryData.hourly_rate]
      );
      dataset.timeEntries.push(timeEntryResult.rows[0]);
    }
    
    // Generate and insert invoices
    for (let i = 0; i < 2; i++) {
      const project = dataset.projects[i % dataset.projects.length];
      const invoiceData = generateInvoice(dataset.user.id, project.client_id, project.id);
      const invoiceResult = await pool.query(
        `INSERT INTO invoices (user_id, client_id, project_id, invoice_number, amount, tax, total, status, issue_date, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [invoiceData.user_id, invoiceData.client_id, invoiceData.project_id, invoiceData.invoice_number,
         invoiceData.amount, invoiceData.tax, invoiceData.total, invoiceData.status, invoiceData.issue_date, invoiceData.due_date]
      );
      dataset.invoices.push(invoiceResult.rows[0]);
    }
    
    // Generate and insert notifications
    for (let i = 0; i < 3; i++) {
      const notificationData = generateNotification(dataset.user.id);
      const notificationResult = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, is_read)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [notificationData.user_id, notificationData.type, notificationData.title, notificationData.message, notificationData.is_read]
      );
      dataset.notifications.push(notificationResult.rows[0]);
    }
    
    // Generate and insert quotes
    for (let i = 0; i < 2; i++) {
      const client = dataset.clients[i % dataset.clients.length];
      const quoteData = generateQuote(dataset.user.id, client.id);
      const quoteResult = await pool.query(
        `INSERT INTO quotes (user_id, client_id, quote_number, title, description, amount, tax, total, status, valid_until)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [quoteData.user_id, quoteData.client_id, quoteData.quote_number, quoteData.title, quoteData.description,
         quoteData.amount, quoteData.tax, quoteData.total, quoteData.status, quoteData.valid_until]
      );
      dataset.quotes.push(quoteResult.rows[0]);
    }
    
    return dataset;
  } catch (error) {
    throw new Error(`Failed to generate complete test dataset: ${error.message}`);
  }
}

module.exports = {
  generateRandomString,
  generateEmail,
  generatePhoneNumber,
  generateUser,
  generateClient,
  generateProject,
  generateTask,
  generateTimeEntry,
  generateInvoice,
  generateInvoiceItem,
  generateNotification,
  generateQuote,
  generateCompleteTestDataset
};
