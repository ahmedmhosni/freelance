require('dotenv').config({
  path: require('path').join(__dirname, '../../.env'),
});
const { query } = require('./postgresql');
const fs = require('fs');
const path = require('path');

async function runAnnouncementsMigration() {
  try {
    console.log('🚀 Running announcements table migration...');

    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create-announcements-table.sql'),
      'utf8'
    );

    await query(sql);

    console.log('✅ Announcements table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runAnnouncementsMigration();
