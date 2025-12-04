#!/bin/bash
# Quick Deployment Script for Existing AWS Infrastructure
# This script deploys to your existing EC2 instance at 3.77.235.145

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
EC2_IP="3.77.235.145"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/roastify-key}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo -e "${GREEN}=== Roastify Deployment to Existing Infrastructure ===${NC}"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY${NC}"
    echo "Please set SSH_KEY environment variable or place key at ~/.ssh/roastify-key"
    exit 1
fi

# Check if .env.production exists
if [ ! -f "$PROJECT_ROOT/backend/.env.production" ]; then
    echo -e "${RED}Error: .env.production not found${NC}"
    echo "Please create backend/.env.production with your production settings"
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

# Backup current deployment
if [ -d "/opt/roastify/backend" ]; then
    echo "Backing up current deployment..."
    sudo mv /opt/roastify/backend /opt/roastify/backend.backup.$(date +%s) 2>/dev/null || true
fi

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/roastify/backend
sudo chown ec2-user:ec2-user /opt/roastify/backend

# Extract new deployment
echo "Extracting deployment package..."
cd /opt/roastify/backend
tar -xzf /tmp/roastify-backend.tar.gz

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Start application
echo "Starting application..."
pm2 start src/server.js --name roastify-backend --time
pm2 save

# Configure PM2 startup (only needs to be done once)
pm2 startup systemd -u ec2-user --hp /home/ec2-user 2>/dev/null || true

# Wait for application to start
echo "Waiting for application to start..."
sleep 5

# Check health
echo "Checking application health..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✓ Application is healthy"
    
    # Remove old backups (keep last 2)
    cd /opt/roastify
    ls -t | grep "backend.backup" | tail -n +3 | xargs -r sudo rm -rf
else
    echo "✗ Application health check failed"
    echo "Rolling back..."
    
    pm2 stop roastify-backend 2>/dev/null || true
    
    # Restore backup
    LATEST_BACKUP=$(ls -t /opt/roastify/backend.backup.* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        echo "Restoring from backup: $LATEST_BACKUP"
        sudo rm -rf /opt/roastify/backend
        sudo mv "$LATEST_BACKUP" /opt/roastify/backend
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
    echo "To view logs:"
    echo "  ssh -i $SSH_KEY ec2-user@$EC2_IP 'pm2 logs roastify-backend'"
    echo ""
    echo "To check status:"
    echo "  ssh -i $SSH_KEY ec2-user@$EC2_IP 'pm2 status'"
    echo ""
else
    echo ""
    echo -e "${RED}=== Deployment Failed ===${NC}"
    echo "Check logs with:"
    echo "  ssh -i $SSH_KEY ec2-user@$EC2_IP 'pm2 logs roastify-backend'"
    exit 1
fi
