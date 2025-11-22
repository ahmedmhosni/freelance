# 🚀 Azure Deployment Guide

Complete guide to deploy your Freelancer Management App to Microsoft Azure.

## 📋 Prerequisites

- Azure Account (free tier available)
- Azure CLI installed
- Node.js installed locally
- Git installed

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Azure Resources                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Static Web App  │      │   App Service    │   │
│  │   (Frontend)     │◄────►│   (Backend API)  │   │
│  └──────────────────┘      └──────────────────┘   │
│           │                         │               │
│           │                         ▼               │
│           │                ┌──────────────────┐   │
│           │                │   Azure SQL DB   │   │
│           │                └──────────────────┘   │
│           │                         │               │
│           ▼                         ▼               │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │   Key Vault      │      │  App Insights    │   │
│  │   (Secrets)      │      │  (Monitoring)    │   │
│  └──────────────────┘      └──────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 🔧 Step 1: Install Azure CLI

### Windows
```powershell
winget install Microsoft.AzureCLI
```

### Mac
```bash
brew install azure-cli
```

### Linux
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

## 🔐 Step 2: Login to Azure

```bash
az login
```

## 📦 Step 3: Create Resource Group

```bash
az group create --name freelancer-rg --location eastus
```

## 🗄️ Step 4: Deploy Azure SQL Database

### Create SQL Server
```bash
az sql server create \
  --name freelancer-sql-server \
  --resource-group freelancer-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourSecurePassword123!
```

### Create Database
```bash
az sql db create \
  --resource-group freelancer-rg \
  --server freelancer-sql-server \
  --name freelancer-db \
  --service-objective S0
```

### Configure Firewall
```bash
# Allow Azure services
az sql server firewall-rule create \
  --resource-group freelancer-rg \
  --server freelancer-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP
az sql server firewall-rule create \
  --resource-group freelancer-rg \
  --server freelancer-sql-server \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### Get Connection String
```bash
az sql db show-connection-string \
  --client ado.net \
  --server freelancer-sql-server \
  --name freelancer-db
```

## 🔑 Step 5: Create Key Vault

```bash
az keyvault create \
  --name freelancer-keyvault \
  --resource-group freelancer-rg \
  --location eastus
```

### Store Secrets
```bash
# JWT Secret
az keyvault secret set \
  --vault-name freelancer-keyvault \
  --name JWT-SECRET \
  --value "your-super-secret-jwt-key"

# Database Connection String
az keyvault secret set \
  --vault-name freelancer-keyvault \
  --name DB-CONNECTION-STRING \
  --value "your-connection-string"
```

## 🌐 Step 6: Deploy Backend (App Service)

### Create App Service Plan
```bash
az appservice plan create \
  --name freelancer-plan \
  --resource-group freelancer-rg \
  --sku B1 \
  --is-linux
```

### Create Web App
```bash
az webapp create \
  --resource-group freelancer-rg \
  --plan freelancer-plan \
  --name freelancer-api \
  --runtime "NODE:18-lts"
```

### Configure App Settings
```bash
az webapp config appsettings set \
  --resource-group freelancer-rg \
  --name freelancer-api \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://freelancer-keyvault.vault.azure.net/secrets/JWT-SECRET/)" \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://freelancer-keyvault.vault.azure.net/secrets/DB-CONNECTION-STRING/)"
```

### Enable Managed Identity
```bash
az webapp identity assign \
  --resource-group freelancer-rg \
  --name freelancer-api
```

### Grant Key Vault Access
```bash
# Get the principal ID
PRINCIPAL_ID=$(az webapp identity show \
  --resource-group freelancer-rg \
  --name freelancer-api \
  --query principalId \
  --output tsv)

# Grant access
az keyvault set-policy \
  --name freelancer-keyvault \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list
```

### Deploy Backend Code
```bash
cd backend
zip -r deploy.zip .
az webapp deployment source config-zip \
  --resource-group freelancer-rg \
  --name freelancer-api \
  --src deploy.zip
```

## 🎨 Step 7: Deploy Frontend (Static Web App)

### Create Static Web App
```bash
az staticwebapp create \
  --name freelancer-frontend \
  --resource-group freelancer-rg \
  --location eastus2
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Deploy Frontend
```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist \
  --deployment-token YOUR_DEPLOYMENT_TOKEN \
  --app-name freelancer-frontend
```

### Configure API URL
Update `frontend/.env.production`:
```
VITE_API_URL=https://freelancer-api.azurewebsites.net
```

## 📊 Step 8: Setup Application Insights

```bash
az monitor app-insights component create \
  --app freelancer-insights \
  --location eastus \
  --resource-group freelancer-rg \
  --application-type web
```

### Get Instrumentation Key
```bash
az monitor app-insights component show \
  --app freelancer-insights \
  --resource-group freelancer-rg \
  --query instrumentationKey
```

### Add to Backend
```bash
npm install applicationinsights

# Add to server.js
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).start();
```

## 🔄 Step 9: Setup CI/CD with GitHub Actions

### Backend Workflow (`.github/workflows/backend.yml`)
```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: freelancer-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./backend
```

### Frontend Workflow (`.github/workflows/frontend.yml`)
```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Build
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          output_location: "dist"
```

## 🔒 Step 10: Security Configuration

### Enable HTTPS Only
```bash
az webapp update \
  --resource-group freelancer-rg \
  --name freelancer-api \
  --https-only true
```

### Configure CORS
```bash
az webapp cors add \
  --resource-group freelancer-rg \
  --name freelancer-api \
  --allowed-origins https://freelancer-frontend.azurestaticapps.net
```

### Enable Authentication (Azure AD B2C)
```bash
az webapp auth update \
  --resource-group freelancer-rg \
  --name freelancer-api \
  --enabled true \
  --action LoginWithAzureActiveDirectory
```

## 📈 Step 11: Monitoring & Logging

### View Logs
```bash
az webapp log tail \
  --resource-group freelancer-rg \
  --name freelancer-api
```

### Enable Diagnostic Logging
```bash
az webapp log config \
  --resource-group freelancer-rg \
  --name freelancer-api \
  --application-logging filesystem \
  --level information
```

## 💰 Step 12: Cost Optimization

### Free Tier Resources
- Static Web Apps: Free tier (100 GB bandwidth/month)
- App Service: B1 tier (~$13/month)
- Azure SQL: Basic tier (~$5/month)
- Key Vault: Pay per operation (minimal cost)
- Application Insights: First 5 GB free

### Estimated Monthly Cost: ~$20-25

### Cost Saving Tips
1. Use Azure Free Account credits
2. Stop App Service during non-business hours
3. Use serverless SQL for development
4. Enable auto-scaling only when needed

## 🧪 Step 13: Testing Deployment

### Test Backend
```bash
curl https://freelancer-api.azurewebsites.net/health
```

### Test Frontend
Open: https://freelancer-frontend.azurestaticapps.net

### Test Database Connection
```bash
curl https://freelancer-api.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 🔄 Step 14: Database Migration

### Update backend/src/db/database.js for Azure SQL
```javascript
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// Run schema.sql on Azure SQL
```

## 📝 Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend loads correctly
- [ ] Database connection works
- [ ] Authentication works
- [ ] All API endpoints respond
- [ ] HTTPS is enforced
- [ ] CORS is configured
- [ ] Secrets are in Key Vault
- [ ] Monitoring is enabled
- [ ] Backups are configured
- [ ] CI/CD pipeline works

## 🆘 Troubleshooting

### Backend not starting
```bash
az webapp log tail --resource-group freelancer-rg --name freelancer-api
```

### Database connection issues
- Check firewall rules
- Verify connection string
- Test from Azure Portal Query Editor

### Frontend not loading
- Check build output
- Verify API URL in environment variables
- Check browser console for errors

## 📚 Additional Resources

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure SQL Database Docs](https://docs.microsoft.com/azure/azure-sql/)
- [Azure Key Vault Docs](https://docs.microsoft.com/azure/key-vault/)

---

**Deployment Complete! Your app is now live on Azure! 🎉**
