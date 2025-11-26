# Add Firewall Rule to Azure PostgreSQL

## Your connection is being blocked by the firewall. Here's how to fix it:

### Option 1: Azure Portal (Easiest)

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your PostgreSQL server: `roastifydbpost`
3. Click on "Networking" in the left menu
4. Under "Firewall rules", click "+ Add current client IP address"
5. Click "Save"
6. Wait 1-2 minutes for the rule to apply

### Option 2: Azure CLI

```bash
# Get your current IP
$myip = (Invoke-WebRequest -Uri "https://api.ipify.org").Content

# Add firewall rule
az postgres flexible-server firewall-rule create `
  --resource-group your-resource-group `
  --name roastifydbpost `
  --rule-name AllowMyIP `
  --start-ip-address $myip `
  --end-ip-address $myip
```

### Option 3: Allow All Azure Services

If you want to allow connections from Azure services:

1. Go to Azure Portal
2. Navigate to your PostgreSQL server
3. Click "Networking"
4. Check "Allow public access from any Azure service within Azure to this server"
5. Click "Save"

### After Adding Firewall Rule:

Run the test again:
```bash
cd backend
node test-azure-postgres.js
```

You should see:
```
✓ Successfully connected to Azure PostgreSQL!
```

