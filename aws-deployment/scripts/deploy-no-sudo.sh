#!/bin/bash
# Deployment Script WITHOUT sudo requirements
# Deploys to home directory instead of /opt

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
EC2_IP="3.77.235.145"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/roastify-key.pem}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo -e "${GREEN}=== Roastify Deployment (No Sudo) ===${NC}"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY${NC}"
    echo "Please set SSH_KEY environment variable"
    exit 1
fi

# Check if .env.production exists
if [ ! -f "$PROJECT_ROOT/backend/.env.production" ]; then
    echo -e "${RED}Error: .env.production not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Building backend...${NC}"
cd "$PROJECT_ROOT/backend"
npm install --production

echo ""
echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
DEPLOY_DIR="/tmp/roastify-deploy-$(date +%s)"
mkdir -p "$DEPLOY_DIR"

# Copy files
cp -r src "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp .env.production "$DEPLOY_DIR/.env"

# Create tarball
cd /tmp
tar -czf roastify-backend.tar.gz -C "$DEPLOY_DIR" .

echo ""
echo -e "${YELLOW}Step 3: Uploading to EC2 ($EC2_IP)...${NC}"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    roastify-backend.tar.gz ec2-user@$EC2_IP:/tmp/

echo ""
echo -e "${YELLOW}Step 4: Deploying on EC2...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@$EC2_IP << 'ENDSSH'
set -e

echo "Stopping existing application..."
pm2 stop roastify-backend 2>/dev/null || echo "No existing application to stop"

# Use home directory instead of /opt
APP_DIR="$HOME/roastify/backend"

# Backup current deployment
if [ -d "$APP_DIR" ]; then
    echo "Backing up current deployment..."
    mv "$APP_DIR" "$HOME/roastify/backend.backup.$(date +%s)" 2>/dev/null || true
fi

# Create application directory
echo "Creating application directory..."
mkdir -p "$APP_DIR"

# Extract new deployment
echo "Extracting deployment package..."
cd "$APP_DIR"
tar -xzf /tmp/roastify-backend.tar.gz

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start application
echo "Starting application..."
cd "$APP_DIR"
pm2 start src/server.js --name roastify-backend --time
pm2 save

# Wait for application to start
echo "Waiting for application to start..."
sleep 5

# Check health
echo "Checking application health..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✓ Application is healthy"
    
    # Remove old backups (keep last 2)
    cd "$HOME/roastify"
    ls -t | grep "backend.backup" | tail -n +3 | xargs -r rm -rf
else
    echo "✗ Application health check failed"
    echo "Rolling back..."
    
    pm2 stop roastify-backend 2>/dev/null || true
    
    # Restore backup
    LATEST_BACKUP=$(ls -t "$HOME/roastify/backend.backup."* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        echo "Restoring from backup: $LATEST_BACKUP"
        rm -rf "$APP_DIR"
        mv "$LATEST_BACKUP" "$APP_DIR"
        cd "$APP_DIR"
        pm2 start src/server.js --name roastify-backend
    fi
    
    exit 1
fi

# Cleanup
rm /tmp/roastify-backend.tar.gz

echo ""
echo "Deployment completed successfully!"
echo ""
echo "Application Status:"
pm2 status
ENDSSH

DEPLOY_STATUS=$?

# Cleanup local files
rm -rf "$DEPLOY_DIR"
rm /tmp/roastify-backend.tar.gz

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=== Deployment Successful! ===${NC}"
    echo ""
    echo "Application is running at:"
    echo "  Direct: http://$EC2_IP:5000/health"
    echo "  Load Balancer: http://roastify-alb-337599437.eu-central-1.elb.amazonaws.com/health"
    echo ""
else
    echo ""
    echo -e "${RED}=== Deployment Failed ===${NC}"
    exit 1
fi
