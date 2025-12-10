require('dotenv').config();
const { Pool } = require('pg');

async function fixUserPreferencesId() {
    console.log('\n================================================================================');
    console.log('🔧 FIXING USER_PREFERENCES ID COLUMN');
    console.log('================================================================================');

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
        console.log('🔌 Connecting to Azure database...');
        await azurePool.query('SELECT 1');
        console.log('✅ Connected to Azure database\n');

        // Check current structure of user_preferences table
        console.log('🔍 Checking current user_preferences structure...');
        const tableInfo = await azurePool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'user_preferences'
            ORDER BY ordinal_position
        `);

        console.log('Current columns:');
        tableInfo.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        // Check if id column exists
        const hasId = tableInfo.rows.some(col => col.column_name === 'id');
        
        if (hasId) {
            console.log('✅ ID column already exists');
            return;
        }

        // Check if table has data
        const dataCheck = await azurePool.query('SELECT COUNT(*) as count FROM user_preferences');
        const hasData = parseInt(dataCheck.rows[0].count) > 0;
        
        console.log(`📊 Table has ${dataCheck.rows[0].count} rows`);

        if (hasData) {
            console.log('⚠️ Table has data, need to add ID column carefully...');
            
            // Step 1: Add id column as integer (not primary key yet)
            console.log('1. Adding id column as integer...');
            await azurePool.query('ALTER TABLE user_preferences ADD COLUMN id INTEGER');
            
            // Step 2: Create sequence
            console.log('2. Creating sequence...');
            await azurePool.query('CREATE SEQUENCE IF NOT EXISTS user_preferences_id_seq');
            
            // Step 3: Update existing rows with sequence values
            console.log('3. Updating existing rows with sequence values...');
            await azurePool.query(`
                UPDATE user_preferences 
                SET id = nextval('user_preferences_id_seq')
                WHERE id IS NULL
            `);
            
            // Step 4: Set default and not null
            console.log('4. Setting default and not null...');
            await azurePool.query('ALTER TABLE user_preferences ALTER COLUMN id SET DEFAULT nextval(\'user_preferences_id_seq\')');
            await azurePool.query('ALTER TABLE user_preferences ALTER COLUMN id SET NOT NULL');
            
            // Step 5: Add primary key constraint
            console.log('5. Adding primary key constraint...');
            await azurePool.query('ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id)');
            
        } else {
            console.log('✅ Table is empty, adding id column with serial...');
            await azurePool.query('ALTER TABLE user_preferences ADD COLUMN id SERIAL PRIMARY KEY');
        }

        // Verify the fix
        console.log('\n🔍 Verifying fix...');
        const finalCheck = await azurePool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'user_preferences' AND column_name = 'id'
        `);

        if (finalCheck.rows.length > 0) {
            const col = finalCheck.rows[0];
            console.log(`✅ user_preferences.id: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
        } else {
            console.log('❌ ID column still missing');
        }

        console.log('\n✅ User preferences ID column fix complete!');

    } catch (error) {
        console.error('❌ Error fixing user_preferences id:', error.message);
    } finally {
        await azurePool.end();
    }
}

fixUserPreferencesId();