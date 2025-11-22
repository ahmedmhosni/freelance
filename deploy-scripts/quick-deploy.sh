#!/bin/bash

# Quick deployment script for Google Cloud VM
# Run this from your LOCAL machine

set -e

VM_NAME="project-management-vm"
ZONE="us-central1-a"
PROJECT_ID="YOUR_PROJECT_ID"

echo "=== Quick Deploy to Google Cloud ==="
echo "VM: $VM_NAME"
echo "Zone: $ZONE"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "Setting project..."
gcloud config set project $PROJECT_ID

# Upload files
echo "Uploading backend..."
gcloud compute scp --recurse ./backend $VM_NAME:/var/app/ --zone=$ZONE

echo "Uploading frontend..."
gcloud compute scp --recurse ./frontend $VM_NAME:/var/app/ --zone=$ZONE

echo "Uploading deployment scripts..."
gcloud compute scp --recurse ./deploy-scripts $VM_NAME:/tmp/ --zone=$ZONE

echo "Uploading ecosystem config..."
gcloud compute scp ecosystem.config.js $VM_NAME:/var/app/ --zone=$ZONE

# Deploy
echo "Deploying application..."
gcloud compute ssh $VM_NAME --zone=$ZONE --command="
    chmod +x /tmp/deploy-scripts/*.sh
    /tmp/deploy-scripts/deploy-backend.sh
    /tmp/deploy-scripts/deploy-frontend.sh
"

# Get VM IP
VM_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo ""
echo "=== Deployment Complete! ==="
echo "Your application is available at: http://$VM_IP"
echo ""
echo "Useful commands:"
echo "  SSH into VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
echo "  View logs: gcloud compute ssh $VM_NAME --zone=$ZONE --command='pm2 logs backend'"
echo "  Check status: gcloud compute ssh $VM_NAME --zone=$ZONE --command='pm2 status'"
