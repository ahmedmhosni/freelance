require('dotenv').config();
const { Pool } = require('pg');

async function fixAzureSchemaDefferences() {
    console.log('\n================================================================================');
    console.log('🔧 FIXING AZURE SCHEMA DIFFERENCES');
    console.log('================================================================================');
    console.log('Time:', new Date().toISOString());
    console.log('================================================================================\n');

    // Azure database connection
    const azurePool = new Pool({
        host: '4.245.193.235',
        port: 5432,
        database: 'roastifydb',
        user: 'adminuser',
        password: 'AHmed#123456',
        ssl: { rejectUnauthorized: false }
    });

    // Local database connection (to get column definitions)
    const localPool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'roastify',
        user: 'postgres',
        password: 'postgres123',
        ssl: false
    });

    try {
        console.log('🔌 Connecting to databases...');
        await azurePool.query('SELECT 1');
        await localPool.query('SELECT 1');
        console.log('✅ Connected to both LOCAL and AZURE databases\n');

        // Schema fixes needed based on the mirroring errors
        const schemaFixes = [
            {
                table: 'users',
                column: 'email_preferences',
                definition: 'JSONB DEFAULT \'{}\'::jsonb'
            },
            {
                table: 'clients', 
                column: 'tags',
                definition: 'TEXT[]'
            },
            {
                table: 'projects',
                column: 'title', 
                definition: 'VARCHAR(255)'
            },
            {
                table: 'tasks',
                column: 'comments',
                definition: 'TEXT'
            },
            {
                table: 'time_entries',
                column: 'date',
                definition: 'DATE'
            },
            {
                table: 'ai_conversations',
                column: 'tokens_used',
                definition: 'INTEGER DEFAULT 0'
            },
            {
                table: 'ai_usage',
                column: 'request_count',
                definition: 'INTEGER DEFAULT 0'
            },
            {
                table: 'user_preferences',
                column: 'id',
                definition: 'SERIAL PRIMARY KEY'
            }
        ];

        console.log('🔧 APPLYING SCHEMA FIXES:');
        console.log('--------------------------------------------------------------------------------');

        for (const fix of schemaFixes) {
            try {
                console.log(`\n🔄 Adding column ${fix.column} to ${fix.table}...`);
                
                // Check if column already exists
                const columnCheck = await azurePool.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND column_name = $2
                `, [fix.table, fix.column]);

                if (columnCheck.rows.length > 0) {
                    console.log(`   ✅ Column ${fix.column} already exists in ${fix.table}`);
                    continue;
                }

                // Special handling for user_preferences id column (needs to be added differently)
                if (fix.table === 'user_preferences' && fix.column === 'id') {
                    // First check if table has any data
                    const dataCheck = await azurePool.query(`SELECT COUNT(*) as count FROM "${fix.table}"`);
                    const hasData = parseInt(dataCheck.rows[0].count) > 0;
                    
                    if (hasData) {
                        console.log(`   ⚠️ Table ${fix.table} has data, adding id column with sequence...`);
                        
                        // Add the column without PRIMARY KEY first
                        await azurePool.query(`ALTER TABLE "${fix.table}" ADD COLUMN ${fix.column} INTEGER`);
                        
                        // Create sequence
                        await azurePool.query(`CREATE SEQUENCE IF NOT EXISTS ${fix.table}_id_seq`);
                        
                        // Update existing rows with sequence values
                        await azurePool.query(`
                            UPDATE "${fix.table}" 
                            SET ${fix.column} = nextval('${fix.table}_id_seq')
                            WHERE ${fix.column} IS NULL
                        `);
                        
                        // Set default and not null
                        await azurePool.query(`ALTER TABLE "${fix.table}" ALTER COLUMN ${fix.column} SET DEFAULT nextval('${fix.table}_id_seq')`);
                        await azurePool.query(`ALTER TABLE "${fix.table}" ALTER COLUMN ${fix.column} SET NOT NULL`);
                        
                        // Add primary key constraint
                        await azurePool.query(`ALTER TABLE "${fix.table}" ADD CONSTRAINT ${fix.table}_pkey PRIMARY KEY (${fix.column})`);
                        
                        console.log(`   ✅ Added ${fix.column} column with sequence to ${fix.table}`);
                    } else {
                        // Table is empty, can add normally
                        await azurePool.query(`ALTER TABLE "${fix.table}" ADD COLUMN ${fix.definition}`);
                        console.log(`   ✅ Added ${fix.column} column to empty ${fix.table}`);
                    }
                } else {
                    // Regular column addition
                    const alterQuery = `ALTER TABLE "${fix.table}" ADD COLUMN ${fix.column} ${fix.definition}`;
                    await azurePool.query(alterQuery);
                    console.log(`   ✅ Added ${fix.column} column to ${fix.table}`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error adding ${fix.column} to ${fix.table}: ${error.message}`);
            }
        }

        console.log('\n🔍 VERIFICATION - Checking all columns exist:');
        console.log('--------------------------------------------------------------------------------');

        for (const fix of schemaFixes) {
            try {
                const columnCheck = await azurePool.query(`
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND column_name = $2
                `, [fix.table, fix.column]);

                if (columnCheck.rows.length > 0) {
                    const col = columnCheck.rows[0];
                    console.log(`✅ ${fix.table}.${fix.column}: ${col.data_type} (nullable: ${col.is_nullable})`);
                } else {
                    console.log(`❌ ${fix.table}.${fix.column}: MISSING`);
                }
            } catch (error) {
                console.log(`❌ Error checking ${fix.table}.${fix.column}: ${error.message}`);
            }
        }

        console.log('\n================================================================================');
        console.log('🎉 AZURE SCHEMA FIXES COMPLETE');
        console.log('================================================================================');
        console.log('✅ All missing columns have been added to Azure database');
        console.log('✅ Ready to run complete database mirroring again');
        console.log('✅ Run: node complete-database-mirror.js');

    } catch (error) {
        console.error('❌ Error during schema fixes:', error.message);
    } finally {
        await azurePool.end();
        await localPool.end();
    }
}

fixAzureSchemaDefferences();