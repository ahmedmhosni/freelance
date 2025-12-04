# GitHub Actions Deployment Setup

## Quick Setup (5 minutes)

### Step 1: Add GitHub Secrets

Go to your repository: https://github.com/ahmedmhosni/freelance/settings/secrets/actions

Add these 3 secrets:

#### 1. EC2_SSH_KEY
- Click "New repository secret"
- Name: `EC2_SSH_KEY`
- Value: Copy the entire content of `roastify-key.pem` file
  ```
  -----BEGIN RSA PRIVATE KEY-----
  [your key content]
  -----END RSA PRIVATE KEY-----
  ```

#### 2. EC2_HOST
- Name: `EC2_HOST`
- Value: `3.77.235.145`

#### 3. EC2_USER
- Name: `EC2_USER`
- Value: `ec2-user`

### Step 2: Upload .env file to EC2 (One-time setup)

The .env.production file needs to be on the server:

```powershell
scp -i roastify-key.pem backend/.env.production ec2-user@3.77.235.145:/home/ec2-user/roastify/backend/.env
```

### Step 3: Deploy!

Now every time you push to `main` or `kiro` branch, GitHub Actions will automatically:
1. Build your backend
2. Upload to EC2
3. Restart the application
4. Check health

### Manual Deployment

You can also trigger deployment manually:
1. Go to: https://github.com/ahmedmhosni/freelance/actions
2. Click "Deploy to AWS EC2"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### View Deployment Status

Check deployment progress at:
https://github.com/ahmedmhosni/freelance/actions

## Troubleshooting

### If deployment fails:

1. Check the GitHub Actions logs
2. SSH into server and check PM2 logs:
   ```bash
   ssh -i roastify-key.pem ec2-user@3.77.235.145
   pm2 logs roastify-backend
   ```

3. Check if .env file exists:
   ```bash
   ssh -i roastify-key.pem ec2-user@3.77.235.145 "ls -la ~/roastify/backend/.env"
   ```

## Next Steps

1. Merge `kiro` branch to `main` for production deployments
2. Set up branch protection rules
3. Add deployment notifications (Slack/Discord)
