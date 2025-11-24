require('dotenv').config();
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const db = require('./index');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    const pool = await db;

    // Check if admin already exists
    const checkRequest = pool.request();
    checkRequest.input('email', sql.NVarChar, 'admin@example.com');
    const checkResult = await checkRequest.query('SELECT id FROM users WHERE email = @email');
    
    if (checkResult.recordset.length > 0) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminRequest = pool.request();
    adminRequest.input('name', sql.NVarChar, 'Admin User');
    adminRequest.input('email', sql.NVarChar, 'admin@example.com');
    adminRequest.input('password', sql.NVarChar, adminPassword);
    adminRequest.input('role', sql.NVarChar, 'admin');
    
    const adminResult = await adminRequest.query(
      'INSERT INTO users (name, email, password, role) OUTPUT INSERTED.id VALUES (@name, @email, @password, @role)'
    );
    const adminId = adminResult.recordset[0].id;
    console.log(`✓ Admin user created (ID: ${adminId})`);
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');

    // Create freelancer user
    const freelancerPassword = await bcrypt.hash('freelancer123', 10);
    const freelancerRequest = pool.request();
    freelancerRequest.input('name', sql.NVarChar, 'John Freelancer');
    freelancerRequest.input('email', sql.NVarChar, 'freelancer@example.com');
    freelancerRequest.input('password', sql.NVarChar, freelancerPassword);
    freelancerRequest.input('role', sql.NVarChar, 'freelancer');
    
    const freelancerResult = await freelancerRequest.query(
      'INSERT INTO users (name, email, password, role) OUTPUT INSERTED.id VALUES (@name, @email, @password, @role)'
    );
    const freelancerId = freelancerResult.recordset[0].id;
    console.log(`✓ Freelancer user created (ID: ${freelancerId})`);
    console.log('  Email: freelancer@example.com');
    console.log('  Password: freelancer123');

    // Create sample client for freelancer
    const clientRequest = pool.request();
    clientRequest.input('userId', sql.Int, freelancerId);
    clientRequest.input('name', sql.NVarChar, 'Acme Corp');
    clientRequest.input('email', sql.NVarChar, 'contact@acme.com');
    clientRequest.input('phone', sql.NVarChar, '+1234567890');
    clientRequest.input('company', sql.NVarChar, 'Acme Corporation');
    clientRequest.input('notes', sql.NVarChar, 'Important client - VIP status');
    
    const clientResult = await clientRequest.query(
      'INSERT INTO clients (user_id, name, email, phone, company, notes) OUTPUT INSERTED.id VALUES (@userId, @name, @email, @phone, @company, @notes)'
    );
    const clientId = clientResult.recordset[0].id;
    console.log(`✓ Sample client created (ID: ${clientId})`);

    // Create sample project
    const projectRequest = pool.request();
    projectRequest.input('userId', sql.Int, freelancerId);
    projectRequest.input('clientId', sql.Int, clientId);
    projectRequest.input('name', sql.NVarChar, 'Website Redesign');
    projectRequest.input('description', sql.NVarChar, 'Complete redesign of company website with modern UI/UX');
    projectRequest.input('status', sql.NVarChar, 'active');
    projectRequest.input('budget', sql.Decimal(10, 2), 15000.00);
    projectRequest.input('startDate', sql.Date, '2024-11-01');
    projectRequest.input('endDate', sql.Date, '2025-12-31');
    
    const projectResult = await projectRequest.query(
      'INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date) OUTPUT INSERTED.id VALUES (@userId, @clientId, @name, @description, @status, @budget, @startDate, @endDate)'
    );
    const projectId = projectResult.recordset[0].id;
    console.log(`✓ Sample project created (ID: ${projectId})`);

    // Create sample tasks
    const task1Request = pool.request();
    task1Request.input('userId', sql.Int, freelancerId);
    task1Request.input('assignedTo', sql.Int, freelancerId);
    task1Request.input('projectId', sql.Int, projectId);
    task1Request.input('title', sql.NVarChar, 'Design mockups');
    task1Request.input('description', sql.NVarChar, 'Create initial design mockups for homepage and key pages');
    task1Request.input('priority', sql.NVarChar, 'high');
    task1Request.input('status', sql.NVarChar, 'in-progress');
    task1Request.input('dueDate', sql.Date, '2024-11-30');
    
    await task1Request.query(
      'INSERT INTO tasks (user_id, assigned_to, project_id, title, description, priority, status, due_date) VALUES (@userId, @assignedTo, @projectId, @title, @description, @priority, @status, @dueDate)'
    );

    const task2Request = pool.request();
    task2Request.input('userId', sql.Int, freelancerId);
    task2Request.input('assignedTo', sql.Int, freelancerId);
    task2Request.input('projectId', sql.Int, projectId);
    task2Request.input('title', sql.NVarChar, 'Frontend development');
    task2Request.input('description', sql.NVarChar, 'Implement responsive frontend with React');
    task2Request.input('priority', sql.NVarChar, 'medium');
    task2Request.input('status', sql.NVarChar, 'todo');
    task2Request.input('dueDate', sql.Date, '2024-12-15');
    
    await task2Request.query(
      'INSERT INTO tasks (user_id, assigned_to, project_id, title, description, priority, status, due_date) VALUES (@userId, @assignedTo, @projectId, @title, @description, @priority, @status, @dueDate)'
    );
    console.log('✓ Sample tasks created');

    // Create sample invoice
    const invoiceRequest = pool.request();
    invoiceRequest.input('userId', sql.Int, freelancerId);
    invoiceRequest.input('projectId', sql.Int, projectId);
    invoiceRequest.input('clientId', sql.Int, clientId);
    invoiceRequest.input('invoiceNumber', sql.NVarChar, 'INV-001');
    invoiceRequest.input('amount', sql.Decimal(10, 2), 5000.00);
    invoiceRequest.input('tax', sql.Decimal(10, 2), 500.00);
    invoiceRequest.input('total', sql.Decimal(10, 2), 5500.00);
    invoiceRequest.input('status', sql.NVarChar, 'sent');
    invoiceRequest.input('issueDate', sql.Date, '2024-11-01');
    invoiceRequest.input('dueDate', sql.Date, '2024-12-01');
    invoiceRequest.input('notes', sql.NVarChar, 'First milestone payment - 30% deposit');
    
    await invoiceRequest.query(
      'INSERT INTO invoices (user_id, project_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, notes) VALUES (@userId, @projectId, @clientId, @invoiceNumber, @amount, @tax, @total, @status, @issueDate, @dueDate, @notes)'
    );
    console.log('✓ Sample invoice created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nYou can now login with:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  Freelancer: freelancer@example.com / freelancer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Wait a bit for database to initialize
setTimeout(seedDatabase, 1000);
