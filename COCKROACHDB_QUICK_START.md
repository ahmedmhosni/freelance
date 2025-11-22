# CockroachDB + Google Cloud - Quick Start

**Deploy in 40 minutes with 10GB free database**

---

## ✅ What You Need

- Google account
- Email for CockroachDB
- 40 minutes

---

## 🎯 Quick Overview

1. **Setup CockroachDB** (10 min) - Create free 10GB database
2. **Prepare code** (10 min) - Install PostgreSQL driver
3. **Deploy to GCP** (15 min) - Create VM and deploy
4. **Test** (5 min) - Verify everything works

---

## PART 1: CockroachDB Setup

### 1. Create Account
- Go to https://cockroachlabs.cloud/signup
- Sign up (no credit card needed)
- Verify email

### 2. Create Cluster
- Click "Create Cluster"
- Select "Serverless" (FREE)
- Cloud: **GCP**
- Region: **us-central1**
- Name: `project-management-db`
- Click "Create"

### 3. Create User
- Click "Connect"
- Click "Create SQL user"
- Username: `admin`
- Click "Generate & save password"
- **SAVE THE PASSWORD!**

### 4. Get Connection String
- Copy the connection string
- Looks like: `postgresql://admin:PASSWORD@...`
- **SAVE THIS!**

### 5. Download Certificate
- Click "Download CA Cert"
- Save as `root.crt`
- Keep it safe

---

## PART 2: Prepare Code

### 6. Install PostgreSQL Driver

```powershell
cd backend
npm install pg
```

### 7. Update Environment File

Edit `backend/.env.production`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=YOUR_COCKROACHDB_CONNECTION_STRING
DATABASE_CA_CERT=/var/app/certs/root.crt
JWT_SECRET=change-this-to-a-long-random-string
UPLOAD_DIR=/var/app/uploads
FRONTEND_URL=http://YOUR_VM_IP
```

Replace:
- `YOUR_COCKROACHDB_CONNECTION_STRING` with your connection string
- `YOUR_VM_IP` will be added after creating VM

---

## PART 3: Deploy to Google Cloud

### 8. Create VM

```powershell
# Login
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Create firewall
gcloud compute firewall-rules create allow-http-traffic --allow tcp:80,tcp:5000 --target-tags http-server

# Create VM
gcloud compute instances create project-management-vm --zone=us-central1-a --machine-type=e2-micro --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud --boot-disk-size=30GB --tags=http-server

# Get IP
gcloud compute instances describe project-management-vm --zone=us-central1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

**Your VM IP:** `_______________`

### 9. Setup VM

```powershell
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a
```

Inside VM:
```bash
# Install Node.js & Nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2

# Create directories
sudo mkdir -p /var/app/{backend,frontend,uploads,logs,certs}
sudo chown -R $USER:$USER /var/app

exit
```

### 10. Upload Everything

```powershell
# Upload code
gcloud compute scp --recurse backend project-management-vm:/var/app/ --zone=us-central1-a
gcloud compute scp --recurse frontend project-management-vm:/var/app/ --zone=us-central1-a

# Upload certificate
gcloud compute scp root.crt project-management-vm:/var/app/certs/ --zone=us-central1-a

# Upload scripts
gcloud compute scp --recurse deploy-scripts project-management-vm:/tmp/ --zone=us-central1-a
gcloud compute scp ecosystem.config.js project-management-vm:/var/app/ --zone=us-central1-a
```

### 11. Deploy Backend

```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a
```

Inside VM:
```bash
# Install & migrate
cd /var/app/backend
npm ci --production
node src/db/migrate-cockroach.js

# Start backend
pm2 start /var/app/ecosystem.config.js --env production
pm2 save
pm2 startup
```

Run the command PM2 shows (starts with `sudo`).

### 12. Deploy Frontend

```bash
# Build frontend
cd /var/app/frontend
PUBLIC_IP=$(curl -s ifconfig.me)
echo "VITE_API_URL=http://$PUBLIC_IP" > .env.production
npm ci
npm run build
sudo cp -r dist/* /var/www/html/

# Configure nginx
sudo cp /tmp/deploy-scripts/nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx

exit
```

---

## PART 4: Test

### 13. Open Your App

Go to: `http://YOUR_VM_IP`

### 14. Login

- Email: `admin@example.com`
- Password: `admin123`

### 15. Test Features

- Create a project ✓
- Create a task ✓
- Create a client ✓

---

## 🎉 Success!

You now have:
- ✅ App running on Google Cloud (free)
- ✅ 10GB CockroachDB database (free)
- ✅ Automatic backups
- ✅ Production-ready setup
- ✅ $0/month cost

---

## 📊 What You Have

| Component | Storage | Cost |
|-----------|---------|------|
| GCP VM | 30GB | $0 |
| CockroachDB | 10GB | $0 |
| **Total** | **40GB** | **$0/month** |

---

## 🔧 Quick Commands

### View Logs
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a --command="pm2 logs backend"
```

### Restart Backend
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a --command="pm2 restart backend"
```

### Check Database
- Go to https://cockroachlabs.cloud/
- Click your cluster
- Click "SQL Shell"
- Run: `SELECT * FROM users;`

---

## 🆘 Troubleshooting

### Can't connect to database?
```bash
# Check certificate
ls -la /var/app/certs/root.crt

# Test connection
cd /var/app/backend
node -e "const {pool} = require('./src/db/cockroachdb'); pool.query('SELECT 1').then(() => console.log('OK')).catch(console.error)"
```

### Backend won't start?
```bash
pm2 logs backend --lines 50
```

### Migration failed?
```bash
cd /var/app/backend
node src/db/migrate-cockroach.js
```

---

## ✅ Success Checklist

- [ ] CockroachDB cluster created
- [ ] Connection string saved
- [ ] GCP VM created
- [ ] Code uploaded
- [ ] Database migrated
- [ ] Backend running
- [ ] Frontend deployed
- [ ] Can access app
- [ ] Can login
- [ ] Features working

---

**For detailed guide, see:** `GCP_COCKROACHDB_DEPLOYMENT.md`

**Total time:** 40 minutes  
**Total cost:** $0/month forever  
**Total storage:** 40GB (30GB VM + 10GB database)
