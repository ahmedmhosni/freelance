#!/bin/bash

echo "=== Deploying Backend ==="

# Navigate to backend directory
cd /var/app/backend

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Initialize database if it doesn't exist
if [ ! -f /var/app/data/database.sqlite ]; then
    echo "Initializing database..."
    node src/db/database.js
fi

# Run migrations
echo "Running migrations..."
node src/db/migrations/add-quotes-table.js 2>/dev/null || true

# Stop existing backend process
echo "Stopping existing backend..."
pm2 delete backend 2>/dev/null || true

# Start backend with PM2
echo "Starting backend..."
pm2 start /var/app/ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot (run once)
pm2 startup | tail -n 1 | sudo bash

echo "=== Backend deployed successfully! ==="
echo "Check status with: pm2 status"
echo "View logs with: pm2 logs backend"
