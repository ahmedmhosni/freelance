const sql = require('mssql');
const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../backend/.env.azure' });

// Azure SQL configuration
const azureConfig = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER?.split('@')[0],
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// PostgreSQL configuration (Azure)
const pgConfig = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('========================================');
console.log('Data Migration: Azure SQL → PostgreSQL');
console.log('========================================\n');

async function migrateData() {
  let azurePool, pgPool;
  
  try {
    // Connect to Azure SQL
    console.log('Connecting to Azure SQL...');
    azurePool = await sql.connect(azureConfig);
    console.log('✓ Connected to Azure SQL\n');
    
    // Connect to PostgreSQL
    console.log('Connecting to PostgreSQL...');
    pgPool = new Pool(pgConfig);
    await pgPool.query('SELECT 1');
    console.log('✓ Connected to PostgreSQL\n');
    
    // Tables to migrate (in order due to foreign keys)
    const tables = [
      'users',
      'clients',
      'projects',
      'tasks',
      'time_entries',
      'invoices',
      'invoice_items',
      'notifications',
      'files',
      'quotes',
      'maintenance'
    ];
    
    for (const table of tables) {
      console.log(`Migrating ${table}...`);
      
      try {
        // Get data from Azure SQL
        const result = await azurePool.request().query(`SELECT * FROM ${table}`);
        const rows = result.recordset;
        
        if (rows.length === 0) {
          console.log(`  ⚠ No data in ${table}`);
          continue;
        }
        
        console.log(`  Found ${rows.length} rows`);
        
        // Get column names
        const columns = Object.keys(rows[0]);
        
        // Prepare INSERT statement
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertQuery = `
          INSERT INTO ${table} (${columns.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;
        
        // Insert each row
        let inserted = 0;
        for (const row of rows) {
          try {
            const values = columns.map(col => {
              let value = row[col];
              
              // Convert SQL Server types to PostgreSQL
              if (value instanceof Date) {
                return value;
              }
              if (typeof value === 'boolean') {
                return value;
              }
              if (value === null || value === undefined) {
                return null;
              }
              
              return value;
            });
            
            await pgPool.query(insertQuery, values);
            inserted++;
          } catch (err) {
            console.log(`    ⚠ Skipped row (likely duplicate): ${err.message}`);
          }
        }
        
        console.log(`  ✓ Inserted ${inserted} rows into ${table}\n`);
        
        // Reset sequence for SERIAL columns
        if (columns.includes('id')) {
          await pgPool.query(`
            SELECT setval(pg_get_serial_sequence('${table}', 'id'), 
            COALESCE((SELECT MAX(id) FROM ${table}), 1))
          `);
        }
        
      } catch (err) {
        console.error(`  ❌ Error migrating ${table}:`, err.message);
      }
    }
    
    console.log('========================================');
    console.log('Migration Complete!');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (azurePool) await azurePool.close();
    if (pgPool) await pgPool.end();
  }
}

migrateData();
