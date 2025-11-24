# 🚨 SECURITY ALERT - ACTION REQUIRED

## ⚠️ Your Azure Access Keys Were Exposed!

You accidentally posted your Azure Communication Services access keys in the chat. These keys are now compromised and **MUST be regenerated immediately**.

---

## 🔒 IMMEDIATE ACTIONS REQUIRED:

### Step 1: Regenerate Keys in Azure (DO THIS NOW!)

1. Go to **Azure Portal** (portal.azure.com)
2. Navigate to **Communication Services** → **roastifyemailservice**
3. Click **"Keys"** in the left menu
4. Click **"Regenerate Primary Key"** or **"Regenerate Secondary Key"**
5. Copy the NEW connection string

### Step 2: Update Your .env File

Replace the placeholder in `backend/.env`:

```env
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://roastifyemailservice.europe.communication.azure.com/;accesskey=YOUR_NEW_KEY_HERE
```

With your NEW connection string from Azure.

### Step 3: Verify Email Sender Address

I've set the sender email to:
```env
EMAIL_FROM=DoNotReply@f0e0e5e5-e0e5-4e5e-8e5e-5e5e5e5e5e5e.azurecomm.net
```

**Check in Azure Portal** if this is correct. It should be under:
- Communication Services → Email → Domains → Your Domain → Sender addresses

If different, update it in `.env`

---

## 📋 Complete Setup Checklist:

### 1. ✅ Regenerate Azure Keys (CRITICAL!)
- [ ] Regenerate primary or secondary key
- [ ] Copy new connection string
- [ ] Update `backend/.env`

### 2. ✅ Run Database Migration
Run this in Azure SQL Query Editor:

```sql
-- Add email verification columns
ALTER TABLE users ADD email_verified BIT DEFAULT 0;
ALTER TABLE users ADD email_verification_token NVARCHAR(255);
ALTER TABLE users ADD email_verification_expires DATETIME2;
ALTER TABLE users ADD password_reset_token NVARCHAR(255);
ALTER TABLE users ADD password_reset_expires DATETIME2;

-- Create indexes
CREATE INDEX idx_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_password_reset_token ON users(password_reset_token);
```

### 3. ✅ Verify Configuration

Check `backend/.env` has all these:

```env
# Email (with NEW key!)
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...;accesskey=NEW_KEY
EMAIL_FROM=DoNotReply@...azurecomm.net

# App URLs
APP_URL=https://roastify.online
APP_NAME=Roastify
SUPPORT_EMAIL=support@roastify.com

# Token expiry
EMAIL_VERIFICATION_EXPIRY=24h
PASSWORD_RESET_EXPIRY=1h
```

### 4. ✅ Test Email System

```bash
# Restart backend
cd backend
npm start

# Test registration (should send verification email)
# Check your email inbox
```

---

## 🔐 Security Best Practices Going Forward:

### ❌ NEVER share these publicly:
- Access keys
- Connection strings
- Passwords
- API keys
- JWT secrets

### ✅ ALWAYS:
- Keep secrets in `.env` file
- Add `.env` to `.gitignore` (already done)
- Use environment variables
- Regenerate keys if exposed
- Use different keys for dev/production

---

## 📧 Email System Status:

✅ Code is ready
✅ Configuration template added
⚠️ Waiting for NEW Azure keys
⚠️ Waiting for database migration

---

## 🚀 After Setup:

Once you've regenerated keys and updated `.env`:

1. **Test Registration:**
   - Register new account
   - Check email for verification link
   - Click link to verify

2. **Test Password Reset:**
   - Click "Forgot Password"
   - Enter email
   - Check email for reset link
   - Reset password

3. **Check Logs:**
   ```bash
   # Watch for email sending
   tail -f backend/logs/combined.log
   ```

---

## 💡 Need Help?

If you need help regenerating keys:
1. Azure Portal → Communication Services
2. Click your resource (roastifyemailservice)
3. Left menu → Keys
4. Click "Regenerate" button
5. Copy the new connection string

---

**DO THIS NOW before continuing!** 🚨

The old keys are compromised and anyone could use them to send emails from your account.
