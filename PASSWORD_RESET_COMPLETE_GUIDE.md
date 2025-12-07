# Password Reset Feature - Complete Implementation Guide

## ✅ Implementation Status

### Backend Implementation
- ✅ AuthController: Added `forgotPassword` and `resetPassword` routes
- ✅ AuthService: Implemented password reset logic with secure token generation
- ✅ Email Service: Added password reset email template with proper styling
- ✅ Database Schema: Added `password_reset_token` and `password_reset_expires` columns
- ✅ Password Validation: Synchronized requirements (8+ chars, uppercase, lowercase, number, special char)

### Code Locations
```
backend/src/modules/auth/controllers/AuthController.js  (lines 19-20, 213-263)
backend/src/modules/auth/services/AuthService.js        (lines 232-318)
backend/src/services/emailService.js                    (lines 145-227)
```

## 🔧 How It Works

### 1. Request Password Reset
**Endpoint:** `POST /api/v2/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Process:**
1. User submits email address
2. System checks if user exists (doesn't reveal if email is registered)
3. Generates secure random token (32 bytes)
4. Hashes token with SHA-256 before storing
5. Saves hashed token and expiry (1 hour) to database
6. Sends email with reset link containing plain token
7. Always returns success to prevent email enumeration

### 2. Reset Password
**Endpoint:** `POST /api/v2/auth/reset-password`

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "NewSecure123!@#"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Process:**
1. Validates password strength (8+ chars, uppercase, lowercase, number, special char)
2. Hashes provided token with SHA-256
3. Looks up user with matching token that hasn't expired
4. Hashes new password with bcrypt (12 rounds)
5. Updates password and clears reset token
6. Returns success

## 🔒 Security Features

1. **Token Hashing**: Reset tokens are hashed before storage (SHA-256)
2. **Token Expiry**: Tokens expire after 1 hour
3. **One-Time Use**: Tokens are cleared after successful reset
4. **Email Enumeration Prevention**: Always returns success message
5. **Strong Password Requirements**: Enforced on both frontend and backend
6. **Secure Random Generation**: Uses crypto.randomBytes(32)

## 📧 Email Template

The password reset email includes:
- Professional styling matching your brand
- Clear call-to-action button
- Fallback link for copy/paste
- Security warning
- 1-hour expiry notice
- Support contact information

Subject: "🔐 Password Reset Request - Roastify"

## 🧪 Testing

### Test Scripts Available
```bash
# Test on Azure production
node test-password-reset.js

# Test locally
node test-password-reset-local.js

# Detailed debugging
node test-password-reset-detailed.js

# Check database schema
node check-azure-password-reset.js
```

### Manual Testing Steps

1. **Request Reset:**
```bash
curl -X POST https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/v2/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmedmhosni90@gmail.com"}'
```

2. **Check Email:**
- Look for email with subject "🔐 Password Reset Request - Roastify"
- Check spam folder if not in inbox
- Copy the token from the URL (after `?token=`)

3. **Reset Password:**
```bash
curl -X POST https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/v2/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE","newPassword":"NewPassword123!@#"}'
```

4. **Test Login:**
```bash
curl -X POST https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmedmhosni90@gmail.com","password":"NewPassword123!@#"}'
```

## ⚠️ Current Issue

**Problem:** Azure production server returning 404 for all routes

**Possible Causes:**
1. GitHub Actions deployment failed
2. Azure Web App needs restart
3. Environment variables not configured
4. App not starting correctly

**Solutions:**

### Option 1: Check GitHub Actions
1. Go to https://github.com/ahmedmhosni/freelance/actions
2. Look for latest "Build and deploy Node.js app to Azure Web App" workflow
3. Check if it succeeded or failed
4. Review logs if failed

### Option 2: Restart Azure Web App
Via Azure Portal:
1. Go to https://portal.azure.com
2. Navigate to: App Services > roastify-webapp-api
3. Click "Restart" button
4. Wait 2-3 minutes

Via Azure CLI:
```bash
az webapp restart --name roastify-webapp-api --resource-group roastify-rg
```

### Option 3: Check Logs
1. Azure Portal > App Services > roastify-webapp-api
2. Click "Log stream" in left menu
3. Look for startup errors
4. Check environment variables are set

## 📝 Database Schema

```sql
-- Already applied to Azure database
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
```

Verified on Azure: ✅ Columns exist

## 🎯 Next Steps

1. **Fix Azure Deployment**
   - Check GitHub Actions status
   - Restart Azure Web App if needed
   - Monitor deployment logs

2. **Test Password Reset**
   - Run test scripts
   - Verify email delivery
   - Test complete flow

3. **Frontend Integration** (if needed)
   - Create forgot-password page
   - Create reset-password page
   - Add form validation
   - Handle success/error states

## 📚 Related Documentation

- `PASSWORD_RESET_IMPLEMENTATION.md` - Implementation details
- `PASSWORD_VALIDATION_SYNC.md` - Password validation rules
- `AZURE_DEPLOYMENT_FIX.md` - Deployment troubleshooting
- `EMAIL_SUBJECTS_UPDATED.md` - Email service updates

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v2/auth/forgot-password` | Request password reset | No |
| POST | `/api/v2/auth/reset-password` | Reset password with token | No |
| POST | `/api/v2/auth/login` | Login with new password | No |

## ✨ Features

- ✅ Secure token generation and storage
- ✅ Email delivery via Azure Communication Services
- ✅ Professional email templates
- ✅ Token expiry (1 hour)
- ✅ Strong password validation
- ✅ Email enumeration prevention
- ✅ One-time use tokens
- ✅ Clear error messages
- ✅ Comprehensive testing scripts

## 🐛 Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify Azure Communication Services is configured
- Check `AZURE_COMMUNICATION_CONNECTION_STRING` environment variable
- Review email service logs

### Invalid Token Error
- Token may have expired (1 hour limit)
- Token may have been used already
- Request a new reset link

### Password Validation Errors
Password must have:
- At least 8 characters
- One uppercase letter (A-Z)
- One lowercase letter (a-z)
- One number (0-9)
- One special character (!@#$%^&*(),.?":{}|<>)

### 404 Errors
- Azure deployment may not be complete
- Check GitHub Actions workflow
- Restart Azure Web App
- Verify routes are registered in AuthController

## 📞 Support

For issues or questions:
- Check application logs in Azure Portal
- Review GitHub Actions deployment logs
- Test locally first to isolate issues
- Verify database schema is correct
