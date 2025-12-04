# AWS Deployment Guide

## Overview

This directory contains everything you need to deploy the refactored application to AWS using modern infrastructure-as-code practices.

**Estimated Cost:** ~$15-20/month (first 12 months with free tier)
**Capacity:** 50-100 concurrent users

## Architecture

- **Backend:** EC2 t3.micro instance running Node.js with PM2
- **Database:** RDS PostgreSQL db.t3.micro with automated backups
- **Frontend:** S3 static website hosting (with optional CloudFront CDN)
- **Load Balancer:** Application Load Balancer with SSL/TLS
- **Storage:** S3 bucket for file uploads
- **Monitoring:** CloudWatch logs and metrics
- **DNS:** Route 53 for domain management
- **SSL:** AWS Certificate Manager (ACM) - free

## 📚 Documentation

### Getting Started
1. **[START_HERE.md](START_HERE.md)** - Choose your deployment path (manual or automated)
2. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide
3. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Comprehensive checklist for deployment

### Quick Reference
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common commands and quick tips
- **[scripts/README.md](scripts/README.md)** - Deployment scripts documentation

### Specific Guides
- **[ROASTIFY_DEPLOYMENT_GUIDE.md](ROASTIFY_DEPLOYMENT_GUIDE.md)** - Manual deployment walkthrough
- **[QUICK_START.md](QUICK_START.md)** - Automated Terraform deployment

## Prerequisites

### 1. AWS Account
- Sign up at https://aws.amazon.com
- Enable billing alerts
- Note your AWS Account ID

### 2. Install Required Tools
```bash
# Install AWS CLI
# Windows: Download from https://aws.amazon.com/cli/
# Verify installation
aws --version

# Install Terraform (Infrastructure as Code)
# Windows: Download from https://www.terraform.io/downloads
# Verify installation
terraform --version
```

### 3. Configure AWS CLI
```bash
# Run this and enter your credentials
aws configure

# You'll need:
# - AWS Access Key ID (from IAM console)
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Output format: json
```

### 4. Domain Name
- Purchase a domain or use existing one
- We'll configure Route 53 to manage it

## Deployment Steps

### Step 1: Prepare Your Application

1. **Build Frontend**
```bash
cd frontend
npm install
npm run build
```

2. **Prepare Backend**
```bash
cd backend
npm install
# Ensure all tests pass
npm test
```

### Step 2: Create AWS Resources

Navigate to the terraform directory:
```bash
cd aws-deployment/terraform
```

Initialize Terraform:
```bash
terraform init
```

Review the plan:
```bash
terraform plan
```

Apply the infrastructure:
```bash
terraform apply
# Type 'yes' when prompted
```

This will create:
- VPC and networking
- EC2 instances
- RDS database
- Load balancer
- S3 buckets
- Security groups

**This takes ~10-15 minutes**

### Step 3: Configure Domain

1. Go to AWS Route 53 console
2. Create hosted zone for your domain
3. Update nameservers at your domain registrar
4. Wait for DNS propagation (5-60 minutes)

### Step 4: Deploy Application Code

The deployment scripts will:
1. SSH into EC2 instances
2. Install Node.js and dependencies
3. Copy your application code
4. Set up PM2 for process management
5. Configure nginx as reverse proxy

```bash
# Run deployment script
cd aws-deployment/scripts
./deploy.sh
```

### Step 5: Configure Database

```bash
# Run database migrations
./setup-database.sh
```

### Step 6: Verify Deployment

1. Check backend health:
```bash
curl https://api.yourdomain.com/health
```

2. Check frontend:
```bash
curl https://app.yourdomain.com
```

3. Monitor logs:
```bash
./view-logs.sh
```

## Subdomain Configuration

Your setup will include:
- `app.yourdomain.com` - Main application
- `api.yourdomain.com` - Backend API
- `admin.yourdomain.com` - Admin panel
- `status.yourdomain.com` - Status page

All configured automatically with SSL certificates.

## Monitoring & Maintenance

### CloudWatch Dashboards
- CPU utilization
- Memory usage
- Request count
- Error rates
- Database connections

### Set Up Billing Alerts
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name billing-alert \
  --alarm-description "Alert when bill exceeds $25" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 25 \
  --comparison-operator GreaterThanThreshold
```

### Backup Strategy
- RDS automated backups (7 days retention)
- S3 versioning enabled
- Daily snapshots

## Scaling Up

When you need more capacity:

1. **Upgrade to t3.small**
```bash
cd aws-deployment/terraform
# Edit variables.tf - change instance_type
terraform apply
```

2. **Add Auto Scaling**
```bash
# Uncomment auto-scaling configuration
terraform apply
```

## Troubleshooting

### Can't connect to instances
```bash
# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Verify instance status
aws ec2 describe-instances --instance-ids i-xxxxx
```

### Database connection issues
```bash
# Test database connectivity
psql -h your-db-endpoint.rds.amazonaws.com -U dbuser -d dbname
```

### SSL certificate issues
```bash
# Check certificate status
aws acm list-certificates
aws acm describe-certificate --certificate-arn arn:aws:acm:...
```

## Cost Optimization Tips

1. Use Reserved Instances after 3 months (save 40%)
2. Enable CloudFront caching (reduce backend load)
3. Set up S3 lifecycle policies (archive old files)
4. Use RDS read replicas only when needed
5. Monitor unused resources with AWS Cost Explorer

## Security Checklist

- [ ] Enable MFA on AWS root account
- [ ] Create IAM users (don't use root)
- [ ] Enable CloudTrail logging
- [ ] Configure security groups (least privilege)
- [ ] Enable RDS encryption
- [ ] Use Secrets Manager for credentials
- [ ] Enable VPC Flow Logs
- [ ] Set up AWS WAF (optional)

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions)
2. Configure monitoring alerts
3. Set up log aggregation
4. Create disaster recovery plan
5. Document runbooks

## Support

For issues or questions:
1. Check AWS documentation
2. Review CloudWatch logs
3. Check application logs on EC2
4. Review this guide's troubleshooting section
