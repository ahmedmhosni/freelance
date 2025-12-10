require('dotenv').config();
const { Pool } = require('pg');

async function syncAzureToLocal() {
    console.log('\n================================================================================');
    console.log('📥 SYNCING AZURE DATA TO LOCAL DATABASE');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    // Local database connection
    const localPool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'roastify',
        user: 'postgres',
        password: 'postgres123',
        ssl: false
    });

    // Azure database connection
    const azurePool = new Pool({
        host: '4.245.193.235',
        port: 5432,
        database: 'roastifydb',
        user: 'adminuser',
        password: 'AHmed#123456',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Connecting to databases...');
        await localPool.query('SELECT 1');
        await azurePool.query('SELECT 1');
        console.log('✅ Connected to both LOCAL and AZURE databases\n');

        // Step 1: Create Azure-only tables in local
        console.log('🏗️ STEP 1: Creating Azure-only tables in local...');
        console.log('--------------------------------------------------------------------------------');
        
        const azureOnlyTables = [
            'admin_reports',
            'deleted_accounts', 
            'email_preferences',
            'password_resets',
            'verification_codes'
        ];

        for (const tableName of azureOnlyTables) {
            try {
                // Get table structure from Azure
                const structureQuery = `
                    SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
                    FROM information_schema.columns 
                    WHERE table_name = $1 
                    ORDER BY ordinal_position;
                `;
                
                const structure = await azurePool.query(structureQuery, [tableName]);
                
                if (structure.rows.length > 0) {
                    // Create table in local
                    let createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
                    
                    const columns = structure.rows.map(col => {
                        let columnDef = `  "${col.column_name}" ${col.data_type}`;
                        
                        if (col.character_maximum_length) {
                            columnDef += `(${col.character_maximum_length})`;
                        }
                        
                        if (col.is_nullable === 'NO') {
                            columnDef += ' NOT NULL';
                        }
                        
                        if (col.column_default) {
                            columnDef += ` DEFAULT ${col.column_default}`;
                        }
                        
                        return columnDef;
                    });
                    
                    createTableSQL += columns.join(',\n') + '\n);';
                    
                    await localPool.query(createTableSQL);
                    console.log(`✅ Created table: ${tableName}`);
                } else {
                    console.log(`⚠️ No structure found for: ${tableName}`);
                }
                
            } catch (error) {
                console.log(`❌ Error creating ${tableName}: ${error.message}`);
            }
        }

        // Step 2: Sync data from Azure tables that have more data
        console.log('\n📊 STEP 2: Syncing data from Azure (where Azure has more data)...');
        console.log('--------------------------------------------------------------------------------');
        
        const tablesToSync = [
            'activity_logs',
            'feedback', 
            'git_sync_status',
            'maintenance_content',
            'status_history',
            'version_names'
        ];

        for (const tableName of tablesToSync) {
            try {
                console.log(`\n🔄 Syncing ${tableName}...`);
                
                // Get row counts
                const localCount = await localPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                const azureCount = await azurePool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                
                const localRows = parseInt(localCount.rows[0].count);
                const azureRows = parseInt(azureCount.rows[0].count);
                
                console.log(`   LOCAL: ${localRows} rows | AZURE: ${azureRows} rows`);
                
                if (azureRows > localRows) {
                    // Clear local data first
                    await localPool.query(`DELETE FROM "${tableName}"`);
                    console.log(`   🗑️ Cleared local ${tableName}`);
                    
                    // Get all data from Azure
                    const azureData = await azurePool.query(`SELECT * FROM "${tableName}" ORDER BY id`);
                    
                    if (azureData.rows.length > 0) {
                        // Get column names
                        const columns = Object.keys(azureData.rows[0]);
                        const columnNames = columns.map(col => `"${col}"`).join(', ');
                        const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                        
                        const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`;
                        
                        // Insert each row
                        for (const row of azureData.rows) {
                            const values = columns.map(col => row[col]);
                            await localPool.query(insertQuery, values);
                        }
                        
                        console.log(`   ✅ Synced ${azureData.rows.length} rows to local`);
                    }
                } else {
                    console.log(`   ✅ Local already has same or more data`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error syncing ${tableName}: ${error.message}`);
            }
        }

        // Step 3: Sync Azure-only table data
        console.log('\n📋 STEP 3: Syncing Azure-only table data...');
        console.log('--------------------------------------------------------------------------------');
        
        for (const tableName of azureOnlyTables) {
            try {
                const azureCount = await azurePool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                const azureRows = parseInt(azureCount.rows[0].count);
                
                console.log(`\n📊 ${tableName}: ${azureRows} rows in Azure`);
                
                if (azureRows > 0) {
                    const azureData = await azurePool.query(`SELECT * FROM "${tableName}" ORDER BY id`);
                    
                    if (azureData.rows.length > 0) {
                        const columns = Object.keys(azureData.rows[0]);
                        const columnNames = columns.map(col => `"${col}"`).join(', ');
                        const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                        
                        const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;
                        
                        for (const row of azureData.rows) {
                            const values = columns.map(col => row[col]);
                            await localPool.query(insertQuery, values);
                        }
                        
                        console.log(`   ✅ Synced ${azureData.rows.length} rows`);
                    }
                } else {
                    console.log(`   ✅ Table is empty in Azure`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error syncing ${tableName}: ${error.message}`);
            }
        }

        console.log('\n================================================================================');
        console.log('✅ AZURE TO LOCAL SYNC COMPLETE');
        console.log('================================================================================');
        
        // Final verification
        console.log('\n📊 VERIFICATION - Updated row counts:');
        console.log('--------------------------------------------------------------------------------');
        
        const allTables = [...tablesToSync, ...azureOnlyTables];
        for (const tableName of allTables) {
            try {
                const localCount = await localPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                const localRows = parseInt(localCount.rows[0].count);
                console.log(`✅ ${tableName}: ${localRows} rows in local`);
            } catch (error) {
                console.log(`❌ ${tableName}: Error - ${error.message}`);
            }
        }

        console.log('\n🎯 NEXT STEP: Run comparison again to see the updated differences');
        console.log('   Command: node local-vs-azure-comparison.js');

    } catch (error) {
        console.error('❌ Error during sync:', error.message);
    } finally {
        await localPool.end();
        await azurePool.end();
    }
}

syncAzureToLocal();