const sql = require('mssql');

const config = {
  server: 'roastify-db-server.database.windows.net',
  database: 'roastifydbazure',
  user: 'adminuser',
  password: 'AHmed#123456',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function checkData() {
  try {
    console.log('Connecting to Azure SQL...');
    const pool = await sql.connect(config);
    console.log('✓ Connected\n');
    
    const tables = ['users', 'clients', 'projects', 'tasks', 'invoices', 'time_entries'];
    
    console.log('Data Summary:');
    console.log('=============\n');
    
    for (const table of tables) {
      try {
        const result = await pool.request().query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.recordset[0].count;
        console.log(`${table.padEnd(15)}: ${count} rows`);
      } catch (err) {
        console.log(`${table.padEnd(15)}: Error - ${err.message}`);
      }
    }
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkData();
