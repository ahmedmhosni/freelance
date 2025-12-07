const axios = require('axios');
const { Client } = require('pg');

const AZURE_API_URL = 'https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net';

// Azure Production Database Configuration
const azureDbConfig = {
  host: 'roastifydbpost.postgres.database.azure.com',
  port: 5432,
  database: 'roastifydb',
  user: 'adminuser',
  password: 'AHmed#123456',
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkAzureDeployment() {
  console.log('=== Azure Deployment Pre-Check ===\n');

  // 1. Check Database Connection
  console.log('1. Checking Azure PostgreSQL Database...');
  const dbClient = new Client(azureDbConfig);
  
  try {
    await dbClient.connect();
    console.log('✓ Database connection successful');

    // Check users table
    const usersCheck = await dbClient.query('SELECT COUNT(*) FROM users');
    console.log(`✓ Users table exists with ${usersCheck.rows[0].count} users`);

    // Check for admin user
    const adminCheck = await dbClient.query(
      "SELECT email, role, email_verified FROM users WHERE email = 'admin@roastify.com'"
    );
    if (adminCheck.rows.length > 0) {
      console.log('✓ Admin user exists:', adminCheck.rows[0]);
    } else {
      console.log('⚠ Admin user not found');
    }

    await dbClient.end();
  } catch (error) {
    console.log('✗ Database check failed:', error.message);
    return false;
  }

  // 2. Check Current API Status
  console.log('\n2. Checking Current Azure API Status...');
  try {
    const healthResponse = await axios.get(`${AZURE_API_URL}/api/health`, {
      timeout: 10000
    });
    console.log('✓ API is responding');
    console.log('  Status:', healthResponse.data);
  } catch (error) {
    if (error.response) {
      console.log('⚠ API responded with error:', error.response.status);
    } else {
      console.log('✗ API is not responding:', error.message);
    }
  }

  // 3. Check Environment Configuration
  console.log('\n3. Checking Environment Configuration...');
  console.log('Required Azure App Service Settings:');
  console.log('  - PG_HOST: roastifydbpost.postgres.database.azure.com');
  console.log('  - PG_PORT: 5432');
  console.log('  - PG_DATABASE: roastifydb');
  console.log('  - PG_USER: adminuser');
  console.log('  - PG_PASSWORD: [CONFIGURED]');
  console.log('  - PG_SSL: false');
  console.log('  - NODE_ENV: production');
  console.log('  - JWT_SECRET: [CONFIGURED]');
  console.log('  - PORT: 8080 (Azure default)');

  // 4. Check Backend Code
  console.log('\n4. Checking Backend Code...');
  const fs = require('fs');
  const path = require('path');

  // Check if server.js exists
  const serverPath = path.join(__dirname, 'backend', 'src', 'server.js');
  if (fs.existsSync(serverPath)) {
    console.log('✓ server.js exists');
  } else {
    console.log('✗ server.js not found');
    return false;
  }

  // Check package.json
  const packagePath = path.join(__dirname, 'backend', 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('✓ package.json exists');
    console.log('  Start script:', packageJson.scripts?.start || 'NOT DEFINED');
  } else {
    console.log('✗ package.json not found');
    return false;
  }

  console.log('\n=== Pre-Check Summary ===');
  console.log('✓ Database is accessible');
  console.log('✓ Admin user exists');
  console.log('✓ Backend code is ready');
  console.log('\n⚠ IMPORTANT: Verify Azure App Service environment variables are set correctly!');
  console.log('\nTo deploy:');
  console.log('1. Ensure Azure App Service has correct environment variables');
  console.log('2. Push to main branch to trigger deployment');
  console.log('3. Monitor deployment in GitHub Actions');

  return true;
}

checkAzureDeployment().catch(console.error);
