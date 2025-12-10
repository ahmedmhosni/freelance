require('dotenv').config();
const { Pool } = require('pg');

async function checkUserPreferencesStructure() {
    console.log('\n================================================================================');
    console.log('🔍 CHECKING USER_PREFERENCES STRUCTURE');
    console.log('================================================================================');

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
        console.log('✅ Connected to both databases\n');

        // Check LOCAL structure
        console.log('📊 LOCAL user_preferences structure:');
        const localColumns = await localPool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'user_preferences'
            ORDER BY ordinal_position
        `);

        localColumns.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
        });

        // Check LOCAL primary key
        const localPK = await localPool.query(`
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = 'user_preferences'::regclass AND i.indisprimary
        `);
        console.log(`  PRIMARY KEY: ${localPK.rows.map(r => r.attname).join(', ')}`);

        // Check AZURE structure
        console.log('\n📊 AZURE user_preferences structure:');
        const azureColumns = await azurePool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'user_preferences'
            ORDER BY ordinal_position
        `);

        azureColumns.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
        });

        // Check AZURE primary key
        const azurePK = await azurePool.query(`
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = 'user_preferences'::regclass AND i.indisprimary
        `);
        console.log(`  PRIMARY KEY: ${azurePK.rows.map(r => r.attname).join(', ')}`);

        // Check sample data from local
        console.log('\n📋 LOCAL sample data:');
        const localData = await localPool.query('SELECT * FROM user_preferences LIMIT 1');
        if (localData.rows.length > 0) {
            console.log(JSON.stringify(localData.rows[0], null, 2));
        } else {
            console.log('  No data in local user_preferences');
        }

        console.log('\n✅ Structure comparison complete!');

    } catch (error) {
        console.error('❌ Error checking structure:', error.message);
    } finally {
        await localPool.end();
        await azurePool.end();
    }
}

checkUserPreferencesStructure();