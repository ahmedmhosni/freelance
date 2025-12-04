#!/bin/bash
# AWS Setup Script
# This script helps set up AWS credentials and generate necessary keys

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AWS Deployment Setup ===${NC}"
echo ""
echo "This script will help you set up everything needed for AWS deployment."
echo ""

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI is not installed${NC}"
    echo "Install from: https://aws.amazon.com/cli/"
    exit 1
else
    echo -e "${GREEN}✓ AWS CLI installed${NC}"
fi

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}✗ Terraform is not installed${NC}"
    echo "Install from: https://www.terraform.io/downloads"
    exit 1
else
    echo -e "${GREEN}✓ Terraform installed${NC}"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Install from: https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✓ Node.js installed ($(node --version))${NC}"
fi

echo ""
echo -e "${BLUE}Step 1: AWS Credentials${NC}"
echo ""

# Check if AWS is configured
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✓ AWS CLI is already configured${NC}"
    aws sts get-caller-identity
    echo ""
    read -p "Do you want to reconfigure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        aws configure
    fi
else
    echo -e "${YELLOW}AWS CLI is not configured${NC}"
    echo "You'll need:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Default region (e.g., us-east-1)"
    echo ""
    read -p "Configure now? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        aws configure
    else
        echo -e "${RED}AWS configuration required to continue${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Step 2: SSH Key Pair${NC}"
echo ""

SSH_KEY="$HOME/.ssh/roastify-key"

if [ -f "$SSH_KEY" ]; then
    echo -e "${GREEN}✓ SSH key already exists at $SSH_KEY${NC}"
    echo ""
    read -p "Do you want to generate a new key? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        GENERATE_KEY=false
    else
        GENERATE_KEY=true
    fi
else
    GENERATE_KEY=true
fi

if [ "$GENERATE_KEY" = true ]; then
    echo "Generating new SSH key pair..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY" -N "" -C "roastify-deployment"
    chmod 600 "$SSH_KEY"
    chmod 644 "$SSH_KEY.pub"
    echo -e "${GREEN}✓ SSH key generated${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Database Password${NC}"
echo ""

# Generate strong database password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "Generated database password:"
echo -e "${YELLOW}$DB_PASSWORD${NC}"
echo ""
echo -e "${RED}IMPORTANT: Save this password securely!${NC}"
echo "You'll need it for:"
echo "  - Terraform deployment (TF_VAR_db_password)"
echo "  - Backend .env.production file"
echo ""
read -p "Press Enter to continue..."

echo ""
echo -e "${BLUE}Step 4: JWT Secret${NC}"
echo ""

# Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "Generated JWT secret:"
echo -e "${YELLOW}$JWT_SECRET${NC}"
echo ""
echo -e "${RED}IMPORTANT: Save this secret securely!${NC}"
echo "You'll need it for the backend .env.production file"
echo ""
read -p "Press Enter to continue..."

echo ""
echo -e "${BLUE}Step 5: Environment Variables${NC}"
echo ""

# Create terraform.tfvars if it doesn't exist
TERRAFORM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../terraform" && pwd)"
TFVARS_FILE="$TERRAFORM_DIR/terraform.tfvars"

if [ ! -f "$TFVARS_FILE" ]; then
    echo "Creating terraform.tfvars..."
    cat > "$TFVARS_FILE" << EOF
# AWS Configuration
aws_region = "us-east-1"
app_name   = "roastify"
environment = "production"

# Domain Configuration
domain_name = "roastify.online"

# EC2 Configuration
instance_type = "t3.micro"
key_pair_name = "roastify-key"

# RDS Configuration
db_instance_class = "db.t3.micro"
db_engine_version = "15.4"
db_name          = "roastify"
db_username      = "dbadmin"
# db_password set via environment variable TF_VAR_db_password

# Network Configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Tags
tags = {
  Project     = "Roastify"
  Environment = "Production"
  ManagedBy   = "Terraform"
}
EOF
    echo -e "${GREEN}✓ Created terraform.tfvars${NC}"
else
    echo -e "${GREEN}✓ terraform.tfvars already exists${NC}"
fi

# Create .env.production if it doesn't exist
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../backend" && pwd)"
ENV_PROD_FILE="$BACKEND_DIR/.env.production"

if [ ! -f "$ENV_PROD_FILE" ]; then
    echo "Creating .env.production template..."
    cp "$BACKEND_DIR/.env.production.template" "$ENV_PROD_FILE"
    
    # Update with generated values
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$ENV_PROD_FILE"
    sed -i.bak "s/PG_PASSWORD=.*/PG_PASSWORD=$DB_PASSWORD/" "$ENV_PROD_FILE"
    rm "$ENV_PROD_FILE.bak"
    
    echo -e "${GREEN}✓ Created .env.production${NC}"
    echo -e "${YELLOW}Note: You'll need to update PG_HOST after Terraform deployment${NC}"
else
    echo -e "${GREEN}✓ .env.production already exists${NC}"
fi

# Create environment setup script
ENV_SCRIPT="$TERRAFORM_DIR/set-env.sh"
cat > "$ENV_SCRIPT" << EOF
#!/bin/bash
# Source this file to set Terraform environment variables
# Usage: source set-env.sh

export TF_VAR_db_password="$DB_PASSWORD"
export TF_VAR_ssh_public_key="\$(cat $SSH_KEY.pub)"

echo "Environment variables set:"
echo "  TF_VAR_db_password: [HIDDEN]"
echo "  TF_VAR_ssh_public_key: \$(echo \$TF_VAR_ssh_public_key | cut -c1-50)..."
EOF
chmod +x "$ENV_SCRIPT"

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "Summary of generated credentials:"
echo ""
echo "1. SSH Key:"
echo "   Location: $SSH_KEY"
echo "   Public key: $SSH_KEY.pub"
echo ""
echo "2. Database Password:"
echo "   Password: $DB_PASSWORD"
echo ""
echo "3. JWT Secret:"
echo "   Secret: $JWT_SECRET"
echo ""
echo "4. Configuration Files:"
echo "   Terraform: $TFVARS_FILE"
echo "   Backend: $ENV_PROD_FILE"
echo "   Env Script: $ENV_SCRIPT"
echo ""
echo -e "${YELLOW}IMPORTANT: Save these credentials in a secure password manager!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Review and update configuration files:"
echo "   - $TFVARS_FILE"
echo "   - $ENV_PROD_FILE"
echo ""
echo "2. Set environment variables for Terraform:"
echo "   cd $TERRAFORM_DIR"
echo "   source set-env.sh"
echo ""
echo "3. Deploy infrastructure:"
echo "   terraform init"
echo "   terraform plan"
echo "   terraform apply"
echo ""
echo "4. After deployment, update .env.production with RDS endpoint:"
echo "   terraform output rds_address"
echo ""
echo "5. Deploy application:"
echo "   cd $(dirname "${BASH_SOURCE[0]}")"
echo "   ./deploy-backend.sh"
echo "   ./deploy-frontend.sh"
echo ""
