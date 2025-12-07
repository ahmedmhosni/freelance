# Azure Blob Storage Proxy - Hide Blob URLs Behind Your Domain

## ✅ Implementation Complete

Your Azure Blob Storage URLs are now proxied through your domain for better branding, security, and control.

## 🔄 How It Works

### Before (Direct Blob URL):
```
https://yourstorage.blob.core.windows.net/feedback-screenshots/feedback-123-1701234567890.png
```

### After (Proxied URL):
```
https://roastify.online/api/media/feedback/feedback-123-1701234567890.png
```

## 🎯 Benefits

### 1. **Better Branding**
- URLs show your domain instead of Azure's
- Professional appearance
- Consistent with your brand

### 2. **Security**
- Hide storage account name
- Control access through authentication
- Prevent direct blob access
- Add custom authorization logic

### 3. **Flexibility**
- Easy to migrate storage providers
- Add watermarks or transformations
- Track downloads/analytics
- Implement rate limiting

### 4. **Control**
- Revoke access without deleting files
- Add expiration logic
- Implement download limits
- Custom caching strategies

## 📁 Files Created/Modified

### 1. New Media Proxy Route
**File:** `backend/src/routes/media.js`

**Endpoints:**
- `GET /api/media/feedback/:filename` - Feedback screenshots (auth required)
- `GET /api/media/profile/:filename` - Profile pictures (public)

**Features:**
- Streams files from Azure Blob Storage
- Validates filenames (prevents path traversal)
- Sets proper content types
- Implements caching headers
- Handles errors gracefully

### 2. Updated Feedback Route
**File:** `backend/src/routes/feedback.js`

**Changes:**
- Stores proxied URL instead of direct blob URL
- Uses `APP_URL` environment variable
- Format: `{APP_URL}/api/media/feedback/{filename}`

### 3. Server Configuration
**File:** `backend/src/server.js`

**Changes:**
- Registered media routes: `app.use('/api/media', mediaRoutes)`

## 🔧 Implementation Details

### Media Proxy Endpoint

```javascript
GET /api/media/feedback/:filename
Authorization: Bearer {token}
```

**Process:**
1. Validates authentication token
2. Validates filename (security check)
3. Connects to Azure Blob Storage
4. Checks if file exists
5. Gets file properties (content type, size)
6. Streams file to response
7. Sets caching headers

**Security Features:**
- Path traversal prevention (`..` and `/` blocked)
- Authentication required
- File existence check
- Proper error handling

### URL Format

**Stored in Database:**
```
https://roastify.online/api/media/feedback/feedback-123-1701234567890.png
```

**Actual Blob Location:**
```
Container: feedback-screenshots
Blob: feedback-123-1701234567890.png
```

## 🚀 Usage

### Frontend (Automatic)
No changes needed! The URLs stored in the database are already proxied.

```jsx
// In FeedbackManager or anywhere displaying screenshots
<img src={feedback.screenshot_url} alt="Screenshot" />
// URL is already: https://roastify.online/api/media/feedback/...
```

### API Response
```json
{
  "feedback": {
    "id": 1,
    "screenshot_url": "https://roastify.online/api/media/feedback/feedback-123-1701234567890.png"
  }
}
```

## 🔒 Security Features

### 1. Authentication
- Feedback screenshots require valid JWT token
- Profile pictures can be public or protected

### 2. Filename Validation
```javascript
// Prevents path traversal attacks
if (filename.includes('..') || filename.includes('/')) {
  throw new AppError('Invalid filename', 400);
}
```

### 3. Container Isolation
- Each media type has its own container
- Prevents cross-container access

### 4. Error Handling
- 404 for missing files
- 400 for invalid filenames
- 500 for server errors
- No information leakage

## 📊 Performance Optimization

### Caching Headers
```javascript
res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
res.setHeader('ETag', properties.etag);
```

**Benefits:**
- Browser caching reduces server load
- CDN-friendly headers
- Conditional requests with ETags
- Faster subsequent loads

### Streaming
- Files are streamed, not loaded into memory
- Efficient for large files
- Low memory footprint
- Fast response times

## 🌐 CDN Integration (Optional)

You can add a CDN in front of your media endpoints:

### Option 1: Azure CDN
```
https://cdn.roastify.online/api/media/feedback/...
```

### Option 2: Cloudflare
- Point Cloudflare to your domain
- Media URLs automatically cached
- Global distribution
- DDoS protection

## 🔄 Migration Guide

### For Existing Data

If you have existing feedback with direct blob URLs, run this migration:

```javascript
// migration-script.js
const { query } = require('./backend/src/db/postgresql');

async function migrateUrls() {
  const appUrl = process.env.APP_URL || 'https://roastify.online';
  
  const result = await query(`
    SELECT id, screenshot_url 
    FROM feedback 
    WHERE screenshot_url LIKE '%blob.core.windows.net%'
  `);

  for (const row of result.rows) {
    // Extract filename from blob URL
    const filename = row.screenshot_url.split('/').pop();
    const newUrl = `${appUrl}/api/media/feedback/${filename}`;
    
    await query(
      'UPDATE feedback SET screenshot_url = $1 WHERE id = $2',
      [newUrl, row.id]
    );
  }

  console.log(`Migrated ${result.rows.length} URLs`);
}

migrateUrls();
```

## 📝 Environment Variables

Add to your `.env`:

```env
# Application URL (for proxied media URLs)
APP_URL=https://roastify.online

# Azure Storage (still needed for backend access)
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
```

## 🧪 Testing

### Test Proxied URL
```bash
# Get auth token
TOKEN=$(curl -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# Access proxied image
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/media/feedback/feedback-123-1701234567890.png \
  --output test-image.png
```

### Test in Browser
1. Login to your app
2. Submit feedback with screenshot
3. View feedback in admin panel
4. Image URL should be: `https://roastify.online/api/media/feedback/...`
5. Click image to verify it loads

## 🎨 Advanced Features (Optional)

### 1. Image Transformations
Add image resizing/optimization:

```javascript
const sharp = require('sharp');

router.get('/feedback/:filename', authenticateToken, async (req, res) => {
  const { width, height, quality } = req.query;
  
  // ... get blob ...
  
  if (width || height) {
    const transformer = sharp()
      .resize(parseInt(width), parseInt(height))
      .jpeg({ quality: parseInt(quality) || 80 });
    
    downloadResponse.readableStreamBody
      .pipe(transformer)
      .pipe(res);
  } else {
    downloadResponse.readableStreamBody.pipe(res);
  }
});
```

### 2. Download Analytics
Track who downloads what:

```javascript
await query(
  'INSERT INTO media_downloads (user_id, filename, downloaded_at) VALUES ($1, $2, NOW())',
  [req.user.id, filename]
);
```

### 3. Watermarking
Add watermarks to images:

```javascript
const watermark = await sharp('watermark.png').toBuffer();

sharp(imageBuffer)
  .composite([{ input: watermark, gravity: 'southeast' }])
  .pipe(res);
```

### 4. Access Control
Fine-grained permissions:

```javascript
// Check if user has permission to view this feedback
const feedback = await query(
  'SELECT user_id FROM feedback WHERE screenshot_url LIKE $1',
  [`%${filename}%`]
);

if (feedback.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
  throw new AppError('Access denied', 403);
}
```

## 🔐 Private Blob Containers

You can now make your blob containers private:

### Azure Portal
1. Go to your Storage Account
2. Select Container (feedback-screenshots)
3. Change "Public access level" to "Private"
4. Save

**Result:** Direct blob URLs will no longer work, only proxied URLs will work.

## 📈 Monitoring

### Log Downloads
```javascript
console.log(`Media accessed: ${filename} by user ${req.user.id}`);
```

### Track Bandwidth
```javascript
const downloadSize = properties.contentLength;
// Store in analytics database
```

### Error Tracking
```javascript
if (error.statusCode === 404) {
  console.error(`Missing file requested: ${filename}`);
}
```

## ✅ Checklist

- [x] Created media proxy route (`/api/media`)
- [x] Updated feedback route to use proxied URLs
- [x] Registered media routes in server
- [x] Added authentication to feedback media
- [x] Implemented filename validation
- [x] Added caching headers
- [x] Streaming implementation
- [x] Error handling
- [ ] Deploy to production
- [ ] Test proxied URLs
- [ ] (Optional) Make blob containers private
- [ ] (Optional) Migrate existing URLs

## 🎉 Result

Your blob storage URLs are now hidden behind your domain:

**Before:**
```
https://mystorageaccount.blob.core.windows.net/feedback-screenshots/feedback-123-1701234567890.png
```

**After:**
```
https://roastify.online/api/media/feedback/feedback-123-1701234567890.png
```

Professional, secure, and fully under your control! 🚀
