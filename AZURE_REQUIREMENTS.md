# Project Management System - Azure Deployment Requirements

## 📋 Executive Summary

**Application Name:** Freelance Project Management System  
**Type:** Full-stack web application  
**Architecture:** Monolithic with separate frontend/backend  
**Target Environment:** Azure Cloud Platform  
**Estimated Users:** 100-10,000 concurrent users  
**Data Sensitivity:** Medium (business data, no PII/PHI)  

---

## 🏗️ Application Architecture

### Technology Stack

**Frontend:**
- Framework: React 18.x
- Build Tool: Vite 5.x
- UI Libraries: React Icons, Recharts, React Big Calendar
- State Management: React Context API
- Styling: CSS (custom, Notion-like design)
- Bundle Size: ~2-3 MB (optimized)

**Backend:**
- Runtime: Node.js 18.x LTS
- Framework: Express.js 4.x
- Real-time: Socket.io 4.x
- Authentication: JWT (jsonwebtoken)
- Security: Helmet, bcryptjs, CORS
- File Processing: PDFKit, Multer
- Email: Nodemailer

**Database:**
- Primary: PostgreSQL 14+ (CockroachDB compatible)
- Schema: Relational (10 tables)
- Size Estimate: 1-10 GB (first year)
- Connections: Pool of 20 concurrent connections

---

## 💻 Infrastructure Requirements

### Compute Resources

**Application Server:**
- **Minimum:** 1 vCPU, 1 GB RAM
- **Recommended:** 2 vCPU, 2 GB RAM
- **OS:** Ubuntu 22.04 LTS or Windows Server 2022
- **Runtime:** Node.js 18.x LTS
- **Process Manager:** PM2 or Azure App Service built-in

**Scaling Requirements:**
- Vertical: Up to 4 vCPU, 8 GB RAM
- Horizontal: 2-5 instances with load balancer
- Auto-scaling: Based on CPU (>70%) and Memory (>80%)

### Storage Requirements

**Application Storage:**
- OS Disk: 30 GB SSD (Premium recommended)
- Data Disk: 50-100 GB SSD for file uploads
- Backup Storage: 100 GB (incremental backups)

**Database Storage:**
- Initial: 5 GB
- Growth: ~1-2 GB/month
- Backup: 3x database size
- IOPS: 500-1000 (Standard SSD)

### Network Requirements

**Bandwidth:**
- Ingress: Unlimited (Azure standard)
- Egress: 5-10 GB/month (estimated)
- Latency: <100ms (within region)

**Ports:**
- HTTP: 80 (public)
- HTTPS: 443 (public)
- Backend API: 5000 (internal)
- WebSocket: 5000 (internal)
- Database: 26257 (CockroachDB) or 5432 (PostgreSQL)

**DNS:**
- Custom domain support required
- SSL/TLS certificate (Let's Encrypt or Azure managed)

---

## 🗄️ Database Requirements

### Schema Overview

**Tables (10):**
1. users - User accounts and authentication
2. clients - Client information
3. projects - Project management
4. tasks - Task tracking
5. invoices - Invoice generation
6. invoice_items - Invoice line items
7. files - File metadata
8. notifications - User notifications
9. time_entries - Time tracking
10. quotes - Motivational quotes

**Relationships:**
- Foreign keys with CASCADE/SET NULL
- Indexes on: user_id, project_id, client_id, created_at
- Full-text search on: project names, task titles

### Database Options

**Option 1: CockroachDB Serverless (Current)**
- Provider: CockroachDB Cloud
- Type: PostgreSQL-compatible
- Free Tier: 10 GB storage, 50M RU/month
- Connection: SSL required
- Backup: Automatic daily

**Option 2: Azure Database for PostgreSQL**
- SKU: Flexible Server
- Tier: Burstable B1ms (1 vCore, 2 GB RAM)
- Storage: 32 GB with auto-grow
- Backup: 7-day retention
- High Availability: Optional (zone-redundant)

**Option 3: Azure SQL Database**
- Tier: Basic (5 DTU) or Standard S0 (10 DTU)
- Storage: 2-250 GB
- Backup: Point-in-time restore (7-35 days)
- Requires: Schema migration from PostgreSQL

### Connection Requirements

- Connection pooling: 10-20 connections
- SSL/TLS: Required
- Connection timeout: 30 seconds
- Idle timeout: 5 minutes
- Retry logic: 3 attempts with exponential backoff

---

## 🔐 Security Requirements

### Authentication & Authorization

**User Authentication:**
- Method: JWT tokens
- Token expiry: 24 hours
- Refresh token: 7 days
- Password hashing: bcrypt (10 rounds)
- Session management: Stateless

**Authorization Levels:**
- Admin: Full system access
- User: Limited to assigned projects
- Client: Read-only access (future)

### Network Security

**Required:**
- HTTPS/TLS 1.2+ only
- CORS configuration (specific origins)
- Rate limiting: 100 requests/minute per IP
- DDoS protection: Azure DDoS Standard (optional)
- WAF: Azure Application Gateway WAF (optional)

**Firewall Rules:**
- Allow: HTTPS (443) from internet
- Allow: HTTP (80) for redirect to HTTPS
- Allow: Database port from app subnet only
- Deny: All other inbound traffic

### Data Security

**At Rest:**
- Database encryption: Transparent Data Encryption (TDE)
- File storage encryption: AES-256
- Backup encryption: Enabled

**In Transit:**
- SSL/TLS for all connections
- Database connections: SSL required
- API calls: HTTPS only

**Secrets Management:**
- Azure Key Vault for:
  - Database connection strings
  - JWT secret keys
  - API keys
  - SMTP credentials

---

## 📦 Deployment Options

### Option 1: Azure App Service (Recommended)

**Frontend:**
- Service: Azure Static Web Apps or App Service
- Plan: Free or Basic B1
- Features: Auto-deploy from GitHub, SSL, CDN

**Backend:**
- Service: Azure App Service (Linux)
- Plan: Basic B1 (1 vCPU, 1.75 GB RAM)
- Runtime: Node.js 18 LTS
- Features: Auto-scaling, deployment slots, logs

**Pros:**
- Fully managed (PaaS)
- Easy deployment
- Built-in monitoring
- Auto-scaling

**Cons:**
- Higher cost than VMs
- Less control

**Estimated Cost:** $13-25/month

---

### Option 2: Azure Virtual Machine

**VM Specifications:**
- Size: Standard B1s or B1ms
- OS: Ubuntu 22.04 LTS
- Disk: 30 GB Premium SSD
- Network: Standard public IP

**Software Stack:**
- Node.js 18.x
- PM2 process manager
- Nginx reverse proxy
- Certbot for SSL

**Pros:**
- Full control
- Lower cost
- Flexible configuration

**Cons:**
- Manual management
- OS updates required
- More setup time

**Estimated Cost:** $10-15/month

---

### Option 3: Azure Container Instances

**Containers:**
- Frontend: Nginx + React build
- Backend: Node.js application
- Orchestration: Azure Container Instances or AKS

**Pros:**
- Modern architecture
- Easy scaling
- Portable

**Cons:**
- More complex setup
- Higher cost for AKS

**Estimated Cost:** $15-30/month

---

## 🔄 CI/CD Requirements

### Source Control
- Repository: GitHub (current)
- Branching: main (production), develop (staging)
- Protected branches: main requires PR approval

### Build Pipeline

**Frontend Build:**
```bash
npm ci
npm run build
# Output: dist/ folder
```

**Backend Build:**
```bash
npm ci --production
# No build step (Node.js runtime)
```

### Deployment Pipeline

**Stages:**
1. Code checkout
2. Install dependencies
3. Run tests (optional)
4. Build frontend
5. Deploy to staging
6. Manual approval
7. Deploy to production

**Tools:**
- Azure DevOps Pipelines, or
- GitHub Actions, or
- Azure CLI scripts

---

## 📊 Monitoring & Logging

### Application Monitoring

**Required Metrics:**
- Response time (avg, p95, p99)
- Error rate (4xx, 5xx)
- Request rate (req/sec)
- Active users (concurrent)
- Database query performance

**Tools:**
- Azure Application Insights (recommended)
- PM2 monitoring (if using VMs)
- Custom logging to Azure Log Analytics

### Infrastructure Monitoring

**Required Metrics:**
- CPU utilization
- Memory usage
- Disk I/O
- Network throughput
- Database connections

**Alerts:**
- CPU > 80% for 5 minutes
- Memory > 85% for 5 minutes
- Error rate > 5% for 2 minutes
- Response time > 2 seconds
- Database connection failures

### Logging

**Log Levels:**
- ERROR: Application errors
- WARN: Warnings and deprecations
- INFO: General information
- DEBUG: Detailed debugging (dev only)

**Log Retention:**
- Application logs: 30 days
- Access logs: 90 days
- Error logs: 180 days

**Log Destinations:**
- Azure Log Analytics Workspace
- Application Insights
- File system (last 7 days)

---

## 🔄 Backup & Disaster Recovery

### Backup Strategy

**Database:**
- Frequency: Daily automated backups
- Retention: 7 days (minimum), 30 days (recommended)
- Type: Full backup + transaction logs
- Storage: Azure Backup or database service built-in

**Application Files:**
- Frequency: Weekly
- Retention: 4 weeks
- Scope: Uploaded files, configuration
- Storage: Azure Blob Storage (Cool tier)

**Configuration:**
- Frequency: On change
- Retention: Indefinite
- Storage: Git repository + Azure Key Vault

### Disaster Recovery

**RTO (Recovery Time Objective):** 4 hours  
**RPO (Recovery Point Objective):** 24 hours  

**DR Plan:**
1. Database restore from backup
2. Redeploy application from Git
3. Restore uploaded files from backup
4. Update DNS if needed
5. Verify functionality

**Testing:** Quarterly DR drill

---

## 🌐 Scalability Requirements

### Current Scale
- Users: 1-100 concurrent
- Requests: 100-1,000 per hour
- Data: <1 GB
- Files: <5 GB

### Target Scale (Year 1)
- Users: 100-1,000 concurrent
- Requests: 10,000-100,000 per hour
- Data: 5-10 GB
- Files: 50-100 GB

### Scaling Strategy

**Vertical Scaling (First):**
- Upgrade VM/App Service plan
- Increase database tier
- Add more storage

**Horizontal Scaling (Later):**
- Multiple app instances
- Load balancer (Azure Load Balancer or App Gateway)
- Database read replicas
- CDN for static assets (Azure CDN)

---

## 💰 Cost Estimation

### Minimum Configuration (Development/Testing)

| Resource | Service | Cost/Month |
|----------|---------|------------|
| App Service | B1 Basic | $13 |
| Database | CockroachDB Free | $0 |
| Storage | 10 GB | $0.50 |
| Bandwidth | 5 GB | $0.40 |
| **Total** | | **~$14/month** |

### Recommended Configuration (Production)

| Resource | Service | Cost/Month |
|----------|---------|------------|
| App Service | B2 Basic | $55 |
| Database | PostgreSQL Flexible B1ms | $15 |
| Storage | 50 GB Premium | $10 |
| Backup | 50 GB | $2 |
| Bandwidth | 10 GB | $0.80 |
| Application Insights | Basic | $0 (free tier) |
| **Total** | | **~$83/month** |

### Enterprise Configuration (High Availability)

| Resource | Service | Cost/Month |
|----------|---------|------------|
| App Service | S1 Standard (2 instances) | $140 |
| Database | PostgreSQL HA | $100 |
| Storage | 200 GB Premium | $40 |
| Load Balancer | Standard | $18 |
| Backup | 200 GB | $8 |
| CDN | Standard | $10 |
| Application Gateway WAF | Standard | $125 |
| **Total** | | **~$441/month** |

---

## 📋 Environment Variables

### Required Configuration

```env
# Application
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=verify-full

# Security
JWT_SECRET=<64-character-random-string>

# Storage
UPLOAD_DIR=/var/app/uploads
MAX_FILE_SIZE=52428800

# Frontend
FRONTEND_URL=https://yourdomain.com

# Email (Optional)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=<app-password>

# Monitoring (Optional)
APPLICATIONINSIGHTS_CONNECTION_STRING=<connection-string>
```

---

## 🔧 Dependencies

### Backend Dependencies (package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "socket.io": "^4.8.1",
    "nodemailer": "^7.0.10",
    "pdfkit": "^0.17.2",
    "express-validator": "^7.0.1"
  }
}
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.12.0",
    "recharts": "^2.10.3",
    "react-big-calendar": "^1.8.5"
  }
}
```

---

## 📞 Support Requirements

### Documentation Needed
- ✅ Deployment guide (provided)
- ✅ API documentation (provided)
- ✅ User manual (basic)
- ⚠️ Admin guide (to be created)
- ⚠️ Troubleshooting guide (to be created)

### Training Requirements
- Admin training: 2 hours
- User training: 1 hour
- Developer handoff: 4 hours

### Maintenance Windows
- Preferred: Sunday 2:00-6:00 AM UTC
- Frequency: Monthly for updates
- Notification: 48 hours advance

---

## ✅ Compliance & Standards

### Data Residency
- Data location: Configurable (Azure region)
- Current: Europe West 3 (CockroachDB)
- Recommended: Same region as users

### Standards Compliance
- HTTPS/TLS 1.2+
- OWASP Top 10 security practices
- GDPR ready (data export/deletion)
- SOC 2 Type II (if using Azure services)

### Accessibility
- WCAG 2.1 Level A (current)
- Target: WCAG 2.1 Level AA

---

## 📝 Migration Path

### From Current Setup (GCP + CockroachDB)

**Phase 1: Database (No change)**
- Keep CockroachDB (already cloud-agnostic)
- Update connection strings only

**Phase 2: Application**
- Deploy to Azure App Service or VM
- Update environment variables
- Test connectivity

**Phase 3: DNS**
- Update DNS to point to Azure
- Verify SSL certificate
- Monitor for issues

**Downtime:** <5 minutes (DNS propagation)

---

## 🎯 Success Criteria

### Performance
- Page load time: <2 seconds
- API response time: <500ms (p95)
- Database query time: <100ms (p95)
- Uptime: 99.5% (monthly)

### Scalability
- Support 1,000 concurrent users
- Handle 100,000 requests/hour
- Database: 10 GB capacity
- Storage: 100 GB capacity

### Security
- Zero critical vulnerabilities
- SSL/TLS A+ rating
- Regular security updates
- Encrypted data at rest and in transit

---

## 📧 Contact Information

**Project Owner:** Ahmed (ahmedroastify)  
**Application:** Freelance Project Management System  
**Repository:** GitHub (private)  
**Current Deployment:** Google Cloud VM + CockroachDB  
**Target Platform:** Microsoft Azure  

---

**Document Version:** 1.0  
**Last Updated:** November 22, 2025  
**Next Review:** December 2025
