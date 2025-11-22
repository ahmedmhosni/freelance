#!/bin/bash

echo "=== Updating Application ==="

# Backup current database before update
echo "Creating backup..."
/var/app/backup-script.sh

# Update backend
echo "Updating backend..."
cd /var/app/backend
npm ci --production
pm2 restart backend

# Update frontend
echo "Updating frontend..."
cd /var/app/frontend

# Get VM's public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "VITE_API_URL=http://$PUBLIC_IP" > .env.production

npm ci
npm run build
sudo cp -r dist/* /var/www/html/

echo "=== Update complete! ==="
echo "Backend status:"
pm2 status backend
