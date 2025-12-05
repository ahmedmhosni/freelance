# Deployment Scripts

This directory contains scripts to help deploy the application to AWS.

## Scripts Overview

### 1. setup-aws.sh
**Purpose:** Initial AWS setup and credential generation

**What it does:**
- Checks prerequisites (AWS CLI, Terraform, Node.js)
- Configures AWS credentials
- Generates SSH key pair
- Creates strong database password
- Generates JWT secret
- Creates configuration files (terraform.tfvars, .env.production)

**Usage:**
```bash
cd aws-deployment/scripts
./setup-aws.sh
```

**When to use:** Run this ONCE before your first deployment

---

### 2. deploy-backend.sh
**Purpose:** Deploy backend application to EC2

**What it does:**
- Builds backend application
- Creates deployment package
- Uploads to EC2 instance
- Runs database migrations
- Restarts application with PM2
- Performs health check
- Rolls back on failure

**Usage:**
```bash
cd aws-deployment/scripts
./deploy-backend.sh
```

**Prerequisites:**
- Infrastructure deployed with Terraform
- .env.production configured
- SSH key available

**When to use:** 
- Initial backend deployment
- Deploying code updates
- After configuration changes

---

### 3. deploy-frontend-s3.ps1 (Windows PowerShell)
**Purpose:** Deploy frontend application to AWS S3 + CloudFront

**What it does:**
- Verifies AWS CLI and credentials
- Creates/configures S3 bucket for static website hosting
- Builds React frontend for production
- Uploads files with optimized cache headers:
  - HTML: No cache (always fresh)
  - JS/CSS: 1 year cache (content-hashed filenames)
  - Other assets: 1 day cache
- Invalidates CloudFront cache (if configured)
- Provides interactive prompts for easy deployment

**Usage:**
```powershell
# Basic deployment (interactive)
.\deploy-frontend-s3.ps1

# With specific bucket
.\deploy-frontend-s3.ps1 -BucketName "my-frontend-bucket"

# Skip build (use existing dist folder)
.\deploy-frontend-s3.ps1 -SkipBuild

# With CloudFront distribution
.\deploy-frontend-s3.ps1 `
    -BucketName "my-bucket" `
    -CloudFrontDistributionId "E1234567890ABC"
```

**Prerequisites:**
- AWS CLI installed and configured
- Node.js 18+ installed
- Valid AWS credentials with S3/CloudFront permissions

**When to use:**
- Initial frontend deployment
- Deploying UI updates
- After configuration changes

---

### 4. deploy-frontend-s3.sh (Linux/Mac Bash)
**Purpose:** Same as PowerShell version for Unix-based systems

**Usage:**
```bash
# Basic deployment (interactive)
./deploy-frontend-s3.sh

# With specific bucket
./deploy-frontend-s3.sh --bucket my-frontend-bucket

# Skip build
./deploy-frontend-s3.sh --skip-build

# With CloudFront distribution
./deploy-frontend-s3.sh \
    --bucket my-bucket \
    --distribution E1234567890ABC

# Show help
./deploy-frontend-s3.sh --help
```

**Prerequisites:**
- AWS CLI installed and configured
- Node.js 18+ installed
- Valid AWS credentials with S3/CloudFront permissions

**When to use:**
- Initial frontend deployment
- Deploying UI updates
- After configuration changes

---

## Deployment Workflow

### First Time Deployment

```bash
# 1. Setup AWS and generate credentials
./setup-aws.sh

# 2. Deploy infrastructure with Terraform
cd ../terraform
source set-env.sh
terraform init
terraform plan
terraform apply

# 3. Update .env.production with RDS endpoint
# Get endpoint: terraform output rds_address
# Edit: ../../backend/.env.production

# 4. Deploy backend
cd ../scripts
./deploy-backend.sh

# 5. Deploy frontend
# Windows PowerShell:
.\deploy-frontend-s3.ps1

# Linux/Mac:
./deploy-frontend-s3.sh
```

### Subsequent Deployments

```bash
# Deploy backend updates
./deploy-backend.sh

# Deploy frontend updates
# Windows PowerShell:
.\deploy-frontend-s3.ps1

# Linux/Mac:
./deploy-frontend-s3.sh
```

---

## Script Requirements

### System Requirements
- Bash shell (Linux/Mac) or Git Bash (Windows)
- AWS CLI v2.x or higher
- Terraform v1.0 or higher
- Node.js v18.x or higher
- SSH client

### AWS Requirements
- AWS account with billing enabled
- IAM user with appropriate permissions
- AWS CLI configured with credentials

### File Requirements
- SSH key at `~/.ssh/roastify-key`
- `.env.production` in backend directory
- `terraform.tfvars` in terraform directory

---

## Troubleshooting

### "AWS CLI is not installed"
Install AWS CLI from: https://aws.amazon.com/cli/

### "Terraform is not installed"
Install Terraform from: https://www.terraform.io/downloads

### "Could not get EC2 IP from Terraform"
Make sure infrastructure is deployed:
```bash
cd ../terraform
terraform apply
```

### "SSH key not found"
Run setup script to generate key:
```bash
./setup-aws.sh
```

### "Application health check failed"
Check logs on EC2:
```bash
ssh -i ~/.ssh/roastify-key ec2-user@<EC2_IP>
pm2 logs roastify-backend
```

### "S3 bucket not found"
Deploy infrastructure first:
```bash
cd ../terraform
terraform apply
```

---

## Security Notes

1. **Never commit credentials** to version control
2. **Protect SSH keys** - keep them secure and backed up
3. **Use strong passwords** - generated by setup script
4. **Rotate credentials** regularly
5. **Use AWS Secrets Manager** for production secrets
6. **Enable MFA** on AWS account
7. **Restrict security groups** to minimum required access

---

## Advanced Usage

### Custom Deployment

You can customize deployments by modifying the scripts or using environment variables:

```bash
# Deploy to specific EC2 instance
EC2_IP=1.2.3.4 ./deploy-backend.sh

# Deploy to specific S3 bucket
S3_BUCKET=my-custom-bucket ./deploy-frontend.sh

# Use custom SSH key
SSH_KEY=/path/to/key ./deploy-backend.sh
```

### Automated Deployments

For CI/CD pipelines, you can use these scripts with environment variables:

```yaml
# GitHub Actions example
- name: Deploy Backend
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  run: |
    cd aws-deployment/scripts
    ./deploy-backend.sh
```

---

## Maintenance

### Update Scripts

Scripts are versioned with the application. To update:

```bash
git pull origin main
cd aws-deployment/scripts
# Scripts are automatically updated
```

### Backup Before Deployment

Scripts automatically create backups:
- Backend: `/opt/roastify/backend.backup.<timestamp>`
- Rollback happens automatically on failure

### Monitor Deployments

Check deployment status:
```bash
# Backend logs
ssh -i ~/.ssh/roastify-key ec2-user@<EC2_IP> 'pm2 logs'

# CloudWatch logs
aws logs tail /aws/ec2/roastify --follow

# S3 deployment
aws s3 ls s3://your-bucket/ --recursive
```

---

## Support

For issues with scripts:
1. Check script output for error messages
2. Verify prerequisites are installed
3. Check AWS credentials are configured
4. Review the main DEPLOYMENT_GUIDE.md
5. Check CloudWatch logs for application errors

---

**Happy Deploying! 🚀**
