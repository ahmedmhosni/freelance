# Deploy to Google Cloud - Step by Step

Follow these steps exactly. Total time: **30 minutes**

---

## PART 1: Setup Google Cloud (10 minutes)

### Step 1: Create Google Cloud Account
1. Go to https://cloud.google.com/
2. Click "Get started for free"
3. Sign in with your Google account
4. Enter payment info (you get $300 free credit, won't be charged)
5. Complete the signup

### Step 2: Create a Project
1. Go to https://console.cloud.google.com/
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `project-management`
5. Click "CREATE"
6. **Write down your Project ID**: `_______________________`

### Step 3: Install Google Cloud SDK on Your Computer

**For Windows:**
1. Download: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
2. Run the installer
3. Follow the installation wizard
4. When done, open a new PowerShell or Command Prompt

**Verify installation:**
```powershell
gcloud --version
```

You should see version information.

### Step 4: Login to Google Cloud
```powershell
gcloud auth login
```
- A browser window will open
- Login with your Google account
- Click "Allow"

### Step 5: Set Your Project
```powershell
gcloud config set project YOUR_PROJECT_ID
```
Replace `YOUR_PROJECT_ID` with the ID from Step 2.

---

## PART 2: Create the Virtual Machine (5 minutes)

### Step 6: Create Firewall Rule
```powershell
gcloud compute firewall-rules create allow-http-traffic --allow tcp:80,tcp:5000 --target-tags http-server --description="Allow HTTP traffic"
```

### Step 7: Create the VM
```powershell
gcloud compute instances create project-management-vm --zone=us-central1-a --machine-type=e2-micro --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud --boot-disk-size=30GB --boot-disk-type=pd-standard --tags=http-server
```

Wait 1-2 minutes for the VM to be created.

### Step 8: Get Your VM's IP Address
```powershell
gcloud compute instances describe project-management-vm --zone=us-central1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

**Write down this IP address**: `_______________________`

---

## PART 3: Setup the VM (5 minutes)

### Step 9: Connect to Your VM
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a
```

You're now inside your VM! The prompt will change to show `username@project-management-vm`.

### Step 10: Install Node.js
Copy and paste this entire block:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

You should see: `v18.x.x`

### Step 11: Install PM2 and Nginx
```bash
sudo npm install -g pm2
sudo apt-get install -y nginx
```

### Step 12: Create Directories
```bash
sudo mkdir -p /var/app/backend /var/app/frontend /var/app/data /var/app/uploads /var/app/logs /var/app/backups
sudo chown -R $USER:$USER /var/app
```

### Step 13: Exit the VM
```bash
exit
```

You're back on your local computer.

---

## PART 4: Upload Your Code (5 minutes)

### Step 14: Update Backend Environment File

On your local computer, edit `backend/.env.production`:

Replace `YOUR_VM_IP` with the IP address from Step 8:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-random-string-change-this-to-something-long-and-random
DATABASE_PATH=/var/app/data/database.sqlite
UPLOAD_DIR=/var/app/uploads
FRONTEND_URL=http://YOUR_VM_IP
```

**Important:** Change the `JWT_SECRET` to a random string!

### Step 15: Upload Backend Code
```powershell
gcloud compute scp --recurse backend project-management-vm:/var/app/ --zone=us-central1-a
```

This will take 2-3 minutes.

### Step 16: Upload Frontend Code
```powershell
gcloud compute scp --recurse frontend project-management-vm:/var/app/ --zone=us-central1-a
```

This will take 2-3 minutes.

### Step 17: Upload Deployment Scripts
```powershell
gcloud compute scp --recurse deploy-scripts project-management-vm:/tmp/ --zone=us-central1-a
```

### Step 18: Upload PM2 Config
```powershell
gcloud compute scp ecosystem.config.js project-management-vm:/var/app/ --zone=us-central1-a
```

---

## PART 5: Deploy Backend (3 minutes)

### Step 19: Connect to VM Again
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a
```

### Step 20: Install Backend Dependencies
```bash
cd /var/app/backend
npm ci --production
```

Wait for installation to complete (1-2 minutes).

### Step 21: Initialize Database
```bash
node src/db/database.js
```

You should see: "Database initialized successfully"

### Step 22: Start Backend with PM2
```bash
pm2 start /var/app/ecosystem.config.js --env production
pm2 save
```

### Step 23: Setup PM2 to Start on Boot
```bash
pm2 startup
```

Copy the command it shows and run it (it will start with `sudo`).

### Step 24: Verify Backend is Running
```bash
pm2 status
```

You should see `backend` with status `online`.

```bash
curl http://localhost:5000/api/health
```

You should see a response (not an error).

---

## PART 6: Deploy Frontend (2 minutes)

### Step 25: Create Frontend Environment File
```bash
cd /var/app/frontend
PUBLIC_IP=$(curl -s ifconfig.me)
echo "VITE_API_URL=http://$PUBLIC_IP" > .env.production
cat .env.production
```

Verify it shows your IP address.

### Step 26: Install Frontend Dependencies and Build
```bash
npm ci
npm run build
```

Wait for build to complete (1-2 minutes).

### Step 27: Copy Build to Nginx
```bash
sudo cp -r dist/* /var/www/html/
```

---

## PART 7: Configure Nginx (2 minutes)

### Step 28: Setup Nginx Configuration
```bash
sudo cp /tmp/deploy-scripts/nginx.conf /etc/nginx/sites-available/default
```

### Step 29: Test Nginx Configuration
```bash
sudo nginx -t
```

You should see: "syntax is ok" and "test is successful"

### Step 30: Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 31: Check Everything is Running
```bash
pm2 status
sudo systemctl status nginx
```

Both should show as running/active.

---

## PART 8: Test Your Application (1 minute)

### Step 32: Exit VM
```bash
exit
```

### Step 33: Open Your Application

Open your web browser and go to:
```
http://YOUR_VM_IP
```

Replace `YOUR_VM_IP` with the IP from Step 8.

### Step 34: Login

Default credentials:
- **Email:** `admin@example.com`
- **Password:** `admin123`

**🎉 SUCCESS!** Your application is now live on Google Cloud!

---

## Important: Change Admin Password

1. Login to your application
2. Go to Admin Panel
3. Change the admin password immediately

---

## Useful Commands for Later

### View Backend Logs
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a --command="pm2 logs backend"
```

### Restart Backend
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a --command="pm2 restart backend"
```

### Stop VM (to save costs when not using)
```powershell
gcloud compute instances stop project-management-vm --zone=us-central1-a
```

### Start VM Again
```powershell
gcloud compute instances start project-management-vm --zone=us-central1-a
```

### Get VM IP (if you forgot it)
```powershell
gcloud compute instances describe project-management-vm --zone=us-central1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

---

## Troubleshooting

### Can't connect to VM IP?
1. Check firewall rule exists:
   ```powershell
   gcloud compute firewall-rules list
   ```
2. Make sure VM is running:
   ```powershell
   gcloud compute instances list
   ```

### Backend not working?
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a
pm2 logs backend --lines 50
```

### Frontend shows blank page?
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a
sudo tail -f /var/log/nginx/error.log
```

---

## Cost

**Monthly Cost: $0**

Everything runs on Google Cloud's free tier:
- e2-micro VM (always free in us-central1)
- 30GB storage (always free)
- 1GB network egress per month (always free)

---

## Next Steps

1. **Setup Backups** - See `GCP_DEPLOYMENT_GUIDE.md` for automated backups
2. **Add SSL Certificate** - Get free HTTPS with Let's Encrypt
3. **Add Custom Domain** - Point your domain to the VM IP
4. **Monitor Usage** - Check GCP Console → Billing

---

**Need help?** Check the detailed guides:
- `GCP_DEPLOYMENT_GUIDE.md` - Complete guide
- `GCP_QUICK_START.md` - Quick reference
- `deploy-scripts/README.md` - Script documentation
