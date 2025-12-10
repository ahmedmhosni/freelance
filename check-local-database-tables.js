const Database = require('./backend/src/core/database/Database');

async function checkLocalDatabaseTables() {
    console.log('\n================================================================================');
    console.log('🔍 CHECKING LOCAL DATABASE TABLES');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    try {
        const db = Database.getInstance();
        
        // Get all tables
        const tablesResult = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        
        console.log('📊 AVAILABLE TABLES:');
        console.log('--------------------------------------------------------------------------------');
        
        if (tablesResult.rows.length === 0) {
            console.log('❌ No tables found in database');
            return;
        }
        
        for (const table of tablesResult.rows) {
            const tableName = table.table_name;
            
            // Get row count for each table
            try {
                const countResult = await db.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
                const count = countResult.rows[0].count;
                console.log(`✅ ${tableName}: ${count} rows`);
            } catch (error) {
                console.log(`⚠️ ${tableName}: Error counting rows - ${error.message}`);
            }
        }
        
        console.log('\n📋 DETAILED TABLE STRUCTURE:');
        console.log('--------------------------------------------------------------------------------');
        
        // Check key tables structure
        const keyTables = ['users', 'clients', 'projects', 'tasks', 'invoices', 'time_entries', 'announcements', 'quotes'];
        
        for (const tableName of keyTables) {
            try {
                const columnsResult = await db.query(`
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = $1 
                    ORDER BY ordinal_position;
                `, [tableName]);
                
                if (columnsResult.rows.length > 0) {
                    console.log(`\n🔍 Table: ${tableName}`);
                    columnsResult.rows.forEach(col => {
                        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
                    });
                }
            } catch (error) {
                console.log(`⚠️ Table ${tableName} not found or error: ${error.message}`);
            }
        }
        
        console.log('\n================================================================================');
        console.log('✅ DATABASE ANALYSIS COMPLETE');
        console.log('================================================================================\n');
        
    } catch (error) {
        console.error('❌ Error during database analysis:', error.message);
    }
}

checkLocalDatabaseTables();