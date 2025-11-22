#!/bin/bash

echo "=== System Health Check ==="
echo ""

# Check Node.js
echo "Node.js Version:"
node --version
echo ""

# Check PM2
echo "PM2 Status:"
pm2 status
echo ""

# Check Nginx
echo "Nginx Status:"
sudo systemctl status nginx --no-pager | head -n 5
echo ""

# Check Backend API
echo "Backend API Health:"
curl -s http://localhost:5000/api/health || echo "Backend not responding"
echo ""

# Check Disk Space
echo "Disk Usage:"
df -h / | tail -n 1
echo ""

# Check Memory
echo "Memory Usage:"
free -h | grep Mem
echo ""

# Check Database
echo "Database:"
if [ -f /var/app/data/database.sqlite ]; then
    echo "✓ Database exists"
    ls -lh /var/app/data/database.sqlite
else
    echo "✗ Database not found"
fi
echo ""

# Check Uploads Directory
echo "Uploads Directory:"
if [ -d /var/app/uploads ]; then
    echo "✓ Uploads directory exists"
    du -sh /var/app/uploads
else
    echo "✗ Uploads directory not found"
fi
echo ""

# Check Logs
echo "Recent Backend Logs (last 10 lines):"
pm2 logs backend --lines 10 --nostream
echo ""

# Check Nginx Logs
echo "Recent Nginx Errors (last 5 lines):"
sudo tail -n 5 /var/log/nginx/error.log
echo ""

echo "=== Health Check Complete ==="
