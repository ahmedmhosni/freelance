require('dotenv').config();
const { Pool } = require('pg');

async function completeDatabaseMirror() {
    console.log('\n================================================================================');
    console.log('🔄 COMPLETE DATABASE MIRRORING - LOCAL ↔ AZURE');
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

        // STEP 1: Create missing Azure-only tables in Local
        console.log('🏗️ STEP 1: Creating missing Azure-only tables in Local...');
        console.log('--------------------------------------------------------------------------------');
        
        const azureOnlyTables = ['admin_reports', 'deleted_accounts', 'password_resets', 'verification_codes'];
        
        for (const tableName of azureOnlyTables) {
            try {
                // Get full table definition from Azure
                const createTableQuery = `
                    SELECT 
                        'CREATE TABLE IF NOT EXISTS "' || table_name || '" (' ||
                        string_agg(
                            '"' || column_name || '" ' || 
                            CASE 
                                WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
                                WHEN data_type = 'integer' THEN 'INTEGER'
                                WHEN data_type = 'bigint' THEN 'BIGINT'
                                WHEN data_type = 'boolean' THEN 'BOOLEAN'
                                WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
                                WHEN data_type = 'text' THEN 'TEXT'
                                WHEN data_type = 'numeric' THEN 'NUMERIC'
                                ELSE data_type
                            END ||
                            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                            CASE 
                                WHEN column_default IS NOT NULL AND column_default LIKE 'nextval%' THEN ' PRIMARY KEY'
                                WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
                                ELSE ''
                            END,
                            ', '
                            ORDER BY ordinal_position
                        ) || ');' as create_statement
                    FROM information_schema.columns 
                    WHERE table_name = $1 
                    GROUP BY table_name;
                `;
                
                const result = await azurePool.query(createTableQuery, [tableName]);
                
                if (result.rows.length > 0) {
                    const createStatement = result.rows[0].create_statement;
                    await localPool.query(createStatement);
                    console.log(`✅ Created table: ${tableName}`);
                } else {
                    console.log(`⚠️ Table ${tableName} not found in Azure`);
                }
                
            } catch (error) {
                console.log(`❌ Error creating ${tableName}: ${error.message}`);
            }
        }

        // STEP 2: Sync critical business data LOCAL → AZURE
        console.log('\n🔥 STEP 2: Syncing critical business data (LOCAL → AZURE)...');
        console.log('--------------------------------------------------------------------------------');
        
        const criticalTables = ['users', 'clients', 'projects', 'tasks', 'invoices', 'time_entries'];
        
        for (const tableName of criticalTables) {
            try {
                console.log(`\n🔄 Syncing ${tableName}...`);
                
                // Get counts
                const localCount = await localPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                const azureCount = await azurePool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                
                const localRows = parseInt(localCount.rows[0].count);
                const azureRows = parseInt(azureCount.rows[0].count);
                
                console.log(`   LOCAL: ${localRows} rows | AZURE: ${azureRows} rows`);
                
                if (localRows > azureRows) {
                    // Clear Azure data first
                    await azurePool.query(`DELETE FROM "${tableName}"`);
                    console.log(`   🗑️ Cleared Azure ${tableName}`);
                    
                    // Get all data from Local
                    const localData = await localPool.query(`SELECT * FROM "${tableName}" ORDER BY id`);
                    
                    if (localData.rows.length > 0) {
                        console.log(`   📤 Transferring ${localData.rows.length} rows...`);
                        
                        // Batch insert to Azure
                        const columns = Object.keys(localData.rows[0]);
                        const columnNames = columns.map(col => `"${col}"`).join(', ');
                        
                        // Process in batches of 100
                        const batchSize = 100;
                        for (let i = 0; i < localData.rows.length; i += batchSize) {
                            const batch = localData.rows.slice(i, i + batchSize);
                            
                            for (const row of batch) {
                                const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                                const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${columns.map(col => `"${col}" = EXCLUDED."${col}"`).join(', ')}`;
                                const values = columns.map(col => row[col]);
                                
                                try {
                                    await azurePool.query(insertQuery, values);
                                } catch (insertError) {
                                    console.log(`     ⚠️ Error inserting row ${row.id}: ${insertError.message}`);
                                }
                            }
                            
                            console.log(`     ✅ Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(localData.rows.length/batchSize)}`);
                        }
                        
                        console.log(`   ✅ Synced ${localData.rows.length} rows to Azure`);
                    }
                } else {
                    console.log(`   ✅ Azure already has same or more data`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error syncing ${tableName}: ${error.message}`);
            }
        }

        // STEP 3: Sync remaining data differences
        console.log('\n📊 STEP 3: Syncing remaining data differences...');
        console.log('--------------------------------------------------------------------------------');
        
        const remainingTables = [
            { name: 'ai_analytics', direction: 'LOCAL_TO_AZURE' },
            { name: 'ai_conversations', direction: 'LOCAL_TO_AZURE' },
            { name: 'ai_usage', direction: 'LOCAL_TO_AZURE' },
            { name: 'invoice_items', direction: 'LOCAL_TO_AZURE' },
            { name: 'user_preferences', direction: 'LOCAL_TO_AZURE' },
            { name: 'maintenance_content', direction: 'AZURE_TO_LOCAL' }
        ];
        
        for (const tableInfo of remainingTables) {
            try {
                const tableName = tableInfo.name;
                console.log(`\n🔄 Syncing ${tableName} (${tableInfo.direction})...`);
                
                const localCount = await localPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                const azureCount = await azurePool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                
                const localRows = parseInt(localCount.rows[0].count);
                const azureRows = parseInt(azureCount.rows[0].count);
                
                console.log(`   LOCAL: ${localRows} rows | AZURE: ${azureRows} rows`);
                
                if (tableInfo.direction === 'LOCAL_TO_AZURE' && localRows > azureRows) {
                    // Sync LOCAL → AZURE
                    const localData = await localPool.query(`SELECT * FROM "${tableName}" ORDER BY id`);
                    
                    if (localData.rows.length > 0) {
                        const columns = Object.keys(localData.rows[0]);
                        const columnNames = columns.map(col => `"${col}"`).join(', ');
                        
                        for (const row of localData.rows) {
                            const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                            const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;
                            const values = columns.map(col => row[col]);
                            
                            try {
                                await azurePool.query(insertQuery, values);
                            } catch (insertError) {
                                console.log(`     ⚠️ Error inserting: ${insertError.message}`);
                            }
                        }
                        
                        console.log(`   ✅ Synced ${localData.rows.length} rows to Azure`);
                    }
                } else if (tableInfo.direction === 'AZURE_TO_LOCAL' && azureRows > localRows) {
                    // Sync AZURE → LOCAL
                    const azureData = await azurePool.query(`SELECT * FROM "${tableName}" ORDER BY id`);
                    
                    if (azureData.rows.length > 0) {
                        const columns = Object.keys(azureData.rows[0]);
                        const columnNames = columns.map(col => `"${col}"`).join(', ');
                        
                        for (const row of azureData.rows) {
                            const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                            const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;
                            const values = columns.map(col => row[col]);
                            
                            try {
                                await localPool.query(insertQuery, values);
                            } catch (insertError) {
                                console.log(`     ⚠️ Error inserting: ${insertError.message}`);
                            }
                        }
                        
                        console.log(`   ✅ Synced ${azureData.rows.length} rows to Local`);
                    }
                } else {
                    console.log(`   ✅ Already in sync`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error syncing ${tableInfo.name}: ${error.message}`);
            }
        }

        console.log('\n================================================================================');
        console.log('🎉 COMPLETE DATABASE MIRRORING FINISHED');
        console.log('================================================================================');
        
        // Final verification
        console.log('\n📊 FINAL VERIFICATION:');
        console.log('--------------------------------------------------------------------------------');
        
        const allTables = [...criticalTables, ...remainingTables.map(t => t.name)];
        let totalLocal = 0;
        let totalAzure = 0;
        let perfectMatches = 0;
        
        for (const tableName of allTables) {
            try {
                const localCount = await localPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                const azureCount = await azurePool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                
                const localRows = parseInt(localCount.rows[0].count);
                const azureRows = parseInt(azureCount.rows[0].count);
                
                totalLocal += localRows;
                totalAzure += azureRows;
                
                if (localRows === azureRows) {
                    perfectMatches++;
                    console.log(`✅ ${tableName}: ${localRows} rows (PERFECT MATCH)`);
                } else {
                    console.log(`⚠️ ${tableName}: LOCAL ${localRows} vs AZURE ${azureRows}`);
                }
                
            } catch (error) {
                console.log(`❌ ${tableName}: Error - ${error.message}`);
            }
        }
        
        console.log('\n📈 MIRRORING SUMMARY:');
        console.log('================================================================================');
        console.log(`📊 Total LOCAL rows: ${totalLocal.toLocaleString()}`);
        console.log(`📊 Total AZURE rows: ${totalAzure.toLocaleString()}`);
        console.log(`✅ Perfect matches: ${perfectMatches}/${allTables.length} tables`);
        console.log(`📊 Match rate: ${Math.round((perfectMatches/allTables.length)*100)}%`);
        
        if (perfectMatches === allTables.length) {
            console.log('\n🎉 DATABASES ARE NOW PERFECTLY MIRRORED! 🎉');
        } else {
            console.log('\n⚠️ Some tables still have differences - check logs above');
        }

    } catch (error) {
        console.error('❌ Error during mirroring:', error.message);
    } finally {
        await localPool.end();
        await azurePool.end();
    }
}

completeDatabaseMirror();