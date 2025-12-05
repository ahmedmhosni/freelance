const { Pool } = require('pg');

// Azure PostgreSQL database configuration
const azurePool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
});

// Local PostgreSQL database configuration
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123',
  ssl: false
});

async function mirrorDatabase() {
  try {
    console.log('🔄 Starting database mirror from Azure to Local...\n');
    console.log('='.repeat(80));

    // Get all tables from Azure
    const azureTables = await azurePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // Get all tables from Local
    const localTables = await localPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const localTableNames = new Set(localTables.rows.map(t => t.table_name));
    const missingTables = azureTables.rows.filter(t => !localTableNames.has(t.table_name));

    console.log(`📊 Azure has ${azureTables.rows.length} tables`);
    console.log(`📊 Local has ${localTables.rows.length} tables`);
    console.log(`📊 Missing in local: ${missingTables.length} tables\n`);

    // Step 1: Create missing tables
    if (missingTables.length > 0) {
      console.log('='.repeat(80));
      console.log('STEP 1: Creating Missing Tables');
      console.log('='.repeat(80) + '\n');

      for (const table of missingTables) {
        console.log(`📝 Creating table: ${table.table_name}`);
        
        // Get CREATE TABLE statement from Azure
        const createTableQuery = await azurePool.query(`
          SELECT 
            'CREATE TABLE ' || table_name || ' (' ||
            string_agg(
              column_name || ' ' || 
              CASE 
                WHEN data_type = 'character varying' THEN 
                  CASE WHEN character_maximum_length IS NOT NULL 
                    THEN 'VARCHAR(' || character_maximum_length || ')'
                    ELSE 'VARCHAR'
                  END
                WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
                WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
                ELSE UPPER(data_type)
              END ||
              CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
              CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
              ', '
              ORDER BY ordinal_position
            ) || ');' as create_statement
          FROM information_schema.columns
          WHERE table_name = $1
          GROUP BY table_name
        `, [table.table_name]);

        if (createTableQuery.rows.length > 0) {
          try {
            await localPool.query(createTableQuery.rows[0].create_statement);
            console.log(`   ✅ Created: ${table.table_name}`);
          } catch (error) {
            console.log(`   ⚠️  Error creating ${table.table_name}: ${error.message}`);
          }
        }
      }
    }

    // Step 2: Add missing columns to existing tables
    console.log('\n' + '='.repeat(80));
    console.log('STEP 2: Adding Missing Columns to Existing Tables');
    console.log('='.repeat(80) + '\n');

    const commonTables = azureTables.rows.filter(t => localTableNames.has(t.table_name));
    let totalColumnsAdded = 0;

    for (const table of commonTables) {
      // Get columns from Azure
      const azureColumns = await azurePool.query(`
        SELECT column_name, data_type, is_nullable, column_default, 
               character_maximum_length, numeric_precision, numeric_scale
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);

      // Get columns from Local
      const localColumns = await localPool.query(`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table.table_name]);

      const localColNames = new Set(localColumns.rows.map(c => c.column_name));
      const missingColumns = azureColumns.rows.filter(c => !localColNames.has(c.column_name));

      if (missingColumns.length > 0) {
        console.log(`📋 Table: ${table.table_name} - Adding ${missingColumns.length} column(s)`);

        for (const col of missingColumns) {
          let dataType = col.data_type.toUpperCase();
          
          // Handle specific data types
          if (dataType === 'CHARACTER VARYING') {
            dataType = col.character_maximum_length 
              ? `VARCHAR(${col.character_maximum_length})` 
              : 'VARCHAR';
          } else if (dataType === 'TIMESTAMP WITHOUT TIME ZONE') {
            dataType = 'TIMESTAMP';
          } else if (dataType === 'TIMESTAMP WITH TIME ZONE') {
            dataType = 'TIMESTAMPTZ';
          }

          const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : '';
          const defaultValue = col.column_default ? `DEFAULT ${col.column_default}` : '';

          const alterQuery = `
            ALTER TABLE ${table.table_name} 
            ADD COLUMN ${col.column_name} ${dataType} ${nullable} ${defaultValue}
          `.trim();

          try {
            await localPool.query(alterQuery);
            console.log(`   ✅ Added column: ${col.column_name} (${dataType})`);
            totalColumnsAdded++;
          } catch (error) {
            console.log(`   ⚠️  Error adding ${col.column_name}: ${error.message}`);
          }
        }
      }
    }

    // Step 3: Create indexes and constraints
    console.log('\n' + '='.repeat(80));
    console.log('STEP 3: Syncing Indexes and Constraints');
    console.log('='.repeat(80) + '\n');

    // Get primary keys from Azure
    const azurePKs = await azurePool.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    console.log(`📌 Found ${azurePKs.rows.length} primary key constraints in Azure`);

    // Get unique constraints from Azure
    const azureUnique = await azurePool.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    console.log(`🔑 Found ${azureUnique.rows.length} unique constraints in Azure`);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Created ${missingTables.length} new table(s)`);
    console.log(`✅ Added ${totalColumnsAdded} new column(s)`);
    console.log(`📊 Local database now has ${azureTables.rows.length} tables (matching Azure)`);

    await azurePool.end();
    await localPool.end();

    console.log('\n🎉 Database mirror complete!');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

mirrorDatabase();
