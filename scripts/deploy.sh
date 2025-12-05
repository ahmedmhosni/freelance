#!/bin/bash

# Deployment script for AWS EC2
# Usage: ./scripts/deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to ${ENVIRONMENT}...${NC}"

# Load environment-specific configuration
if [ "$ENVIRONMENT" == "production" ]; then
    SSH_KEY="roastify-key.pem"
    EC2_HOST="${EC2_HOST:-3.77.235.145}"
    EC2_USER="${EC2_USER:-ec2-user}"
    APP_NAME="roastify-backend"
    PORT="5000"
elif [ "$ENVIRONMENT" == "staging" ]; then
    SSH_KEY="${STAGING_SSH_KEY:-roastify-staging-key.pem}"
    EC2_HOST="${STAGING_HOST}"
    EC2_USER="${STAGING_USER:-ec2-user}"
    APP_NAME="roastify-staging"
    PORT="5001"
else
    echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
    echo "Usage: ./scripts/deploy.sh [production|staging]"
    exit 1
fi

# Verify SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH key not found: $SSH_KEY${NC}"
    exit 1
fi

# Build deployment package
echo -e "${YELLOW}📦 Building deployment package...${NC}"
cd backend
npm ci --omit=dev
cd ..
tar -czf deploy-${TIMESTAMP}.tar.gz -C backend src node_modules package.json

# Upload to server
echo -e "${YELLOW}⬆️  Uploading to server...${NC}"
scp -i "$SSH_KEY" deploy-${TIMESTAMP}.tar.gz ${EC2_USER}@${EC2_HOST}:/tmp/

# Deploy on server
echo -e "${YELLOW}🔧 Deploying on server...${NC}"
ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_HOST} << ENDSSH
    set -e
    
    APP_NAME="$APP_NAME"
    APP_DIR="\$HOME/roastify/backend"
    BACKUP_DIR="\$HOME/roastify/backups"
    DEPLOY_FILE="/tmp/deploy-${TIMESTAMP}.tar.gz"
    
    echo "Creating backup..."
    mkdir -p "\$BACKUP_DIR"
    if [ -d "\$APP_DIR" ]; then
        tar -czf "\$BACKUP_DIR/backup-${TIMESTAMP}.tar.gz" -C "\$APP_DIR" . 2>/dev/null || true
    fi
    
    echo "Stopping application..."
    pm2 stop \$APP_NAME 2>/dev/null || true
    
    echo "Extracting new version..."
    mkdir -p "\$APP_DIR"
    cd "\$APP_DIR"
    tar -xzf "\$DEPLOY_FILE"
    
    if [ ! -f .env ]; then
        echo "ERROR: .env file not found!"
        exit 1
    fi
    
    echo "Starting application..."
    pm2 start src/server.js --name \$APP_NAME --time --max-memory-restart 500M
    pm2 save
    
    echo "Running health check..."
    sleep 10
    if curl -f http://localhost:${PORT}/health > /dev/null 2>&1; then
        echo "✅ Deployment successful!"
        rm "\$DEPLOY_FILE"
        pm2 status
    else
        echo "❌ Health check failed!"
        exit 1
    fi
ENDSSH

# Cleanup local files
rm deploy-${TIMESTAMP}.tar.gz

echo -e "${GREEN}✅ Deployment to ${ENVIRONMENT} completed successfully!${NC}"
