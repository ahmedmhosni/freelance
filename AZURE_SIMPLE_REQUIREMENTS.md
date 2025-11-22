# Azure Deployment - Simple Requirements

## 📋 Application Overview

**Name:** Freelance Project Management System  
**Type:** Full-stack web application (React + Node.js)  
**Users:** 100-1,000 concurrent  
**Database:** PostgreSQL (currently using CockroachDB)  

---

## 🔧 Required Azure Services

### 1. Compute
**Service:** Azure App Service (Linux)  
**Plan:** Basic B1 or B2  
**Specs:** 1-2 vCPU, 1.75-3.5 GB RAM  
**Runtime:** Node.js 18 LTS  

### 2. Database
**Service:** Azure Database for PostgreSQL - Flexible Server  
**Tier:** Burstable B1ms  
**Specs:** 1 vCore, 2 GB RAM, 32 GB storage  
**Backup:** 7-day retention  

**Alternative:** Keep existing CockroachDB (free, already configured)

### 3. Storage
**Service:** Azure Blob Storage  
**Tier:** Hot or Cool  
**Size:** 50-100 GB  
**Purpose:** File uploads (invoices, documents)  

### 4. Networking
**Service:** Azure Application Gateway (optional) or built-in App Service  
**SSL:** Azure managed certificate or Let's Encrypt  
**Domain:** Custom domain support  

---

## 💻 Technical Specifications

### Frontend
- React 18.x
- Vite build tool
- Bundle size: ~2-3 MB
- Deployment: Static files

### Backend
- Node.js 18.x
- Express.js framework
- WebSocket support (Socket.io)
- JWT authentication

### Database Schema
- 10 tables (users, projects, tasks, clients, invoices, etc.)
- PostgreSQL 14+
- Initial size: 1-5 GB
- Connection pool: 20 connections

---

## 🔐 Security Requirements

- HTTPS/TLS only
- JWT authentication
- Password hashing (bcrypt)
- CORS configuration
- Environment variables in Azure Key Vault

---

## 📊 Environment Variables Needed

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<random-64-char-string>
FRONTEND_URL=<your-domain>
UPLOAD_DIR=/var/app/uploads
```

---

## 💰 Estimated Monthly Cost

### Minimum Setup
- App Service B1: $13/month
- PostgreSQL B1ms: $15/month
- Storage 50GB: $1/month
- **Total: ~$29/month**

### Recommended Setup
- App Service B2: $55/month
- PostgreSQL B2s: $30/month
- Storage 100GB: $2/month
- **Total: ~$87/month**

---

## 📦 Deployment Requirements

### Source Code
- Repository: GitHub
- Build: `npm ci && npm run build`
- Deploy: Azure DevOps or GitHub Actions

### Dependencies
- Node.js 18.x
- npm packages (see package.json)
- PostgreSQL client library (pg)

---

## 🎯 Performance Targets

- Response time: <500ms
- Uptime: 99.5%
- Concurrent users: 1,000
- Page load: <2 seconds

---

## 📞 Contact

**Owner:** Ahmed (ahmedroastify)  
**Current Setup:** Google Cloud VM + CockroachDB  
**Migration:** Can keep CockroachDB or migrate to Azure PostgreSQL  

---

## ✅ What We Need from Azure Team

1. **App Service** - B1 or B2 plan with Node.js 18
2. **Database** - PostgreSQL Flexible Server OR keep CockroachDB
3. **Storage** - Blob storage for file uploads
4. **SSL Certificate** - For custom domain
5. **Deployment Pipeline** - CI/CD setup

**That's it!** Simple, straightforward deployment.
