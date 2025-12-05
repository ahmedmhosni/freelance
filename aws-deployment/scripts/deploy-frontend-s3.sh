#!/bin/bash

# Deploy Frontend to AWS S3 + CloudFront
# This script builds the React frontend and deploys it to AWS S3 with CloudFront CDN

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_success() { echo -e "${GREEN}$1${NC}"; }
print_info() { echo -e "${CYAN}$1${NC}"; }
print_warning() { echo -e "${YELLOW}$1${NC}"; }
print_error() { echo -e "${RED}$1${NC}"; }

# Parse command line arguments
ENVIRONMENT="production"
BUCKET_NAME=""
CLOUDFRONT_DISTRIBUTION_ID=""
SKIP_BUILD=false
INVALIDATE_CACHE=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --bucket)
            BUCKET_NAME="$2"
            shift 2
            ;;
        --distribution)
            CLOUDFRONT_DISTRIBUTION_ID="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --no-invalidate)
            INVALIDATE_CACHE=false
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --environment ENV          Environment name (default: production)"
            echo "  --bucket NAME              S3 bucket name"
            echo "  --distribution ID          CloudFront distribution ID"
            echo "  --skip-build               Skip building, use existing dist folder"
            echo "  --no-invalidate            Skip CloudFront cache invalidation"
            echo "  --help                     Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
DIST_DIR="$FRONTEND_DIR/dist"

print_info "=========================================="
print_info "  AWS S3 + CloudFront Frontend Deployment"
print_info "=========================================="
echo ""

# Step 1: Verify AWS CLI is installed
print_info "Step 1: Checking AWS CLI installation..."
if ! command -v aws &> /dev/null; then
    print_error "✗ AWS CLI not found. Please install it from: https://aws.amazon.com/cli/"
    exit 1
fi

AWS_VERSION=$(aws --version 2>&1)
print_success "✓ AWS CLI found: $AWS_VERSION"

# Step 2: Verify AWS credentials
print_info "\nStep 2: Verifying AWS credentials..."
if ! IDENTITY=$(aws sts get-caller-identity --output json 2>&1); then
    print_error "✗ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

ACCOUNT=$(echo "$IDENTITY" | jq -r '.Account')
USER_ARN=$(echo "$IDENTITY" | jq -r '.Arn')
print_success "✓ AWS credentials valid"
print_info "  Account: $ACCOUNT"
print_info "  User: $USER_ARN"

# Step 3: Get or validate S3 bucket name
if [ -z "$BUCKET_NAME" ]; then
    print_info "\nStep 3: S3 bucket name not provided."
    print_info "Checking for existing frontend buckets..."
    
    BUCKETS=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'frontend') || contains(Name, 'roastify')].Name" --output json 2>/dev/null || echo "[]")
    BUCKET_COUNT=$(echo "$BUCKETS" | jq '. | length')
    
    if [ "$BUCKET_COUNT" -gt 0 ]; then
        print_info "Found existing buckets:"
        echo "$BUCKETS" | jq -r 'to_entries[] | "  [\(.key)] \(.value)"'
        
        echo ""
        read -p "Select bucket number or press Enter to create new: " SELECTION
        
        if [[ "$SELECTION" =~ ^[0-9]+$ ]] && [ "$SELECTION" -lt "$BUCKET_COUNT" ]; then
            BUCKET_NAME=$(echo "$BUCKETS" | jq -r ".[$SELECTION]")
            print_success "✓ Using existing bucket: $BUCKET_NAME"
        fi
    fi
    
    if [ -z "$BUCKET_NAME" ]; then
        read -p "Enter S3 bucket name (e.g., roastify-frontend-prod): " BUCKET_NAME
        
        if [ -z "$BUCKET_NAME" ]; then
            print_error "✗ Bucket name is required"
            exit 1
        fi
    fi
fi

print_info "\nUsing S3 bucket: $BUCKET_NAME"

# Step 4: Check if bucket exists, create if not
print_info "\nStep 4: Checking S3 bucket..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    print_success "✓ Bucket exists: $BUCKET_NAME"
else
    print_warning "Bucket does not exist. Creating..."
    
    REGION=$(aws configure get region)
    if [ -z "$REGION" ]; then
        REGION="us-east-1"
    fi
    
    # Create bucket
    if [ "$REGION" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "$BUCKET_NAME" --acl private
    else
        aws s3api create-bucket --bucket "$BUCKET_NAME" --acl private \
            --create-bucket-configuration LocationConstraint="$REGION"
    fi
    
    print_success "✓ Bucket created: $BUCKET_NAME"
    
    # Configure bucket for static website hosting
    print_info "Configuring bucket for static website hosting..."
    
    cat > /tmp/website-config.json <<EOF
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}
EOF
    
    aws s3api put-bucket-website --bucket "$BUCKET_NAME" \
        --website-configuration file:///tmp/website-config.json
    rm /tmp/website-config.json
    
    # Set bucket policy for public read access
    cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" \
        --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json
    
    print_success "✓ Bucket configured for static website hosting"
fi

# Step 5: Build frontend
if [ "$SKIP_BUILD" = false ]; then
    print_info "\nStep 5: Building frontend..."
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "✗ Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    print_info "Installing dependencies..."
    npm install
    
    print_info "Building production bundle..."
    NODE_ENV="$ENVIRONMENT" npm run build
    
    if [ ! -d "$DIST_DIR" ]; then
        print_error "✗ Build failed - dist directory not found"
        exit 1
    fi
    
    print_success "✓ Frontend built successfully"
    cd - > /dev/null
else
    print_info "\nStep 5: Skipping build (using existing dist folder)..."
    
    if [ ! -d "$DIST_DIR" ]; then
        print_error "✗ Dist directory not found: $DIST_DIR"
        print_error "  Run without --skip-build flag to build first"
        exit 1
    fi
    
    print_success "✓ Using existing build"
fi

# Step 6: Upload to S3
print_info "\nStep 6: Uploading files to S3..."

# Upload HTML files with no-cache
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME/" \
    --delete \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE

# Upload JS/CSS with long cache (they have hashes in filenames)
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME/" \
    --delete \
    --exclude "*.html" \
    --include "*.js" \
    --include "*.css" \
    --cache-control "public, max-age=31536000, immutable" \
    --metadata-directive REPLACE

# Upload other assets
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME/" \
    --delete \
    --exclude "*.html" \
    --exclude "*.js" \
    --exclude "*.css" \
    --cache-control "public, max-age=86400"

print_success "✓ Files uploaded to S3"

# Get website URL
REGION=$(aws configure get region)
if [ -z "$REGION" ]; then
    REGION="us-east-1"
fi

WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
print_info "\n  S3 Website URL: $WEBSITE_URL"

# Step 7: CloudFront invalidation
if [ "$INVALIDATE_CACHE" = true ]; then
    print_info "\nStep 7: CloudFront cache invalidation..."
    
    if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        print_info "Searching for CloudFront distributions..."
        
        DISTRIBUTIONS=$(aws cloudfront list-distributions \
            --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '$BUCKET_NAME')].{Id:Id,DomainName:DomainName}" \
            --output json 2>/dev/null || echo "[]")
        
        DIST_COUNT=$(echo "$DISTRIBUTIONS" | jq '. | length')
        
        if [ "$DIST_COUNT" -gt 0 ]; then
            print_info "Found CloudFront distributions:"
            echo "$DISTRIBUTIONS" | jq -r 'to_entries[] | "  [\(.key)] \(.value.Id) - \(.value.DomainName)"'
            
            echo ""
            read -p "Select distribution number or press Enter to skip: " SELECTION
            
            if [[ "$SELECTION" =~ ^[0-9]+$ ]] && [ "$SELECTION" -lt "$DIST_COUNT" ]; then
                CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTIONS" | jq -r ".[$SELECTION].Id")
            fi
        else
            print_warning "No CloudFront distributions found for this bucket"
            print_info "You can create one later for better performance and HTTPS support"
        fi
    fi
    
    if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        print_info "Creating invalidation for distribution: $CLOUDFRONT_DISTRIBUTION_ID"
        
        INVALIDATION=$(aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --paths "/*" \
            --output json)
        
        INVALIDATION_ID=$(echo "$INVALIDATION" | jq -r '.Invalidation.Id')
        INVALIDATION_STATUS=$(echo "$INVALIDATION" | jq -r '.Invalidation.Status')
        
        print_success "✓ CloudFront invalidation created"
        print_info "  Invalidation ID: $INVALIDATION_ID"
        print_info "  Status: $INVALIDATION_STATUS"
        print_info "  This may take 5-15 minutes to complete"
        
        # Get CloudFront domain
        DISTRIBUTION=$(aws cloudfront get-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" --output json)
        CLOUDFRONT_DOMAIN=$(echo "$DISTRIBUTION" | jq -r '.Distribution.DomainName')
        CLOUDFRONT_URL="https://$CLOUDFRONT_DOMAIN"
        print_info "\n  CloudFront URL: $CLOUDFRONT_URL"
    else
        print_info "Skipping CloudFront invalidation (no distribution specified)"
    fi
else
    print_info "\nStep 7: Skipping CloudFront invalidation..."
fi

# Summary
FILE_COUNT=$(find "$DIST_DIR" -type f | wc -l)

print_info "\n=========================================="
print_success "  Deployment Complete! ✓"
print_info "=========================================="
echo ""
print_info "Deployment Summary:"
print_info "  Environment: $ENVIRONMENT"
print_info "  S3 Bucket: $BUCKET_NAME"
print_info "  Files Uploaded: $FILE_COUNT"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_info "  CloudFront: $CLOUDFRONT_DISTRIBUTION_ID"
fi

echo ""
print_info "Next Steps:"
print_info "  1. Test the S3 website URL in your browser"

if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_info "  2. (Optional) Create CloudFront distribution for:"
    print_info "     - HTTPS support"
    print_info "     - Custom domain"
    print_info "     - Better performance with CDN"
    print_info "     - Lower costs with caching"
fi

echo ""
print_success "Deployment successful! 🚀"
