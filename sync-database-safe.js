/**
 * Safe Database Sync: Structure + Essential Data Only
 * Syncs table structure and essential non-sensitive data
 */

require('dotenv').config();
const { Pool } = require('pg');

// Load backend environment variables
require('dotenv').config({ path: './backend/.env' });

// Local database configuration
const localConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'roastify',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres123',
  ssl: false
};

// Production database configuration (Azure)
const productionConfig = {
  host: process.env.DB_HOST || 'roastifydbpost.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'roastifydb',
  user: process.env.DB_USER || 'adminuser',
  password: process.env.DB_PASSWORD || 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
};

// Tables to sync data for (non-sensitive)
const SAFE_DATA_TABLES = [
  'announcements',
  'changelog',
  'quotes',
  'ai_settings',
  'ai_conversations',
  'system_settings',
  'email_templates',
  'legal_pages'
];

// Tables to create structure only (sensitive data)
const STRUCTURE_ONLY_TABLES = [
  'users',
  'user_sessions', 
  'password_resets',
  'clients',
  'projects',
  'tasks',
  'invoices',
  'invoice_items',
  'time_entries',
  'user_preferences',
  'gdpr_requests',
  'ai_usage',
  'ai_analytics'
];

let localPool, productionPool;

async function connectDatabases() {
  console.log('🔗 Connecting to databases...');
  
  localPool = new Pool(localConfig);
  productionPool = new Pool(productionConfig);
  
  // Test connections
  try {
    await localPool.query('SELECT NOW()');
    console.log('✅ Local database connected');
  } catch (error) {
    console.error('❌ Local database connection failed:', error.message);
    process.exit(1);
  }
  
  try {
    await productionPool.query('SELECT NOW()');
    console.log('✅ Production database connected');
  } catch (error) {
    console.error('❌ Production database connection failed:', error.message);
    process.exit(1);
  }
}

async function getTableStructure(pool, tableName) {
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length,
      numeric_precision,
      numeric_scale
    FROM information_schema.columns 
    WHERE table_name = $1 
    ORDER BY ordinal_position
  `;
  
  const result = await pool.query(query, [tableName]);
  return result.rows;
}

async function getAllTables(pool) {
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  
  const result = await pool.query(query);
  return result.rows.map(row => row.table_name);
}

async function createMissingTable(tableName, structure) {
  console.log(`📋 Creating table: ${tableName}`);
  
  const columns = structure.map(col => {
    let columnDef = `"${col.column_name}" ${col.data_type}`;
    
    if (col.character_maximum_length) {
      columnDef += `(${col.character_maximum_length})`;
    } else if (col.numeric_precision) {
      columnDef += `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
    }
    
    if (col.is_nullable === 'NO') {
      columnDef += ' NOT NULL';
    }
    
    if (col.column_default) {
      columnDef += ` DEFAULT ${col.column_default}`;
    }
    
    return columnDef;
  }).join(',\n  ');
  
  const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columns}\n)`;
  
  try {
    await productionPool.query(createTableSQL);
    console.log(`✅ Table ${tableName} created`);
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error.message);
  }
}

async function addMissingColumns(tableName, missingColumns) {
  for (const col of missingColumns) {
    console.log(`📋 Adding column: ${tableName}.${col.column_name}`);
    
    let columnDef = `"${col.column_name}" ${col.data_type}`;
    
    if (col.character_maximum_length) {
      columnDef += `(${col.character_maximum_length})`;
    } else if (col.numeric_precision) {
      columnDef += `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
    }
    
    if (col.column_default) {
      columnDef += ` DEFAULT ${col.column_default}`;
    }
    
    const alterSQL = `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS ${columnDef}`;
    
    try {
      await productionPool.query(alterSQL);
      console.log(`✅ Column added: ${tableName}.${col.column_name}`);
    } catch (error) {
      console.error(`❌ Failed to add column:`, error.message);
    }
  }
}

async function syncSafeTableData(tableName) {
  console.log(`📊 Syncing data: ${tableName}`);
  
  try {
    // Get data from local
    const localData = await localPool.query(`SELECT * FROM "${tableName}"`);
    
    if (localData.rows.length === 0) {
      console.log(`   ⚠️ No data in ${tableName}`);
      return;
    }
    
    // Clear and insert
    await productionPool.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
    
    const rows = localData.rows;
    const columns = Object.keys(rows[0]);
    
    for (const row of rows) {
      const values = columns.map(col => row[col]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const insertSQL = `
        INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')}) 
        VALUES (${placeholders})
      `;
      
      await productionPool.query(insertSQL, values);
    }
    
    console.log(`   ✅ Synced ${rows.length} rows`);
    
  } catch (error) {
    console.error(`   ❌ Failed to sync ${tableName}:`, error.message);
  }
}

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    
    const insertUserSQL = `
      INSERT INTO users (name, email, password, email_verified, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        email_verified = EXCLUDED.email_verified,
        updated_at = NOW()
      RETURNING id, email
    `;
    
    const result = await productionPool.query(insertUserSQL, [
      'Test User',
      'test@roastify.online',
      hashedPassword,
      true, // Email verified
      'user'
    ]);
    
    console.log(`✅ Test user created: ${result.rows[0].email} (ID: ${result.rows[0].id})`);
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
  }
}

async function main() {
  console.log('\n🚀 Safe Database Sync');
  console.log('====================');
  
  try {
    await connectDatabases();
    
    // Get all tables
    const localTables = await getAllTables(localPool);
    const productionTables = await getAllTables(productionPool);
    
    console.log(`\n📊 Tables: Local(${localTables.length}) Production(${productionTables.length})`);
    
    // Sync all table structures
    for (const tableName of localTables) {
      console.log(`\n📋 Processing: ${tableName}`);
      
      // Get structures
      const localStructure = await getTableStructure(localPool, tableName);
      
      if (!productionTables.includes(tableName)) {
        // Create missing table
        await createMissingTable(tableName, localStructure);
      } else {
        // Check for missing columns
        const productionStructure = await getTableStructure(productionPool, tableName);
        const productionColumns = productionStructure.map(col => col.column_name);
        const missingColumns = localStructure.filter(col => !productionColumns.includes(col.column_name));
        
        if (missingColumns.length > 0) {
          await addMissingColumns(tableName, missingColumns);
        }
      }
      
      // Sync data for safe tables only
      if (SAFE_DATA_TABLES.includes(tableName)) {
        await syncSafeTableData(tableName);
      } else {
        console.log(`   ⚠️ Skipping data sync (sensitive table)`);
      }
    }
    
    // Create test user
    await createTestUser();
    
    console.log('\n🎉 Safe database sync completed!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    if (localPool) await localPool.end();
    if (productionPool) await productionPool.end();
  }
}

main().catch(console.error);