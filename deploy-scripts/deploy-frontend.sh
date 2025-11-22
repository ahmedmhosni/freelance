#!/bin/bash

echo "=== Deploying Frontend ==="

# Navigate to frontend directory
cd /var/app/frontend

# Get VM's public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "VM Public IP: $PUBLIC_IP"

# Create production environment file
echo "VITE_API_URL=http://$PUBLIC_IP" > .env.production

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build for production
echo "Building frontend..."
npm run build

# Copy build to nginx directory
echo "Deploying to nginx..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html

echo "=== Frontend deployed successfully! ==="
echo "Access your application at: http://$PUBLIC_IP"
