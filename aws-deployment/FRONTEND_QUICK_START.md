# Frontend Deployment - Quick Start

Deploy your React frontend to AWS S3 + CloudFront in minutes.

## Prerequisites

- AWS account with configured credentials (`aws configure`)
- Node.js 18+ installed
- Project built and tested locally

## One-Command Deployment

### Windows (PowerShell)

```powershell
.\aws-deployment\scripts\deploy-frontend-s3.ps1
```

### Linux/Mac (Bash)

```bash
./aws-deployment/scripts/deploy-frontend-s3.sh
```

The script will:
1. ✅ Check AWS credentials
2. ✅ Create/select S3 bucket
3. ✅ Build frontend
4. ✅ Upload files with proper caching
5. ✅ Invalidate CloudFront cache (if configured)

## Script Options

### PowerShell

```powershell
# Use existing bucket
.\aws-deployment\scripts\deploy-frontend-s3.ps1 -BucketName "my-frontend-bucket"

# Skip build (use existing dist folder)
.\aws-deployment\scripts\deploy-frontend-s3.ps1 -SkipBuild

# Specify CloudFront distribution
.\aws-deployment\scripts\deploy-frontend-s3.ps1 `
    -BucketName "my-frontend-bucket" `
    -CloudFrontDistributionId "E1234567890ABC"

# Skip CloudFront invalidation
.\aws-deployment\scripts\deploy-frontend-s3.ps1 -InvalidateCache:$false
```

### Bash

```bash
# Use existing bucket
./aws-deployment/scripts/deploy-frontend-s3.sh --bucket my-frontend-bucket

# Skip build (use existing dist folder)
./aws-deployment/scripts/deploy-frontend-s3.sh --skip-build

# Specify CloudFront distribution
./aws-deployment/scripts/deploy-frontend-s3.sh \
    --bucket my-frontend-bucket \
    --distribution E1234567890ABC

# Skip CloudFront invalidation
./aws-deployment/scripts/deploy-frontend-s3.sh --no-invalidate

# Show help
./aws-deployment/scripts/deploy-frontend-s3.sh --help
```

## Manual Deployment (3 Steps)

If you prefer manual control:

```bash
# 1. Build
cd frontend
npm install
npm run build

# 2. Create bucket (first time only)
aws s3 mb s3://your-bucket-name
aws s3 website s3://your-bucket-name/ \
    --index-document index.html \
    --error-document index.html

# 3. Deploy
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

## After Deployment

### Get Your Website URL

```bash
# S3 website URL
REGION=$(aws configure get region)
echo "http://your-bucket-name.s3-website-$REGION.amazonaws.com"

# CloudFront URL (if configured)
aws cloudfront get-distribution --id YOUR_DIST_ID \
    --query 'Distribution.DomainName' --output text
```

### Test Your Deployment

```bash
# Test S3 endpoint
curl -I http://your-bucket-name.s3-website-us-east-1.amazonaws.com

# Test CloudFront endpoint
curl -I https://d123456.cloudfront.net
```

## Common Issues

### 403 Forbidden

```bash
# Fix bucket policy
aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}'
```

### 404 on Page Refresh

```bash
# Fix error document
aws s3api put-bucket-website --bucket your-bucket-name \
    --website-configuration '{
        "IndexDocument": {"Suffix": "index.html"},
        "ErrorDocument": {"Key": "index.html"}
    }'
```

### Old Content Showing

```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id YOUR_DIST_ID \
    --paths "/*"

# Clear browser cache (Ctrl+Shift+R)
```

## Next Steps

1. ✅ **Deploy** - Run the deployment script
2. ⬜ **CloudFront** - Set up CDN for HTTPS and better performance
3. ⬜ **Custom Domain** - Configure your own domain name
4. ⬜ **CI/CD** - Automate deployments with GitHub Actions
5. ⬜ **Monitoring** - Set up CloudWatch alerts

## Cost Estimate

- **S3 Only**: ~$1-2/month for small apps
- **S3 + CloudFront**: ~$2-5/month for small apps
- **Free Tier**: First 12 months includes 5GB S3 + 50GB CloudFront

## Full Documentation

For detailed instructions, see:
- [Complete Deployment Guide](./FRONTEND_DEPLOYMENT_GUIDE.md)
- [CloudFront Setup](./FRONTEND_DEPLOYMENT_GUIDE.md#cloudfront-setup)
- [Custom Domain](./FRONTEND_DEPLOYMENT_GUIDE.md#custom-domain-configuration)
- [Troubleshooting](./FRONTEND_DEPLOYMENT_GUIDE.md#troubleshooting)

---

**Ready to deploy? Run the script and follow the prompts! 🚀**
