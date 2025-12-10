const { Pool } = require('pg');

async function checkLocalDatabase() {
    console.log('🔍 LOCAL DATABASE CONTENT CHECK');
    console.log('================================');
    
    // Local database configuration
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'roastify',
        user: 'postgres',
        password: 'postgres123',
        ssl: false
    });

    try {
        // Test connection
        const client = await pool.connect();
        console.log('✅ Connected to local PostgreSQL database');
        
        // Check tables and row counts
        const tables = [
            'clients', 'projects', 'tasks', 'invoices', 
            'time_entries', 'users', 'announcements'
        ];
        
        console.log('\n📊 Table Row Counts:');
        for (const table of tables) {
            try {
                const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
                const count = parseInt(result.rows[0].count);
                console.log(`   ${table}: ${count} rows`);
            } catch (error) {
                console.log(`   ${table}: Table not found or error`);
            }
        }
        
        // Test a simple query
        console.log('\n🔄 Testing sample queries...');
        try {
            const clientsResult = await client.query('SELECT id, name FROM clients LIMIT 3');
            console.log(`✅ Clients query: ${clientsResult.rows.length} results`);
            if (clientsResult.rows.length > 0) {
                console.log(`   Sample: ${clientsResult.rows[0].name}`);
            }
        } catch (error) {
            console.log(`❌ Clients query failed: ${error.message}`);
        }
        
        client.release();
        await pool.end();
        
        console.log('\n✅ Local database is working properly!');
        
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
    }
}

checkLocalDatabase().catch(console.error);