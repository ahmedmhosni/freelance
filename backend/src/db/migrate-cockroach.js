require('dotenv').config({ path: '.env.production' });
const { pool } = require('./cockroachdb');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    console.log('🚀 Starting CockroachDB migration...\n');
    
    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_active INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create clients table
    console.log('Creating clients table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        address TEXT,
        notes TEXT,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Clients table created');

    // Create projects table
    console.log('Creating projects table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        client_id INT REFERENCES clients(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'active',
        budget DECIMAL(10, 2),
        start_date DATE,
        end_date DATE,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Projects table created');

    // Create tasks table
    console.log('Creating tasks table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'medium',
        due_date DATE,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tasks table created');

    // Create invoices table
    console.log('Creating invoices table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
        project_id INT REFERENCES projects(id) ON DELETE SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        notes TEXT,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Invoices table created');

    // Create invoice_items table
    console.log('Creating invoice_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity INT DEFAULT 1,
        rate DECIMAL(10, 2) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL
      )
    `);
    console.log('✓ Invoice items table created');

    // Create files table
    console.log('Creating files table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        size INT,
        path VARCHAR(500) NOT NULL,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        uploaded_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Files table created');

    // Create notifications table
    console.log('Creating notifications table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Notifications table created');

    // Create time_entries table
    console.log('Creating time_entries table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        task_id INT REFERENCES tasks(id) ON DELETE SET NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INT,
        is_billable INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Time entries table created');

    // Create quotes table
    console.log('Creating quotes table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        author VARCHAR(255),
        is_active INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Quotes table created');

    // Create default admin user
    console.log('\nCreating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@example.com']
    );

    if (existingUser.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (email, password, name, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin@example.com', hashedPassword, 'Admin User', 'admin', 1]);
      console.log('✓ Default admin user created');
      console.log('  Email: admin@example.com');
      console.log('  Password: admin123');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create some default quotes
    console.log('\nCreating default quotes...');
    const quotes = [
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
      { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' }
    ];

    for (const quote of quotes) {
      const existing = await pool.query(
        'SELECT id FROM quotes WHERE text = $1',
        [quote.text]
      );
      
      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO quotes (text, author, is_active) VALUES ($1, $2, $3)',
          [quote.text, quote.author, 1]
        );
      }
    }
    console.log('✓ Default quotes created');

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('  - 10 tables created');
    console.log('  - Admin user ready');
    console.log('  - Sample data added');
    console.log('\n🚀 Your app is ready to use!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run migration
migrate();
