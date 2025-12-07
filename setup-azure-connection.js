/**
 * Azure PostgreSQL Connection Setup Helper
 * 
 * This script helps you test and configure your Azure PostgreSQL connection
 */

const { Pool } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection(config) {
  const pool = new Pool(config);
  
  try {
    log('\nTesting connection...', 'yellow');
    const result = await pool.query('SELECT NOW(), version()');
    log('✓ Connection successful!', 'green');
    log(`  Server time: ${result.rows[0].now}`, 'cyan');
    log(`  PostgreSQL version: ${result.rows[0].version.split(',')[0]}`, 'cyan');
    
    // Test database access
    const dbResult = await pool.query('SELECT current_database()');
    log(`  Connected to database: ${dbResult.rows[0].current_database}`, 'cyan');
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    log(`  Tables in database: ${tablesResult.rows[0].table_count}`, 'cyan');
    
    await pool.end();
    return true;
  } catch (error) {
    log('✗ Connection failed!', 'red');
    log(`  Error: ${error.message}`, 'red');
    
    if (error.message.includes('password authentication failed')) {
      log('\n  Tip: Check your username and password', 'yellow');
      log('  Azure format: username@servername', 'yellow');
    } else if (error.message.includes('no pg_hba.conf entry')) {
      log('\n  Tip: Add your IP to Azure PostgreSQL firewall rules', 'yellow');
    } else if (error.message.includes('SSL')) {
      log('\n  Tip: Azure PostgreSQL requires SSL connection', 'yellow');
    }
    
    await pool.end();
    return false;
  }
}

async function getAzureConfig() {
  log('\n╔════════════════════════════════════════════════════════╗', 'bright');
  log('║     Azure PostgreSQL Connection Setup                 ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝', 'bright');
  
  log('\nPlease enter your Azure PostgreSQL connection details:', 'cyan');
  log('(You can find these in Azure Portal → PostgreSQL Server → Connection strings)\n', 'yellow');
  
  const host = await question('Host (e.g., myserver.postgres.database.azure.com): ');
  const database = await question('Database name: ');
  const user = await question('Username (format: username@servername): ');
  const password = await question('Password: ');
  const port = await question('Port (default 5432): ') || '5432';
  
  return {
    host: host.trim(),
    port: parseInt(port),
    database: database.trim(),
    user: user.trim(),
    password: password.trim(),
    ssl: {
      rejectUnauthorized: false
    }
  };
}

async function generateEnvConfig(config) {
  log('\n╔════════════════════════════════════════════════════════╗', 'bright');
  log('║     Environment Configuration                          ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝', 'bright');
  
  log('\nAdd these to your .env file:', 'cyan');
  log('\n# Azure PostgreSQL Configuration', 'yellow');
  log(`AZURE_PG_HOST=${config.host}`, 'green');
  log(`AZURE_PG_PORT=${config.port}`, 'green');
  log(`AZURE_PG_DATABASE=${config.database}`, 'green');
  log(`AZURE_PG_USER=${config.user}`, 'green');
  log(`AZURE_PG_PASSWORD=${config.password}`, 'green');
  
  log('\n# For production use (update backend .env):', 'yellow');
  log(`PG_HOST=${config.host}`, 'green');
  log(`PG_PORT=${config.port}`, 'green');
  log(`PG_DATABASE=${config.database}`, 'green');
  log(`PG_USER=${config.user}`, 'green');
  log(`PG_PASSWORD=${config.password}`, 'green');
  log(`PG_SSL=true`, 'green');
}

async function checkFirewall(host) {
  log('\n╔════════════════════════════════════════════════════════╗', 'bright');
  log('║     Firewall Configuration Check                       ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝', 'bright');
  
  log('\nTo allow connections to Azure PostgreSQL:', 'cyan');
  log('1. Go to Azure Portal', 'yellow');
  log('2. Navigate to your PostgreSQL server', 'yellow');
  log('3. Click "Connection security" in the left menu', 'yellow');
  log('4. Add your IP address to firewall rules', 'yellow');
  log('5. Click "Save"', 'yellow');
  
  log('\nYour current IP can be found at: https://whatismyipaddress.com/', 'cyan');
}

async function main() {
  try {
    // Check if environment variables are already set
    if (process.env.AZURE_PG_HOST) {
      log('\n✓ Azure PostgreSQL environment variables detected', 'green');
      
      const useExisting = await question('\nTest existing configuration? (y/n): ');
      
      if (useExisting.toLowerCase() === 'y') {
        const config = {
          host: process.env.AZURE_PG_HOST,
          port: parseInt(process.env.AZURE_PG_PORT || '5432'),
          database: process.env.AZURE_PG_DATABASE,
          user: process.env.AZURE_PG_USER,
          password: process.env.AZURE_PG_PASSWORD,
          ssl: {
            rejectUnauthorized: false
          }
        };
        
        const success = await testConnection(config);
        
        if (success) {
          log('\n✓ Your Azure PostgreSQL connection is configured correctly!', 'green');
          log('\nYou can now run the migration:', 'cyan');
          log('  node migrate-to-azure.js', 'yellow');
        } else {
          await checkFirewall(config.host);
        }
        
        rl.close();
        return;
      }
    }
    
    // Get new configuration
    const config = await getAzureConfig();
    
    // Test connection
    const success = await testConnection(config);
    
    if (success) {
      // Generate environment configuration
      await generateEnvConfig(config);
      
      log('\n✓ Setup complete!', 'green');
      log('\nNext steps:', 'cyan');
      log('1. Copy the environment variables above to your .env file', 'yellow');
      log('2. Run the migration: node migrate-to-azure.js', 'yellow');
    } else {
      await checkFirewall(config.host);
      
      log('\nAfter fixing the connection issue, run this script again.', 'cyan');
    }
    
  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Run setup
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, getAzureConfig };
