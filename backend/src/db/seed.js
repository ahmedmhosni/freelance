require('dotenv').config();
const bcrypt = require('bcryptjs');
const { runQuery, getOne } = require('./database');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Check if admin already exists
    const existingAdmin = await getOne('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
    
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await runQuery(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', adminPassword, 'admin']
    );
    console.log(`✓ Admin user created (ID: ${adminResult.id})`);
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');

    // Create freelancer user
    const freelancerPassword = await bcrypt.hash('freelancer123', 10);
    const freelancerResult = await runQuery(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['John Freelancer', 'freelancer@example.com', freelancerPassword, 'freelancer']
    );
    console.log(`✓ Freelancer user created (ID: ${freelancerResult.id})`);
    console.log('  Email: freelancer@example.com');
    console.log('  Password: freelancer123');

    // Create sample client for freelancer
    const clientResult = await runQuery(
      'INSERT INTO clients (user_id, name, email, phone, company, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [freelancerResult.id, 'Acme Corp', 'contact@acme.com', '+1234567890', 'Acme Corporation', 'Important client', 'vip,active']
    );
    console.log(`✓ Sample client created (ID: ${clientResult.id})`);

    // Create sample project
    const projectResult = await runQuery(
      'INSERT INTO projects (user_id, client_id, title, description, status, deadline) VALUES (?, ?, ?, ?, ?, ?)',
      [freelancerResult.id, clientResult.id, 'Website Redesign', 'Complete redesign of company website', 'active', '2025-12-31']
    );
    console.log(`✓ Sample project created (ID: ${projectResult.id})`);

    // Create sample tasks
    await runQuery(
      'INSERT INTO tasks (user_id, project_id, title, description, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [freelancerResult.id, projectResult.id, 'Design mockups', 'Create initial design mockups', 'high', 'in-progress', '2025-11-30']
    );
    await runQuery(
      'INSERT INTO tasks (user_id, project_id, title, description, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [freelancerResult.id, projectResult.id, 'Frontend development', 'Implement responsive frontend', 'medium', 'todo', '2025-12-15']
    );
    console.log('✓ Sample tasks created');

    // Create sample invoice
    await runQuery(
      'INSERT INTO invoices (user_id, project_id, client_id, invoice_number, amount, status, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [freelancerResult.id, projectResult.id, clientResult.id, 'INV-001', 5000.00, 'sent', '2025-12-01', 'First milestone payment']
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
