// PostgreSQL queries for Roastify
// Clean, direct PostgreSQL syntax - no conversion needed

const { query, getOne, getAll } = require('./postgresql');

// ============================================
// USER QUERIES
// ============================================

async function findUserByEmail(email) {
  return getOne('SELECT * FROM users WHERE email = $1', [email]);
}

async function findUserById(id) {
  return getOne('SELECT * FROM users WHERE id = $1', [id]);
}

async function createUser(userData) {
  const {
    name,
    email,
    password,
    role = 'freelancer',
    email_verified = false,
    email_verification_token,
    email_verification_code,
    email_verification_expires,
  } = userData;

  const result = await query(
    `INSERT INTO users (name, email, password, role, email_verified, 
     email_verification_token, email_verification_code, email_verification_expires, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id, name, email, role`,
    [
      name,
      email,
      password,
      role,
      email_verified,
      email_verification_token,
      email_verification_code,
      email_verification_expires,
    ]
  );

  return result.rows[0];
}

async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    fields.push(`${key} = $${paramCount}`);
    values.push(updates[key]);
    paramCount++;
  });

  values.push(id);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() 
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

// ============================================
// CLIENT QUERIES
// ============================================

async function getAllClients(userId) {
  return getAll(
    'SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
}

async function getClientById(id, userId) {
  return getOne('SELECT * FROM clients WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
}

async function createClient(clientData) {
  const { user_id, name, email, phone, company, address, notes } = clientData;

  const result = await query(
    `INSERT INTO clients (user_id, name, email, phone, company, address, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [user_id, name, email, phone, company, address, notes]
  );

  return result.rows[0];
}

// ============================================
// PROJECT QUERIES
// ============================================

async function getAllProjects(userId) {
  return getAll(
    `SELECT p.*, c.name as client_name 
     FROM projects p 
     LEFT JOIN clients c ON p.client_id = c.id 
     WHERE p.user_id = $1 
     ORDER BY p.created_at DESC`,
    [userId]
  );
}

async function getProjectById(id, userId) {
  return getOne(
    `SELECT p.*, c.name as client_name 
     FROM projects p 
     LEFT JOIN clients c ON p.client_id = c.id 
     WHERE p.id = $1 AND p.user_id = $2`,
    [id, userId]
  );
}

async function createProject(projectData) {
  const {
    user_id,
    client_id,
    name,
    description,
    status,
    budget,
    start_date,
    end_date,
  } = projectData;

  const result = await query(
    `INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    [
      user_id,
      client_id,
      name,
      description,
      status,
      budget,
      start_date,
      end_date,
    ]
  );

  return result.rows[0];
}

// ============================================
// TASK QUERIES
// ============================================

async function getAllTasks(userId, filters = {}) {
  let queryText = `
    SELECT t.*, p.name as project_name, p.client_id 
    FROM tasks t 
    LEFT JOIN projects p ON t.project_id = p.id 
    WHERE t.user_id = $1
  `;

  const params = [userId];
  let paramCount = 2;

  if (filters.status) {
    queryText += ` AND t.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }

  if (filters.priority) {
    queryText += ` AND t.priority = $${paramCount}`;
    params.push(filters.priority);
    paramCount++;
  }

  if (filters.project_id) {
    queryText += ` AND t.project_id = $${paramCount}`;
    params.push(filters.project_id);
    paramCount++;
  }

  queryText += ' ORDER BY t.created_at DESC';

  if (filters.limit) {
    queryText += ` LIMIT $${paramCount}`;
    params.push(filters.limit);
  }

  return getAll(queryText, params);
}

async function createTask(taskData) {
  const {
    user_id,
    project_id,
    title,
    description,
    status,
    priority,
    due_date,
    assigned_to,
  } = taskData;

  const result = await query(
    `INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date, assigned_to, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    [
      user_id,
      project_id,
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
    ]
  );

  return result.rows[0];
}

// ============================================
// INVOICE QUERIES
// ============================================

async function getAllInvoices(userId) {
  return getAll(
    `SELECT i.*, c.name as client_name 
     FROM invoices i 
     LEFT JOIN clients c ON i.client_id = c.id 
     WHERE i.user_id = $1 
     ORDER BY i.created_at DESC`,
    [userId]
  );
}

async function getInvoiceById(id, userId) {
  return getOne(
    `SELECT i.*, c.name as client_name, c.email as client_email 
     FROM invoices i 
     LEFT JOIN clients c ON i.client_id = c.id 
     WHERE i.id = $1 AND i.user_id = $2`,
    [id, userId]
  );
}

async function createInvoice(invoiceData) {
  const {
    user_id,
    client_id,
    project_id,
    invoice_number,
    issue_date,
    due_date,
    amount,
    tax,
    total,
    status,
    notes,
  } = invoiceData;

  const result = await query(
    `INSERT INTO invoices (user_id, client_id, project_id, invoice_number, issue_date, 
     due_date, amount, tax, total, status, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
     RETURNING *`,
    [
      user_id,
      client_id,
      project_id,
      invoice_number,
      issue_date,
      due_date,
      amount,
      tax,
      total,
      status,
      notes,
    ]
  );

  return result.rows[0];
}

// ============================================
// MAINTENANCE QUERIES
// ============================================

async function getMaintenanceStatus() {
  return getOne(
    'SELECT is_active, message FROM maintenance ORDER BY updated_at DESC LIMIT 1'
  );
}

module.exports = {
  // Users
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,

  // Clients
  getAllClients,
  getClientById,
  createClient,

  // Projects
  getAllProjects,
  getProjectById,
  createProject,

  // Tasks
  getAllTasks,
  createTask,

  // Invoices
  getAllInvoices,
  getInvoiceById,
  createInvoice,

  // Maintenance
  getMaintenanceStatus,
};
