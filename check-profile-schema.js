const { query } = require('./backend/src/db/postgresql');

async function checkSchema() {
  try {
    console.log('Checking users table schema...\n');
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, ['users']);
    
    console.log('Users table columns:');
    console.log('─'.repeat(80));
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(25)} ${row.data_type.padEnd(20)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(80));
    console.log(`Total columns: ${result.rows.length}\n`);

    // Check if profile fields exist
    const profileFields = [
      'username', 'job_title', 'bio', 'profile_picture', 'location', 
      'website', 'linkedin', 'behance', 'instagram', 'facebook', 
      'twitter', 'github', 'dribbble', 'portfolio', 'profile_visibility'
    ];

    console.log('Profile field status:');
    console.log('─'.repeat(80));
    profileFields.forEach(field => {
      const exists = result.rows.some(row => row.column_name === field);
      console.log(`${field.padEnd(25)} ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
    });
    console.log('─'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
