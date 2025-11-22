# Azure Deployment - Cheapest Configuration

**Everything on Azure with the absolute cheapest options**

⏱️ **Time:** 45 minutes  
💰 **Cost:** $0 (12 months) → $27/month after  
🎯 **All services on Azure**  

---

## 💰 Cost Breakdown

### Free for 12 Months
| Service | Specs | Free (12mo) | After 12mo |
|---------|-------|-------------|------------|
| **VM** | B1s (1 vCPU, 1GB RAM) | ✅ Free | $10/month |
| **Database** | PostgreSQL B1ms | ✅ Free | $12/month |
| **Storage** | 64GB SSD | ✅ Free | $5/month |
| **Bandwidth** | 15GB/month | ✅ Free | Included |
| **TOTAL** | | **$0/month** | **$27/month** |

**This is the CHEAPEST Azure setup possible!**

---

## 📋 Prerequisites

1. Azure account (sign up at https://azure.microsoft.com/free/)
2. Credit card (required, won't be charged for 12 months)
3. $200 free credit (30 days) + 12 months free services
4. Your project code

---

## PART 1: Create Azure Account (5 minutes)

### Step 1: Sign Up
1. Go to https://azure.microsoft.com/free/
2. Click "Start free"
3. Sign in with Microsoft account (or create one)
4. Enter credit card (verification only)
5. Complete phone verification

### Step 2: Access Azure Portal
1. Go to https://portal.azure.com/
2. You should see the dashboard

---

## PART 2: Create PostgreSQL Database (10 minutes)

### Step 3: Create Database Server

1. In Azure Portal, click "Create a resource"
2. Search for "Azure Database for PostgreSQL"
3. Click "Create" → Select "Flexible server"

**Configuration:**
- **Subscription:** Free Trial
- **Resource Group:** Create new → `project-management-rg`
- **Server name:** `projectmanagement-db` (must be unique)
- **Region:** East US (cheapest)
- **PostgreSQL version:** 14
- **Workload type:** Development
- **Compute + storage:** Click "Configure server"
  - Tier: **Burstable**
  - Compute: **B1ms** (1 vCore, 2GB RAM)
  - Storage: **32 GB**
  - Backup retention: 7 days
  - Click "Save"

**Authentication:**
- **Admin username:** `adminuser`
- **Password:** Create strong password (save it!)
- Confirm password

**Networking:**
- **Connectivity method:** Public access
- **Firewall rules:** 
  - ✅ Allow public access from any Azure service
  - ✅ Add current client IP address
  - Add rule: Name=`AllowAll`, Start=`0.0.0.0`, End=`255.255.255.255`

Click "Review + create" → "Create"

**Wait 5-10 minutes for deployment**

### Step 4: Get Database Connection String

1. Go to your database resource
2. Click "Connection strings" in left menu
3. Copy the connection string (looks like):
```
postgresql://adminuser@projectmanagement-db:PASSWORD@projectmanagement-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

4. **Save this!** Replace `PASSWORD` with your actual password

---

## PART 3: Create Virtual Machine (10 minutes)

### Step 5: Create VM

1. Click "Create a resource"
2. Search for "Virtual Machine"
3. Click "Create"

**Basics:**
- **Resource group:** `project-management-rg` (same as database)
- **VM name:** `project-management-vm`
- **Region:** East US (same as database)
- **Image:** Ubuntu Server 22.04 LTS
- **Size:** Click "See all sizes"
  - Filter: B-series
  - Select: **B1s** (1 vCPU, 1GB RAM) - FREE for 12 months
- **Authentication:**
  - Type: Password
  - Username: `azureuser`
  - Password: Create strong password (save it!)

**Disks:**
- **OS disk type:** Standard SSD (64GB) - FREE for 12 months

**Networking:**
- **Public IP:** Create new
- **NIC network security group:** Basic
- **Public inbound ports:** 
  - ✅ HTTP (80)
  - ✅ HTTPS (443)
  - ✅ SSH (22)

**Management:**
- **Auto-shutdown:** Enable (optional, saves costs)
- **Time:** 7:00 PM (your timezone)

Click "Review + create" → "Create"

**Wait 2-3 minutes for deployment**

### Step 6: Get VM IP Address

1. Go to your VM resource
2. Find "Public IP address" on overview page
3. **Save this IP:** `_______________`

---

## PART 4: Setup VM (10 minutes)

### Step 7: Connect to VM

**Windows (PowerShell):**
```powershell
ssh azureuser@YOUR_VM_IP
```

Enter your VM password when prompted.

### Step 8: Install Node.js and Dependencies

Inside VM, run these commands:

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Create directories
sudo mkdir -p /var/app/{backend,frontend,uploads,logs}
sudo chown -R $USER:$USER /var/app

echo "✓ VM setup complete!"
```

### Step 9: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

Type `y` and press Enter.

---

## PART 5: Deploy Application (10 minutes)

### Step 10: Update Environment File (Local Machine)

On your local machine, update `backend/.env.production`:

```env
NODE_ENV=production
PORT=5000

# Azure PostgreSQL Database
DATABASE_URL=postgresql://adminuser@projectmanagement-db:YOUR_PASSWORD@projectmanagement-db.postgres.database.azure.com:5432/postgres?sslmode=require

# Security
JWT_SECRET=your-super-secure-random-string-change-this-32-chars-minimum

# File Uploads
UPLOAD_DIR=/var/app/uploads
MAX_FILE_SIZE=52428800

# Frontend URL (use your VM IP)
FRONTEND_URL=http://YOUR_VM_IP
```

Replace:
- `YOUR_PASSWORD` with your database password
- `YOUR_VM_IP` with your VM's public IP

### Step 11: Upload Code to VM

On your local machine (PowerShell):

```powershell
# Navigate to project directory
cd C:\Users\ahmed\OneDrive\freelancemanagment

# Upload backend
scp -r backend azureuser@YOUR_VM_IP:/var/app/

# Upload frontend
scp -r frontend azureuser@YOUR_VM_IP:/var/app/

# Upload ecosystem config
scp ecosystem.config.js azureuser@YOUR_VM_IP:/var/app/
```

Enter your VM password for each upload.

### Step 12: Deploy Backend

SSH back into VM:
```powershell
ssh azureuser@YOUR_VM_IP
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

### Step 13: Deploy Frontend

```bash
# Build frontend
cd /var/app/frontend
PUBLIC_IP=$(curl -s ifconfig.me)
echo "VITE_API_URL=http://$PUBLIC_IP" > .env.production
npm ci
npm run build

# Deploy to nginx
sudo cp -r dist/* /var/www/html/
```

### Step 14: Configure Nginx

Create nginx config:
```bash
sudo nano /etc/nginx/sites-available/default
```

Replace content with:
```nginx
server {
    listen 80 default_server;
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
    }

    client_max_body_size 50M;
}
```

Save: `Ctrl+X`, `Y`, `Enter`

Restart nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## PART 6: Test Application (5 minutes)

### Step 15: Access Your App

Open browser and go to:
```
http://YOUR_VM_IP
```

### Step 16: Login

Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

### Step 17: Test Features

- ✅ Create a project
- ✅ Create a task
- ✅ Create a client
- ✅ Upload a file

**🎉 Success! Your app is live on Azure!**

---

## 📊 What You Have

| Component | Service | Specs | Cost (12mo) | Cost (After) |
|-----------|---------|-------|-------------|--------------|
| **VM** | B1s | 1 vCPU, 1GB RAM | $0 | $10/mo |
| **Database** | PostgreSQL B1ms | 1 vCore, 2GB RAM, 32GB | $0 | $12/mo |
| **Storage** | Standard SSD | 64GB | $0 | $5/mo |
| **Bandwidth** | Outbound | 15GB/mo | $0 | Included |
| **TOTAL** | | | **$0/month** | **$27/month** |

---

## 🔧 Management Commands

### View Logs
```bash
ssh azureuser@YOUR_VM_IP
pm2 logs backend
```

### Restart Backend
```bash
ssh azureuser@YOUR_VM_IP
pm2 restart backend
```

### Check Database
1. Go to Azure Portal
2. Navigate to your PostgreSQL server
3. Click "Query editor"
4. Login with admin credentials
5. Run queries:
```sql
SELECT * FROM users;
SELECT COUNT(*) FROM projects;
```

### Monitor Costs
1. Go to Azure Portal
2. Click "Cost Management + Billing"
3. View current month's usage
4. Set up budget alerts

---

## 🔄 Update Application

```powershell
# Upload new code
scp -r backend azureuser@YOUR_VM_IP:/var/app/
scp -r frontend azureuser@YOUR_VM_IP:/var/app/

# SSH and update
ssh azureuser@YOUR_VM_IP

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

## 💡 Cost Optimization Tips

### During Free Period (12 months)
- ✅ Everything is free
- ✅ Monitor usage to stay within limits
- ✅ Set up billing alerts

### After 12 Months ($27/month)
**To reduce costs:**

1. **Stop VM when not in use** (saves $10/month)
   ```bash
   az vm deallocate --resource-group project-management-rg --name project-management-vm
   ```

2. **Use smaller database** (save $5/month)
   - Downgrade to B1s if possible

3. **Optimize storage** (save $2/month)
   - Delete old backups
   - Compress files

**Potential savings: Down to $15/month**

---

## 🆘 Troubleshooting

### Can't connect to database?
```bash
# Test connection
cd /var/app/backend
node -e "const {pool} = require('./src/db/cockroachdb'); pool.query('SELECT 1').then(() => console.log('Connected!')).catch(console.error)"
```

### Backend won't start?
```bash
pm2 logs backend --lines 50
# Check for errors
```

### Frontend shows blank page?
```bash
sudo tail -f /var/log/nginx/error.log
```

### Database connection timeout?
1. Go to Azure Portal
2. Navigate to PostgreSQL server
3. Click "Networking"
4. Verify firewall rules allow your VM IP

---

## ✅ Success Checklist

- [ ] Azure account created
- [ ] PostgreSQL database created
- [ ] VM created and running
- [ ] Code uploaded
- [ ] Database migrated
- [ ] Backend running (pm2 status)
- [ ] Frontend deployed
- [ ] Can access app via VM IP
- [ ] Can login with admin credentials
- [ ] All features working
- [ ] Billing alerts set up

---

## 📞 Support

**Azure Support:**
- Portal: https://portal.azure.com/
- Documentation: https://docs.microsoft.com/azure/
- Pricing Calculator: https://azure.microsoft.com/pricing/calculator/

**Your Setup:**
- VM IP: YOUR_VM_IP
- Database: projectmanagement-db.postgres.database.azure.com
- Resource Group: project-management-rg
- Region: East US

---

**Congratulations! You're running on Azure with the cheapest possible configuration! 🎉**

**Cost: $0 for 12 months, then $27/month**
