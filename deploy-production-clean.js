#!/usr/bin/env node

/**
 * Clean Production Deployment Script
 * Prepares and deploys the system to Azure with proper configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}📋 ${msg}${colors.reset}\n`)
};

// Production environment variables from user input
const PRODUCTION_ENV_VARS = [
  { name: "APP_NAME", value: "Roastify" },
  { name: "APP_URL", value: "https://roastify.online" },
  { name: "APPINSIGHTS_INSTRUMENTATIONKEY", value: "f8d92f8a-6336-4408-b4ea-c39ea67a2cea" },
  { name: "APPINSIGHTS_PROFILERFEATURE_VERSION", value: "1.0.0" },
  { name: "APPINSIGHTS_SNAPSHOTFEATURE_VERSION", value: "1.0.0" },
  { name: "APPLICATIONINSIGHTS_CONNECTION_STRING", value: "InstrumentationKey=f8d92f8a-6336-4408-b4ea-c39ea67a2cea;IngestionEndpoint=https://canadaeast-0.in.applicationinsights.azure.com/;LiveEndpoint=https://canadaeast.livediagnostics.monitor.azure.com/;ApplicationId=13300441-e166-44a8-b81c-e2693c9cf1e1" },
  { name: "ApplicationInsightsAgent_EXTENSION_VERSION", value: "~3" },
  { name: "AZURE_COMMUNICATION_CONNECTION_STRING", value: "endpoint=https://roastifyemail.europe.communication.azure.com/;accesskey=5n3xW27OBEh5mK0tQm9gnafnqkaFsyP2ErqH8EnEDV5ToU3aYFvsJQQJ99BKACULyCptyCYmAAAAAZCSEYcP" },
  { name: "AZURE_STORAGE_ACCOUNT_NAME", value: "roastifystorge" },
  { name: "AZURE_STORAGE_CONNECTION_STRING", value: "DefaultEndpointsProtocol=https;AccountName=roastifystorge;AccountKey=QuoWr/TLMzxex1692Vlh6HQY39FAOiPgcFKh4MzpH/h3q09C5dIe++7eKSbz86Q6zk04097z8Q12+AStT91geQ==;EndpointSuffix=core.windows.net" },
  { name: "AZURE_STORAGE_CONTAINER_NAME", value: "profile-pictures" },
  { name: "DB_DATABASE", value: "roastifydb" },
  { name: "DB_HOST", value: "roastifydbpost.postgres.database.azure.com" },
  { name: "DB_PASSWORD", value: "AHmed#123456" },
  { name: "DB_PORT", value: "5432" },
  { name: "DB_SSL", value: "true" },
  { name: "DB_USER", value: "adminuser" },
  { name: "DiagnosticServices_EXTENSION_VERSION", value: "~3" },
  { name: "EMAIL_FROM", value: "donotreply@roastify.online" },
  { name: "EMAIL_VERIFICATION_EXPIRY", value: "1h" },
  { name: "FRONTEND_URL", value: "https://roastify.online" },
  { name: "GEMINI_API_KEY", value: "AIzaSyACrmn14lPWw2D5-vPiJmZhiaqqi1MJaW8" },
  { name: "InstrumentationEngine_EXTENSION_VERSION", value: "disabled" },
  { name: "JWT_EXPIRES_IN", value: "7d" },
  { name: "JWT_SECRET", value: "407a5787374ec74af5dc562804cd251381196c173fead3cfa887350baec780cb" },
  { name: "NODE_ENV", value: "production" },
  { name: "PASSWORD_RESET_EXPIRY", value: "1h" },
  { name: "PORT", value: "8080" },
  { name: "SnapshotDebugger_EXTENSION_VERSION", value: "disabled" },
  { name: "SUPPORT_EMAIL", value: "support@roastify.online" },
  { name: "USE_AZURE_SQL", value: "false" },
  { name: "USE_POSTGRES", value: "true" },
  { name: "XDT_MicrosoftApplicationInsights_BaseExtensions", value: "disabled" },
  { name: "XDT_MicrosoftApplicationInsights_Mode", value: "recommended" },
  { name: "XDT_MicrosoftApplicationInsights_PreemptSdk", value: "disabled" }
];

async function main() {
  console.log('🚀 Starting Clean Production Deployment...\n');

  let step = 1;

  // Step 1: Pre-deployment validation
  log.section(`Step ${step++}: Pre-deployment Validation`);

  log.info('Validating system readiness...');
  
  // Check if we have all required files
  const requiredFiles = [
    'backend/package.json',
    'frontend/package.json',
    'backend/src/server.js',
    'frontend/src/App.jsx'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      log.error(`Required file missing: ${file}`);
      process.exit(1);
    }
  }

  log.success('All required files present');

  // Step 2: Create production environment files
  log.section(`Step ${step++}: Production Environment Configuration`);

  // Create production .env for frontend
  const frontendProdEnv = `# Production Environment
VITE_API_URL=https://roastify.online/api
VITE_APP_NAME=Roastify
VITE_APP_VERSION=2.0.0
VITE_ENV=production
`;

  fs.writeFileSync('frontend/.env.production', frontendProdEnv);
  log.success('Created frontend production environment file');

  // Create Azure environment variables script
  const azureEnvScript = `#!/bin/bash
# Azure App Service Environment Variables Configuration
# Run this script in Azure Cloud Shell or with Azure CLI

echo "🔧 Configuring Azure App Service Environment Variables..."

# App Service name (update this to match your app service)
APP_SERVICE_NAME="roastify-backend"
RESOURCE_GROUP="roastify-rg"

${PRODUCTION_ENV_VARS.map(env => 
  `az webapp config appsettings set --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP --settings "${env.name}=${env.value}"`
).join('\n')}

echo "✅ All environment variables configured!"
echo "🔍 Verifying configuration..."

az webapp config appsettings list --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP --query "[].{Name:name, Value:value}" --output table

echo "🚀 Backend configuration complete!"
`;

  fs.writeFileSync('configure-azure-env.sh', azureEnvScript);
  log.success('Created Azure environment configuration script');

  // Step 3: Clean and prepare backend
  log.section(`Step ${step++}: Backend Preparation`);

  log.info('Cleaning backend...');
  
  // Remove development files
  const backendCleanupPaths = [
    'backend/logs',
    'backend/uploads',
    'backend/database.sqlite',
    'backend/.env.local'
  ];

  for (const cleanupPath of backendCleanupPaths) {
    if (fs.existsSync(cleanupPath)) {
      fs.rmSync(cleanupPath, { recursive: true, force: true });
      log.info(`Cleaned: ${cleanupPath}`);
    }
  }

  // Ensure production directories exist
  const productionDirs = [
    'backend/logs',
    'backend/uploads'
  ];

  for (const dir of productionDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log.info(`Created: ${dir}`);
    }
  }

  log.success('Backend cleaned and prepared');

  // Step 4: Build frontend
  log.section(`Step ${step++}: Frontend Build`);

  log.info('Building frontend for production...');

  try {
    // Clean previous build
    if (fs.existsSync('frontend/dist')) {
      fs.rmSync('frontend/dist', { recursive: true, force: true });
    }

    // Build frontend
    execSync('npm run build', { 
      cwd: 'frontend', 
      stdio: 'inherit'
    });

    log.success('Frontend build completed');

    // Validate build
    if (!fs.existsSync('frontend/dist/index.html')) {
      throw new Error('Build validation failed: index.html not found');
    }

    const buildFiles = fs.readdirSync('frontend/dist');
    log.info(`Build contains ${buildFiles.length} files/directories`);

  } catch (error) {
    log.error(`Frontend build failed: ${error.message}`);
    process.exit(1);
  }

  // Step 5: Create deployment package
  log.section(`Step ${step++}: Deployment Package Creation`);

  log.info('Creating deployment package...');

  // Create deployment info
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: 'production',
    backend: {
      nodeVersion: process.version,
      dependencies: JSON.parse(fs.readFileSync('backend/package.json', 'utf8')).dependencies
    },
    frontend: {
      buildTime: new Date().toISOString(),
      buildSize: getBuildSize('frontend/dist')
    },
    deployment: {
      database: 'Azure PostgreSQL',
      storage: 'Azure Blob Storage',
      email: 'Azure Communication Services',
      monitoring: 'Application Insights'
    }
  };

  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  log.success('Created deployment information file');

  // Step 6: Create GitHub Actions workflow
  log.section(`Step ${step++}: GitHub Actions Configuration`);

  const githubWorkflow = `name: Deploy to Azure

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          backend/package-lock.json
          frontend/package-lock.json
    
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build frontend
      run: |
        cd frontend
        npm run build
    
    - name: Deploy backend to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'roastify-backend'
        publish-profile: \${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: './backend'
    
    - name: Deploy frontend to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: \${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/frontend"
        output_location: "dist"
`;

  // Ensure .github/workflows directory exists
  if (!fs.existsSync('.github/workflows')) {
    fs.mkdirSync('.github/workflows', { recursive: true });
  }

  fs.writeFileSync('.github/workflows/deploy.yml', githubWorkflow);
  log.success('Created GitHub Actions workflow');

  // Step 7: Create deployment scripts
  log.section(`Step ${step++}: Deployment Scripts`);

  // Manual deployment script
  const manualDeployScript = `#!/bin/bash
# Manual Deployment Script for Azure

echo "🚀 Starting manual deployment to Azure..."

# 1. Configure environment variables
echo "📋 Step 1: Configuring environment variables..."
chmod +x configure-azure-env.sh
./configure-azure-env.sh

# 2. Deploy backend
echo "📋 Step 2: Deploying backend..."
cd backend
zip -r ../backend-deployment.zip . -x "node_modules/*" "logs/*" "uploads/*" "*.sqlite"
cd ..

echo "📤 Upload backend-deployment.zip to Azure App Service"
echo "   1. Go to Azure Portal > App Services > roastify-backend"
echo "   2. Go to Deployment Center > ZIP Deploy"
echo "   3. Upload backend-deployment.zip"

# 3. Deploy frontend
echo "📋 Step 3: Deploying frontend..."
echo "📤 Frontend build is ready in frontend/dist/"
echo "   1. Go to Azure Portal > Static Web Apps > roastify-frontend"
echo "   2. Upload the contents of frontend/dist/"

echo "✅ Manual deployment preparation complete!"
echo "🔍 Next steps:"
echo "   1. Upload backend-deployment.zip to Azure App Service"
echo "   2. Upload frontend/dist/ to Azure Static Web Apps"
echo "   3. Verify deployment at https://roastify.online"
`;

  fs.writeFileSync('deploy-manual.sh', manualDeployScript);
  fs.chmodSync('deploy-manual.sh', '755');
  log.success('Created manual deployment script');

  // Step 8: Final validation
  log.section(`Step ${step++}: Final Validation`);

  const validationChecks = [
    { name: 'Frontend build exists', check: () => fs.existsSync('frontend/dist/index.html') },
    { name: 'Backend server file exists', check: () => fs.existsSync('backend/src/server.js') },
    { name: 'Environment config created', check: () => fs.existsSync('configure-azure-env.sh') },
    { name: 'GitHub workflow created', check: () => fs.existsSync('.github/workflows/deploy.yml') },
    { name: 'Deployment info created', check: () => fs.existsSync('deployment-info.json') },
    { name: 'Manual deploy script created', check: () => fs.existsSync('deploy-manual.sh') }
  ];

  let allValid = true;
  for (const check of validationChecks) {
    if (check.check()) {
      log.success(check.name);
    } else {
      log.error(check.name);
      allValid = false;
    }
  }

  // Summary
  log.section('Deployment Preparation Summary');

  if (allValid) {
    log.success('🎉 System is ready for production deployment!');
    
    console.log('\n📋 Deployment Options:');
    console.log('');
    console.log('🔧 Option 1: Manual Deployment');
    console.log('   Run: ./deploy-manual.sh');
    console.log('   Then follow the manual upload instructions');
    console.log('');
    console.log('🤖 Option 2: GitHub Actions (Recommended)');
    console.log('   1. Commit and push all changes to main branch');
    console.log('   2. Configure secrets in GitHub repository:');
    console.log('      - AZURE_WEBAPP_PUBLISH_PROFILE');
    console.log('      - AZURE_STATIC_WEB_APPS_API_TOKEN');
    console.log('   3. GitHub Actions will automatically deploy');
    console.log('');
    console.log('🔍 Post-deployment verification:');
    console.log('   - Backend: https://roastify-backend.azurewebsites.net/health');
    console.log('   - Frontend: https://roastify.online');
    console.log('   - API: https://roastify.online/api/health');

  } else {
    log.error('❌ Deployment preparation failed. Please fix the issues above.');
    process.exit(1);
  }

  console.log('\n🏁 Clean production deployment preparation complete!\n');
}

function getBuildSize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  let totalSize = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      totalSize += getBuildSize(filePath);
    } else {
      totalSize += fs.statSync(filePath).size;
    }
  }
  
  return totalSize;
}

main().catch(error => {
  log.error(`Deployment preparation failed: ${error.message}`);
  process.exit(1);
});