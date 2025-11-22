#!/bin/bash

echo "=== Setting up VM for Project Management System ==="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
sudo apt-get install -y nginx

# Create application directories
echo "Creating application directories..."
sudo mkdir -p /var/app/backend
sudo mkdir -p /var/app/frontend
sudo mkdir -p /var/app/data
sudo mkdir -p /var/app/uploads
sudo mkdir -p /var/app/logs
sudo mkdir -p /var/app/backups

# Set permissions
sudo chown -R $USER:$USER /var/app

# Install git (optional, for updates)
sudo apt-get install -y git

echo "=== VM setup complete! ==="
echo "Next steps:"
echo "1. Upload your application code"
echo "2. Run deploy-backend.sh"
echo "3. Run deploy-frontend.sh"
echo "4. Configure nginx with nginx.conf"
