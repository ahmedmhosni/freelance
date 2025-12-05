const { Pool } = require('pg');

// Azure PostgreSQL database configuration
const azurePool = new Pool({
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: { rejectUnauthorized: false }
});

// Local PostgreSQL database configuration
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'roastify',
  user: 'postgres',
  password: 'postgres123',
  ssl: false
});

async function createMissingTables() {
  try {
    console.log('🔄 Creating missing tables from Azure schema...\n');

    const missingTables = [
      'activity_log',
      'activity_logs',
      'changelog_entries',
      'changelog_items',
      'data_export_requests',
      'feedback',
      'file_metadata',
      'gdpr_requests',
      'git_commits',
      'git_sync_status',
      'legal_content',
      'maintenance',
      'status_history',
      'version_names',
      'versions'
    ];

    for (const tableName of missingTables) {
      console.log(`\n📝 Creating table: ${tableName}`);
      
      // Get table structure from Azure
      const columns = await azurePool.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      if (columns.rows.length === 0) {
        console.log(`   ⚠️  Table ${tableName} not found in Azure`);
        continue;
      }

      // Build CREATE TABLE statement
      let createSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      const columnDefs = [];

      for (const col of columns.rows) {
        let colDef = `  ${col.column_name} `;

        // Map data types
        let dataType = col.data_type.toUpperCase();
        if (dataType === 'CHARACTER VARYING') {
          dataType = col.character_maximum_length 
            ? `VARCHAR(${col.character_maximum_length})` 
            : 'TEXT';
        } else if (dataType === 'TIMESTAMP WITHOUT TIME ZONE') {
          dataType = 'TIMESTAMP';
        } else if (dataType === 'TIMESTAMP WITH TIME ZONE') {
          dataType = 'TIMESTAMPTZ';
        }

        colDef += dataType;

        // Handle NOT NULL
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }

        // Handle DEFAULT - fix sequence references
        if (col.column_default) {
          let defaultVal = col.column_default;
          // Replace sequence references with SERIAL
          if (defaultVal.includes('nextval')) {
            if (col.column_name === 'id') {
              // For id columns, use SERIAL instead
              colDef = `  ${col.column_name} SERIAL`;
              if (col.is_nullable === 'NO') {
                colDef += ' NOT NULL';
              }
            }
          } else {
            colDef += ` DEFAULT ${defaultVal}`;
          }
        }

        columnDefs.push(colDef);
      }

      createSQL += columnDefs.join(',\n');
      
      // Add primary key if id column exists
      if (columns.rows.some(c => c.column_name === 'id')) {
        createSQL += ',\n  PRIMARY KEY (id)';
      }

      createSQL += '\n);';

      try {
        await localPool.query(createSQL);
        console.log(`   ✅ Created table: ${tableName}`);
        console.log(`      Columns: ${columns.rows.length}`);
      } catch (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
      }
    }

    // Create indexes
    console.log('\n' + '='.repeat(80));
    console.log('Creating Indexes');
    console.log('='.repeat(80));

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);',
      'CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_id ON gdpr_requests(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_versions_is_published ON versions(is_published);',
      'CREATE INDEX IF NOT EXISTS idx_changelog_items_version_id ON changelog_items(version_id);'
    ];

    for (const indexSQL of indexes) {
      try {
        await localPool.query(indexSQL);
        console.log(`   ✅ Created index`);
      } catch (error) {
        // Ignore errors for indexes that already exist or reference missing tables
      }
    }

    await azurePool.end();
    await localPool.end();

    console.log('\n🎉 Missing tables created successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createMissingTables();
