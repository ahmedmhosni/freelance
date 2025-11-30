# Announcements Management System

## Overview
Complete announcements management system with admin controls, public pages, and featured announcements display.

## Features Implemented

### Backend
✅ **Database Table**: `announcements` table with fields:
- id, title, content, is_featured, media_url, media_type, created_at, updated_at
- Indexes for performance on featured and created_at columns

✅ **API Routes** (`/api/announcements`):
- `GET /` - Get all announcements (public)
- `GET /featured` - Get featured announcements (public)
- `GET /:id` - Get single announcement (public)
- `POST /` - Create announcement with media upload (admin only)
- `PUT /:id` - Update announcement with media upload (admin only)
- `DELETE /:id` - Delete announcement and media (admin only)

✅ **Azure Blob Storage Integration**:
- Uploads images/videos to `https://roastifystorge.blob.core.windows.net/general/announcements/`
- Supports: JPG, PNG, GIF, WebP, MP4, WebM
- Max file size: 50MB
- Automatic cleanup on update/delete

### Frontend Components

✅ **AnnouncementBanner** (`/src/components/AnnouncementBanner.jsx`):
- Displays featured announcements
- Auto-rotates through multiple announcements (5s interval)
- Dismissible
- Clickable to view full announcement
- Added to Home page and Dashboard

✅ **AnnouncementsManager** (`/src/components/AnnouncementsManager.jsx`):
- Full CRUD interface for admins
- Create/Edit/Delete announcements
- Upload images or videos
- Toggle featured status
- Rich preview cards
- Added to Admin Panel

✅ **Public Pages**:
- `/announcements` - List all announcements
- `/announcements/:id` - View single announcement with full content and media
- SEO optimized
- Responsive design

### Integration Points

✅ **Home Page**:
- Announcement banner below header
- Footer link to announcements page

✅ **Dashboard**:
- Announcement banner at top

✅ **Admin Panel**:
- New "Announcements" tab
- Full management interface

✅ **Footer**:
- Link to announcements page added

## Usage

### For Admins
1. Go to Admin Panel → Announcements tab
2. Click "New Announcement"
3. Fill in title and content
4. Optionally upload image or video
5. Check "Featured" to show on home/dashboard
6. Click "Create"

### For Users
- Featured announcements appear as banner on home page and dashboard
- Click banner to view full announcement
- Visit `/announcements` to see all announcements
- Click any announcement to view details with media

## Database Migration

Run the migration to create the table:
```bash
node backend/src/db/run-announcements-migration.js
```

## Files Created/Modified

### New Files:
- `backend/src/db/migrations/create-announcements-table.sql`
- `backend/src/db/run-announcements-migration.js`
- `backend/src/routes/announcements.js`
- `frontend/src/components/AnnouncementBanner.jsx`
- `frontend/src/components/AnnouncementBanner.css`
- `frontend/src/components/AnnouncementsManager.jsx`
- `frontend/src/pages/Announcements.jsx`
- `frontend/src/pages/AnnouncementDetail.jsx`

### Modified Files:
- `backend/src/server.js` - Added announcements route
- `frontend/src/App.jsx` - Added announcement routes
- `frontend/src/pages/Home.jsx` - Added banner and footer link
- `frontend/src/pages/Dashboard.jsx` - Added banner
- `frontend/src/pages/AdminPanel.jsx` - Added announcements tab

## API Examples

### Create Announcement
```javascript
const formData = new FormData();
formData.append('title', 'New Feature Released!');
formData.append('content', 'We are excited to announce...');
formData.append('isFeatured', true);
formData.append('media', fileInput.files[0]);

await axios.post('/api/announcements', formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### Get Featured Announcements
```javascript
const response = await axios.get('/api/announcements/featured');
console.log(response.data); // Array of featured announcements
```

## Styling
- Modern gradient banner (purple theme)
- Responsive design for mobile
- Smooth animations
- Consistent with app design system
- Dark mode compatible

## Security
- Admin-only routes protected with authentication middleware
- File type validation (images and videos only)
- File size limits (50MB)
- SQL injection protection via parameterized queries
- XSS protection via React's built-in escaping

## Next Steps (Optional Enhancements)
- Rich text editor for content formatting
- Scheduled announcements (publish date)
- Email notifications for new announcements
- Analytics (views, clicks)
- Categories/tags for announcements
- Draft/Published status
