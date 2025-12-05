#!/bin/bash
# Complete EC2 Deployment Script - Run this in AWS CloudShell
# This will setup and deploy your application in one go

set -e
EC2_IP="3.77.235.145"
EC2_USER="ec2-user"

echo "=========================================="
echo "🚀 Roastify Complete Deployment"
echo "=========================================="
echo ""

# Step 1: Check connectivity
echo "📡 Step 1: Testing EC2 connectivity..."
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} "echo 'Connected'" 2>/dev/null; then
    echo "✅ EC2 is reachable"
else
    echo "❌ Cannot connect to EC2. Please check:"
    echo "   1. Instance is running"
    echo "   2. Security group allows SSH from CloudShell"
    echo "   3. SSH key is configured in CloudShell"
    exit 1
fi

# Step 2: Run complete setup on EC2
echo ""
echo "🔧 Step 2: Setting up EC2 instance..."
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} << 'ENDSSH'
set -e

echo "📦 Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - 2>&1 | tail -5
sudo yum install -y nodejs 2>&1 | tail -5

echo "✅ Node.js installed: $(node --version)"

echo "📦 Installing PM2..."
sudo npm install -g pm2 2>&1 | tail -3

echo "📂 Creating app directory..."
mkdir -p ~/roastify
cd ~/roastify

echo "📥 Cloning repository..."
if [ -d ".git" ]; then
    git pull origin kiro 2>&1 | tail -5
else
    git clone https://github.com/ahmedmhosni/freelance.git . 2>&1 | tail -5
    git checkout kiro 2>&1 | tail -3
fi

cd backend

echo "📝 Creating .env.production..."
cat > .env.production << 'EOF'
PORT=5000
NODE_ENV=production
PG_HOST=roastifydb.cvy4q2kao3fh.eu-central-1.rds.amazonaws.com
PG_PORT=5432
PG_DATABASE=roastifydb
PG_USER=postgres
PG_PASSWORD=AHmed#123456
PG_SSL=true
PG_POOL_MAX=20
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c03f0c03c87f0c03c87f0c03c87f0c03c87f0c03c87f0c03c87f0c03c87f0c03c87f0c03c87f0c03c87f0c03c87f0c03c8
JWT_EXPIRES_IN=7d
APP_NAME=Roastify
APP_URL=http://3.77.235.145:5000
FRONTEND_URL=http://3.77.235.145:3000
LOG_LEVEL=info
AWS_REGION=eu-central-1
EOF

echo "📦 Installing dependencies..."
npm install --production 2>&1 | tail -10

echo "🔄 Starting application with PM2..."
pm2 stop roastify-backend 2>/dev/null || true
pm2 delete roastify-backend 2>/dev/null || true
pm2 start src/server.js --name roastify-backend --time
pm2 save
pm2 startup | tail -1 | bash || true

echo ""
echo "✅ Deployment complete!"
echo ""
pm2 status
echo ""
echo "🏥 Testing health endpoint..."
sleep 3
curl -s http://localhost:5000/health || echo "Health check pending..."

ENDSSH

# Step 3: Test from outside
echo ""
echo "🏥 Step 3: Testing from outside..."
sleep 2
if curl -s -m 5 http://${EC2_IP}:5000/health | grep -q "ok"; then
    echo "✅ API is responding!"
    echo ""
    echo "=========================================="
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "=========================================="
    echo ""
    echo "Your API is live at:"
    echo "  http://${EC2_IP}:5000"
    echo ""
    echo "Test it:"
    echo "  curl http://${EC2_IP}:5000/health"
    echo ""
    echo "View logs:"
    echo "  ssh ${EC2_USER}@${EC2_IP} 'pm2 logs roastify-backend'"
    echo ""
else
    echo "⚠️  API deployed but health check failed"
    echo "Check logs: ssh ${EC2_USER}@${EC2_IP} 'pm2 logs roastify-backend'"
fi
