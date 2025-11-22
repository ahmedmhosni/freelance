# Google Cloud Platform - Quick Start Checklist

## ✅ Pre-Deployment Checklist

### 1. Google Cloud Account Setup
- [ ] Create Google Cloud account at https://cloud.google.com/
- [ ] Activate $300 free trial credit
- [ ] Create a new project in GCP Console
- [ ] Note your Project ID: `___________________`

### 2. Install Required Tools
- [ ] Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
- [ ] Verify installation: `gcloud --version`
- [ ] Login: `gcloud auth login`
- [ ] Set project: `gcloud config set project YOUR_PROJECT_ID`

### 3. Prepare Application
- [ ] Update `backend/.env.production` with secure JWT_SECRET
- [ ] Review `ecosystem.config.js` settings
- [ ] Test application locally before deploying

## 🚀 Deployment Steps (30 minutes)

### Step 1: Create VM Instance (5 min)
```bash
# Create e2-micro instance (FREE TIER)
gcloud compute instances create project-management-vm \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=30GB \
    --boot-disk-type=pd-standard \
    --tags=http-server

# Create firewall rule
gcloud compute firewall-rules create allow-http \
    --allow tcp:80,tcp:5000 \
    --target-tags http-server
```

**Get your VM IP:**
```bash
gcloud compute instances describe project-management-vm \
    --zone=us-central1-a \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Your VM IP:** `___________________`

### Step 2: Setup VM (10 min)
```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# Run setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2

# Create directories
sudo mkdir -p /var/app/{backend,frontend,data,uploads,logs,backups}
sudo chown -R $USER:$USER /var/app

# Exit SSH
exit
```

### Step 3: Upload Code (5 min)
```bash
# From your local machine
gcloud compute scp --recurse ./backend project-management-vm:/var/app/ --zone=us-central1-a
gcloud compute scp --recurse ./frontend project-management-vm:/var/app/ --zone=us-central1-a
gcloud compute scp --recurse ./deploy-scripts project-management-vm:/tmp/ --zone=us-central1-a
gcloud compute scp ecosystem.config.js project-management-vm:/var/app/ --zone=us-central1-a
```

### Step 4: Deploy Backend (5 min)
```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# Deploy backend
cd /var/app/backend
npm ci --production
node src/db/database.js
pm2 start /var/app/ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 5: Deploy Frontend (5 min)
```bash
# Still in VM
cd /var/app/frontend

# Create .env.production with your VM IP
echo "VITE_API_URL=http://YOUR_VM_IP" > .env.production

# Build and deploy
npm ci
npm run build
sudo cp -r dist/* /var/www/html/
```

### Step 6: Configure Nginx (2 min)
```bash
# Copy nginx config
sudo cp /tmp/deploy-scripts/nginx.conf /etc/nginx/sites-available/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 7: Verify (3 min)
```bash
# Check services
pm2 status
sudo systemctl status nginx

# Test backend
curl http://localhost:5000/api/health

# Exit SSH
exit
```

**Visit your app:** `http://YOUR_VM_IP`

## 📊 Post-Deployment

### Setup Automatic Backups
```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# Make backup script executable
chmod +x /tmp/deploy-scripts/backup-script.sh
cp /tmp/deploy-scripts/backup-script.sh /var/app/

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /var/app/backup-script.sh
```

### Monitor Your Application
```bash
# View logs
pm2 logs backend

# Monitor resources
pm2 monit

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
```

## 🔄 Update Application

```bash
# From local machine
gcloud compute scp --recurse ./backend project-management-vm:/var/app/ --zone=us-central1-a
gcloud compute scp --recurse ./frontend project-management-vm:/var/app/ --zone=us-central1-a

# SSH and update
gcloud compute ssh project-management-vm --zone=us-central1-a

cd /var/app/backend
npm ci --production
pm2 restart backend

cd /var/app/frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/
```

## 💰 Cost Tracking

**Free Tier Limits:**
- ✅ 1 e2-micro VM instance (always free)
- ✅ 30 GB standard persistent disk
- ✅ 1 GB network egress per month
- ✅ Unlimited ingress

**Expected Monthly Cost:** $0 (within free tier)

**Monitor usage:**
- GCP Console → Billing → Reports
- Set up billing alerts at $5, $10, $15

## 🛠️ Troubleshooting

### Backend won't start
```bash
pm2 logs backend --lines 50
# Check for errors in logs
```

### Can't access website
```bash
# Check firewall
gcloud compute firewall-rules list

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```

### Database errors
```bash
# Check permissions
ls -la /var/app/data/
# Reinitialize if needed
cd /var/app/backend
node src/db/database.js
```

## 📞 Quick Commands Reference

```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# View backend logs
pm2 logs backend

# Restart backend
pm2 restart backend

# Restart nginx
sudo systemctl restart nginx

# Check status
pm2 status
sudo systemctl status nginx

# Stop VM (to save costs during development)
gcloud compute instances stop project-management-vm --zone=us-central1-a

# Start VM
gcloud compute instances start project-management-vm --zone=us-central1-a

# Get VM IP
gcloud compute instances describe project-management-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

## 🎯 Success Criteria

- [ ] Can access frontend at `http://YOUR_VM_IP`
- [ ] Can login with default credentials
- [ ] Backend API responds at `http://YOUR_VM_IP/api/health`
- [ ] PM2 shows backend running: `pm2 status`
- [ ] Nginx is active: `sudo systemctl status nginx`
- [ ] Database file exists: `/var/app/data/database.sqlite`
- [ ] Automatic backups configured

## 🔐 Security Recommendations

1. **Change default admin password immediately**
2. **Update JWT_SECRET in `.env.production`**
3. **Setup SSL certificate (Let's Encrypt - Free)**
4. **Enable firewall rules for specific IPs if needed**
5. **Regular backups (automated with cron)**
6. **Monitor logs for suspicious activity**

## 📚 Additional Resources

- [GCP Free Tier](https://cloud.google.com/free)
- [GCP Documentation](https://cloud.google.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Need Help?**
- Check logs: `pm2 logs backend`
- Review nginx logs: `sudo tail -f /var/log/nginx/error.log`
- GCP Support: https://cloud.google.com/support
