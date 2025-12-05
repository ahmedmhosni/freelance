#!/bin/bash

# Rollback script for AWS EC2
# Usage: ./scripts/rollback.sh [production|staging] [backup-timestamp]

set -e

ENVIRONMENT=${1:-production}
BACKUP_TIMESTAMP=$2

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Starting rollback for ${ENVIRONMENT}...${NC}"

# Load environment configuration
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
    exit 1
fi

# Verify SSH key
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH key not found: $SSH_KEY${NC}"
    exit 1
fi

# List available backups if no timestamp provided
if [ -z "$BACKUP_TIMESTAMP" ]; then
    echo -e "${YELLOW}📋 Available backups:${NC}"
    ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_HOST} "ls -lht \$HOME/roastify/backups/backup-*.tar.gz | head -10"
    echo ""
    echo "Usage: ./scripts/rollback.sh ${ENVIRONMENT} <backup-timestamp>"
    echo "Example: ./scripts/rollback.sh ${ENVIRONMENT} 20231215_143022"
    exit 0
fi

# Perform rollback
echo -e "${YELLOW}🔧 Rolling back to backup-${BACKUP_TIMESTAMP}...${NC}"
ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_HOST} << ENDSSH
    set -e
    
    APP_NAME="$APP_NAME"
    APP_DIR="\$HOME/roastify/backend"
    BACKUP_FILE="\$HOME/roastify/backups/backup-${BACKUP_TIMESTAMP}.tar.gz"
    
    if [ ! -f "\$BACKUP_FILE" ]; then
        echo "❌ Backup file not found: \$BACKUP_FILE"
        exit 1
    fi
    
    echo "Stopping application..."
    pm2 stop \$APP_NAME 2>/dev/null || true
    
    echo "Restoring from backup..."
    cd "\$APP_DIR"
    rm -rf *
    tar -xzf "\$BACKUP_FILE"
    
    echo "Starting application..."
    pm2 start src/server.js --name \$APP_NAME --time --max-memory-restart 500M
    pm2 save
    
    echo "Running health check..."
    sleep 10
    if curl -f http://localhost:${PORT}/health > /dev/null 2>&1; then
        echo "✅ Rollback successful!"
        pm2 status
    else
        echo "❌ Health check failed after rollback!"
        exit 1
    fi
ENDSSH

echo -e "${GREEN}✅ Rollback to ${ENVIRONMENT} completed successfully!${NC}"
