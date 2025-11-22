# Google Cloud VM + CockroachDB Deployment Guide

**Complete free production deployment with 10GB managed database**

⏱️ **Time:** 40 minutes  
💰 **Cost:** $0/month forever  
🎯 **What you get:** VM + 10GB PostgreSQL database  

---

## ✨ What You're Building

- ✅ Frontend + Backend on Google Cloud VM (free)
- ✅ CockroachDB Serverless PostgreSQL (10GB free)
- ✅ Automatic backups
- ✅ Production-ready setup
- ✅ Always running
- ✅ Free forever

---

## PART 1: Setup CockroachDB (10 minutes)

### Step 1: Create CockroachDB Account

1. Go to https://cockroachlabs.cloud/signup
2. Sign up with email or GitHub
3. Verify your email
4. No credit card required!

### Step 2: Create Serverless Cluster

1. Click "Create Cluster"
2. Select "Serverless"
3. Choose a cloud provider: **GCP** (to match your VM)
4. Select region: **us-central1** (same as your VM for low latency)
5. Cluster name: `project-management-db`
6. Click "Create cluster"

Wait 1-2 minutes for cluster creation.

### Step 3: Create Database User

1. Click "Connect" button
2. Select "Create SQL user"
3. Username: `admin`
4. Click "Generate & save password"
5. **IMPORTANT:** Copy and save the password somewhere safe!

### Step 4: Get Connection String

1. Still in the Connect dialog
2. Select "Connection string"
3. Copy the connection string (looks like):
```
postgresql://admin:PASSWORD@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full
```

4. **Save this connection string!** You'll need it later.

### Step 5: Download CA Certificate

1. In the Connect dialog, click "Download CA Cert"
2. Save the file as `root.crt`
3. Keep it safe, you'll upload it to your VM

---

## PART 2: Prepare Your Code (10 minutes)

### Step 6: Install PostgreSQL Driver

On your local machine:

```powershell
cd backend
npm install pg
```

### Step 7: Create Database Configuration

Create `backend/src/db/cockroachdb.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DATABASE_CA_CERT
  }
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to CockroachDB');
});

pool.on('error', (err) => {
  console.error('CockroachDB connection error:', err);
});

module.exports = { pool };
```

### Step 8: Update Environment File

Update `backend/.env.production`:

```env
NODE_ENV=production
PORT=5000

# CockroachDB Connection
DATABASE_URL=postgresql://admin:YOUR_PASSWORD@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full
DATABASE_CA_CERT=/var/app/certs/root.crt

# Security
JWT_SECRET=your-super-secure-random-string-at-least-32-characters-long

# Paths
UPLOAD_DIR=/var/app/uploads

# Frontend URL (will update after VM creation)
FRONTEND_URL=http://YOUR_VM_IP
```

**Replace:**
- `YOUR_PASSWORD` with your CockroachDB password
- `YOUR_VM_IP` will be added later

### Step 9: Create Database Schema Migration

Create `backend/src/db/migrate-cockroach.js`:

```javascript
const { pool } = require('./cockroachdb');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('Starting CockroachDB migration...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✓ Schema created successfully');
    
    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (email, password, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@example.com', hashedPassword, 'Admin User', 'admin', 1]);
    
    console.log('✓ Default admin user created');
    console.log('✓ Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
```

### Step 10: Update Database Imports

Update files that use database to use CockroachDB:

In `backend/src/routes/*.js`, replace:
```javascript
const { db } = require('../db/database');
```

With:
```javascript
const { pool } = require('../db/cockroachdb');
```

And update queries from SQLite syntax to PostgreSQL:
- `db.get()` → `pool.query()` (returns rows[0])
- `db.all()` → `pool.query()` (returns rows)
- `db.run()` → `pool.query()`
- `?` placeholders → `$1, $2, $3` placeholders

---

## PART 3: Deploy to Google Cloud (15 minutes)

### Step 11: Create Google Cloud VM

Follow steps 1-8 from `DEPLOY_STEPS.md`:

```powershell
# Login to Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Create firewall rule
gcloud compute firewall-rules create allow-http-traffic --allow tcp:80,tcp:5000 --target-tags http-server

# Create VM
gcloud compute instances create project-management-vm --zone=us-central1-a --machine-type=e2-micro --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud --boot-disk-size=30GB --boot-disk-type=pd-standard --tags=http-server

# Get VM IP
gcloud compute instances describe project-management-vm --zone=us-central1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

**Save your VM IP:** `_______________________`

### Step 12: Setup VM

```powershell
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a
```

Inside VM:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Install PM2
sudo npm install -g pm2

# Create directories
sudo mkdir -p /var/app/{backend,frontend,data,uploads,logs,certs}
sudo chown -R $USER:$USER /var/app

# Exit
exit
```

### Step 13: Upload Code and Certificate

```powershell
# Upload backend
gcloud compute scp --recurse backend project-management-vm:/var/app/ --zone=us-central1-a

# Upload frontend
gcloud compute scp --recurse frontend project-management-vm:/var/app/ --zone=us-central1-a

# Upload CockroachDB certificate
gcloud compute scp root.crt project-management-vm:/var/app/certs/ --zone=us-central1-a

# Upload deployment scripts
gcloud compute scp --recurse deploy-scripts project-management-vm:/tmp/ --zone=us-central1-a

# Upload ecosystem config
gcloud compute scp ecosystem.config.js project-management-vm:/var/app/ --zone=us-central1-a
```

### Step 14: Deploy Backend

```powershell
# SSH into VM
gcloud compute ssh project-management-vm --zone=us-central1-a
```

Inside VM:
```bash
# Install backend dependencies
cd /var/app/backend
npm ci --production

# Run database migration
node src/db/migrate-cockroach.js

# Start backend with PM2
pm2 start /var/app/ecosystem.config.js --env production
pm2 save
pm2 startup
```

Copy and run the command PM2 shows (starts with `sudo`).

### Step 15: Deploy Frontend

```bash
# Get VM IP
PUBLIC_IP=$(curl -s ifconfig.me)

# Build frontend
cd /var/app/frontend
echo "VITE_API_URL=http://$PUBLIC_IP" > .env.production
npm ci
npm run build

# Deploy to nginx
sudo cp -r dist/* /var/www/html/
```

### Step 16: Configure Nginx

```bash
# Copy nginx config
sudo cp /tmp/deploy-scripts/nginx.conf /etc/nginx/sites-available/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 17: Verify Deployment

```bash
# Check backend
pm2 status
pm2 logs backend --lines 20

# Check nginx
sudo systemctl status nginx

# Test API
curl http://localhost:5000/health

# Exit VM
exit
```

---

## PART 4: Test Your Application (5 minutes)

### Step 18: Access Your App

Open browser and go to:
```
http://YOUR_VM_IP
```

### Step 19: Login

Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

### Step 20: Test Features

- ✅ Create a project
- ✅ Create a task
- ✅ Create a client
- ✅ Upload a file
- ✅ Check dashboard

**🎉 Everything should work!**

---

## 📊 What You Have Now

| Component | Service | Storage | Cost |
|-----------|---------|---------|------|
| **Frontend** | GCP VM | 30GB | $0 |
| **Backend** | GCP VM | 30GB | $0 |
| **Database** | CockroachDB | 10GB | $0 |
| **Backups** | CockroachDB | Auto | $0 |
| **Total** | | **70GB** | **$0/month** |

---

## 🔧 Management Commands

### View Backend Logs
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a --command="pm2 logs backend"
```

### Restart Backend
```powershell
gcloud compute ssh project-management-vm --zone=us-central1-a --command="pm2 restart backend"
```

### Check Database
1. Go to https://cockroachlabs.cloud/
2. Click your cluster
3. Click "SQL Shell"
4. Run queries:
```sql
SELECT * FROM users;
SELECT COUNT(*) FROM projects;
```

### View Database Metrics
1. Go to CockroachDB dashboard
2. Click "Metrics"
3. View:
   - Storage usage
   - Request units
   - Query performance

---

## 🔄 Update Application

```powershell
# Upload new code
gcloud compute scp --recurse backend project-management-vm:/var/app/ --zone=us-central1-a
gcloud compute scp --recurse frontend project-management-vm:/var/app/ --zone=us-central1-a

# SSH and update
gcloud compute ssh project-management-vm --zone=us-central1-a

# Update backend
cd /var/app/backend
npm ci --production
pm2 restart backend

# Update frontend
cd /var/app/frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/
```

---

## 📈 Monitor Usage

### CockroachDB Free Tier Limits
- ✅ **10GB storage**
- ✅ **50M Request Units/month**
- ✅ **Unlimited databases**

### Check Usage
1. Go to https://cockroachlabs.cloud/
2. Click "Usage"
3. View current month's usage

### GCP Free Tier
- ✅ **1 e2-micro VM** (always free)
- ✅ **30GB storage** (always free)
- ✅ **1GB egress/month** (always free)

---

## 🛠️ Troubleshooting

### Database Connection Error

```bash
# Check certificate exists
ls -la /var/app/certs/root.crt

# Test connection
cd /var/app/backend
node -e "const {pool} = require('./src/db/cockroachdb'); pool.query('SELECT 1').then(() => console.log('Connected!')).catch(console.error)"
```

### Backend Won't Start

```bash
pm2 logs backend --lines 50
# Check for DATABASE_URL errors
```

### Migration Failed

```bash
cd /var/app/backend
node src/db/migrate-cockroach.js
# Check error messages
```

---

## 🔐 Security Checklist

- [ ] Change admin password immediately
- [ ] Update JWT_SECRET in .env.production
- [ ] Keep CockroachDB password secure
- [ ] Don't commit .env files to Git
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Enable firewall rules
- [ ] Regular backups (automatic with CockroachDB)

---

## 🎯 Success Checklist

- [ ] CockroachDB cluster created
- [ ] Database user created
- [ ] Connection string saved
- [ ] GCP VM created and running
- [ ] Backend deployed and running
- [ ] Frontend built and deployed
- [ ] Can access app via VM IP
- [ ] Can login with admin credentials
- [ ] Database queries working
- [ ] All features functional

---

## 💡 Pro Tips

1. **Use CockroachDB Console** for database management
2. **Monitor Request Units** to stay within free tier
3. **Use connection pooling** for better performance
4. **Enable query logging** for debugging
5. **Setup alerts** in CockroachDB dashboard

---

## 📚 Resources

- **CockroachDB Docs:** https://www.cockroachlabs.com/docs/
- **CockroachDB Console:** https://cockroachlabs.cloud/
- **GCP Console:** https://console.cloud.google.com/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Congratulations! You have a production-ready app with 10GB managed database, all for FREE! 🚀**

**Total Cost:** $0/month forever  
**Total Storage:** 70GB (30GB VM + 10GB database + 30GB disk)  
**Uptime:** 99.5%+ (GCP) + 99.99% (CockroachDB)
