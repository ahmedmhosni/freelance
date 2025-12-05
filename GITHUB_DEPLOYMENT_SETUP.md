# GitHub Actions CI/CD Setup

## 🚀 Quick Setup (10 minutes)

This guide will help you set up automated testing and deployment using GitHub Actions.

## What You Get

✅ **Continuous Integration (CI)**
- Automatic testing on every push
- Frontend and backend tests
- Security scanning
- Build verification

✅ **Continuous Deployment (CD)**
- Automatic deployment to production on `main` branch
- Staging environment support
- Automatic backups before deployment
- Health checks with automatic rollback
- Zero-downtime deployments

## Step 1: Configure GitHub Secrets

Go to your repository settings:
```
https://github.com/ahmedmhosni/freelance/settings/secrets/actions
```

### Required Secrets for Production

Click "New repository secret" and add:

#### 1. EC2_SSH_KEY
- **Name**: `EC2_SSH_KEY`
- **Value**: Copy the entire content of `roastify-key.pem` file
  ```
  -----BEGIN RSA PRIVATE KEY-----
  [your key content]
  -----END RSA PRIVATE KEY-----
  ```

#### 2. EC2_HOST
- **Name**: `EC2_HOST`
- **Value**: `3.77.235.145`

#### 3. EC2_USER
- **Name**: `EC2_USER`
- **Value**: `ec2-user`

#### 4. APP_URL (Optional)
- **Name**: `APP_URL`
- **Value**: Your production URL (e.g., `https://yourapp.com`)

### Optional: Staging Environment Secrets

If you want a staging environment:

- `STAGING_SSH_KEY` - SSH key for staging server
- `STAGING_HOST` - Staging server IP
- `STAGING_USER` - SSH username for staging
- `STAGING_URL` - Staging URL

## Step 2: One-Time Server Setup

### Upload .env file to EC2

```powershell
# Windows PowerShell
scp -i roastify-key.pem backend/.env.production ec2-user@3.77.235.145:/home/ec2-user/roastify/backend/.env
```

```bash
# Linux/Mac
scp -i roastify-key.pem backend/.env.production ec2-user@3.77.235.145:~/roastify/backend/.env
```

### Create required directories

```bash
ssh -i roastify-key.pem ec2-user@3.77.235.145
mkdir -p ~/roastify/backend
mkdir -p ~/roastify/backups
exit
```

## Step 3: Configure GitHub Environments (Optional but Recommended)

This adds deployment protection and visibility.

1. Go to: `Settings` → `Environments`
2. Create `production` environment
3. Add protection rules:
   - ✅ Required reviewers (optional)
   - ✅ Wait timer (optional)
4. Add environment secrets (same as above)

## Step 4: Test the Pipeline

### Automatic Deployment

Push to `main` branch:
```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

This will:
1. ✅ Run all tests (CI)
2. ✅ Deploy to production (CD)
3. ✅ Create backup
4. ✅ Run health checks
5. ✅ Rollback if anything fails

### Manual Deployment

1. Go to: https://github.com/ahmedmhosni/freelance/actions
2. Click "CD - Deploy to AWS"
3. Click "Run workflow"
4. Select branch and environment
5. Click "Run workflow"

## Step 5: Monitor Deployment

### View Deployment Status

Check progress at:
```
https://github.com/ahmedmhosni/freelance/actions
```

### Check Application Logs

```bash
ssh -i roastify-key.pem ec2-user@3.77.235.145
pm2 logs roastify-backend
pm2 status
```

## Workflows Overview

### 1. CI Workflow (ci.yml)
**Triggers**: Push or PR to `main`, `kiro`, `develop`

**What it does**:
- Runs backend tests with PostgreSQL
- Runs frontend tests and builds
- Scans for security vulnerabilities
- Uploads test coverage

### 2. Production Deployment (deploy.yml)
**Triggers**: Push to `main` or manual

**What it does**:
- Runs full test suite first
- Creates backup of current version
- Deploys new version
- Runs health checks (6 attempts)
- Automatically rolls back if health check fails
- Keeps last 5 backups

### 3. Staging Deployment (deploy-staging.yml)
**Triggers**: Push to `develop`/`staging` or manual

**What it does**:
- Same as production but deploys to staging server
- Test changes before production

## Rollback

### Automatic Rollback

If deployment fails health checks, it automatically:
1. Stops the new version
2. Restores from backup
3. Starts previous version

### Manual Rollback

**Using script**:
```bash
# Make script executable
chmod +x scripts/rollback.sh

# List available backups
./scripts/rollback.sh production

# Rollback to specific backup
./scripts/rollback.sh production 20231215_143022
```

**Via SSH**:
```bash
ssh -i roastify-key.pem ec2-user@3.77.235.145
ls -lht ~/roastify/backups/
# Choose a backup and restore
```

## Local Deployment Scripts

### Deploy from your machine

```bash
# Make scripts executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging
```

## Troubleshooting

### Deployment Fails

**Check GitHub Actions logs**:
1. Go to Actions tab
2. Click failed workflow
3. Review error messages

**Check server logs**:
```bash
ssh -i roastify-key.pem ec2-user@3.77.235.145
pm2 logs roastify-backend --lines 100
pm2 status
```

### Health Check Fails

Common issues:
- Database connection error (check .env)
- Port already in use
- Missing dependencies
- Application crash on startup

**Fix**:
```bash
ssh -i roastify-key.pem ec2-user@3.77.235.145
cd ~/roastify/backend
cat .env  # Verify environment variables
pm2 logs roastify-backend  # Check error logs
```

### Tests Fail in CI

**Run tests locally**:
```bash
cd backend
npm test
```

**Check test logs in GitHub Actions**

### SSH Connection Issues

**Test connection**:
```bash
ssh -i roastify-key.pem ec2-user@3.77.235.145 "echo 'Success'"
```

**Fix key permissions**:
```bash
chmod 600 roastify-key.pem
```

## Best Practices

### Branch Strategy

```
main (production)
  ↑
  └── develop (staging)
        ↑
        └── feature/your-feature
```

1. Create feature branch from `develop`
2. Develop and test locally
3. Push to `develop` → deploys to staging
4. Test on staging
5. Merge to `main` → deploys to production

### Before Deploying

- ✅ Run tests locally
- ✅ Test on staging first
- ✅ Review changes carefully
- ✅ Have rollback plan ready
- ✅ Monitor logs after deployment

## Advanced Features

### Add Slack Notifications

Add to your workflow:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Database Migrations

Add migration step in deployment:
```bash
npm run migrate
```

## Documentation

For detailed information, see:
- [CI/CD Guide](docs/CICD_GUIDE.md) - Complete pipeline documentation
- [Deployment Guide](aws-deployment/DEPLOYMENT_GUIDE.md) - AWS setup

## Support

If you encounter issues:
1. Check workflow logs in Actions tab
2. Review server logs with `pm2 logs`
3. Verify secrets are configured
4. Test SSH connection
5. Check EC2 security groups

## Next Steps

1. ✅ Set up branch protection rules
2. ✅ Configure staging environment
3. ✅ Add deployment notifications
4. ✅ Set up monitoring (CloudWatch)
5. ✅ Configure automated backups
