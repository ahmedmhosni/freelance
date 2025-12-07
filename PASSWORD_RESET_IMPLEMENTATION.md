# Password Reset Implementation

## ✅ Implementation Complete

Password reset functionality has been added to the Roastify application.

## Features Implemented

### 1. Forgot Password Endpoint
**POST** `/api/v2/auth/forgot-password`

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

**Security Features:**
- Always returns success (prevents email enumeration)
- Generates secure random token (32 bytes)
- Token is hashed before storing in database
- Token expires after 1 hour
- Sends professional email with reset link

### 2. Reset Password Endpoint
**POST** `/api/v2/auth/reset-password`

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "NewSecure123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Security Features:**
- Validates token hasn't expired
- Enforces password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Clears reset token after use
- Hashes password with bcrypt (12 rounds)

## Email Template

Users receive an email with:
- **Subject:** `🔐 Password Reset Request - Roastify`
- **From:** `donotreply@roastify.online`
- **Content:**
  - Professional HTML template
  - Reset button with link
  - Link expires in 1 hour
  - Security warning
  - Support contact

## Database Changes

Uses existing columns in `users` table:
- `password_reset_token` (VARCHAR) - Stores hashed token
- `password_reset_expires` (TIMESTAMP) - Token expiration time

## Testing

### Test Script
```bash
node test-password-reset.js
```

This will:
1. Request password reset for ahmedmhosni90@gmail.com
2. Send email with reset link
3. Test invalid token (should fail)
4. Test weak passwords (should fail)

### Manual Testing Steps

1. **Request Reset:**
```bash
curl -X POST https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/v2/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

2. **Check Email:**
   - Look for email from donotreply@roastify.online
   - Click the reset link or copy the token

3. **Reset Password:**
```bash
curl -X POST https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/v2/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN","newPassword":"NewSecure123"}'
```

4. **Login with New Password:**
```bash
curl -X POST https://roastify-webapp-api-c0hgg2h4f4djcwaf.canadaeast-01.azurewebsites.net/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"NewSecure123"}'
```

## Frontend Integration

### Forgot Password Page

```javascript
const handleForgotPassword = async (email) => {
  try {
    const response = await axios.post('/api/v2/auth/forgot-password', { email });
    // Show success message
    alert('Password reset link sent! Check your email.');
  } catch (error) {
    // Show error
    alert('Failed to send reset link');
  }
};
```

### Reset Password Page

```javascript
const handleResetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post('/api/v2/auth/reset-password', {
      token,
      newPassword
    });
    // Show success and redirect to login
    alert('Password reset successful! Please login.');
    navigate('/login');
  } catch (error) {
    // Show error
    alert(error.response?.data?.error || 'Failed to reset password');
  }
};
```

## Security Considerations

### ✅ Implemented
- Token hashing (SHA-256)
- Token expiration (1 hour)
- Password strength validation
- Email enumeration prevention
- Secure random token generation
- Token cleared after use
- HTTPS only (in production)

### 🔒 Best Practices
- Tokens are single-use
- Old tokens are invalidated
- No sensitive data in URLs
- Rate limiting on endpoints (existing)
- Email sent asynchronously

## Error Handling

### Common Errors

1. **Invalid Email Format**
   - Status: 400
   - Message: "Valid email is required"

2. **Invalid/Expired Token**
   - Status: 401
   - Message: "Invalid or expired reset token"

3. **Weak Password**
   - Status: 400
   - Message: "Password must contain at least one uppercase letter" (etc.)

## Deployment

**Commit:** `331d859` - "feat: Add password reset functionality"

**Files Changed:**
- `backend/src/modules/auth/controllers/AuthController.js`
- `backend/src/modules/auth/services/AuthService.js`

**Deployment Status:**
- ✅ Committed to main branch
- ✅ Pushed to GitHub
- ⏳ Deploying to Azure (5-10 minutes)

## Testing After Deployment

Wait 5-10 minutes for Azure deployment, then run:

```bash
node test-password-reset.js
```

Check your email (ahmedmhosni90@gmail.com) for the reset link!

## Next Steps

1. ✅ Password Reset - COMPLETE
2. ⏳ Email Verification - TODO
3. ⏳ Invoice PDF Generation - TODO
4. ⏳ File Upload - TODO

## Support

If password reset isn't working:
1. Check Azure App Service logs
2. Verify email service is working
3. Check database has reset token columns
4. Verify token hasn't expired (1 hour limit)
