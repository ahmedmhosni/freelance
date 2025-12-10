const { Pool } = require('pg');

console.log('\n' + '='.repeat(80));
console.log('🔧 COMPREHENSIVE DATABASE SCHEMA FIX');
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

async function addMissingColumns() {
  console.log('🔧 ADDING MISSING COLUMNS TO ALL TABLES');
  console.log('-'.repeat(50));
  
  const columnFixes = [
    // Quotes table
    {
      table: 'quotes',
      column: 'updated_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    {
      table: 'quotes',
      column: 'created_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    
    // Changelog items table
    {
      table: 'changelog_items',
      column: 'updated_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    {
      table: 'changelog_items',
      column: 'created_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    
    // Users table
    {
      table: 'users',
      column: 'is_verified',
      type: 'BOOLEAN DEFAULT false'
    },
    {
      table: 'users',
      column: 'email_verified',
      type: 'BOOLEAN DEFAULT false'
    },
    {
      table: 'users',
      column: 'is_active',
      type: 'BOOLEAN DEFAULT true'
    },
    {
      table: 'users',
      column: 'role',
      type: 'VARCHAR(50) DEFAULT \'user\''
    },
    
    // Versions table
    {
      table: 'versions',
      column: 'updated_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    {
      table: 'versions',
      column: 'created_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    
    // Announcements table
    {
      table: 'announcements',
      column: 'updated_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    {
      table: 'announcements',
      column: 'created_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    
    // Legal content table
    {
      table: 'legal_content',
      column: 'updated_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    {
      table: 'legal_content',
      column: 'created_at',
      type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    }
  ];

  for (const fix of columnFixes) {
    try {
      // Check if column exists
      const columnCheck = await localDbPool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [fix.table, fix.column]);
      
      if (columnCheck.rows.length === 0) {
        console.log(`Adding ${fix.column} to ${fix.table}...`);
        await localDbPool.query(`ALTER TABLE ${fix.table} ADD COLUMN ${fix.column} ${fix.type}`);
        console.log(`✅ Added ${fix.column} to ${fix.table}`);
      } else {
        console.log(`✅ ${fix.table}.${fix.column} already exists`);
      }
    } catch (error) {
      console.log(`⚠️ Could not add ${fix.column} to ${fix.table}: ${error.message}`);
    }
  }
}

async function syncAllData() {
  console.log('\n📊 SYNCING ALL DATA FROM AZURE TO LOCAL');
  console.log('-'.repeat(50));
  
  try {
    // Sync announcements
    console.log('📢 Syncing announcements...');
    const azureAnnouncements = await azureDbPool.query('SELECT * FROM announcements ORDER BY id');
    if (azureAnnouncements.rows.length > 0) {
      await localDbPool.query('DELETE FROM announcements');
      for (const announcement of azureAnnouncements.rows) {
        await localDbPool.query(`
          INSERT INTO announcements (id, title, content, is_featured, media_url, media_type, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            is_featured = EXCLUDED.is_featured,
            media_url = EXCLUDED.media_url,
            media_type = EXCLUDED.media_type,
            updated_at = EXCLUDED.updated_at
        `, [
          announcement.id,
          announcement.title,
          announcement.content,
          announcement.is_featured,
          announcement.media_url,
          announcement.media_type,
          announcement.created_at || new Date(),
          announcement.updated_at || new Date()
        ]);
      }
      console.log(`✅ Synced ${azureAnnouncements.rows.length} announcements`);
    }

    // Sync quotes
    console.log('💬 Syncing quotes...');
    const azureQuotes = await azureDbPool.query('SELECT * FROM quotes ORDER BY id');
    if (azureQuotes.rows.length > 0) {
      await localDbPool.query('DELETE FROM quotes');
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
    }

    // Sync versions and changelog
    console.log('📝 Syncing versions and changelog...');
    const azureVersions = await azureDbPool.query('SELECT * FROM versions ORDER BY id');
    if (azureVersions.rows.length > 0) {
      await localDbPool.query('DELETE FROM changelog_items');
      await localDbPool.query('DELETE FROM versions');
      
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
          version.created_at || new Date(),
          version.updated_at || new Date()
        ]);
      }

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
          item.created_at || new Date(),
          item.updated_at || new Date()
        ]);
      }
      
      console.log(`✅ Synced ${azureVersions.rows.length} versions and ${azureChangelogItems.rows.length} changelog items`);
    }

    // Sync legal content
    console.log('⚖️ Syncing legal content...');
    const azureLegal = await azureDbPool.query('SELECT * FROM legal_content ORDER BY id');
    if (azureLegal.rows.length > 0) {
      await localDbPool.query('DELETE FROM legal_content');
      for (const legal of azureLegal.rows) {
        await localDbPool.query(`
          INSERT INTO legal_content (id, type, content, is_active, updated_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            content = EXCLUDED.content,
            is_active = EXCLUDED.is_active,
            updated_by = EXCLUDED.updated_by,
            updated_at = EXCLUDED.updated_at
        `, [
          legal.id,
          legal.type,
          legal.content,
          legal.is_active,
          legal.updated_by,
          legal.created_at || new Date(),
          legal.updated_at || new Date()
        ]);
      }
      console.log(`✅ Synced ${azureLegal.rows.length} legal content items`);
    }

  } catch (error) {
    console.log(`❌ Data sync error: ${error.message}`);
  }
}

async function createTestUser() {
  console.log('\n👤 CREATING TEST USER');
  console.log('-'.repeat(50));
  
  try {
    // Simple password hash (for testing only)
    const crypto = require('crypto');
    const password = 'Ahmed@123456';
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Check if user exists
    const existingUser = await localDbPool.query(
      'SELECT id FROM users WHERE email = $1',
      ['ahmedmhosni90@gmail.com']
    );
    
    if (existingUser.rows.length === 0) {
      // Create user
      await localDbPool.query(`
        INSERT INTO users (name, email, password, role, is_verified, email_verified, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        'Ahmed Hosni',
        'ahmedmhosni90@gmail.com',
        hash,
        'admin',
        true,
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
        SET password = $1, is_verified = true, email_verified = true, is_active = true, role = 'admin'
        WHERE email = $2
      `, [hash, 'ahmedmhosni90@gmail.com']);
      console.log('✅ Updated existing test user');
    }

  } catch (error) {
    console.log(`❌ Error creating test user: ${error.message}`);
  }
}

async function verifyAllData() {
  console.log('\n🔍 VERIFYING ALL DATA');
  console.log('-'.repeat(50));
  
  try {
    // Check all tables
    const tables = [
      { name: 'announcements', condition: '' },
      { name: 'announcements', condition: 'WHERE is_featured = true', label: 'featured announcements' },
      { name: 'quotes', condition: 'WHERE is_active = true', label: 'active quotes' },
      { name: 'versions', condition: 'WHERE is_published = true', label: 'published versions' },
      { name: 'users', condition: 'WHERE is_verified = true', label: 'verified users' },
      { name: 'legal_content', condition: 'WHERE is_active = true', label: 'active legal content' },
      { name: 'changelog_items', condition: '', label: 'changelog items' }
    ];

    for (const table of tables) {
      try {
        const result = await localDbPool.query(`SELECT COUNT(*) as count FROM ${table.name} ${table.condition}`);
        const label = table.label || table.name;
        console.log(`✅ ${label}: ${result.rows[0].count}`);
      } catch (error) {
        console.log(`⚠️ Could not check ${table.name}: ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ Error verifying data: ${error.message}`);
  }
}

async function main() {
  try {
    // Test connections
    await localDbPool.query('SELECT NOW()');
    await azureDbPool.query('SELECT NOW()');
    console.log('✅ Database connections successful\n');

    // Fix all schema issues
    await addMissingColumns();
    
    // Sync all data
    await syncAllData();
    
    // Create test user
    await createTestUser();
    
    // Verify everything
    await verifyAllData();

    console.log('\n' + '='.repeat(80));
    console.log('🎉 COMPREHENSIVE DATABASE FIX COMPLETED!');
    console.log('='.repeat(80));
    console.log('Now run: node test-local-comprehensive.js');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Comprehensive fix failed:', error);
  } finally {
    // Close database connections
    await localDbPool.end();
    await azureDbPool.end();
  }
}

// Run the comprehensive fix
main();