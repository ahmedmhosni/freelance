#!/bin/bash
# Frontend Deployment Script
# This script builds and deploys the frontend to S3

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/aws-deployment/terraform"

echo -e "${GREEN}=== Frontend Deployment Script ===${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    exit 1
fi

# Get S3 bucket name from Terraform
echo -e "${YELLOW}Getting S3 bucket name from Terraform...${NC}"
cd "$TERRAFORM_DIR"
S3_BUCKET=$(terraform output -raw s3_frontend_bucket 2>/dev/null)

if [ -z "$S3_BUCKET" ]; then
    echo -e "${RED}Error: Could not get S3 bucket name from Terraform${NC}"
    echo "Make sure you have deployed infrastructure with 'terraform apply'"
    exit 1
fi

echo -e "${GREEN}S3 Bucket: $S3_BUCKET${NC}"

# Build frontend
echo ""
echo -e "${YELLOW}Step 1: Building frontend...${NC}"
cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build for production
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Uploading to S3...${NC}"

# Sync to S3 with proper cache headers
aws s3 sync dist/ s3://$S3_BUCKET/ \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.html"

# Upload HTML files with no-cache
aws s3 sync dist/ s3://$S3_BUCKET/ \
    --cache-control "no-cache, no-store, must-revalidate" \
    --exclude "*" \
    --include "*.html"

echo ""
echo -e "${YELLOW}Step 3: Invalidating CloudFront cache (if configured)...${NC}"

# Get CloudFront distribution ID if it exists
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='$S3_BUCKET.s3.amazonaws.com']].Id" \
    --output text 2>/dev/null)

if [ -n "$DISTRIBUTION_ID" ]; then
    echo "Creating CloudFront invalidation..."
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*"
    echo -e "${GREEN}CloudFront cache invalidated${NC}"
else
    echo -e "${YELLOW}No CloudFront distribution found - skipping cache invalidation${NC}"
fi

# Get website endpoint
WEBSITE_ENDPOINT=$(terraform output -raw s3_frontend_website_endpoint 2>/dev/null)

echo ""
echo -e "${GREEN}=== Deployment Successful! ===${NC}"
echo ""
echo "Frontend deployed to:"
echo "  S3 Bucket: $S3_BUCKET"
if [ -n "$WEBSITE_ENDPOINT" ]; then
    echo "  Website: http://$WEBSITE_ENDPOINT"
fi
echo ""
echo "Files uploaded:"
aws s3 ls s3://$S3_BUCKET/ --recursive --human-readable --summarize | tail -2
echo ""
