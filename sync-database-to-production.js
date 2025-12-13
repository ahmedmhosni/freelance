/**
 * Complete Database Sync: Local to Production
 * Syncs all tables, columns, and data from local PostgreSQL to Azure PostgreSQL
 */

require('dotenv').config();
const { Pool } = require('pg');

// Local database configuration
const localConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'roastify',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
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
  console.log(`📋 Creating missing table: ${tableName}`);
  
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
    console.log(`✅ Table ${tableName} created successfully`);
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error.message);
  }
}

async function addMissingColumns(tableName, missingColumns) {
  for (const col of missingColumns) {
    console.log(`📋 Adding missing column: ${tableName}.${col.column_name}`);
    
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
      console.log(`✅ Column ${tableName}.${col.column_name} added successfully`);
    } catch (error) {
      console.error(`❌ Failed to add column ${tableName}.${col.column_name}:`, error.message);
    }
  }
}

async function syncTableData(tableName) {
  console.log(`📊 Syncing data for table: ${tableName}`);
  
  try {
    // Get all data from local table
    const localData = await localPool.query(`SELECT * FROM "${tableName}"`);
    
    if (localData.rows.length === 0) {
      console.log(`   ⚠️ No data in local table ${tableName}`);
      return;
    }
    
    // Clear production table (be careful!)
    await productionPool.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
    console.log(`   🗑️ Cleared production table ${tableName}`);
    
    // Insert data in batches
    const batchSize = 100;
    const rows = localData.rows;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      if (batch.length > 0) {
        const columns = Object.keys(batch[0]);
        const placeholders = batch.map((_, rowIndex) => 
          `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
        ).join(', ');
        
        const values = batch.flatMap(row => columns.map(col => row[col]));
        
        const insertSQL = `
          INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')}) 
          VALUES ${placeholders}
        `;
        
        await productionPool.query(insertSQL, values);
        console.log(`   ✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} rows)`);
      }
    }
    
    console.log(`   🎉 Synced ${rows.length} rows to ${tableName}`);
    
  } catch (error) {
    console.error(`   ❌ Failed to sync data for ${tableName}:`, error.message);
  }
}

async function syncDatabase() {
  console.log('\n🚀 Starting Complete Database Sync');
  console.log('==================================');
  
  try {
    // Get all tables from local database
    const localTables = await getAllTables(localPool);
    const productionTables = await getAllTables(productionPool);
    
    console.log(`\n📊 Database Overview:`);
    console.log(`   Local tables: ${localTables.length}`);
    console.log(`   Production tables: ${productionTables.length}`);
    
    // Find missing tables
    const missingTables = localTables.filter(table => !productionTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`\n📋 Missing tables in production: ${missingTables.join(', ')}`);
      
      for (const tableName of missingTables) {
        const structure = await getTableStructure(localPool, tableName);
        await createMissingTable(tableName, structure);
      }
    }
    
    // Check and sync each table
    console.log('\n🔄 Syncing table structures and data...');
    
    for (const tableName of localTables) {
      console.log(`\n📋 Processing table: ${tableName}`);
      
      // Get structures
      const localStructure = await getTableStructure(localPool, tableName);
      const productionStructure = await getTableStructure(productionPool, tableName);
      
      // Find missing columns
      const localColumns = localStructure.map(col => col.column_name);
      const productionColumns = productionStructure.map(col => col.column_name);
      const missingColumns = localStructure.filter(col => !productionColumns.includes(col.column_name));
      
      if (missingColumns.length > 0) {
        console.log(`   📋 Missing columns: ${missingColumns.map(col => col.column_name).join(', ')}`);
        await addMissingColumns(tableName, missingColumns);
      }
      
      // Sync data (skip sensitive tables)
      const skipDataSync = ['users', 'user_sessions', 'password_resets'];
      if (!skipDataSync.includes(tableName)) {
        await syncTableData(tableName);
      } else {
        console.log(`   ⚠️ Skipping data sync for sensitive table: ${tableName}`);
      }
    }
    
    console.log('\n🎉 Database sync completed successfully!');
    
    // Final verification
    console.log('\n📊 Final verification:');
    const finalLocalTables = await getAllTables(localPool);
    const finalProductionTables = await getAllTables(productionPool);
    
    console.log(`   Local tables: ${finalLocalTables.length}`);
    console.log(`   Production tables: ${finalProductionTables.length}`);
    console.log(`   Tables synced: ${finalLocalTables.filter(t => finalProductionTables.includes(t)).length}`);
    
  } catch (error) {
    console.error('❌ Database sync failed:', error);
  }
}

async function main() {
  try {
    await connectDatabases();
    await syncDatabase();
  } catch (error) {
    console.error('❌ Sync process failed:', error);
  } finally {
    if (localPool) await localPool.end();
    if (productionPool) await productionPool.end();
    console.log('\n🔚 Database connections closed');
  }
}

// Run the sync
main().catch(console.error);