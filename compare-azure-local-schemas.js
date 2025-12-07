const { Client } = require('pg');

const azureConfig = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
};

const localConfig = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'admin'
};

async function compareSchemas() {
  const azureClient = new Client(azureConfig);
  const localClient = new Client(localConfig);

  try {
    console.log('Connecting to databases...\n');
    await azureClient.connect();
    await localClient.connect();
    console.log('✓ Connected to both databases\n');

    // Get all tables from both databases
    const azureTables = await azureClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const localTables = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const azureTableNames = azureTables.rows.map(r => r.table_name);
    const localTableNames = localTables.rows.map(r => r.table_name);

    console.log('=== TABLE COMPARISON ===\n');
    console.log('Azure tables:', azureTableNames.length);
    console.log('Local tables:', localTableNames.length);
    console.log();

    // Tables in local but not in Azure
    const missingInAzure = localTableNames.filter(t => !azureTableNames.includes(t));
    if (missingInAzure.length > 0) {
      console.log('❌ Tables missing in Azure:');
      missingInAzure.forEach(t => console.log(`  - ${t}`));
      console.log();
    }

    // Tables in Azure but not in local
    const extraInAzure = azureTableNames.filter(t => !localTableNames.includes(t));
    if (extraInAzure.length > 0) {
      console.log('⚠ Extra tables in Azure:');
      extraInAzure.forEach(t => console.log(`  - ${t}`));
      console.log();
    }

    // Compare columns for common tables
    const commonTables = azureTableNames.filter(t => localTableNames.includes(t));
    console.log(`\n=== COMPARING ${commonTables.length} COMMON TABLES ===\n`);

    for (const tableName of commonTables) {
      const azureCols = await azureClient.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      const localCols = await localClient.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      const azureColNames = azureCols.rows.map(r => r.column_name);
      const localColNames = localCols.rows.map(r => r.column_name);

      const missingCols = localColNames.filter(c => !azureColNames.includes(c));
      const extraCols = azureColNames.filter(c => !localColNames.includes(c));

      if (missingCols.length > 0 || extraCols.length > 0) {
        console.log(`\n📋 Table: ${tableName}`);
        
        if (missingCols.length > 0) {
          console.log('  ❌ Missing columns in Azure:');
          missingCols.forEach(col => {
            const localCol = localCols.rows.find(r => r.column_name === col);
            console.log(`    - ${col} (${localCol.data_type})`);
          });
        }

        if (extraCols.length > 0) {
          console.log('  ⚠ Extra columns in Azure:');
          extraCols.forEach(col => {
            const azureCol = azureCols.rows.find(r => r.column_name === col);
            console.log(`    - ${col} (${azureCol.data_type})`);
          });
        }
      }
    }

    console.log('\n\n=== SUMMARY ===');
    console.log(`Tables missing in Azure: ${missingInAzure.length}`);
    console.log(`Extra tables in Azure: ${extraInAzure.length}`);
    console.log(`Common tables: ${commonTables.length}`);

    await azureClient.end();
    await localClient.end();

  } catch (error) {
    console.error('Error:', error.message);
    try {
      await azureClient.end();
      await localClient.end();
    } catch (e) {}
  }
}

compareSchemas();
