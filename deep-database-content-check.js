const { Pool } = require('pg');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function deepDatabaseCheck() {
  console.log('\n' + '='.repeat(100));
  console.log('🔍 DEEP DATABASE CONTENT ANALYSIS');
  console.log('='.repeat(100));
  console.log(`Database: roastifydb @ roastifydbpost.postgres.database.azure.com`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(100) + '\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Get all tables with data
    const tablesResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows
      FROM pg_stat_user_tables 
      WHERE n_live_tup > 0
      ORDER BY n_live_tup DESC
    `);

    console.log('📊 TABLES WITH DATA (Ordered by row count)');
    console.log('-'.repeat(100));
    
    for (const table of tablesResult.rows) {
      console.log(`\n🔸 ${table.tablename.toUpperCase()} (${table.live_rows} rows)`);
      console.log(`   Inserts: ${table.inserts}, Updates: ${table.updates}, Deletes: ${table.deletes}`);
      
      // Get actual data from each table
      try {
        const dataResult = await pool.query(`SELECT * FROM ${table.tablename} LIMIT 5`);
        
        if (dataResult.rows.length > 0) {
          console.log(`   📋 Sample Data (showing ${Math.min(5, dataResult.rows.length)} of ${table.live_rows} rows):`);
          
          dataResult.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(row, null, 2).substring(0, 200)}...`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Error reading data: ${error.message}`);
      }
    }

    // Check specific tables that should be showing in the app
    console.log('\n' + '='.repeat(100));
    console.log('🎯 CRITICAL APP DATA ANALYSIS');
    console.log('='.repeat(100));

    // 1. ANNOUNCEMENTS - Should show on home page
    console.log('\n📢 ANNOUNCEMENTS (Should display on home page)');
    console.log('-'.repeat(80));
    try {
      const announcements = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
      console.log(`Total announcements: ${announcements.rows.length}`);
      
      if (announcements.rows.length > 0) {
        announcements.rows.forEach((ann, index) => {
          console.log(`${index + 1}. "${ann.title}" (Featured: ${ann.is_featured})`);
          console.log(`   Content: ${ann.content.substring(0, 100)}...`);
          console.log(`   Created: ${ann.created_at}`);
          console.log(`   Media: ${ann.media_url || 'None'}`);
          console.log();
        });
      } else {
        console.log('❌ NO ANNOUNCEMENTS FOUND - This explains why nothing shows on home page!');
      }
    } catch (error) {
      console.log(`❌ Error reading announcements: ${error.message}`);
    }

    // 2. QUOTES - Should show daily quote
    console.log('\n💬 QUOTES (Should display daily quote)');
    console.log('-'.repeat(80));
    try {
      const quotes = await pool.query('SELECT * FROM quotes WHERE is_active = true ORDER BY id');
      console.log(`Active quotes: ${quotes.rows.length}`);
      
      if (quotes.rows.length > 0) {
        quotes.rows.forEach((quote, index) => {
          console.log(`${index + 1}. "${quote.text}"`);
          console.log(`   Author: ${quote.author}`);
          console.log(`   Category: ${quote.category}`);
          console.log(`   Active: ${quote.is_active}`);
          console.log();
        });
      } else {
        console.log('❌ NO ACTIVE QUOTES FOUND - Daily quote will show fallback!');
      }
    } catch (error) {
      console.log(`❌ Error reading quotes: ${error.message}`);
    }

    // 3. LEGAL CONTENT - Should show in legal pages
    console.log('\n⚖️ LEGAL CONTENT (Should display in legal pages)');
    console.log('-'.repeat(80));
    try {
      const legal = await pool.query('SELECT * FROM legal_content WHERE is_active = true ORDER BY type, updated_at DESC');
      console.log(`Active legal content: ${legal.rows.length}`);
      
      if (legal.rows.length > 0) {
        legal.rows.forEach((content, index) => {
          console.log(`${index + 1}. Type: ${content.type}`);
          console.log(`   Content length: ${content.content.length} characters`);
          console.log(`   Updated: ${content.updated_at}`);
          console.log(`   Updated by: ${content.updated_by}`);
          console.log();
        });
      } else {
        console.log('❌ NO LEGAL CONTENT FOUND - Will show defaults!');
      }
    } catch (error) {
      console.log(`❌ Error reading legal content: ${error.message}`);
    }

    // 4. VERSIONS & CHANGELOG - Should show in changelog
    console.log('\n📝 CHANGELOG DATA (Should display in changelog)');
    console.log('-'.repeat(80));
    try {
      const versions = await pool.query(`
        SELECT v.*, vn.name as version_name
        FROM versions v
        LEFT JOIN version_names vn ON v.version_name_id = vn.id
        WHERE v.is_published = true
        ORDER BY v.release_date DESC
      `);
      console.log(`Published versions: ${versions.rows.length}`);
      
      if (versions.rows.length > 0) {
        for (const version of versions.rows) {
          console.log(`Version: ${version.version} (${version.version_name})`);
          console.log(`Release Date: ${version.release_date}`);
          console.log(`Published: ${version.is_published}`);
          
          // Get changelog items for this version
          const items = await pool.query('SELECT * FROM changelog_items WHERE version_id = $1', [version.id]);
          console.log(`Changelog items: ${items.rows.length}`);
          
          items.rows.forEach((item, index) => {
            console.log(`  ${index + 1}. [${item.category}] ${item.title}`);
            console.log(`     ${item.description}`);
          });
          console.log();
        }
      } else {
        console.log('❌ NO PUBLISHED VERSIONS FOUND - Changelog will be empty!');
      }
    } catch (error) {
      console.log(`❌ Error reading changelog: ${error.message}`);
    }

    // 5. USERS - Check if users can log in
    console.log('\n👥 USERS (Should be able to log in)');
    console.log('-'.repeat(80));
    try {
      const users = await pool.query('SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at');
      console.log(`Total users: ${users.rows.length}`);
      
      if (users.rows.length > 0) {
        users.rows.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email})`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Verified: ${user.is_verified}`);
          console.log(`   Created: ${user.created_at}`);
          console.log();
        });
      } else {
        console.log('❌ NO USERS FOUND - Nobody can log in!');
      }
    } catch (error) {
      console.log(`❌ Error reading users: ${error.message}`);
    }

    // 6. Check what APIs are actually returning
    console.log('\n' + '='.repeat(100));
    console.log('🌐 API RESPONSE VERIFICATION');
    console.log('='.repeat(100));

    // Test announcements API
    console.log('\n📢 Testing /api/announcements endpoint');
    try {
      const announcementsAPI = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
      console.log(`API should return: ${announcementsAPI.rows.length} announcements`);
      if (announcementsAPI.rows.length > 0) {
        console.log('✅ Announcements exist - API should return data');
      } else {
        console.log('⚠️ No announcements - API will return empty array (graceful fallback)');
      }
    } catch (error) {
      console.log(`❌ Announcements API will return empty array due to error: ${error.message}`);
    }

    // Test quotes API
    console.log('\n💬 Testing /api/quotes/daily endpoint');
    try {
      const quotesAPI = await pool.query('SELECT * FROM quotes WHERE is_active = true ORDER BY RANDOM() LIMIT 1');
      if (quotesAPI.rows.length > 0) {
        console.log('✅ Active quotes exist - API should return random quote');
        console.log(`Sample: "${quotesAPI.rows[0].text}" - ${quotesAPI.rows[0].author}`);
      } else {
        console.log('⚠️ No active quotes - API will return fallback quote');
      }
    } catch (error) {
      console.log(`❌ Quotes API will return fallback quote due to error: ${error.message}`);
    }

    // Summary and recommendations
    console.log('\n' + '='.repeat(100));
    console.log('💡 ANALYSIS SUMMARY & RECOMMENDATIONS');
    console.log('='.repeat(100));

    // Check if main content tables are empty
    const contentTables = [
      { name: 'announcements', query: 'SELECT COUNT(*) as count FROM announcements' },
      { name: 'quotes', query: 'SELECT COUNT(*) as count FROM quotes WHERE is_active = true' },
      { name: 'versions', query: 'SELECT COUNT(*) as count FROM versions WHERE is_published = true' }
    ];

    let emptyTables = [];
    for (const table of contentTables) {
      try {
        const result = await pool.query(table.query);
        const count = parseInt(result.rows[0].count);
        if (count === 0) {
          emptyTables.push(table.name);
        }
      } catch (error) {
        emptyTables.push(table.name);
      }
    }

    if (emptyTables.length > 0) {
      console.log('\n🔴 CRITICAL ISSUES FOUND:');
      console.log(`Empty content tables: ${emptyTables.join(', ')}`);
      console.log('\nThis explains why the app appears empty!');
      console.log('\n📋 RECOMMENDED ACTIONS:');
      
      if (emptyTables.includes('announcements')) {
        console.log('1. Add sample announcements to the database');
      }
      if (emptyTables.includes('quotes')) {
        console.log('2. Add active quotes to the database');
      }
      if (emptyTables.includes('versions')) {
        console.log('3. Publish some versions in the changelog');
      }
    } else {
      console.log('\n✅ All content tables have data - app should display content');
      console.log('\nIf app still appears empty, check:');
      console.log('1. Frontend API calls are working');
      console.log('2. Frontend is handling API responses correctly');
      console.log('3. Frontend components are rendering data properly');
    }

  } catch (error) {
    console.error('\n❌ Error during database analysis:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

console.log('\n🔍 Starting deep database content analysis...');
console.log('This will examine all table data and verify what should be displaying in the app.\n');

deepDatabaseCheck();