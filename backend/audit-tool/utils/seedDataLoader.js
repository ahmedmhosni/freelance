/**
 * Seed Data Loader
 * 
 * Loads seed data from seed files and resets database to known state before tests.
 * Supports multiple seed data sets for different testing scenarios.
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const logger = require('./logger');
const { cleanupAllTestData } = require('./testDataCleanup');

/**
 * Loads the simple seed data set
 * @param {Object} pool - Database connection pool
 * @returns {Promise<Object>} Seed data result with created IDs
 */
async function loadSimpleSeedData(pool) {
  const result = {
    success: false,
    user: null,
    clients: [],
    projects: [],
    tasks: [],
    timeEntries: [],
    invoices: [],
    errors: [],
    timestamp: new Date().toISOString()
  };

  try {
    logger.info('Loading simple seed data...');

    const userEmail = 'test-seed-user@example.com';
    
    // Check if user already exists
    let userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    let userId;
    
    if (userResult.rows.length === 0) {
      // Create user
      logger.debug('Creating seed user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = await pool.query(
        'INSERT INTO users (name, email, password, role, email_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['Seed Test User', userEmail, hashedPassword, 'freelancer', true]
      );
      userId = newUser.rows[0].id;
      result.user = newUser.rows[0];
    } else {
      userId = userResult.rows[0].id;
      userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      result.user = userResult.rows[0];
      logger.debug(`Using existing seed user (ID: ${userId})`);
    }
    
    // Clear existing data for this user
    logger.debug('Clearing existing seed data...');
    await pool.query('DELETE FROM time_entries WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM invoices WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM projects WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM clients WHERE user_id = $1', [userId]);
    
    // Create clients
    logger.debug('Creating seed clients...');
    const client1 = await pool.query(
      'INSERT INTO clients (user_id, name, email, company) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, 'Acme Corporation', 'contact@acme.com', 'Acme Corp']
    );
    result.clients.push(client1.rows[0]);
    
    const client2 = await pool.query(
      'INSERT INTO clients (user_id, name, email, company) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, 'TechStart Inc', 'hello@techstart.io', 'TechStart']
    );
    result.clients.push(client2.rows[0]);
    
    // Create projects
    logger.debug('Creating seed projects...');
    const project1 = await pool.query(
      'INSERT INTO projects (user_id, client_id, name, description, budget, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, client1.rows[0].id, 'Website Redesign', 'Complete website redesign', 15000, 'in_progress']
    );
    result.projects.push(project1.rows[0]);
    
    const project2 = await pool.query(
      'INSERT INTO projects (user_id, client_id, name, description, budget, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, client2.rows[0].id, 'Mobile App', 'iOS and Android app', 45000, 'in_progress']
    );
    result.projects.push(project2.rows[0]);
    
    // Create tasks
    logger.debug('Creating seed tasks...');
    const task1 = await pool.query(
      'INSERT INTO tasks (user_id, project_id, title, description, status, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, project1.rows[0].id, 'Design homepage', 'Create homepage mockup', 'in_progress', 'high']
    );
    result.tasks.push(task1.rows[0]);
    
    const task2 = await pool.query(
      'INSERT INTO tasks (user_id, project_id, title, description, status, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, project2.rows[0].id, 'Setup authentication', 'Implement OAuth', 'in_progress', 'high']
    );
    result.tasks.push(task2.rows[0]);
    
    // Create time entries
    logger.debug('Creating seed time entries...');
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start);
      end.setHours(12, 30, 0, 0);
      const duration = 210; // 3.5 hours
      
      const timeEntry = await pool.query(
        'INSERT INTO time_entries (user_id, task_id, project_id, description, start_time, end_time, duration, is_billable, hourly_rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [userId, task1.rows[0].id, project1.rows[0].id, 'Working on project', start, end, duration, true, 85]
      );
      result.timeEntries.push(timeEntry.rows[0]);
    }
    
    // Create invoices
    logger.debug('Creating seed invoices...');
    const invoice = await pool.query(
      'INSERT INTO invoices (user_id, client_id, project_id, invoice_number, amount, tax, total, status, issue_date, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [userId, client1.rows[0].id, project1.rows[0].id, 'INV-SEED-001', 5000, 0, 5000, 'sent', '2025-12-01', '2025-12-31']
    );
    result.invoices.push(invoice.rows[0]);
    
    result.success = true;
    logger.info('Simple seed data loaded successfully');

  } catch (error) {
    result.errors.push(error.message);
    logger.error('Failed to load simple seed data:', error.message);
  }

  return result;
}

/**
 * Loads a comprehensive seed data set with more entities
 * @param {Object} pool - Database connection pool
 * @returns {Promise<Object>} Seed data result with created IDs
 */
async function loadComprehensiveSeedData(pool) {
  const result = {
    success: false,
    users: [],
    clients: [],
    projects: [],
    tasks: [],
    timeEntries: [],
    invoices: [],
    notifications: [],
    quotes: [],
    errors: [],
    timestamp: new Date().toISOString()
  };

  try {
    logger.info('Loading comprehensive seed data...');

    // Create multiple users
    const userEmails = [
      'test-seed-freelancer@example.com',
      'test-seed-client@example.com'
    ];

    for (const email of userEmails) {
      let userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      let userId;
      
      if (userResult.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const role = email.includes('freelancer') ? 'freelancer' : 'client';
        const name = email.includes('freelancer') ? 'Seed Freelancer' : 'Seed Client';
        
        const newUser = await pool.query(
          'INSERT INTO users (name, email, password, role, email_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [name, email, hashedPassword, role, true]
        );
        result.users.push(newUser.rows[0]);
      } else {
        userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        result.users.push(userResult.rows[0]);
      }
    }

    const freelancerId = result.users[0].id;

    // Clear existing data
    await pool.query('DELETE FROM time_entries WHERE user_id = $1', [freelancerId]);
    await pool.query('DELETE FROM invoices WHERE user_id = $1', [freelancerId]);
    await pool.query('DELETE FROM tasks WHERE user_id = $1', [freelancerId]);
    await pool.query('DELETE FROM projects WHERE user_id = $1', [freelancerId]);
    await pool.query('DELETE FROM clients WHERE user_id = $1', [freelancerId]);
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [freelancerId]);
    await pool.query('DELETE FROM quotes WHERE user_id = $1', [freelancerId]);

    // Create clients
    const clientNames = [
      { name: 'Global Tech Solutions', email: 'contact@globaltech.com', company: 'Global Tech' },
      { name: 'Startup Ventures', email: 'hello@startupventures.io', company: 'Startup Ventures' },
      { name: 'Enterprise Corp', email: 'info@enterprise.com', company: 'Enterprise Corp' }
    ];

    for (const clientData of clientNames) {
      const client = await pool.query(
        'INSERT INTO clients (user_id, name, email, company, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [freelancerId, clientData.name, clientData.email, clientData.company, '555-0100']
      );
      result.clients.push(client.rows[0]);
    }

    // Create projects
    const projectData = [
      { name: 'E-commerce Platform', description: 'Build online store', budget: 50000, status: 'in_progress' },
      { name: 'Mobile App Development', description: 'iOS and Android apps', budget: 75000, status: 'in_progress' },
      { name: 'Website Redesign', description: 'Modernize company website', budget: 25000, status: 'active' }
    ];

    for (let i = 0; i < projectData.length; i++) {
      const project = await pool.query(
        'INSERT INTO projects (user_id, client_id, name, description, budget, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [freelancerId, result.clients[i].id, projectData[i].name, projectData[i].description, projectData[i].budget, projectData[i].status]
      );
      result.projects.push(project.rows[0]);
    }

    // Create tasks
    const taskData = [
      { title: 'Setup database', description: 'Configure PostgreSQL', status: 'completed', priority: 'high' },
      { title: 'Design UI mockups', description: 'Create Figma designs', status: 'in_progress', priority: 'high' },
      { title: 'Implement authentication', description: 'JWT auth system', status: 'in_progress', priority: 'urgent' },
      { title: 'Write API documentation', description: 'Document all endpoints', status: 'todo', priority: 'medium' },
      { title: 'Deploy to production', description: 'Setup CI/CD pipeline', status: 'todo', priority: 'low' }
    ];

    for (let i = 0; i < taskData.length; i++) {
      const projectId = result.projects[i % result.projects.length].id;
      const task = await pool.query(
        'INSERT INTO tasks (user_id, project_id, title, description, status, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [freelancerId, projectId, taskData[i].title, taskData[i].description, taskData[i].status, taskData[i].priority]
      );
      result.tasks.push(task.rows[0]);
    }

    // Create time entries
    const now = new Date();
    for (let i = 0; i < 20; i++) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(9 + (i % 8), 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 3, 30, 0, 0);
      const duration = 210;
      
      const taskId = result.tasks[i % result.tasks.length].id;
      const projectId = result.tasks[i % result.tasks.length].project_id;
      
      const timeEntry = await pool.query(
        'INSERT INTO time_entries (user_id, task_id, project_id, description, start_time, end_time, duration, is_billable, hourly_rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [freelancerId, taskId, projectId, `Work on ${result.tasks[i % result.tasks.length].title}`, start, end, duration, true, 85]
      );
      result.timeEntries.push(timeEntry.rows[0]);
    }

    // Create invoices
    for (let i = 0; i < 3; i++) {
      const project = result.projects[i];
      const invoice = await pool.query(
        'INSERT INTO invoices (user_id, client_id, project_id, invoice_number, amount, tax, total, status, issue_date, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [freelancerId, project.client_id, project.id, `INV-SEED-${1000 + i}`, 10000 + (i * 5000), 1000, 11000 + (i * 5000), 'sent', '2025-12-01', '2025-12-31']
      );
      result.invoices.push(invoice.rows[0]);
    }

    // Create notifications
    const notificationData = [
      { type: 'info', title: 'New project assigned', message: 'You have been assigned to E-commerce Platform' },
      { type: 'success', title: 'Invoice paid', message: 'Invoice INV-SEED-1000 has been paid' },
      { type: 'warning', title: 'Deadline approaching', message: 'Task "Design UI mockups" is due soon' }
    ];

    for (const notif of notificationData) {
      const notification = await pool.query(
        'INSERT INTO notifications (user_id, type, title, message, is_read) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [freelancerId, notif.type, notif.title, notif.message, false]
      );
      result.notifications.push(notification.rows[0]);
    }

    // Create quotes
    for (let i = 0; i < 2; i++) {
      const client = result.clients[i];
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      
      const quote = await pool.query(
        'INSERT INTO quotes (user_id, client_id, quote_number, title, description, amount, tax, total, status, valid_until) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [freelancerId, client.id, `QUO-SEED-${2000 + i}`, `Quote for ${client.name}`, 'Detailed project quote', 20000, 2000, 22000, 'sent', validUntil.toISOString().split('T')[0]]
      );
      result.quotes.push(quote.rows[0]);
    }

    result.success = true;
    logger.info('Comprehensive seed data loaded successfully');

  } catch (error) {
    result.errors.push(error.message);
    logger.error('Failed to load comprehensive seed data:', error.message);
  }

  return result;
}

/**
 * Resets database to known state by cleaning all test data and loading fresh seed data
 * @param {Object} pool - Database connection pool
 * @param {string} seedType - Type of seed data to load ('simple' or 'comprehensive')
 * @returns {Promise<Object>} Reset result
 */
async function resetDatabaseToKnownState(pool, seedType = 'simple') {
  const result = {
    success: false,
    cleanupResult: null,
    seedResult: null,
    errors: [],
    timestamp: new Date().toISOString()
  };

  try {
    logger.info(`Resetting database to known state with ${seedType} seed data...`);

    // Clean up all existing test data
    logger.debug('Cleaning up existing test data...');
    result.cleanupResult = await cleanupAllTestData(pool);

    if (!result.cleanupResult.success) {
      logger.warn('Cleanup completed with errors, proceeding with seed data load');
    }

    // Load fresh seed data
    logger.debug(`Loading ${seedType} seed data...`);
    if (seedType === 'comprehensive') {
      result.seedResult = await loadComprehensiveSeedData(pool);
    } else {
      result.seedResult = await loadSimpleSeedData(pool);
    }

    if (!result.seedResult.success) {
      result.errors.push('Failed to load seed data');
      logger.error('Failed to load seed data');
      return result;
    }

    result.success = result.seedResult.success;
    logger.info('Database reset to known state successfully');

  } catch (error) {
    result.errors.push(error.message);
    logger.error('Failed to reset database to known state:', error.message);
  }

  return result;
}

/**
 * Creates a database connection pool from config
 * @param {Object} config - Database configuration
 * @returns {Pool} Database connection pool
 */
function createPool(config) {
  return new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });
}

module.exports = {
  loadSimpleSeedData,
  loadComprehensiveSeedData,
  resetDatabaseToKnownState,
  createPool
};
