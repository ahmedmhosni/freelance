#!/bin/bash
# User data script for backend EC2 instance initialization

set -e

# Update system
yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Git
yum install -y git

# Install PM2 globally for process management
npm install -g pm2

# Install PostgreSQL client for database operations
amazon-linux-extras install postgresql14 -y

# Create application directory
mkdir -p /opt/${app_name}
cd /opt/${app_name}

# Create environment file
cat > /opt/${app_name}/.env << EOF
# Server Configuration
PORT=5000
NODE_ENV=${environment}

# Database Configuration (New architecture)
PG_HOST=${db_host}
PG_PORT=${db_port}
PG_DATABASE=${db_name}
PG_USER=${db_user}
PG_PASSWORD=${db_password}
PG_SSL=true
PG_POOL_MAX=20

# JWT Configuration
JWT_SECRET=\${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://app.${app_name}.online

# Application Configuration
APP_NAME=${app_name}
APP_URL=https://api.${app_name}.online
SUPPORT_EMAIL=support@${app_name}.online

# Logging
LOG_LEVEL=info

# Email Configuration
EMAIL_FROM=noreply@${app_name}.online
AZURE_COMMUNICATION_CONNECTION_STRING=\${AZURE_COMMUNICATION_CONNECTION_STRING}

# Token Expiration
EMAIL_VERIFICATION_EXPIRY=24h
PASSWORD_RESET_EXPIRY=1h
EOF

# Set proper permissions
chmod 600 /opt/${app_name}/.env

# Install CloudWatch agent for logs
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json << EOF
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/${app_name}/logs/combined.log",
            "log_group_name": "/aws/ec2/${app_name}",
            "log_stream_name": "{instance_id}/combined"
          },
          {
            "file_path": "/opt/${app_name}/logs/error.log",
            "log_group_name": "/aws/ec2/${app_name}",
            "log_stream_name": "{instance_id}/error"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

# Create deployment script
cat > /opt/${app_name}/deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

cd /opt/${app_name}

# Pull latest code (will be set up during first deployment)
if [ -d "backend" ]; then
  cd backend
  git pull
else
  echo "Application not yet deployed. Run initial deployment first."
  exit 1
fi

# Install dependencies
npm install --production

# Run database migrations
npm run migrate

# Restart application with PM2
pm2 restart ${app_name}-backend || pm2 start src/server.js --name ${app_name}-backend

# Save PM2 configuration
pm2 save

echo "Deployment completed successfully!"
DEPLOY_SCRIPT

chmod +x /opt/${app_name}/deploy.sh

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

# Create health check endpoint test script
cat > /opt/${app_name}/health-check.sh << 'HEALTH_SCRIPT'
#!/bin/bash
curl -f http://localhost:5000/health || exit 1
HEALTH_SCRIPT

chmod +x /opt/${app_name}/health-check.sh

# Log completion
echo "Backend EC2 instance initialization completed" > /var/log/user-data.log
