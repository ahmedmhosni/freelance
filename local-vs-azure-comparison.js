require('dotenv').config();
const { Pool } = require('pg');

async function compareLocalVsAzure() {
    console.log('\n================================================================================');
    console.log('🔍 COMPREHENSIVE LOCAL vs AZURE DATABASE COMPARISON');
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

        // Get tables from both databases
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;

        const localTables = await localPool.query(tablesQuery);
        const azureTables = await azurePool.query(tablesQuery);

        console.log(`📊 LOCAL database: ${localTables.rows.length} tables`);
        console.log(`📊 AZURE database: ${azureTables.rows.length} tables\n`);

        // Find common tables
        const localTableNames = localTables.rows.map(row => row.table_name);
        const azureTableNames = azureTables.rows.map(row => row.table_name);
        const commonTables = localTableNames.filter(table => azureTableNames.includes(table));

        console.log('🔍 DETAILED TABLE COMPARISON:');
        console.log('================================================================================');

        const criticalTables = [
            'users', 'clients', 'projects', 'tasks', 'invoices', 'time_entries',
            'announcements', 'quotes', 'legal_content', 'versions', 'changelog_items'
        ];

        let totalLocalRows = 0;
        let totalAzureRows = 0;
        let syncNeeded = [];

        for (const tableName of commonTables) {
            try {
                const localCount = await localPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                const azureCount = await azurePool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                
                const localRows = parseInt(localCount.rows[0].count);
                const azureRows = parseInt(azureCount.rows[0].count);
                
                totalLocalRows += localRows;
                totalAzureRows += azureRows;

                const isCritical = criticalTables.includes(tableName);
                const status = localRows === azureRows ? '✅' : '⚠️';
                const priority = isCritical ? '🔥' : '📁';
                
                console.log(`${status} ${priority} ${tableName}:`);
                console.log(`   LOCAL: ${localRows} rows | AZURE: ${azureRows} rows`);
                
                if (localRows !== azureRows) {
                    syncNeeded.push({
                        table: tableName,
                        local: localRows,
                        azure: azureRows,
                        critical: isCritical,
                        difference: localRows - azureRows
                    });
                }
                
                // Show sample data for critical tables with differences
                if (isCritical && localRows !== azureRows) {
                    if (localRows > 0) {
                        const localSample = await localPool.query(`SELECT * FROM "${tableName}" LIMIT 1`);
                        console.log(`   📋 LOCAL sample: ${JSON.stringify(localSample.rows[0], null, 2).substring(0, 100)}...`);
                    }
                    if (azureRows > 0) {
                        const azureSample = await azurePool.query(`SELECT * FROM "${tableName}" LIMIT 1`);
                        console.log(`   📋 AZURE sample: ${JSON.stringify(azureSample.rows[0], null, 2).substring(0, 100)}...`);
                    }
                }
                console.log('');
                
            } catch (error) {
                console.log(`❌ Error checking ${tableName}: ${error.message}\n`);
            }
        }

        // Tables only in local
        const localOnlyTables = localTableNames.filter(table => !azureTableNames.includes(table));
        if (localOnlyTables.length > 0) {
            console.log('📤 TABLES ONLY IN LOCAL (need to create in Azure):');
            console.log('--------------------------------------------------------------------------------');
            for (const table of localOnlyTables) {
                const count = await localPool.query(`SELECT COUNT(*) as count FROM "${table}"`);
                console.log(`❌ ${table}: ${count.rows[0].count} rows`);
            }
            console.log('');
        }

        // Tables only in Azure
        const azureOnlyTables = azureTableNames.filter(table => !localTableNames.includes(table));
        if (azureOnlyTables.length > 0) {
            console.log('📥 TABLES ONLY IN AZURE (additional production tables):');
            console.log('--------------------------------------------------------------------------------');
            for (const table of azureOnlyTables) {
                const count = await azurePool.query(`SELECT COUNT(*) as count FROM "${table}"`);
                console.log(`➕ ${table}: ${count.rows[0].count} rows`);
            }
            console.log('');
        }

        // Synchronization recommendations
        console.log('🔄 SYNCHRONIZATION ANALYSIS:');
        console.log('================================================================================');
        
        if (syncNeeded.length === 0) {
            console.log('✅ ALL TABLES ARE IN SYNC! No data migration needed.');
        } else {
            console.log(`⚠️ ${syncNeeded.length} tables need synchronization:\n`);
            
            const criticalSync = syncNeeded.filter(item => item.critical);
            const nonCriticalSync = syncNeeded.filter(item => !item.critical);
            
            if (criticalSync.length > 0) {
                console.log('🔥 CRITICAL TABLES (sync immediately):');
                criticalSync.forEach(item => {
                    const direction = item.difference > 0 ? 'LOCAL → AZURE' : 'AZURE → LOCAL';
                    console.log(`   ⚠️ ${item.table}: ${direction} (${Math.abs(item.difference)} row difference)`);
                });
                console.log('');
            }
            
            if (nonCriticalSync.length > 0) {
                console.log('📁 NON-CRITICAL TABLES (sync when convenient):');
                nonCriticalSync.forEach(item => {
                    const direction = item.difference > 0 ? 'LOCAL → AZURE' : 'AZURE → LOCAL';
                    console.log(`   📁 ${item.table}: ${direction} (${Math.abs(item.difference)} row difference)`);
                });
                console.log('');
            }
        }

        // Summary
        console.log('📊 SUMMARY:');
        console.log('================================================================================');
        console.log(`📋 Common Tables: ${commonTables.length}`);
        console.log(`📤 Local Only: ${localOnlyTables.length}`);
        console.log(`📥 Azure Only: ${azureOnlyTables.length}`);
        console.log(`📊 Total LOCAL rows: ${totalLocalRows.toLocaleString()}`);
        console.log(`📊 Total AZURE rows: ${totalAzureRows.toLocaleString()}`);
        console.log(`🔄 Tables needing sync: ${syncNeeded.length}`);

        // Recommendations
        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('================================================================================');
        
        if (totalLocalRows > totalAzureRows) {
            console.log('📤 LOCAL has more data - consider syncing LOCAL → AZURE');
            console.log('   Command: pg_dump local data and import to Azure');
        } else if (totalAzureRows > totalLocalRows) {
            console.log('📥 AZURE has more data - consider syncing AZURE → LOCAL');
            console.log('   Command: pg_dump Azure data and import to local');
        } else {
            console.log('✅ Databases have similar data volumes');
        }

        if (syncNeeded.length > 0) {
            console.log('\n🔧 SYNC COMMANDS:');
            console.log('For critical tables, run:');
            console.log('   1. Export: pg_dump -h localhost -U postgres -d roastify -t "table_name" --data-only > table_data.sql');
            console.log('   2. Import: psql -h 4.245.193.235 -U adminuser -d roastifydb < table_data.sql');
        }

        console.log('\n✅ Comparison complete!');

    } catch (error) {
        console.error('❌ Error during comparison:', error.message);
    } finally {
        await localPool.end();
        await azurePool.end();
    }
}

compareLocalVsAzure();