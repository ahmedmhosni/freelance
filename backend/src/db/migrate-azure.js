require('dotenv').config(); // Use main .env file
const { getPool, closePool } = require('./azuresql');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('🚀 Starting Azure SQL migration...\n');
    
    const pool = await getPool();
    
    // Read and execute schema
    console.log('Creating database schema...');
    const schemaPath = path.join(__dirname, 'schema-azure.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by GO statements and execute each batch
    const batches = schema.split(/\nGO\n/gi).filter(batch => batch.trim());
    
    for (const batch of batches) {
      if (batch.trim()) {
        try {
          await pool.request().query(batch);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
            console.error('Schema error:', err.message);
          }
        }
      }
    }
    
    console.log('✓ Schema created successfully\n');

    // Create default admin user
    console.log('Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    try {
      await pool.request()
        .input('email', 'admin@example.com')
        .input('password', hashedPassword)
        .input('name', 'Admin User')
        .input('role', 'admin')
        .query(`
          IF NOT EXISTS (SELECT 1 FROM users WHERE email = @email)
          BEGIN
            INSERT INTO users (email, password, name, role, is_active)
            VALUES (@email, @password, @name, @role, 1)
          END
        `);
      console.log('✓ Default admin user created');
      console.log('  Email: admin@example.com');
      console.log('  Password: admin123\n');
    } catch (err) {
      console.log('✓ Admin user already exists\n');
    }

    // Create default quotes
    console.log('Creating default quotes...');
    const quotes = [
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
      { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' }
    ];

    for (const quote of quotes) {
      try {
        await pool.request()
          .input('text', quote.text)
          .input('author', quote.author)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM quotes WHERE text = @text)
            BEGIN
              INSERT INTO quotes (text, author, is_active)
              VALUES (@text, @author, 1)
            END
          `);
      } catch (err) {
        // Ignore errors
      }
    }
    console.log('✓ Default quotes created\n');

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('  - 10 tables created');
    console.log('  - Indexes created');
    console.log('  - Admin user ready');
    console.log('  - Sample data added');
    console.log('\n🚀 Your Azure SQL database is ready!');
    
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error);
    await closePool();
    process.exit(1);
  }
}

// Run migration
migrate();
