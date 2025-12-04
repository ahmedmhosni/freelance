#!/bin/bash
# Backend Deployment Script
# This script deploys the backend application to EC2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/aws-deployment/terraform"

echo -e "${GREEN}=== Backend Deployment Script ===${NC}"
echo ""

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Get EC2 instance IP from Terraform
echo -e "${YELLOW}Getting EC2 instance IP from Terraform...${NC}"
cd "$TERRAFORM_DIR"
EC2_IP=$(terraform output -raw backend_public_ip 2>/dev/null)

if [ -z "$EC2_IP" ]; then
    echo -e "${RED}Error: Could not get EC2 IP from Terraform${NC}"
    echo "Make sure you have deployed infrastructure with 'terraform apply'"
    exit 1
fi

echo -e "${GREEN}EC2 Instance IP: $EC2_IP${NC}"

# Check if SSH key exists
SSH_KEY="$HOME/.ssh/roastify-key"
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY${NC}"
    exit 1
fi

# Check if .env.production exists
ENV_FILE="$PROJECT_ROOT/backend/.env.production"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: .env.production not found${NC}"
    echo "Creating from template..."
    cp "$PROJECT_ROOT/backend/.env.production.template" "$ENV_FILE"
    echo -e "${YELLOW}Please edit $ENV_FILE with your production values${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Building backend...${NC}"
cd "$PROJECT_ROOT/backend"
npm install --production

echo ""
echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
DEPLOY_DIR="/tmp/roastify-deploy-$(date +%s)"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
cp -r src "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp .env.production "$DEPLOY_DIR/.env"

# Create tarball
cd /tmp
tar -czf roastify-backend.tar.gz -C "$DEPLOY_DIR" .

echo ""
echo -e "${YELLOW}Step 3: Uploading to EC2...${NC}"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    roastify-backend.tar.gz ec2-user@$EC2_IP:/tmp/

echo ""
echo -e "${YELLOW}Step 4: Deploying on EC2...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@$EC2_IP << 'ENDSSH'
set -e

# Stop existing application
pm2 stop roastify-backend || true

# Backup current deployment
if [ -d "/opt/roastify/backend" ]; then
    sudo mv /opt/roastify/backend /opt/roastify/backend.backup.$(date +%s)
fi

# Create application directory
sudo mkdir -p /opt/roastify/backend
sudo chown ec2-user:ec2-user /opt/roastify/backend

# Extract new deployment
cd /opt/roastify/backend
tar -xzf /tmp/roastify-backend.tar.gz

# Install dependencies
npm install --production

# Run database migrations
npm run migrate || echo "Warning: Migration failed or not configured"

# Start application
pm2 start src/server.js --name roastify-backend --time
pm2 save

# Wait for application to start
sleep 5

# Check health
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✓ Application is healthy"
    
    # Remove old backup if deployment successful
    sudo rm -rf /opt/roastify/backend.backup.* 2>/dev/null || true
else
    echo "✗ Application health check failed"
    echo "Rolling back..."
    
    pm2 stop roastify-backend
    
    # Restore backup
    LATEST_BACKUP=$(ls -t /opt/roastify/backend.backup.* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        sudo rm -rf /opt/roastify/backend
        sudo mv "$LATEST_BACKUP" /opt/roastify/backend
        pm2 start src/server.js --name roastify-backend
    fi
    
    exit 1
fi

# Cleanup
rm /tmp/roastify-backend.tar.gz

echo "Deployment completed successfully!"
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
    echo "  Health: http://$EC2_IP:5000/health"
    echo ""
    echo "To view logs:"
    echo "  ssh -i $SSH_KEY ec2-user@$EC2_IP 'pm2 logs roastify-backend'"
    echo ""
else
    echo ""
    echo -e "${RED}=== Deployment Failed ===${NC}"
    echo "Check logs with:"
    echo "  ssh -i $SSH_KEY ec2-user@$EC2_IP 'pm2 logs roastify-backend'"
    exit 1
fi
