/**
 * Migration script with automatic retry for firewall propagation
 */

const { Pool } = require('pg');
const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAzureConnection() {
  const pool = new Pool({
    host: process.env.AZURE_PG_HOST,
    port: parseInt(process.env.AZURE_PG_PORT || '5432'),
    database: process.env.AZURE_PG_DATABASE,
    user: process.env.AZURE_PG_USER,
    password: process.env.AZURE_PG_PASSWORD,
    ssl: false
  });

  try {
    await pool.query('SELECT NOW()');
    await pool.end();
    return true;
  } catch (error) {
    await pool.end();
    return false;
  }
}

async function waitForConnection(maxAttempts = 10, delaySeconds = 10) {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Waiting for Azure Firewall Rule to Propagate        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    log(`\nAttempt ${attempt}/${maxAttempts}: Testing connection...`, 'yellow');
    
    const connected = await testAzureConnection();
    
    if (connected) {
      log('✓ Connection successful!', 'green');
      return true;
    }
    
    if (attempt < maxAttempts) {
      log(`✗ Connection failed. Waiting ${delaySeconds} seconds...`, 'red');
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    }
  }
  
  log('\n✗ Could not connect after all attempts', 'red');
  log('\nPlease verify:', 'yellow');
  log('1. Your IP is correctly added to Azure firewall', 'yellow');
  log('2. The firewall rule is saved', 'yellow');
  log('3. "Allow Azure services" is enabled if needed', 'yellow');
  
  return false;
}

async function runMigration() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Starting Database Migration                          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  return new Promise((resolve, reject) => {
    const migration = spawn('node', ['migrate-to-azure.js'], {
      stdio: 'inherit',
      env: process.env
    });

    migration.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Migration failed with code ${code}`));
      }
    });

    migration.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  // Check environment variables
  if (!process.env.AZURE_PG_HOST || !process.env.AZURE_PG_DATABASE) {
    log('✗ Azure PostgreSQL environment variables not set', 'red');
    log('\nPlease set:', 'yellow');
    log('  AZURE_PG_HOST', 'yellow');
    log('  AZURE_PG_DATABASE', 'yellow');
    log('  AZURE_PG_USER', 'yellow');
    log('  AZURE_PG_PASSWORD', 'yellow');
    process.exit(1);
  }

  log('Azure PostgreSQL Configuration:', 'cyan');
  log(`  Host: ${process.env.AZURE_PG_HOST}`, 'cyan');
  log(`  Database: ${process.env.AZURE_PG_DATABASE}`, 'cyan');
  log(`  User: ${process.env.AZURE_PG_USER}`, 'cyan');

  // Wait for connection
  const connected = await waitForConnection();
  
  if (!connected) {
    process.exit(1);
  }

  // Run migration
  try {
    await runMigration();
    log('\n✓ Migration completed successfully!', 'green');
  } catch (error) {
    log(`\n✗ Migration failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main().catch(console.error);
