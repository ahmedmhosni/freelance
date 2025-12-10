const { Pool } = require('pg');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabaseContent() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CHECKING ACTUAL DATABASE CONTENT');
  console.log('='.repeat(80));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80) + '\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // 1. CHECK ANNOUNCEMENTS (Should show on home page)
    console.log('📢 ANNOUNCEMENTS TABLE');
    console.log('-'.repeat(50));
    try {
      const announcements = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
      console.log(`Total rows: ${announcements.rows.length}`);
      
      if (announcements.rows.length > 0) {
        console.log('\n📋 All Announcements:');
        announcements.rows.forEach((ann, index) => {
          console.log(`${index + 1}. ID: ${ann.id}`);
          console.log(`   Title: "${ann.title}"`);
          console.log(`   Content: "${ann.content.substring(0, 100)}..."`);
          console.log(`   Featured: ${ann.is_featured}`);
          console.log(`   Created: ${ann.created_at}`);
          console.log(`   Media URL: ${ann.media_url || 'None'}`);
          console.log();
        });
        
        // Check featured announcements specifically
        const featured = announcements.rows.filter(a => a.is_featured);
        console.log(`🌟 Featured announcements: ${featured.length}`);
        if (featured.length > 0) {
          console.log('✅ Featured announcements should display on home page');
        } else {
          console.log('⚠️ No featured announcements - home page banner will be empty');
        }
      } else {
        console.log('❌ NO ANNOUNCEMENTS FOUND!');
        console.log('   This is why the home page appears empty!');
      }
    } catch (error) {
      console.log(`❌ Error reading announcements: ${error.message}`);
    }

    console.log('\n' + '='.repeat(80));

    // 2. CHECK QUOTES (Should show daily quote)
    console.log('💬 QUOTES TABLE');
    console.log('-'.repeat(50));
    try {
      const quotes = await pool.query('SELECT * FROM quotes ORDER BY id');
      console.log(`Total rows: ${quotes.rows.length}`);
      
      if (quotes.rows.length > 0) {
        console.log('\n📋 All Quotes:');
        quotes.rows.forEach((quote, index) => {
          console.log(`${index + 1}. ID: ${quote.id}`);
          console.log(`   Text: "${quote.text}"`);
          console.log(`   Author: ${quote.author}`);
          console.log(`   Category: ${quote.category}`);
          console.log(`   Active: ${quote.is_active}`);
          console.log();
        });
        
        const activeQuotes = quotes.rows.filter(q => q.is_active);
        console.log(`✅ Active quotes: ${activeQuotes.length}`);
        if (activeQuotes.length > 0) {
          console.log('✅ Daily quote should work (or show random active quote)');
        } else {
          console.log('⚠️ No active quotes - will show fallback quote');
        }
      } else {
        console.log('❌ NO QUOTES FOUND!');
      }
    } catch (error) {
      console.log(`❌ Error reading quotes: ${error.message}`);
    }

    console.log('\n' + '='.repeat(80));

    // 3. CHECK USERS (Should be able to log in)
    console.log('👥 USERS TABLE');
    console.log('-'.repeat(50));
    try {
      const users = await pool.query('SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY id');
      console.log(`Total rows: ${users.rows.length}`);
      
      if (users.rows.length > 0) {
        console.log('\n📋 All Users:');
        users.rows.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Verified: ${user.is_verified}`);
          console.log(`   Created: ${user.created_at}`);
          console.log();
        });
        
        const verifiedUsers = users.rows.filter(u => u.is_verified);
        console.log(`✅ Verified users: ${verifiedUsers.length}`);
        console.log(`👑 Admin users: ${users.rows.filter(u => u.role === 'admin').length}`);
      } else {
        console.log('❌ NO USERS FOUND!');
        console.log('   Nobody can log in!');
      }
    } catch (error) {
      console.log(`❌ Error reading users: ${error.message}`);
    }

    console.log('\n' + '='.repeat(80));

    // 4. CHECK CHANGELOG DATA
    console.log('📝 CHANGELOG DATA');
    console.log('-'.repeat(50));
    try {
      // Check versions
      const versions = await pool.query('SELECT * FROM versions ORDER BY release_date DESC');
      console.log(`Versions: ${versions.rows.length}`);
      
      if (versions.rows.length > 0) {
        console.log('\n📋 All Versions:');
        for (const version of versions.rows) {
          console.log(`Version: ${version.version}`);
          console.log(`  Release Date: ${version.release_date}`);
          console.log(`  Published: ${version.is_published}`);
          console.log(`  Created By: ${version.created_by}`);
          
          // Get changelog items for this version
          const items = await pool.query('SELECT * FROM changelog_items WHERE version_id = $1', [version.id]);
          console.log(`  Changelog Items: ${items.rows.length}`);
          
          if (items.rows.length > 0) {
            items.rows.forEach((item, index) => {
              console.log(`    ${index + 1}. [${item.category}] ${item.title}`);
              console.log(`       ${item.description}`);
            });
          }
          console.log();
        }
        
        const publishedVersions = versions.rows.filter(v => v.is_published);
        console.log(`✅ Published versions: ${publishedVersions.length}`);
        if (publishedVersions.length > 0) {
          console.log('✅ Changelog should display published versions');
        } else {
          console.log('⚠️ No published versions - changelog will be empty');
        }
      } else {
        console.log('❌ NO VERSIONS FOUND!');
      }
    } catch (error) {
      console.log(`❌ Error reading changelog: ${error.message}`);
    }

    console.log('\n' + '='.repeat(80));

    // 5. CHECK LEGAL CONTENT
    console.log('⚖️ LEGAL CONTENT');
    console.log('-'.repeat(50));
    try {
      const legal = await pool.query('SELECT * FROM legal_content ORDER BY type, updated_at DESC');
      console.log(`Total rows: ${legal.rows.length}`);
      
      if (legal.rows.length > 0) {
        console.log('\n📋 All Legal Content:');
        legal.rows.forEach((content, index) => {
          console.log(`${index + 1}. Type: ${content.type}`);
          console.log(`   Active: ${content.is_active}`);
          console.log(`   Content Length: ${content.content.length} characters`);
          console.log(`   Updated: ${content.updated_at}`);
          console.log(`   Updated By: ${content.updated_by}`);
          console.log();
        });
        
        const activeContent = legal.rows.filter(c => c.is_active);
        console.log(`✅ Active legal content: ${activeContent.length}`);
      } else {
        console.log('❌ NO LEGAL CONTENT FOUND!');
      }
    } catch (error) {
      console.log(`❌ Error reading legal content: ${error.message}`);
    }

    console.log('\n' + '='.repeat(80));

    // 6. TEST ACTUAL API CALLS
    console.log('🌐 TESTING WHAT APIs ACTUALLY RETURN');
    console.log('-'.repeat(50));

    // Test announcements endpoint logic
    console.log('\n📢 Testing announcements endpoint logic:');
    try {
      const result = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
      console.log(`Query result: ${result.rows.length} rows`);
      if (result.rows.length > 0) {
        console.log('✅ /api/announcements should return data');
      } else {
        console.log('⚠️ /api/announcements will return empty array (graceful fallback)');
      }
    } catch (error) {
      console.log(`❌ /api/announcements will return empty array due to error: ${error.message}`);
    }

    // Test featured announcements endpoint logic
    console.log('\n🌟 Testing featured announcements endpoint logic:');
    try {
      const result = await pool.query('SELECT * FROM announcements WHERE is_featured = true ORDER BY created_at DESC LIMIT 5');
      console.log(`Query result: ${result.rows.length} rows`);
      if (result.rows.length > 0) {
        console.log('✅ /api/announcements/featured should return data');
      } else {
        console.log('⚠️ /api/announcements/featured will return empty array (graceful fallback)');
      }
    } catch (error) {
      console.log(`❌ /api/announcements/featured will return empty array due to error: ${error.message}`);
    }

    // Test quotes endpoint logic
    console.log('\n💬 Testing quotes endpoint logic:');
    try {
      const result = await pool.query('SELECT * FROM quotes WHERE is_active = true ORDER BY RANDOM() LIMIT 1');
      console.log(`Query result: ${result.rows.length} rows`);
      if (result.rows.length > 0) {
        console.log('✅ /api/quotes/daily should return database quote');
        console.log(`   Sample: "${result.rows[0].text}" - ${result.rows[0].author}`);
      } else {
        console.log('⚠️ /api/quotes/daily will return fallback quote');
      }
    } catch (error) {
      console.log(`❌ /api/quotes/daily will return fallback quote due to error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('💡 DIAGNOSIS COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error during analysis:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseContent();