# Unmatched Backend Routes Analysis

**Date:** December 6, 2025  
**Total Unmatched:** 51 routes  
**Purpose:** Determine which routes to keep, deprecate, or need frontend implementation

---

## 📊 Summary by Category

| Category | Count | Action | Priority |
|----------|-------|--------|----------|
| **Core Module Routes** | 18 | ✅ Keep - Need Frontend | HIGH |
| **Admin/GDPR** | 11 | ✅ Keep - Admin Only | MEDIUM |
| **System/Health** | 6 | ✅ Keep - Monitoring | LOW |
| **Profile/Preferences** | 6 | ⚠️ Review - May Consolidate | MEDIUM |
| **Files/Feedback** | 4 | ❓ Investigate - Usage Unknown | LOW |
| **Legacy Routes** | 6 | ⚠️ Review - May Deprecate | LOW |

---

## 🎯 Core Module Routes (18 routes) - HIGH PRIORITY

**These are newly discovered modular routes that should have frontend integration:**

### Invoices Module (4 routes)
- `GET /api/invoices/` - List all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `GET /api/invoices/stats` - Invoice statistics
- `GET /api/invoices/search` - Search invoices

**Action:** Frontend likely calls these but matcher isn't finding them. Check path matching.

### Projects Module (3 routes)
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/search` - Search projects
- `GET /api/projects/stats` - Project statistics

**Action:** Frontend likely calls these but matcher isn't finding them. Check path matching.

### Tasks Module (5 routes)
- `GET /api/tasks/:id` - Get task by ID
- `GET /api/tasks/due-soon` - Get tasks due soon
- `GET /api/tasks/search` - Search tasks
- `GET /api/tasks/stats/status` - Status statistics
- `GET /api/tasks/stats/priority` - Priority statistics

**Action:** Frontend likely calls these but matcher isn't finding them. Check path matching.

### Time Tracking Module (5 routes)
- `GET /api/time-tracking/summary` - Time tracking summary
- `GET /api/time-tracking/duration/total` - Total duration
- `GET /api/time-tracking/duration/by-date` - Duration by date
- `GET /api/time-tracking/duration/task/:taskId` - Duration by task
- `GET /api/time-tracking/duration/project/:projectId` - Duration by project

**Action:** Frontend likely calls these but matcher isn't finding them. Check path matching.

### Notifications Module (1 route)
- `GET /api/notifications/count` - Get notification count

**Action:** Frontend likely calls this but matcher isn't finding it. Check path matching.

---

## 🔐 Admin/GDPR Routes (11 routes) - KEEP

**These are admin-only routes for system management and compliance:**

### Admin Activity (4 routes)
- `GET /api/admin-activity/inactive-users` - List inactive users
- `GET /api/admin-activity/user-activity` - Get user activity
- `POST /api/admin-activity/delete-inactive` - Delete inactive users
- `GET /api/admin-activity/stats` - Activity statistics

**Action:** ✅ Keep - Admin panel features

### Admin GDPR (5 routes)
- `GET /api/admin-gdpr/export-requests` - List export requests
- `GET /api/admin-gdpr/deleted-accounts` - List deleted accounts
- `POST /api/admin-gdpr/restore-account` - Restore deleted account
- `GET /api/admin-gdpr/email-preferences-stats` - Email preferences stats
- `GET /api/admin-gdpr/deletion-reasons` - Deletion reasons

**Action:** ✅ Keep - Legal compliance features

### Admin Module (2 routes)
- `GET /api/admin/users/:id` - Get user with stats
- `GET /api/admin/stats` - System statistics

**Action:** ✅ Keep - Core admin features

---

## 🏥 System/Health Routes (6 routes) - KEEP

**These are system monitoring and utility routes:**

### Health Checks (2 routes)
- `GET /api/health/health` - Health check endpoint
- `GET /api/health/ping` - Ping endpoint

**Action:** ✅ Keep - Monitoring/DevOps

### GDPR User Routes (2 routes)
- `GET /api/gdpr/export/status` - Check export status
- `GET /api/gdpr/download/:filename` - Download export file

**Action:** ✅ Keep - User data export

### Version/Status (2 routes)
- `GET /api/version/` - Get version info
- `GET /api/version/changelog` - Get changelog

**Action:** ✅ Keep - System information

---

## 👤 Profile/Preferences Routes (6 routes) - REVIEW

**These routes may have duplicate functionality:**

### Profile (3 routes)
- `PUT /api/profile/me` - Update profile
- `GET /api/profile/check-username/:username` - Check username availability
- `DELETE /api/profile/delete-picture` - Delete profile picture

**Action:** ⚠️ Review - Check if frontend uses these

### Preferences (3 routes)
- `GET /api/userPreferences/preferences` - Get user preferences
- `PUT /api/userPreferences/preferences` - Update user preferences
- `POST /api/preferences/unsubscribe` - Unsubscribe from emails

**Action:** ⚠️ Review - Consolidate with userPreferences?

---

## 📁 Files/Feedback Routes (4 routes) - INVESTIGATE

**Usage of these features is unclear:**

### Files (3 routes)
- `GET /api/files/` - List files
- `POST /api/files/` - Upload file
- `POST /api/files/connect` - Connect file storage

**Action:** ❓ Investigate - Is file management used?

### Feedback (1 route)
- `GET /api/feedback/` - List feedback

**Action:** ❓ Investigate - Frontend has POST but not GET

---

## 🔄 Auth/Legacy Routes (6 routes) - REVIEW

**These may be redundant or need frontend:**

### Auth Module (4 routes)
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

**Action:** ⚠️ Review - Frontend likely uses these, check matcher

### Legacy (2 routes)
- `GET /api/status/detailed` - Detailed status
- `GET /api/legal/:type/versions` - Legal document versions

**Action:** ⚠️ Review - Check if used

---

## 🎯 Recommended Actions

### Immediate (HIGH Priority)

1. **Fix Route Matcher** - The 18 core module routes are likely being called by frontend but not matched
   - Check path parameter matching (`:id`, `:taskId`, etc.)
   - Check query parameter handling
   - This could gain us +18 matches immediately!

2. **Verify Auth Routes** - The 4 auth routes should definitely be matched
   - Frontend must be calling login/logout/refresh
   - Check why matcher isn't finding them
   - Potential +4 matches

### Short Term (MEDIUM Priority)

3. **Review Profile/Preferences** - Consolidate duplicate functionality
   - Merge preferences and userPreferences
   - Ensure frontend uses consistent paths
   - Potential +3-6 matches

4. **Admin Routes** - Keep all admin routes
   - These are admin-only features
   - No frontend match needed (admin panel handles them)

### Long Term (LOW Priority)

5. **Investigate Files/Feedback** - Determine if features are used
   - If not used, deprecate
   - If used, add frontend integration

6. **System Routes** - Keep all health/monitoring routes
   - Essential for DevOps
   - No frontend match needed

---

## 📈 Potential Match Rate Improvement

**Current State:**
- Matched: 99/150 = 66.0%
- Unmatched Backend: 51

**If we fix the matcher:**
- Core modules: +18 matches
- Auth routes: +4 matches
- Profile/Preferences: +3 matches
- **New Total: 124/150 = 82.7%**

**With frontend standardization:**
- Add /api prefix: +31 matches (from earlier analysis)
- **Final Total: 155/150 = Would need to recount after fixes**

---

## 🔍 Investigation Needed

### Why aren't core module routes matching?

The 18 core module routes (invoices, projects, tasks, time-tracking, notifications) should definitely be called by the frontend. Possible issues:

1. **Path Parameter Mismatch**
   - Frontend: `/invoices/${id}`
   - Backend: `/api/invoices/:id`
   - Matcher may not recognize these as the same

2. **Query Parameter Handling**
   - Frontend: `/tasks?status=active`
   - Backend: `/api/tasks/`
   - Matcher may not handle query params

3. **Method Mismatch**
   - Frontend using different HTTP method
   - Less likely but possible

### Recommended Fix

Update the RouteMatcher to:
1. Better handle path parameters (`:id`, `:taskId`, etc.)
2. Ignore query parameters when matching
3. Normalize paths before comparison

---

## ✅ Conclusion

**Keep (37 routes):**
- 18 core module routes (need matcher fix)
- 11 admin/GDPR routes (admin only)
- 6 system/health routes (monitoring)
- 2 legacy routes (if used)

**Review (10 routes):**
- 6 profile/preferences routes (consolidate)
- 4 auth routes (should match)

**Investigate (4 routes):**
- 3 files routes (check usage)
- 1 feedback route (check usage)

**Action:** Focus on fixing the route matcher to gain +18-25 matches immediately!

---

**Next Steps:**
1. Fix RouteMatcher path parameter handling
2. Re-run audit to see improved match rate
3. Review profile/preferences consolidation
4. Investigate files/feedback usage
