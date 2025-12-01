require('dotenv').config({
  path: require('path').join(__dirname, '.env.production'),
});
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runProductionMigration() {
  console.log('🚀 Starting production announcements migration...');

  // Create connection pool with production credentials (hardcoded for Azure)
  const pool = new Pool({
    host: 'roastifydbpost.postgres.database.azure.com',
    port: 5432,
    database: 'roastifydb',
    user: 'adminuser',
    password: 'AHmed#123456',
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('📡 Connecting to production database...');
    console.log('   Host: roastifydbpost.postgres.database.azure.com');
    console.log('   Database: roastifydb');

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to production database');

    // Read and execute migration SQL
    console.log('📝 Reading migration SQL...');
    const sql = fs.readFileSync(
      path.join(__dirname, 'src/db/migrations/create-announcements-table.sql'),
      'utf8'
    );

    console.log('⚡ Executing migration...');
    await pool.query(sql);
    console.log('✅ Announcements table created successfully!');

    // Seed sample data
    console.log('🌱 Seeding sample announcements...');

    const announcements = [
      {
        title: 'Welcome to Roastify!',
        content: `We're excited to have you here! Roastify is your all-in-one platform for managing your freelance business. Track time, manage clients, create invoices, and get paid faster.

This is a featured announcement that will appear on your home page and dashboard. You can create, edit, and manage announcements from the Admin Panel.

Stay tuned for more updates and new features!`,
        is_featured: true,
      },
      {
        title: 'New Features Coming Soon',
        content: `We're constantly working to improve Roastify and add new features that make your freelance life easier.

Upcoming features include:
- Advanced reporting and analytics
- Team collaboration tools
- Mobile app for iOS and Android
- Integration with popular payment gateways
- Automated invoice reminders

Keep an eye on this space for announcements about new releases!`,
        is_featured: false,
      },
      {
        title: 'Tips for Getting Started',
        content: `Here are some quick tips to help you get the most out of Roastify:

1. Set up your profile with your business information
2. Add your clients and their contact details
3. Create projects and assign them to clients
4. Track your time as you work
5. Generate professional invoices with one click
6. Monitor your income and expenses in the dashboard

Need help? Check out our documentation or contact support at support@roastify.online`,
        is_featured: false,
      },
    ];

    for (const announcement of announcements) {
      await pool.query(
        `INSERT INTO announcements (title, content, is_featured)
         VALUES ($1, $2, $3)`,
        [announcement.title, announcement.content, announcement.is_featured]
      );
      console.log(`   ✅ Created: ${announcement.title}`);
    }

    console.log('✅ Sample announcements seeded successfully!');
    console.log('');
    console.log('🎉 Production migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

runProductionMigration();
