# 👤 Profile System Setup Guide

## 🎯 What's New

Complete user profile system with:
- Edit your profile
- Public profile pages
- Social media links
- Privacy settings

## 📋 Setup Steps

### Step 1: Run Database Migration (Local)

1. **Open SQL Server Management Studio or Azure Data Studio**
2. **Connect to your local database**
3. **Open the migration file**: `database/migrations/ADD_USER_PROFILE_FIELDS.sql`
4. **Change database name** on line 5:
   ```sql
   USE FreelancerDB; -- Change to your database name
   ```
5. **Execute the script** (F5 or click Run)
6. **Verify success**: You should see ✓ messages for each field added

### Step 2: Test Locally

1. **Start your backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start your frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the profile**:
   - Visit http://localhost:3000/profile
   - Fill in your profile information
   - Set a username
   - Add social links
   - Save changes

4. **Test public profile**:
   - Copy your profile link
   - Open in new tab or incognito
   - Should see your public profile

### Step 3: Apply to Azure (When Ready)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to**: SQL Database → roastifydbazure → Query editor
3. **Login**: `adminuser` / `AHmed#123456`
4. **Change database name** in script:
   ```sql
   USE roastifydbazure; -- Azure database name
   ```
5. **Copy/paste the migration script**
6. **Click Run**
7. **Verify**: Should see ✓ messages

## ✨ Features

### Profile Edit Page (`/profile`)
- ✅ Full name and username
- ✅ Job title and bio
- ✅ Profile picture URL
- ✅ Location and website
- ✅ Social media links (8 platforms)
- ✅ Portfolio link
- ✅ Privacy settings
- ✅ Copy profile link button

### Public Profile Page (`/profile/:username`)
- ✅ Beautiful profile card
- ✅ Profile picture display
- ✅ Job title and location
- ✅ Bio section
- ✅ Social media icons
- ✅ Website and portfolio links
- ✅ Only shows filled fields
- ✅ Dark/light theme support

### Social Media Platforms
- LinkedIn
- Behance
- Instagram
- Facebook
- Twitter/X
- GitHub
- Dribbble
- Portfolio

## 🔒 Privacy

**Profile Visibility Options**:
- **Public**: Anyone can view your profile at `/profile/your-username`
- **Private**: Only you can see your profile

## 📱 Access

**Edit Profile**:
- Click "Profile" in sidebar
- Or visit: http://localhost:3000/profile

**View Public Profile**:
- Visit: http://localhost:3000/profile/username
- Or copy link from profile page

## 🎨 Design

- Matches your app's design system
- Dark/light theme support
- Mobile responsive
- Professional layout
- Social media brand colors
- Smooth animations

## 🧪 Testing Checklist

- [ ] Run database migration locally
- [ ] Edit profile and save
- [ ] Set username
- [ ] Add social links
- [ ] Copy profile link
- [ ] View public profile
- [ ] Test privacy settings
- [ ] Test in dark mode
- [ ] Test on mobile
- [ ] Apply to Azure
- [ ] Test in production

## 🚀 API Endpoints

**Get Own Profile**:
```
GET /api/profile/me
Authorization: Bearer <token>
```

**Update Profile**:
```
PUT /api/profile/me
Authorization: Bearer <token>
Body: { name, username, job_title, bio, ... }
```

**Get Public Profile**:
```
GET /api/profile/:username
No authentication required
```

**Check Username**:
```
GET /api/profile/check-username/:username
```

## 📚 API Documentation

Visit: http://localhost:5000/api-docs

Look for the "Profile" section to see all endpoints and test them.

## ⚠️ Important Notes

### Username Rules
- 3-30 characters
- Letters, numbers, underscores, hyphens only
- Must be unique
- Case-sensitive

### Social Links
- Only show if filled
- Must be valid URLs
- Open in new tab
- Brand colors applied

### Profile Picture
- Provide URL to image
- Recommended: 400x400px or larger
- Square images work best
- Falls back to initial if not provided

## 🐛 Troubleshooting

**Migration fails**:
- Check database name is correct
- Verify you have permissions
- Check if fields already exist

**Username taken**:
- Try a different username
- Usernames are unique across all users

**Profile not showing**:
- Check profile_visibility is 'public'
- Verify username is set
- Check URL is correct

**Social links not showing**:
- Verify URLs are filled
- Check URL format is correct
- Must start with http:// or https://

## ✅ Success!

Once migration is complete:
- ✅ Profile system is ready
- ✅ Users can edit profiles
- ✅ Public profiles work
- ✅ Social links display
- ✅ Privacy controls active

---

**Need help?** Check the API docs at `/api-docs` or test endpoints there!
