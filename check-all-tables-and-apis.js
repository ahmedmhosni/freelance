const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// Map of tables to their related API routes
const tableToRouteMap = {
  'users': ['auth.js', 'admin-activity.js'],
  'clients': ['clients.js'],
  'projects': ['projects.js'],
  'tasks': ['tasks.js'],
  'time_entries': ['time-tracking.js'],
  'invoices': ['invoices.js'],
  'invoice_items': ['invoices.js'],
  'announcements': ['announcements.js'],
  'quotes': ['quotes.js'],
  'feedback': ['feedback.js'],
  'legal_content': ['legal.js'],
  'versions': ['changelog.js'],
  'changelog_items': ['changelog.js'],
  'version_names': ['changelog.js'],
  'git_commits': ['changelog.js'],
  'git_sync_status': ['changelog.js'],
  'activity_logs': ['admin-activity.js'],
  'data_export_requests': ['admin-gdpr.js'],
  'deleted_accounts': ['admin-gdpr.js'],
  'user_preferences': ['user-preferences.js'],
  'email_preferences': ['user-preferences.js'],
  'ai_settings': ['admin-ai.js'],
  'ai_usage': ['ai.js', 'admin-ai.js'],
  'ai_conversations': ['ai.js'],
  'ai_analytics': ['admin-ai.js'],
  'password_resets': ['auth.js'],
  'verification_codes': ['auth.js']
};

async function getAllTables() {
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return result.rows.map(row => row.table_name);
}

async function getTableRowCount(tableName) {
  try {
    const result = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return parseInt(result.rows[0].count);
  } catch (error) {
    return -1; // Error accessing table
  }
}

async function getTableColumns(tableName) {
  const result = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1 
    ORDER BY ordinal_position
  `, [tableName]);
  return result.rows;
}

function findRouteFiles(tableName) {
  const routesDir = path.join(__dirname, 'backend', 'src', 'routes');
  const routes = tableToRouteMap[tableName] || [];
  
  const foundRoutes = [];
  for (const route of routes) {
    const routePath = path.join(routesDir, route);
    if (fs.existsSync(routePath)) {
      foundRoutes.push(route);
    }
  }
  
  return foundRoutes;
}

function checkRouteUsesTable(routeFile, tableName) {
  const routePath = path.join(__dirname, 'backend', 'src', 'routes', routeFile);
  if (!fs.existsSync(routePath)) return false;
  
  const content = fs.readFileSync(routePath, 'utf8');
  // Check if table name appears in SQL queries
  return content.includes(tableName) || content.includes(`FROM ${tableName}`) || content.includes(`"${tableName}"`);
}

async function analyzeDatabase() {
  console.log('\n' + '='.repeat(100));
  console.log('DATABASE TABLES & API CONNECTIVITY ANALYSIS');
  console.log('='.repeat(100));
  console.log(`Database: roastifydb @ roastifydbpost.postgres.database.azure.com`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(100) + '\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Get all tables
    const tables = await getAllTables();
    console.log(`📊 Total Tables: ${tables.length}\n`);

    const tableData = [];
    let totalRows = 0;
    let tablesWithData = 0;
    let tablesWithRoutes = 0;
    let tablesWithoutRoutes = [];

    // Analyze each table
    for (const tableName of tables) {
      const rowCount = await getTableRowCount(tableName);
      const columns = await getTableColumns(tableName);
      const routes = findRouteFiles(tableName);
      
      const hasData = rowCount > 0;
      const hasRoutes = routes.length > 0;
      
      if (hasData) tablesWithData++;
      if (hasRoutes) tablesWithRoutes++;
      if (!hasRoutes) tablesWithoutRoutes.push(tableName);
      
      totalRows += rowCount > 0 ? rowCount : 0;

      tableData.push({
        name: tableName,
        rowCount,
        columnCount: columns.length,
        routes,
        hasData,
        hasRoutes,
        columns
      });
    }

    // Display summary
    console.log('📈 SUMMARY');
    console.log('-'.repeat(100));
    console.log(`Total Tables: ${tables.length}`);
    console.log(`Tables with Data: ${tablesWithData} (${Math.round(tablesWithData/tables.length*100)}%)`);
    console.log(`Tables with API Routes: ${tablesWithRoutes} (${Math.round(tablesWithRoutes/tables.length*100)}%)`);
    console.log(`Total Rows Across All Tables: ${totalRows.toLocaleString()}`);
    console.log();

    // Display detailed table information
    console.log('📋 DETAILED TABLE ANALYSIS');
    console.log('-'.repeat(100));
    console.log();

    for (const table of tableData) {
      const statusIcon = table.hasData ? '✅' : '⚪';
      const routeIcon = table.hasRoutes ? '🔗' : '❌';
      
      console.log(`${statusIcon} ${routeIcon} ${table.name.toUpperCase()}`);
      console.log(`   Rows: ${table.rowCount >= 0 ? table.rowCount.toLocaleString() : 'ERROR'}`);
      console.log(`   Columns: ${table.columnCount}`);
      
      if (table.routes.length > 0) {
        console.log(`   API Routes: ${table.routes.join(', ')}`);
        
        // Verify routes actually use the table
        const usedBy = [];
        for (const route of table.routes) {
          if (checkRouteUsesTable(route, table.name)) {
            usedBy.push(route);
          }
        }
        if (usedBy.length > 0) {
          console.log(`   ✓ Verified in: ${usedBy.join(', ')}`);
        } else {
          console.log(`   ⚠ Routes found but table not used in code`);
        }
      } else {
        console.log(`   API Routes: None found`);
      }
      
      // Show sample columns
      if (table.columns.length > 0) {
        const sampleColumns = table.columns.slice(0, 5).map(c => `${c.column_name} (${c.data_type})`).join(', ');
        console.log(`   Columns: ${sampleColumns}${table.columns.length > 5 ? '...' : ''}`);
      }
      
      console.log();
    }

    // Tables without routes
    if (tablesWithoutRoutes.length > 0) {
      console.log('⚠️  TABLES WITHOUT API ROUTES');
      console.log('-'.repeat(100));
      for (const tableName of tablesWithoutRoutes) {
        const table = tableData.find(t => t.name === tableName);
        console.log(`  - ${tableName} (${table.rowCount} rows)`);
      }
      console.log();
    }

    // Tables with data but no routes
    const dataWithoutRoutes = tableData.filter(t => t.hasData && !t.hasRoutes);
    if (dataWithoutRoutes.length > 0) {
      console.log('🔴 CRITICAL: TABLES WITH DATA BUT NO API ROUTES');
      console.log('-'.repeat(100));
      for (const table of dataWithoutRoutes) {
        console.log(`  - ${table.name} (${table.rowCount} rows) - Data exists but no API access!`);
      }
      console.log();
    }

    // Empty tables with routes
    const emptyWithRoutes = tableData.filter(t => !t.hasData && t.hasRoutes);
    if (emptyWithRoutes.length > 0) {
      console.log('ℹ️  TABLES WITH ROUTES BUT NO DATA');
      console.log('-'.repeat(100));
      for (const table of emptyWithRoutes) {
        console.log(`  - ${table.name} (${table.routes.join(', ')})`);
      }
      console.log();
    }

    // Check for missing tables that should exist
    console.log('🔍 CHECKING FOR EXPECTED TABLES');
    console.log('-'.repeat(100));
    const expectedTables = Object.keys(tableToRouteMap);
    const missingTables = expectedTables.filter(t => !tables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing Expected Tables:');
      for (const tableName of missingTables) {
        console.log(`  - ${tableName} (Expected by: ${tableToRouteMap[tableName].join(', ')})`);
      }
    } else {
      console.log('✅ All expected tables exist');
    }
    console.log();

    // Generate recommendations
    console.log('💡 RECOMMENDATIONS');
    console.log('-'.repeat(100));
    
    if (missingTables.length > 0) {
      console.log('1. Create missing tables:');
      for (const tableName of missingTables) {
        console.log(`   - Create ${tableName} table for ${tableToRouteMap[tableName].join(', ')}`);
      }
    }
    
    if (dataWithoutRoutes.length > 0) {
      console.log('2. Add API routes for tables with data:');
      for (const table of dataWithoutRoutes) {
        console.log(`   - Create API route for ${table.name} (${table.rowCount} rows waiting to be accessed)`);
      }
    }
    
    if (tablesWithoutRoutes.length > 0 && dataWithoutRoutes.length === 0) {
      console.log('✅ All tables with data have API routes');
    }

    console.log();
    console.log('='.repeat(100));
    console.log('ANALYSIS COMPLETE');
    console.log('='.repeat(100) + '\n');

    // Export detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTables: tables.length,
        tablesWithData,
        tablesWithRoutes,
        totalRows
      },
      tables: tableData,
      missingTables,
      tablesWithoutRoutes,
      dataWithoutRoutes: dataWithoutRoutes.map(t => t.name),
      emptyWithRoutes: emptyWithRoutes.map(t => t.name)
    };

    fs.writeFileSync('database-api-analysis.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: database-api-analysis.json\n');

  } catch (error) {
    console.error('❌ Error analyzing database:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Run analysis
console.log('\n🔍 Starting database and API connectivity analysis...\n');
analyzeDatabase();
