require('dotenv').config();
const { Pool } = require('pg');

async function completeDatabaseMirrorSafe() {
    console.log('\n================================================================================');
    console.log('🔄 SAFE DATABASE MIRRORING - LOCAL ↔ AZURE (SKIPPING USER DATA)');
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

        // STEP 1: Sync non-user business data LOCAL → AZURE
        console.log('🔥 STEP 1: Syncing business data (LOCAL → AZURE)...');
        console.log('⚠️ SKIPPING USER DATA FOR SECURITY');
        console.log('--------------------------------------------------------------------------------');
        
        const businessTables = ['clients', 'projects', 'tasks', 'invoices', 'time_entries'];
        
        for (const tableName of businessTables) {
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
                        
                        // Process in batches of 50
                        const batchSize = 50;
                        let successCount = 0;
                        let errorCount = 0;
                        
                        for (let i = 0; i < localData.rows.length; i += batchSize) {
                            const batch = localData.rows.slice(i, i + batchSize);
                            
                            for (const row of batch) {
                                const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                                const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${columns.map(col => `"${col}" = EXCLUDED."${col}"`).join(', ')}`;
                                const values = columns.map(col => row[col]);
                                
                                try {
                                    await azurePool.query(insertQuery, values);
                                    successCount++;
                                } catch (insertError) {
                                    errorCount++;
                                    if (errorCount <= 3) { // Only show first 3 errors
                                        console.log(`     ⚠️ Error inserting row ${row.id}: ${insertError.message}`);
                                    }
                                }
                            }
                            
                            console.log(`     ✅ Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(localData.rows.length/batchSize)}`);
                        }
                        
                        console.log(`   ✅ Synced ${successCount} rows to Azure (${errorCount} errors)`);
                    }
                } else {
                    console.log(`   ✅ Azure already has same or more data`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error syncing ${tableName}: ${error.message}`);
            }
        }

        // STEP 2: Sync AI and system data
        console.log('\n📊 STEP 2: Syncing AI and system data...');
        console.log('--------------------------------------------------------------------------------');
        
        const systemTables = [
            { name: 'ai_analytics', direction: 'LOCAL_TO_AZURE' },
            { name: 'ai_conversations', direction: 'LOCAL_TO_AZURE' },
            { name: 'ai_usage', direction: 'LOCAL_TO_AZURE' },
            { name: 'invoice_items', direction: 'LOCAL_TO_AZURE' },
            { name: 'maintenance_content', direction: 'AZURE_TO_LOCAL' }
        ];
        
        for (const tableInfo of systemTables) {
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
                        
                        let successCount = 0;
                        let errorCount = 0;
                        
                        for (const row of localData.rows) {
                            const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                            const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;
                            const values = columns.map(col => row[col]);
                            
                            try {
                                await azurePool.query(insertQuery, values);
                                successCount++;
                            } catch (insertError) {
                                errorCount++;
                                if (errorCount <= 2) {
                                    console.log(`     ⚠️ Error inserting: ${insertError.message}`);
                                }
                            }
                        }
                        
                        console.log(`   ✅ Synced ${successCount} rows to Azure (${errorCount} errors)`);
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
        console.log('🎉 SAFE DATABASE MIRRORING FINISHED');
        console.log('================================================================================');
        
        // Final verification
        console.log('\n📊 FINAL VERIFICATION:');
        console.log('--------------------------------------------------------------------------------');
        
        const allTables = [...businessTables, ...systemTables.map(t => t.name)];
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
        console.log(`📊 Total LOCAL rows (business data): ${totalLocal.toLocaleString()}`);
        console.log(`📊 Total AZURE rows (business data): ${totalAzure.toLocaleString()}`);
        console.log(`✅ Perfect matches: ${perfectMatches}/${allTables.length} tables`);
        console.log(`📊 Match rate: ${Math.round((perfectMatches/allTables.length)*100)}%`);
        console.log(`🔒 USER DATA SKIPPED FOR SECURITY`);
        
        if (perfectMatches === allTables.length) {
            console.log('\n🎉 BUSINESS DATA IS NOW PERFECTLY MIRRORED! 🎉');
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

completeDatabaseMirrorSafe();