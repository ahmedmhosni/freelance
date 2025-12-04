# AWS Deployment Variables
# Update these values for your deployment

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name (used for resource naming)"
  type        = string
  default     = "roastify"
}

variable "domain_name" {
  description = "Your domain name"
  type        = string
  default     = "roastify.online"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# EC2 Configuration
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"  # Free tier eligible
}

variable "key_pair_name" {
  description = "SSH key pair name"
  type        = string
  default     = "roastify-key"
}

# RDS Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"  # Free tier eligible
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "roastify"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  # Set this via environment variable: TF_VAR_db_password
}

variable "db_allocated_storage" {
  description = "Database storage in GB"
  type        = number
  default     = 20  # Free tier limit
}

# SSH Configuration
variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
  # Set this via environment variable: TF_VAR_ssh_public_key
  # Generate with: ssh-keygen -t rsa -b 4096 -f ~/.ssh/roastify-key
}

# ACM Certificate (optional, for HTTPS)
variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}

# Network Configuration
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "MyApp"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
