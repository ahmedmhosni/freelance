# Google Cloud Platform Deployment Guide

## Overview
This guide will help you deploy your Project Management System to Google Cloud Platform using their free tier services.

## Google Cloud Free Tier Services

### What You'll Use (All Free Tier Eligible):

1. **Compute Engine** (e2-micro instance)
   - 1 shared vCPU
   - 1 GB RAM
   - 30 GB standard persistent disk
   - Available in: us-west1, us-central1, us-east1

2. **Cloud SQL** (Alternative: SQLite on VM)
   - For production, consider Cloud SQL MySQL/PostgreSQL
   - Free tier: Not available, but you can use SQLite on the VM

3. **Cloud Storage** (5 GB)
   - For file uploads and static assets

4. **Cloud Build** (120 build-minutes/day)
   - For CI/CD automation

## Prerequisites

### 1. Create Google Cloud Account
- Go to https://cloud.google.com/
- Sign up for free trial ($300 credit for 90 days)
- After trial, free tier continues indefinitely

### 2. Install Google Cloud SDK
```bash
# Windows (PowerShell)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# Or download from: https://cloud.google.com/sdk/docs/install
```

### 3. Initialize gcloud CLI
```bash
gcloud init
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

## Deployment Steps

### Step 1: Prepare Your Application

#### 1.1 Create Production Environment Files

Create `backend/.env.production`:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret-change-this
DATABASE_PATH=/var/app/data/database.sqlite
UPLOAD_DIR=/var/app/uploads
FRONTEND_URL=http://YOUR_VM_IP:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Create `frontend/.env.production`:
```env
VITE_API_URL=http://YOUR_VM_IP:5000
```

#### 1.2 Create Deployment Scripts

Create `deploy-scripts/setup-vm.sh`:
```bash
#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Create application directories
sudo mkdir -p /var/app/backend
sudo mkdir -p /var/app/frontend
sudo mkdir -p /var/app/data
sudo mkdir -p /var/app/uploads

# Set permissions
sudo chown -R $USER:$USER /var/app

echo "VM setup complete!"
```

Create `deploy-scripts/deploy-backend.sh`:
```bash
#!/bin/bash

# Navigate to backend directory
cd /var/app/backend

# Install dependencies
npm ci --production

# Run database migrations
node src/db/migrations/add-quotes-table.js

# Restart backend with PM2
pm2 delete backend 2>/dev/null || true
pm2 start src/server.js --name backend --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

Create `deploy-scripts/deploy-frontend.sh`:
```bash
#!/bin/bash

# Navigate to frontend directory
cd /var/app/frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Copy build to nginx directory
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

echo "Frontend deployed!"
```

#### 1.3 Create Nginx Configuration

Create `deploy-scripts/nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # File uploads
    client_max_body_size 50M;
}
```

#### 1.4 Create PM2 Ecosystem File

Create `ecosystem.config.js` in root:
```javascript
module.exports = {
  apps: [{
    name: 'backend',
    cwd: '/var/app/backend',
    script: 'src/server.js',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/app/logs/backend-error.log',
    out_file: '/var/app/logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### Step 2: Create VM Instance

#### 2.1 Create the VM
```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create e2-micro instance (free tier)
gcloud compute instances create project-management-vm \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=30GB \
    --boot-disk-type=pd-standard \
    --tags=http-server,https-server

# Create firewall rules
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --target-tags http-server \
    --description="Allow HTTP traffic"

gcloud compute firewall-rules create allow-backend \
    --allow tcp:5000 \
    --target-tags http-server \
    --description="Allow backend traffic"
```

#### 2.2 Get VM External IP
```bash
gcloud compute instances describe project-management-vm \
    --zone=us-central1-a \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

Save this IP address - you'll need it for your environment files.

### Step 3: Deploy Application

#### 3.1 Connect to VM
```bash
gcloud compute ssh project-management-vm --zone=us-central1-a
```

#### 3.2 Setup VM (First Time Only)
```bash
# Update and install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Install PM2
sudo npm install -g pm2

# Create directories
sudo mkdir -p /var/app/{backend,frontend,data,uploads,logs}
sudo chown -R $USER:$USER /var/app

# Exit SSH
exit
```

#### 3.3 Upload Your Code
```bash
# From your local machine

# Upload backend
gcloud compute scp --recurse ./backend/* project-management-vm:/var/app/backend/ --zone=us-central1-a

# Upload frontend
gcloud compute scp --recurse ./frontend/* project-management-vm:/var/app/frontend/ --zone=us-central1-a

# Upload deployment scripts
gcloud compute scp --recurse ./deploy-scripts/* project-management-vm:/tmp/deploy-scripts/ --zone=us-central1-a

# Upload ecosystem config
gcloud compute scp ecosystem.config.js project-management-vm:/var/app/ --zone=us-central1-a
```

#### 3.4 Deploy Backend
```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# Deploy backend
cd /var/app/backend
npm ci --production

# Initialize database
node src/db/database.js

# Start with PM2
pm2 start /var/app/ecosystem.config.js --env production
pm2 save
pm2 startup

# Enable PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

#### 3.5 Deploy Frontend
```bash
# Still in VM
cd /var/app/frontend

# Update .env with VM IP
echo "VITE_API_URL=http://$(curl -s ifconfig.me)" > .env.production

# Install and build
npm ci
npm run build

# Copy to nginx
sudo cp -r dist/* /var/www/html/
```

#### 3.6 Configure Nginx
```bash
# Copy nginx config
sudo cp /tmp/deploy-scripts/nginx.conf /etc/nginx/sites-available/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 4: Verify Deployment

```bash
# Check backend status
pm2 status
pm2 logs backend

# Check nginx status
sudo systemctl status nginx

# Test backend API
curl http://localhost:5000/api/health

# Get your public IP
curl ifconfig.me
```

Visit `http://YOUR_VM_IP` in your browser!

## Post-Deployment

### Set Up Automatic Backups

Create `backup-script.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/app/data/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/app/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
crontab -e
# Add this line for daily backups at 2 AM
0 2 * * * /var/app/backup-script.sh
```

### Monitor Your Application

```bash
# View logs
pm2 logs backend

# Monitor resources
pm2 monit

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update Application

Create `update-app.sh`:
```bash
#!/bin/bash

echo "Updating application..."

# Pull latest code (if using git)
cd /var/app/backend
git pull origin main

cd /var/app/frontend
git pull origin main

# Update backend
cd /var/app/backend
npm ci --production
pm2 restart backend

# Update frontend
cd /var/app/frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/

echo "Update complete!"
```

## Optional: Add Domain Name

### Using Google Cloud DNS (Free)

1. Register a domain (e.g., Namecheap, Google Domains)
2. Create Cloud DNS zone:
```bash
gcloud dns managed-zones create my-zone \
    --dns-name="yourdomain.com." \
    --description="My domain zone"
```

3. Add A record:
```bash
gcloud dns record-sets transaction start --zone=my-zone
gcloud dns record-sets transaction add YOUR_VM_IP \
    --name="yourdomain.com." \
    --ttl=300 \
    --type=A \
    --zone=my-zone
gcloud dns record-sets transaction execute --zone=my-zone
```

4. Update nameservers at your domain registrar

## Optional: Add SSL Certificate (Free with Let's Encrypt)

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

## Cost Optimization Tips

1. **Use e2-micro instance** - Always free in eligible regions
2. **Stop VM when not in use** (development):
   ```bash
   gcloud compute instances stop project-management-vm --zone=us-central1-a
   gcloud compute instances start project-management-vm --zone=us-central1-a
   ```
3. **Use SQLite** instead of Cloud SQL (included in free tier)
4. **Monitor usage** in GCP Console
5. **Set up billing alerts** to avoid surprises

## Troubleshooting

### Backend won't start
```bash
pm2 logs backend --lines 100
# Check for port conflicts
sudo netstat -tulpn | grep 5000
```

### Frontend shows blank page
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build files
ls -la /var/www/html/
```

### Database errors
```bash
# Check database file permissions
ls -la /var/app/data/database.sqlite

# Reinitialize if needed
cd /var/app/backend
node src/db/database.js
```

### Can't connect to VM
```bash
# Check firewall rules
gcloud compute firewall-rules list

# Check VM status
gcloud compute instances list
```

## Quick Reference Commands

```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# View logs
pm2 logs backend

# Restart services
pm2 restart backend
sudo systemctl restart nginx

# Check status
pm2 status
sudo systemctl status nginx

# Update code
cd /var/app/backend && git pull && npm ci --production && pm2 restart backend
cd /var/app/frontend && git pull && npm ci && npm run build && sudo cp -r dist/* /var/www/html/
```

## Support Resources

- GCP Free Tier: https://cloud.google.com/free
- GCP Documentation: https://cloud.google.com/docs
- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/en/docs/

---

**Estimated Monthly Cost**: $0 (within free tier limits)
**Setup Time**: 30-60 minutes
**Maintenance**: Minimal (automated with PM2 and cron)
