const { Pool } = require('pg');

async function testConnection() {
  const configs = [
    {
      name: 'Config 1: adminuser',
      host: 'roastifydbpost.postgres.database.azure.com',
      port: 5432,
      database: 'roastifydb',
      user: 'adminuser',
      password: 'AHmed#123456',
      ssl: false
    },
    {
      name: 'Config 2: adminuser@roastifydbpost',
      host: 'roastifydbpost.postgres.database.azure.com',
      port: 5432,
      database: 'roastifydb',
      user: 'adminuser@roastifydbpost',
      password: 'AHmed#123456',
      ssl: false
    }
  ];

  for (const config of configs) {
    console.log(`\nTesting: ${config.name}`);
    const pool = new Pool(config);
    
    try {
      const result = await pool.query('SELECT NOW(), current_database()');
      console.log('✓ SUCCESS!');
      console.log(`  Time: ${result.rows[0].now}`);
      console.log(`  Database: ${result.rows[0].current_database}`);
      await pool.end();
      return config;
    } catch (error) {
      console.log(`✗ Failed: ${error.message}`);
      await pool.end();
    }
  }
  
  return null;
}

testConnection().then(workingConfig => {
  if (workingConfig) {
    console.log('\n✓ Found working configuration!');
    console.log('Use this username:', workingConfig.user);
  } else {
    console.log('\n✗ No working configuration found');
    console.log('\nTroubleshooting:');
    console.log('1. Wait 1-2 minutes for firewall rule to propagate');
    console.log('2. Verify IP address is correct in Azure Portal');
    console.log('3. Check if "Allow Azure services" is enabled');
    console.log('4. Verify username and password are correct');
  }
  process.exit(0);
});
