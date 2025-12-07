# Azure Load Balancer Guide - Roastify

## Do You Need a Load Balancer?

### Current Status: ❌ NOT NEEDED YET

**Your current setup (Azure App Service) already provides:**
- Built-in load balancing across scaled instances
- Auto-scaling (scale up/out)
- Health monitoring
- SSL termination
- 99.95% uptime SLA

### When You WILL Need It

#### Scenario 1: High Traffic (1,000+ concurrent users)
**Indicators:**
- Response times > 2 seconds
- CPU usage consistently > 80%
- Memory usage > 85%
- App Service auto-scaling hitting limits

**Solution:** Azure Application Gateway or Azure Front Door

#### Scenario 2: Multi-Region Deployment
**Indicators:**
- Users from multiple continents
- Latency issues for distant users
- Need for disaster recovery

**Solution:** Azure Front Door (global load balancer)

#### Scenario 3: Microservices Architecture
**Indicators:**
- Breaking monolith into services
- Multiple backend services
- Container-based deployment (AKS)

**Solution:** Azure Load Balancer or Application Gateway

---

## Azure Load Balancing Options

### 1. Azure App Service (Current - Built-in)

**What You Have:**
```
Internet → Azure App Service → Your App (auto-scaled instances)
```

**Features:**
- ✅ Automatic load balancing across instances
- ✅ Auto-scaling (manual or automatic)
- ✅ SSL/TLS termination
- ✅ Custom domains
- ✅ Deployment slots
- ✅ 99.95% SLA

**Cost:** Included in App Service plan

**Scaling Options:**
```bash
# Scale Up (Vertical - bigger machine)
- Basic: B1, B2, B3
- Standard: S1, S2, S3
- Premium: P1v2, P2v2, P3v2

# Scale Out (Horizontal - more instances)
- Manual: 1-10 instances (Basic)
- Manual: 1-30 instances (Standard/Premium)
- Auto: Based on CPU, Memory, HTTP Queue, etc.
```

**When to Scale:**
- CPU > 70%: Scale up or out
- Memory > 80%: Scale up
- Response time > 1s: Scale out
- Queue length > 10: Scale out

---

### 2. Azure Application Gateway (Layer 7)

**Architecture:**
```
Internet → Application Gateway → App Service Instances
                ↓
         WAF (Web Application Firewall)
         SSL Offloading
         URL-based routing
```

**Use Cases:**
- Need Web Application Firewall (WAF)
- SSL offloading at scale
- URL-based routing (e.g., /api → backend, /app → frontend)
- Cookie-based session affinity
- Custom health probes

**Features:**
- ✅ Layer 7 load balancing (HTTP/HTTPS)
- ✅ Web Application Firewall (WAF)
- ✅ SSL termination
- ✅ URL path-based routing
- ✅ Multi-site hosting
- ✅ Autoscaling
- ✅ 99.95% SLA

**Cost:**
- Standard_v2: ~$0.20/hour + $0.008/GB processed
- WAF_v2: ~$0.36/hour + $0.008/GB processed
- **Estimated:** $150-300/month (with WAF)

**Setup Time:** 2-3 hours

---

### 3. Azure Front Door (Global CDN + Load Balancer)

**Architecture:**
```
Internet → Azure Front Door (Global) → Multiple Regions
              ↓
         CDN Caching
         WAF
         SSL
         DDoS Protection
              ↓
    Region 1: App Service    Region 2: App Service
```

**Use Cases:**
- Global user base (multiple continents)
- Need CDN for static assets
- Multi-region deployment
- Advanced DDoS protection
- Fastest possible performance

**Features:**
- ✅ Global load balancing
- ✅ CDN (Content Delivery Network)
- ✅ Web Application Firewall (WAF)
- ✅ SSL termination
- ✅ URL rewriting
- ✅ Caching rules
- ✅ 99.99% SLA

**Cost:**
- Base: ~$35/month
- Routing: $0.01/10K requests
- Data transfer: $0.06-0.17/GB
- **Estimated:** $100-500/month (depending on traffic)

**Setup Time:** 3-4 hours

---

### 4. Azure Load Balancer (Layer 4)

**Architecture:**
```
Internet → Azure Load Balancer → VM/Container Instances
              ↓
         TCP/UDP load balancing
         Health probes
         Port forwarding
```

**Use Cases:**
- VM-based deployment (not App Service)
- Non-HTTP protocols (TCP, UDP)
- Container orchestration (AKS)
- High-performance scenarios

**Features:**
- ✅ Layer 4 load balancing (TCP/UDP)
- ✅ Port forwarding
- ✅ Health probes
- ✅ Outbound connections
- ✅ 99.99% SLA

**Cost:**
- Standard: ~$0.025/hour + $0.005/GB
- **Estimated:** $20-50/month

**Setup Time:** 1-2 hours

---

## Recommended Path for Roastify

### Phase 1: Current (0-500 users) ✅ YOU ARE HERE
**Setup:** Single Azure App Service (Standard S1 or S2)

**Configuration:**
```bash
# App Service Plan
- Tier: Standard S2
- Instances: 1-3 (manual scaling)
- Auto-scale: Not needed yet

# Monitoring
- Application Insights: Yes
- Alerts: CPU > 80%, Memory > 85%
```

**Cost:** $75-150/month

**Action:** Monitor metrics, optimize code

---

### Phase 2: Growth (500-2,000 users)
**Setup:** App Service with Auto-scaling

**Configuration:**
```bash
# App Service Plan
- Tier: Premium P1v2 or P2v2
- Instances: 2-5 (auto-scale)
- Auto-scale rules:
  - Scale out when CPU > 70% for 5 minutes
  - Scale in when CPU < 30% for 10 minutes
  - Min instances: 2
  - Max instances: 5

# Database
- Azure PostgreSQL: General Purpose (2-4 vCores)
- Connection pooling: 100-200 connections
```

**Cost:** $200-400/month

**Action:** Enable auto-scaling, optimize database queries

---

### Phase 3: Scale (2,000-10,000 users)
**Setup:** App Service + Application Gateway + WAF

**Configuration:**
```bash
# Application Gateway
- SKU: WAF_v2
- Instances: 2-10 (auto-scale)
- WAF: OWASP 3.2 rules

# App Service Plan
- Tier: Premium P2v2 or P3v2
- Instances: 3-10 (auto-scale)

# Database
- Azure PostgreSQL: General Purpose (4-8 vCores)
- Read replicas: Consider for reporting

# Caching
- Azure Cache for Redis: Basic or Standard
```

**Cost:** $600-1,200/month

**Action:** Implement Application Gateway, add WAF, optimize caching

---

### Phase 4: Global (10,000+ users)
**Setup:** Azure Front Door + Multi-Region

**Configuration:**
```bash
# Azure Front Door
- SKU: Premium (includes WAF)
- Origins: 2-3 regions
- Caching: Aggressive for static assets

# App Service (per region)
- Tier: Premium P3v2
- Instances: 5-20 (auto-scale)

# Database
- Azure PostgreSQL: Flexible Server (8-16 vCores)
- Read replicas: Multiple regions
- Geo-replication: Yes

# Caching
- Azure Cache for Redis: Premium (clustered)
```

**Cost:** $2,000-5,000/month

**Action:** Multi-region deployment, global CDN, advanced caching

---

## How to Enable Auto-Scaling (Phase 2)

### Option 1: Azure Portal

1. **Navigate to App Service:**
   ```
   Azure Portal → App Services → [Your App] → Scale out (App Service plan)
   ```

2. **Enable Auto-scale:**
   ```
   - Click "Custom autoscale"
   - Add a rule:
     * Metric: CPU Percentage
     * Operator: Greater than
     * Threshold: 70
     * Duration: 5 minutes
     * Action: Increase count by 1
   
   - Add scale-in rule:
     * Metric: CPU Percentage
     * Operator: Less than
     * Threshold: 30
     * Duration: 10 minutes
     * Action: Decrease count by 1
   
   - Set limits:
     * Minimum: 2 instances
     * Maximum: 5 instances
     * Default: 2 instances
   ```

3. **Save and Monitor:**
   ```
   - Save configuration
   - Monitor in "Run history" tab
   - Check Application Insights for performance
   ```

### Option 2: Azure CLI

```bash
# Create auto-scale settings
az monitor autoscale create \
  --resource-group roastify-rg \
  --resource roastify-app-service-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name roastify-autoscale \
  --min-count 2 \
  --max-count 5 \
  --count 2

# Add scale-out rule (CPU > 70%)
az monitor autoscale rule create \
  --resource-group roastify-rg \
  --autoscale-name roastify-autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1

# Add scale-in rule (CPU < 30%)
az monitor autoscale rule create \
  --resource-group roastify-rg \
  --autoscale-name roastify-autoscale \
  --condition "Percentage CPU < 30 avg 10m" \
  --scale in 1
```

---

## How to Add Application Gateway (Phase 3)

### Prerequisites
- App Service running
- Custom domain configured
- SSL certificate

### Step 1: Create Application Gateway

```bash
# Create public IP
az network public-ip create \
  --resource-group roastify-rg \
  --name roastify-appgw-ip \
  --sku Standard \
  --allocation-method Static

# Create Application Gateway
az network application-gateway create \
  --name roastify-appgw \
  --resource-group roastify-rg \
  --location eastus \
  --sku WAF_v2 \
  --capacity 2 \
  --vnet-name roastify-vnet \
  --subnet appgw-subnet \
  --public-ip-address roastify-appgw-ip \
  --http-settings-cookie-based-affinity Disabled \
  --frontend-port 443 \
  --http-settings-port 443 \
  --http-settings-protocol Https \
  --priority 100
```

### Step 2: Configure Backend Pool

```bash
# Add App Service to backend pool
az network application-gateway address-pool create \
  --gateway-name roastify-appgw \
  --resource-group roastify-rg \
  --name roastify-backend-pool \
  --servers roastify.azurewebsites.net
```

### Step 3: Configure WAF

```bash
# Enable WAF
az network application-gateway waf-config set \
  --gateway-name roastify-appgw \
  --resource-group roastify-rg \
  --enabled true \
  --firewall-mode Prevention \
  --rule-set-type OWASP \
  --rule-set-version 3.2
```

### Step 4: Update DNS

```
# Point your domain to Application Gateway IP
roastify.online → [Application Gateway Public IP]
```

**Setup Time:** 2-3 hours
**Cost:** ~$250/month

---

## Monitoring & Alerts

### Key Metrics to Monitor

```javascript
// Application Insights Query (KQL)

// 1. Response Time
requests
| where timestamp > ago(1h)
| summarize avg(duration), percentile(duration, 95) by bin(timestamp, 5m)

// 2. Failed Requests
requests
| where timestamp > ago(1h) and success == false
| summarize count() by resultCode, bin(timestamp, 5m)

// 3. CPU Usage
performanceCounters
| where timestamp > ago(1h) and name == "% Processor Time"
| summarize avg(value) by bin(timestamp, 5m)

// 4. Memory Usage
performanceCounters
| where timestamp > ago(1h) and name == "Available Bytes"
| summarize avg(value) by bin(timestamp, 5m)
```

### Recommended Alerts

```bash
# Alert 1: High CPU
az monitor metrics alert create \
  --name "High CPU Usage" \
  --resource-group roastify-rg \
  --scopes /subscriptions/{sub-id}/resourceGroups/roastify-rg/providers/Microsoft.Web/sites/roastify \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m

# Alert 2: High Response Time
az monitor metrics alert create \
  --name "High Response Time" \
  --resource-group roastify-rg \
  --scopes /subscriptions/{sub-id}/resourceGroups/roastify-rg/providers/Microsoft.Web/sites/roastify \
  --condition "avg Http Response Time > 2" \
  --window-size 5m \
  --evaluation-frequency 1m

# Alert 3: High Error Rate
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group roastify-rg \
  --scopes /subscriptions/{sub-id}/resourceGroups/roastify-rg/providers/Microsoft.Web/sites/roastify \
  --condition "total Http Server Errors > 10" \
  --window-size 5m \
  --evaluation-frequency 1m
```

---

## Cost Comparison

### Current Setup (Phase 1)
```
App Service (S2):           $75/month
PostgreSQL (Basic):         $30/month
Blob Storage:               $5/month
Application Insights:       $10/month
Email Service:              $5/month
--------------------------------
Total:                      $125/month
```

### With Auto-Scaling (Phase 2)
```
App Service (P1v2, 2-5):    $200-400/month
PostgreSQL (GP 2-4 vCore):  $100-200/month
Blob Storage:               $10/month
Application Insights:       $20/month
Email Service:              $10/month
--------------------------------
Total:                      $340-640/month
```

### With Application Gateway (Phase 3)
```
Application Gateway (WAF):  $250/month
App Service (P2v2, 3-10):   $400-800/month
PostgreSQL (GP 4-8 vCore):  $200-400/month
Redis Cache (Basic):        $15/month
Blob Storage:               $20/month
Application Insights:       $50/month
Email Service:              $20/month
--------------------------------
Total:                      $955-1,555/month
```

### With Azure Front Door (Phase 4)
```
Azure Front Door (Premium): $300/month
App Service (P3v2, 5-20):   $1,000-2,000/month
PostgreSQL (Flex 8-16):     $500-1,000/month
Redis Cache (Premium):      $200/month
Blob Storage:               $50/month
Application Insights:       $100/month
Email Service:              $50/month
--------------------------------
Total:                      $2,200-3,700/month
```

---

## Decision Matrix

| Users | Setup | Monthly Cost | Action |
|-------|-------|--------------|--------|
| 0-500 | App Service (S2) | $125 | ✅ Current - Monitor |
| 500-2K | App Service (P1v2) + Auto-scale | $340-640 | Enable auto-scaling |
| 2K-10K | App Gateway + WAF | $955-1,555 | Add Application Gateway |
| 10K+ | Front Door + Multi-region | $2,200-3,700 | Global deployment |

---

## Recommendation for Roastify

### Now (Early Access)
**Action:** Stay with current setup
- Monitor Application Insights
- Optimize code and queries
- Set up alerts for CPU/Memory

### When to Scale (Indicators)
1. **CPU consistently > 70%** → Enable auto-scaling
2. **Response time > 1 second** → Scale out or optimize
3. **500+ concurrent users** → Move to Premium tier
4. **Security concerns** → Add Application Gateway with WAF
5. **Global users** → Consider Azure Front Door

### Quick Wins (Do Now)
1. ✅ Enable Application Insights (done)
2. Set up CPU/Memory alerts
3. Optimize database queries
4. Enable response caching
5. Compress API responses

---

## Summary

**You DON'T need a load balancer yet because:**
- Azure App Service includes built-in load balancing
- You're in early access phase (< 500 users)
- Auto-scaling can handle growth to 2,000+ users
- Adding complexity too early increases costs and maintenance

**You WILL need it when:**
- Consistent 1,000+ concurrent users
- Need Web Application Firewall (WAF)
- Multi-region deployment
- Response times consistently > 1 second

**Next Steps:**
1. Monitor current metrics
2. Enable auto-scaling when CPU > 70% consistently
3. Consider Application Gateway when you hit 2,000+ users
4. Plan for Azure Front Door when going global

Focus on optimizing your current setup first - it's more cost-effective and simpler to maintain! 🚀
