# Deployment Scripts

This folder contains all scripts needed to deploy your application to Google Cloud Platform.

## Scripts Overview

### 🔧 Setup Scripts

**`setup-vm.sh`** - Initial VM setup
- Installs Node.js, PM2, Nginx
- Creates application directories
- Sets up permissions
- Run once when creating a new VM

### 🚀 Deployment Scripts

**`deploy-backend.sh`** - Deploy backend application
- Installs dependencies
- Initializes database
- Starts backend with PM2
- Configures auto-restart

**`deploy-frontend.sh`** - Deploy frontend application
- Builds React application
- Copies to Nginx directory
- Configures environment variables

**`quick-deploy.sh`** - One-command deployment (from local machine)
- Uploads all code to VM
- Runs deployment scripts
- Shows deployment status

### 🔄 Maintenance Scripts

**`update-app.sh`** - Update running application
- Creates backup before update
- Updates backend and frontend
- Restarts services
- Verifies deployment

**`backup-script.sh`** - Backup database and uploads
- Creates timestamped backups
- Compresses upload directory
- Cleans old backups (keeps 7 days)
- Can be run manually or via cron

**`health-check.sh`** - System health monitoring
- Checks all services status
- Verifies database and files
- Shows resource usage
- Displays recent logs

### ⚙️ Configuration Files

**`nginx.conf`** - Nginx web server configuration
- Serves frontend static files
- Proxies API requests to backend
- Handles file uploads
- Security headers

## Usage

### First Time Deployment

1. **On your local machine:**
```bash
# Create VM
gcloud compute instances create project-management-vm \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=30GB \
    --tags=http-server
```

2. **SSH into VM:**
```bash
gcloud compute ssh project-management-vm --zone=us-central1-a
```

3. **Run setup script:**
```bash
# Copy and paste setup commands from setup-vm.sh
# Or upload and run the script
```

4. **Upload your code from local machine:**
```bash
gcloud compute scp --recurse ./backend project-management-vm:/var/app/
gcloud compute scp --recurse ./frontend project-management-vm:/var/app/
gcloud compute scp --recurse ./deploy-scripts project-management-vm:/tmp/
```

5. **Deploy backend:**
```bash
cd /var/app/backend
bash /tmp/deploy-scripts/deploy-backend.sh
```

6. **Deploy frontend:**
```bash
bash /tmp/deploy-scripts/deploy-frontend.sh
```

7. **Configure Nginx:**
```bash
sudo cp /tmp/deploy-scripts/nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx
```

### Updating Application

```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# Run update script
bash /var/app/update-app.sh
```

### Manual Backup

```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# Run backup
bash /var/app/backup-script.sh
```

### Health Check

```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# Run health check
bash /var/app/health-check.sh
```

## Automated Backups

Setup daily backups at 2 AM:

```bash
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a

# Copy backup script
cp /tmp/deploy-scripts/backup-script.sh /var/app/
chmod +x /var/app/backup-script.sh

# Add to crontab
crontab -e
# Add this line:
0 2 * * * /var/app/backup-script.sh
```

## File Locations on VM

```
/var/app/
├── backend/          # Backend application
├── frontend/         # Frontend source
├── data/            # SQLite database
├── uploads/         # User uploaded files
├── logs/            # Application logs
├── backups/         # Automated backups
├── ecosystem.config.js  # PM2 configuration
├── backup-script.sh     # Backup script
└── update-app.sh        # Update script

/var/www/html/       # Frontend build (served by Nginx)
/etc/nginx/          # Nginx configuration
/tmp/deploy-scripts/ # Deployment scripts (temporary)
```

## Troubleshooting

### Script Permission Denied
```bash
chmod +x /path/to/script.sh
```

### Backend Won't Start
```bash
pm2 logs backend --lines 50
# Check for errors
```

### Nginx Configuration Error
```bash
sudo nginx -t
# Shows configuration errors
```

### Database Not Found
```bash
cd /var/app/backend
node src/db/database.js
# Reinitialize database
```

## Notes

- All scripts assume Ubuntu 22.04 LTS
- Scripts are idempotent (safe to run multiple times)
- Backup script keeps last 7 days of backups
- PM2 automatically restarts backend on crashes
- Nginx serves frontend and proxies API requests

## Quick Reference

```bash
# View backend logs
pm2 logs backend

# Restart backend
pm2 restart backend

# Check PM2 status
pm2 status

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h
```

---

For detailed deployment instructions, see `GCP_QUICK_START.md` in the project root.
