require('dotenv').config();
const Database = require('./src/core/database/Database');

async function comprehensiveDatabaseComparison() {
    console.log('\n================================================================================');
    console.log('🔍 COMPREHENSIVE DATABASE COMPARISON ANALYSIS');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    try {
        // Connect to local database
        const localDb = new Database();
        await localDb.connect();
        console.log('✅ Connected to LOCAL database (roastify)');

        // Get all local tables with detailed information
        const tablesQuery = `
            SELECT 
                t.table_name,
                t.table_type,
                (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE t.table_schema = 'public' 
            ORDER BY t.table_name;
        `;
        
        const tablesResult = await localDb.query(tablesQuery);
        console.log(`📊 Found ${tablesResult.rows.length} tables in LOCAL database\n`);

        // Categorize tables by importance
        const criticalTables = [
            'users', 'clients', 'projects', 'tasks', 'invoices', 'time_entries',
            'announcements', 'quotes', 'legal_content', 'versions', 'changelog_items'
        ];

        const systemTables = [
            'activity_logs', 'feedback', 'notifications', 'user_preferences',
            'gdpr_requests', 'data_export_requests'
        ];

        const aiTables = [
            'ai_analytics', 'ai_conversations', 'ai_settings', 'ai_usage'
        ];

        const supportTables = [
            'files', 'file_metadata', 'maintenance', 'maintenance_content',
            'git_commits', 'git_sync_status', 'status_history', 'invoice_items'
        ];

        // Analyze each category
        console.log('🎯 CRITICAL BUSINESS TABLES (Must have in production):');
        console.log('--------------------------------------------------------------------------------');
        let criticalCount = 0;
        let criticalRows = 0;
        
        for (const table of tablesResult.rows) {
            if (criticalTables.includes(table.table_name)) {
                const countResult = await localDb.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
                const rowCount = countResult.rows[0].count;
                criticalCount++;
                criticalRows += parseInt(rowCount);
                
                console.log(`✅ ${table.table_name}: ${table.column_count} columns, ${rowCount} rows`);
            }
        }
        console.log(`📊 Total: ${criticalCount} critical tables with ${criticalRows} total rows\n`);

        console.log('🔧 SYSTEM & ADMIN TABLES:');
        console.log('--------------------------------------------------------------------------------');
        let systemCount = 0;
        let systemRows = 0;
        
        for (const table of tablesResult.rows) {
            if (systemTables.includes(table.table_name)) {
                const countResult = await localDb.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
                const rowCount = countResult.rows[0].count;
                systemCount++;
                systemRows += parseInt(rowCount);
                
                console.log(`🔧 ${table.table_name}: ${table.column_count} columns, ${rowCount} rows`);
            }
        }
        console.log(`📊 Total: ${systemCount} system tables with ${systemRows} total rows\n`);

        console.log('🤖 AI FEATURE TABLES:');
        console.log('--------------------------------------------------------------------------------');
        let aiCount = 0;
        let aiRows = 0;
        
        for (const table of tablesResult.rows) {
            if (aiTables.includes(table.table_name)) {
                const countResult = await localDb.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
                const rowCount = countResult.rows[0].count;
                aiCount++;
                aiRows += parseInt(rowCount);
                
                console.log(`🤖 ${table.table_name}: ${table.column_count} columns, ${rowCount} rows`);
            }
        }
        console.log(`📊 Total: ${aiCount} AI tables with ${aiRows} total rows\n`);

        console.log('📁 SUPPORT & UTILITY TABLES:');
        console.log('--------------------------------------------------------------------------------');
        let supportCount = 0;
        let supportRows = 0;
        
        for (const table of tablesResult.rows) {
            if (supportTables.includes(table.table_name)) {
                const countResult = await localDb.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
                const rowCount = countResult.rows[0].count;
                supportCount++;
                supportRows += parseInt(rowCount);
                
                console.log(`📁 ${table.table_name}: ${table.column_count} columns, ${rowCount} rows`);
            }
        }
        console.log(`📊 Total: ${supportCount} support tables with ${supportRows} total rows\n`);

        // Check for any uncategorized tables
        const allCategorized = [...criticalTables, ...systemTables, ...aiTables, ...supportTables];
        const uncategorized = tablesResult.rows.filter(table => !allCategorized.includes(table.table_name));
        
        if (uncategorized.length > 0) {
            console.log('❓ UNCATEGORIZED TABLES:');
            console.log('--------------------------------------------------------------------------------');
            for (const table of uncategorized) {
                const countResult = await localDb.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
                const rowCount = countResult.rows[0].count;
                console.log(`❓ ${table.table_name}: ${table.column_count} columns, ${rowCount} rows`);
            }
            console.log('');
        }

        // Generate migration priority
        console.log('🚀 MIGRATION PRIORITY RECOMMENDATIONS:');
        console.log('================================================================================');
        
        console.log('\n🔥 PRIORITY 1 - CRITICAL (Deploy immediately):');
        console.log('   These tables are essential for basic app functionality');
        criticalTables.forEach(table => {
            if (tablesResult.rows.find(t => t.table_name === table)) {
                console.log(`   ✅ ${table}`);
            }
        });

        console.log('\n⚡ PRIORITY 2 - SYSTEM (Deploy soon):');
        console.log('   These tables support admin and system features');
        systemTables.forEach(table => {
            if (tablesResult.rows.find(t => t.table_name === table)) {
                console.log(`   🔧 ${table}`);
            }
        });

        console.log('\n🤖 PRIORITY 3 - AI FEATURES (Deploy when ready):');
        console.log('   These tables support AI assistant functionality');
        aiTables.forEach(table => {
            if (tablesResult.rows.find(t => t.table_name === table)) {
                console.log(`   🤖 ${table}`);
            }
        });

        console.log('\n📁 PRIORITY 4 - SUPPORT (Deploy as needed):');
        console.log('   These tables support additional features');
        supportTables.forEach(table => {
            if (tablesResult.rows.find(t => t.table_name === table)) {
                console.log(`   📁 ${table}`);
            }
        });

        // Generate SQL export commands
        console.log('\n🛠️ MIGRATION COMMANDS:');
        console.log('================================================================================');
        
        console.log('\n📤 EXPORT SCHEMA (run these commands):');
        console.log('   pg_dump -h localhost -U postgres -d roastify --schema-only > local_schema.sql');
        console.log('   pg_dump -h localhost -U postgres -d roastify --data-only > local_data.sql');
        
        console.log('\n📥 IMPORT TO PRODUCTION (after connecting to Azure):');
        console.log('   psql -h [azure-host] -U [azure-user] -d [azure-db] < local_schema.sql');
        console.log('   psql -h [azure-host] -U [azure-user] -d [azure-db] < local_data.sql');

        // Summary
        console.log('\n📊 SUMMARY:');
        console.log('================================================================================');
        console.log(`📋 Total Tables: ${tablesResult.rows.length}`);
        console.log(`🎯 Critical: ${criticalCount} tables (${criticalRows} rows)`);
        console.log(`🔧 System: ${systemCount} tables (${systemRows} rows)`);
        console.log(`🤖 AI: ${aiCount} tables (${aiRows} rows)`);
        console.log(`📁 Support: ${supportCount} tables (${supportRows} rows)`);
        console.log(`📊 Total Data: ${criticalRows + systemRows + aiRows + supportRows} rows`);

        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Export local database schema and data');
        console.log('2. Connect to Azure production database');
        console.log('3. Import critical tables first');
        console.log('4. Test production deployment');
        console.log('5. Import remaining tables as needed');

        await localDb.close();
        
    } catch (error) {
        console.error('❌ Error during analysis:', error.message);
    }
}

comprehensiveDatabaseComparison();