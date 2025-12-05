#!/bin/bash
set -e
REMOTE_DIR="/home/ec2-user/roastify"
PACKAGE_NAME="deploy-package.tar.gz"

echo "Extracting package..."
mkdir -p $REMOTE_DIR
cd $REMOTE_DIR
tar -xzf /tmp/$PACKAGE_NAME
rm /tmp/$PACKAGE_NAME

echo "Installing dependencies..."
npm install --production

echo "Restarting application..."
command -v pm2 >/dev/null 2>&1 || npm install -g pm2
pm2 stop roastify-backend 2>/dev/null || true
pm2 delete roastify-backend 2>/dev/null || true
pm2 start src/server.js --name roastify-backend --time
pm2 save

echo "Deployment complete!"
pm2 status
