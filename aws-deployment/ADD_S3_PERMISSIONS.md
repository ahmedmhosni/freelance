# Add S3 Permissions to IAM User

Your AWS user `ahmedmhosni` needs S3 permissions to deploy the frontend.

## Quick Fix (5 minutes)

### Option 1: Using AWS Console (Recommended)

1. **Go to IAM Console**:
   - Open https://console.aws.amazon.com/iam/
   - Click "Users" in the left sidebar
   - Click on user: `ahmedmhosni`

2. **Add Permissions**:
   - Click "Add permissions" button
   - Select "Attach policies directly"
   - Search for and select these policies:
     - ✅ `AmazonS3FullAccess`
     - ✅ `CloudFrontFullAccess` (optional, for CDN later)
   - Click "Next"
   - Click "Add permissions"

3. **Verify**:
   - You should see the policies listed under "Permissions policies"

### Option 2: Using AWS CLI

Run this command:

```powershell
$awsPath = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

# Attach S3 Full Access policy
& $awsPath iam attach-user-policy `
    --user-name ahmedmhosni `
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Attach CloudFront Full Access policy (optional)
& $awsPath iam attach-user-policy `
    --user-name ahmedmhosni `
    --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

Write-Host "Permissions added successfully!" -ForegroundColor Green
```

## After Adding Permissions

Once permissions are added, run the deployment again:

```powershell
# Navigate to project root
cd C:\Users\ahmed\Downloads\freelancemanagment

# Run deployment
.\aws-deployment\scripts\deploy-frontend-simple.ps1 -BucketName "roastify-frontend-prod-2024"
```

## Alternative: Create Bucket Manually

If you prefer to create the bucket manually:

1. **Go to S3 Console**:
   - Open https://s3.console.aws.amazon.com/
   - Click "Create bucket"

2. **Configure Bucket**:
   - Bucket name: `roastify-frontend-prod-2024`
   - Region: `us-east-1`
   - Uncheck "Block all public access"
   - Check the acknowledgment box
   - Click "Create bucket"

3. **Enable Static Website Hosting**:
   - Click on the bucket name
   - Go to "Properties" tab
   - Scroll to "Static website hosting"
   - Click "Edit"
   - Enable static website hosting
   - Index document: `index.html`
   - Error document: `index.html`
   - Click "Save changes"

4. **Set Bucket Policy**:
   - Go to "Permissions" tab
   - Scroll to "Bucket policy"
   - Click "Edit"
   - Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::roastify-frontend-prod-2024/*"
        }
    ]
}
```

   - Click "Save changes"

5. **Upload Files**:
   ```powershell
   $awsPath = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
   & $awsPath s3 sync .\frontend\dist\ s3://roastify-frontend-prod-2024/ --delete
   ```

6. **Get Website URL**:
   - Go to bucket "Properties" tab
   - Scroll to "Static website hosting"
   - Copy the "Bucket website endpoint"
   - Example: `http://roastify-frontend-prod-2024.s3-website-us-east-1.amazonaws.com`

## Troubleshooting

### "Access Denied" Errors
- Make sure you added the S3 permissions
- Wait 1-2 minutes for permissions to propagate
- Try logging out and back into AWS Console

### "Bucket Name Already Exists"
- S3 bucket names are globally unique
- Try a different name: `roastify-frontend-prod-YOUR_NAME-2024`

### "Invalid JSON" Errors
- Use the AWS Console to set bucket policy instead
- Copy-paste the JSON policy directly in the console

## Next Steps

After successful deployment:

1. ✅ Test the S3 website URL
2. ⬜ Set up CloudFront for HTTPS
3. ⬜ Configure custom domain
4. ⬜ Set up CI/CD for automatic deployments

---

**Need Help?**

Check the complete guides:
- `aws-deployment/AWS_SETUP_GUIDE.md`
- `aws-deployment/FRONTEND_DEPLOYMENT_GUIDE.md`
