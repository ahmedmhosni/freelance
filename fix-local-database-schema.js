const { Pool } = require('pg');

console.log('\n' + '='.repeat(80));
console.log('🔧 FIXING LOCAL DATABASE SCHEMA');
console.log('='.repeat(80));
console.log(`Time: ${new Date().toISOString()}`);
console.log('='.repeat(80) + '\n');

// Local database connection
const localDbPool = new Pool({
  host: 'localhost',
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123',
  port: 5432,
  ssl: false
});

// Azure database connection for reference
const azureDbPool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function fixQuotesTable() {
  console.log('📝 FIXING QUOTES TABLE SCHEMA');
  console.log('-'.repeat(50));
  
  try {
    // Check if updated_at column exists
    const columnCheck = await localDbPool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'quotes' AND column_name = 'updated_at'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('Adding updated_at column to quotes table...');
      await localDbPool.query(`
        ALTER TABLE quotes 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Added updated_at column');
    } else {
      console.log('✅ updated_at column already exists');
    }

    // Check if created_at column exists
    const createdAtCheck = await localDbPool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'quotes' AND column_name = 'created_at'
    `);
    
    if (createdAtCheck.rows.length === 0) {
      console.log('Adding created_at column to quotes table...');
      await localDbPool.query(`
        ALTER TABLE quotes 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Added created_at column');
    } else {
      console.log('✅ created_at column already exists');
    }

    // Now sync quotes from Azure
    console.log('\n💬 Syncing quotes from Azure...');
    const azureQuotes = await azureDbPool.query('SELECT * FROM quotes ORDER BY id');
    
    if (azureQuotes.rows.length > 0) {
      // Clear local quotes
      await localDbPool.query('DELETE FROM quotes');
      
      // Insert Azure quotes
      for (const quote of azureQuotes.rows) {
        await localDbPool.query(`
          INSERT INTO quotes (id, text, author, category, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            text = EXCLUDED.text,
            author = EXCLUDED.author,
            category = EXCLUDED.category,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at
        `, [
          quote.id,
          quote.text,
          quote.author,
          quote.category,
          quote.is_active,
          quote.created_at || new Date(),
          quote.updated_at || new Date()
        ]);
      }
      console.log(`✅ Synced ${azureQuotes.rows.length} quotes`);
      
      // Show active quotes
      const activeQuotes = await localDbPool.query('SELECT COUNT(*) as count FROM quotes WHERE is_active = true');
      console.log(`✅ Active quotes: ${activeQuotes.rows[0].count}`);
    }

  } catch (error) {
    console.log(`❌ Error fixing quotes table: ${error.message}`);
  }
}

async function fixVersionsTable() {
  console.log('\n📝 FIXING VERSIONS AND CHANGELOG TABLES');
  console.log('-'.repeat(50));
  
  try {
    // Sync versions from Azure
    console.log('Syncing versions from Azure...');
    const azureVersions = await azureDbPool.query('SELECT * FROM versions ORDER BY id');
    
    if (azureVersions.rows.length > 0) {
      // Clear local versions and changelog items
      await localDbPool.query('DELETE FROM changelog_items');
      await localDbPool.query('DELETE FROM versions');
      
      // Insert Azure versions
      for (const version of azureVersions.rows) {
        await localDbPool.query(`
          INSERT INTO versions (id, version, release_date, is_published, created_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            version = EXCLUDED.version,
            release_date = EXCLUDED.release_date,
            is_published = EXCLUDED.is_published,
            updated_at = EXCLUDED.updated_at
        `, [
          version.id,
          version.version,
          version.release_date,
          version.is_published,
          version.created_by,
          version.created_at,
          version.updated_at
        ]);
      }

      // Sync changelog items
      const azureChangelogItems = await azureDbPool.query('SELECT * FROM changelog_items ORDER BY id');
      for (const item of azureChangelogItems.rows) {
        await localDbPool.query(`
          INSERT INTO changelog_items (id, version_id, category, title, description, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            category = EXCLUDED.category,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            updated_at = EXCLUDED.updated_at
        `, [
          item.id,
          item.version_id,
          item.category,
          item.title,
          item.description,
          item.created_at,
          item.updated_at
        ]);
      }
      
      console.log(`✅ Synced ${azureVersions.rows.length} versions and ${azureChangelogItems.rows.length} changelog items`);
      
      // Show published versions
      const publishedVersions = await localDbPool.query('SELECT COUNT(*) as count FROM versions WHERE is_published = true');
      console.log(`✅ Published versions: ${publishedVersions.rows[0].count}`);
    }

  } catch (error) {
    console.log(`❌ Error fixing versions table: ${error.message}`);
  }
}

async function createTestUser() {
  console.log('\n👤 CREATING TEST USER FOR AUTHENTICATION');
  console.log('-'.repeat(50));
  
  try {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Ahmed@123456', 10);
    
    // Check if user exists
    const existingUser = await localDbPool.query(
      'SELECT id FROM users WHERE email = $1',
      ['ahmedmhosni90@gmail.com']
    );
    
    if (existingUser.rows.length === 0) {
      // Create user
      await localDbPool.query(`
        INSERT INTO users (name, email, password, role, is_verified, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'Ahmed Hosni',
        'ahmedmhosni90@gmail.com',
        hashedPassword,
        'admin',
        true,
        true,
        new Date(),
        new Date()
      ]);
      console.log('✅ Created test user');
    } else {
      // Update existing user
      await localDbPool.query(`
        UPDATE users 
        SET password = $1, is_verified = true, is_active = true, role = 'admin'
        WHERE email = $2
      `, [hashedPassword, 'ahmedmhosni90@gmail.com']);
      console.log('✅ Updated existing test user');
    }
    
    // Verify user
    const user = await localDbPool.query(
      'SELECT id, name, email, role, is_verified, is_active FROM users WHERE email = $1',
      ['ahmedmhosni90@gmail.com']
    );
    
    if (user.rows.length > 0) {
      console.log(`✅ User verified: ${user.rows[0].name} (${user.rows[0].role})`);
    }

  } catch (error) {
    console.log(`❌ Error creating test user: ${error.message}`);
  }
}

async function verifyFixes() {
  console.log('\n🔍 VERIFYING ALL FIXES');
  console.log('-'.repeat(50));
  
  try {
    // Check announcements
    const announcements = await localDbPool.query('SELECT COUNT(*) as count FROM announcements');
    console.log(`📢 Announcements: ${announcements.rows[0].count}`);
    
    const featuredAnnouncements = await localDbPool.query('SELECT COUNT(*) as count FROM announcements WHERE is_featured = true');
    console.log(`🌟 Featured announcements: ${featuredAnnouncements.rows[0].count}`);
    
    // Check quotes
    const quotes = await localDbPool.query('SELECT COUNT(*) as count FROM quotes WHERE is_active = true');
    console.log(`💬 Active quotes: ${quotes.rows[0].count}`);
    
    // Check versions
    const versions = await localDbPool.query('SELECT COUNT(*) as count FROM versions WHERE is_published = true');
    console.log(`📝 Published versions: ${versions.rows[0].count}`);
    
    // Check users
    const users = await localDbPool.query('SELECT COUNT(*) as count FROM users WHERE is_verified = true');
    console.log(`👥 Verified users: ${users.rows[0].count}`);
    
    console.log('\n✅ All database fixes completed!');

  } catch (error) {
    console.log(`❌ Error verifying fixes: ${error.message}`);
  }
}

async function main() {
  try {
    // Test connections
    await localDbPool.query('SELECT NOW()');
    await azureDbPool.query('SELECT NOW()');
    console.log('✅ Database connections successful\n');

    // Fix all issues
    await fixQuotesTable();
    await fixVersionsTable();
    await createTestUser();
    await verifyFixes();

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ALL FIXES COMPLETED!');
    console.log('='.repeat(80));
    console.log('Now run: node test-local-comprehensive.js');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Fix process failed:', error);
  } finally {
    // Close database connections
    await localDbPool.end();
    await azureDbPool.end();
  }
}

// Run the fix process
main();