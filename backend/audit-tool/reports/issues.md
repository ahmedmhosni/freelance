# Issue Report

**Generated:** 12/6/2025, 8:54:17 AM

**Total Issues:** 200

---

## Summary by Severity

| Severity | Count | Icon |
|----------|-------|------|
| 🔴 Critical | 0 | ✅ |
| 🟠 High | 149 | ⚠️ |
| 🟡 Medium | 51 | ⚠️ |
| 🟢 Low | 0 | ✅ |

---

## Table of Contents

- [🟠 High Priority Issues](#-high-priority-issues)
- [🟡 Medium Priority Issues](#-medium-priority-issues)

---

## 🟠 High Priority Issues

**Count:** 149

### Issue 1: Frontend call without backend route: GET /changelog/admin/version-names?type=major&unused_only=true

**ID:** `issue-1765004057996-5u1myonfo`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\ChangelogEditor.jsx`
- **Line:** 46

**Suggested Fix:**

Create a backend route for GET /changelog/admin/version-names?type=major&unused_only=true or update the frontend call to use an existing route.

---

### Issue 2: Frontend call without backend route: POST /changelog/admin/versions

**ID:** `issue-1765004057996-lf0vpknbn`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\ChangelogEditor.jsx`
- **Line:** 245

**Suggested Fix:**

Create a backend route for POST /changelog/admin/versions or update the frontend call to use an existing route.

---

### Issue 3: Frontend call without backend route: POST /changelog/admin/versions/:newVersionId/items

**ID:** `issue-1765004057996-xffykv5xe`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\ChangelogEditor.jsx`
- **Line:** 264

**Suggested Fix:**

Create a backend route for POST /changelog/admin/versions/:newVersionId/items or update the frontend call to use an existing route.

---

### Issue 4: Frontend call without backend route: PUT /feedback/:id

**ID:** `issue-1765004057996-65vhe6g8x`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "FeedbackManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\FeedbackManager.jsx`
- **Line:** 50

**Suggested Fix:**

Create a backend route for PUT /feedback/:id or update the frontend call to use an existing route.

---

### Issue 5: Frontend call without backend route: GET /invoices/:param/items

**ID:** `issue-1765004057996-jntubbfno`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "InvoiceForm" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\InvoiceForm.jsx`
- **Line:** 147

**Suggested Fix:**

Create a backend route for GET /invoices/:param/items or update the frontend call to use an existing route.

---

### Issue 6: Frontend call without backend route: POST /invoices/:invoiceId/items

**ID:** `issue-1765004057996-4ixnv7lnl`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "InvoiceForm" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\InvoiceForm.jsx`
- **Line:** 290

**Suggested Fix:**

Create a backend route for POST /invoices/:invoiceId/items or update the frontend call to use an existing route.

---

### Issue 7: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057996-v113hkyye`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Layout" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\Layout.jsx`
- **Line:** 45

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

### Issue 8: Frontend call without backend route: PUT /quotes/:param

**ID:** `issue-1765004057996-aj76mnjxx`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "QuotesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\QuotesManager.jsx`
- **Line:** 86

**Suggested Fix:**

Create a backend route for PUT /quotes/:param or update the frontend call to use an existing route.

---

### Issue 9: Frontend call without backend route: GET /tasks

**ID:** `issue-1765004057996-yc6kn1k9i`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "TimerWidget" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\TimerWidget.jsx`
- **Line:** 68

**Suggested Fix:**

Create a backend route for GET /tasks or update the frontend call to use an existing route.

---

### Issue 10: Frontend call without backend route: GET /changelog/admin/version-names?type=minor

**ID:** `issue-1765004057996-651pmm4sd`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VersionNamesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\VersionNamesManager.jsx`
- **Line:** 25

**Suggested Fix:**

Create a backend route for GET /changelog/admin/version-names?type=minor or update the frontend call to use an existing route.

---

### Issue 11: Frontend call without backend route: GET /changelog/admin/version-names?type=major

**ID:** `issue-1765004057997-hkxjau2vq`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VersionNamesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\VersionNamesManager.jsx`
- **Line:** 26

**Suggested Fix:**

Create a backend route for GET /changelog/admin/version-names?type=major or update the frontend call to use an existing route.

---

### Issue 12: Frontend call without backend route: GET /user/preferences

**ID:** `issue-1765004057997-4rpnw2fr1`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ThemeContext" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\context\ThemeContext.jsx`
- **Line:** 40

**Suggested Fix:**

Create a backend route for GET /user/preferences or update the frontend call to use an existing route.

---

### Issue 13: Frontend call without backend route: PUT /user/preferences

**ID:** `issue-1765004057997-rhedcvca3`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ThemeContext" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\context\ThemeContext.jsx`
- **Line:** 80

**Suggested Fix:**

Create a backend route for PUT /user/preferences or update the frontend call to use an existing route.

---

### Issue 14: Frontend call without backend route: PUT /feedback/:id

**ID:** `issue-1765004057997-77085s88s`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "FeedbackManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\FeedbackManager.jsx`
- **Line:** 36

**Suggested Fix:**

Create a backend route for PUT /feedback/:id or update the frontend call to use an existing route.

---

### Issue 15: Frontend call without backend route: PUT /feedback/:id

**ID:** `issue-1765004057997-cgk5054po`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "FeedbackManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\FeedbackManager.jsx`
- **Line:** 50

**Suggested Fix:**

Create a backend route for PUT /feedback/:id or update the frontend call to use an existing route.

---

### Issue 16: Frontend call without backend route: DELETE /feedback/:id

**ID:** `issue-1765004057997-gv7z0jckg`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "FeedbackManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\FeedbackManager.jsx`
- **Line:** 66

**Suggested Fix:**

Create a backend route for DELETE /feedback/:id or update the frontend call to use an existing route.

---

### Issue 17: Frontend call without backend route: PUT /legal/:activeType

**ID:** `issue-1765004057997-p77dt58nm`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "LegalEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\LegalEditor.jsx`
- **Line:** 39

**Suggested Fix:**

Create a backend route for PUT /legal/:activeType or update the frontend call to use an existing route.

---

### Issue 18: Frontend call without backend route: GET /maintenance

**ID:** `issue-1765004057997-zxd9sta2m`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "MaintenanceEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\MaintenanceEditor.jsx`
- **Line:** 21

**Suggested Fix:**

Create a backend route for GET /maintenance or update the frontend call to use an existing route.

---

### Issue 19: Frontend call without backend route: PUT /maintenance

**ID:** `issue-1765004057997-3jbq6kf2c`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "MaintenanceEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\MaintenanceEditor.jsx`
- **Line:** 37

**Suggested Fix:**

Create a backend route for PUT /maintenance or update the frontend call to use an existing route.

---

### Issue 20: Frontend call without backend route: GET /changelog/admin/pending-commits

**ID:** `issue-1765004057997-aajbk7536`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "PendingCommits" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\PendingCommits.jsx`
- **Line:** 22

**Suggested Fix:**

Create a backend route for GET /changelog/admin/pending-commits or update the frontend call to use an existing route.

---

### Issue 21: Frontend call without backend route: POST /changelog/admin/sync-commits

**ID:** `issue-1765004057997-k728qpyfd`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "PendingCommits" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\PendingCommits.jsx`
- **Line:** 74

**Suggested Fix:**

Create a backend route for POST /changelog/admin/sync-commits or update the frontend call to use an existing route.

---

### Issue 22: Frontend call without backend route: GET /quotes?page=:currentPage&limit=:itemsPerPage

**ID:** `issue-1765004057997-zj5eey4jm`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "QuotesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx`
- **Line:** 23

**Suggested Fix:**

Create a backend route for GET /quotes?page=:currentPage&limit=:itemsPerPage or update the frontend call to use an existing route.

---

### Issue 23: Frontend call without backend route: PUT /quotes/:param

**ID:** `issue-1765004057997-mqyd1xtcp`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "QuotesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx`
- **Line:** 36

**Suggested Fix:**

Create a backend route for PUT /quotes/:param or update the frontend call to use an existing route.

---

### Issue 24: Frontend call without backend route: POST /quotes

**ID:** `issue-1765004057997-u7snyzhy4`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "QuotesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx`
- **Line:** 39

**Suggested Fix:**

Create a backend route for POST /quotes or update the frontend call to use an existing route.

---

### Issue 25: Frontend call without backend route: DELETE /quotes/:id

**ID:** `issue-1765004057997-cs2wjrdgz`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "QuotesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx`
- **Line:** 66

**Suggested Fix:**

Create a backend route for DELETE /quotes/:id or update the frontend call to use an existing route.

---

### Issue 26: Frontend call without backend route: PUT /quotes/:param

**ID:** `issue-1765004057997-0e15tmp9q`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "QuotesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx`
- **Line:** 84

**Suggested Fix:**

Create a backend route for PUT /quotes/:param or update the frontend call to use an existing route.

---

### Issue 27: Frontend call without backend route: GET /changelog/admin/version-names?type=minor

**ID:** `issue-1765004057997-qy1mx9jwt`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VersionNamesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx`
- **Line:** 23

**Suggested Fix:**

Create a backend route for GET /changelog/admin/version-names?type=minor or update the frontend call to use an existing route.

---

### Issue 28: Frontend call without backend route: GET /changelog/admin/version-names?type=major

**ID:** `issue-1765004057997-ail8zmgra`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VersionNamesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx`
- **Line:** 24

**Suggested Fix:**

Create a backend route for GET /changelog/admin/version-names?type=major or update the frontend call to use an existing route.

---

### Issue 29: Frontend call without backend route: POST /changelog/admin/version-names

**ID:** `issue-1765004057997-2um565xdb`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VersionNamesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx`
- **Line:** 38

**Suggested Fix:**

Create a backend route for POST /changelog/admin/version-names or update the frontend call to use an existing route.

---

### Issue 30: Frontend call without backend route: PUT /changelog/admin/version-names/:id

**ID:** `issue-1765004057997-8x89fd6bh`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VersionNamesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx`
- **Line:** 55

**Suggested Fix:**

Create a backend route for PUT /changelog/admin/version-names/:id or update the frontend call to use an existing route.

---

### Issue 31: Frontend call without backend route: DELETE /changelog/admin/version-names/:id

**ID:** `issue-1765004057997-uk31m44tj`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VersionNamesManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx`
- **Line:** 70

**Suggested Fix:**

Create a backend route for DELETE /changelog/admin/version-names/:id or update the frontend call to use an existing route.

---

### Issue 32: Frontend call without backend route: GET /api/admin/gdpr/export-requests

**ID:** `issue-1765004057997-66ysh2ppk`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx`
- **Line:** 38

**Suggested Fix:**

Create a backend route for GET /api/admin/gdpr/export-requests or update the frontend call to use an existing route.

---

### Issue 33: Frontend call without backend route: GET /api/admin/gdpr/deleted-accounts

**ID:** `issue-1765004057997-vqdv2mpad`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx`
- **Line:** 42

**Suggested Fix:**

Create a backend route for GET /api/admin/gdpr/deleted-accounts or update the frontend call to use an existing route.

---

### Issue 34: Frontend call without backend route: GET /api/admin/gdpr/email-preferences-stats

**ID:** `issue-1765004057997-0a8jiy630`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx`
- **Line:** 46

**Suggested Fix:**

Create a backend route for GET /api/admin/gdpr/email-preferences-stats or update the frontend call to use an existing route.

---

### Issue 35: Frontend call without backend route: GET /api/admin/gdpr/deletion-reasons

**ID:** `issue-1765004057997-17blb42i5`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx`
- **Line:** 49

**Suggested Fix:**

Create a backend route for GET /api/admin/gdpr/deletion-reasons or update the frontend call to use an existing route.

---

### Issue 36: Frontend call without backend route: POST /api/admin/gdpr/restore-account

**ID:** `issue-1765004057997-us09kgxfs`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx`
- **Line:** 69

**Suggested Fix:**

Create a backend route for POST /api/admin/gdpr/restore-account or update the frontend call to use an existing route.

---

### Issue 37: Frontend call without backend route: GET /admin/activity/inactive-users?days=:inactiveDays

**ID:** `issue-1765004057997-fofmzww1k`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminPanel.jsx`
- **Line:** 58

**Suggested Fix:**

Create a backend route for GET /admin/activity/inactive-users?days=:inactiveDays or update the frontend call to use an existing route.

---

### Issue 38: Frontend call without backend route: GET /admin/activity/stats

**ID:** `issue-1765004057997-sck52stm7`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminPanel.jsx`
- **Line:** 67

**Suggested Fix:**

Create a backend route for GET /admin/activity/stats or update the frontend call to use an existing route.

---

### Issue 39: Frontend call without backend route: POST /admin/activity/delete-inactive

**ID:** `issue-1765004057997-w9wk1hgqh`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminPanel.jsx`
- **Line:** 80

**Suggested Fix:**

Create a backend route for POST /admin/activity/delete-inactive or update the frontend call to use an existing route.

---

### Issue 40: Frontend call without backend route: POST /admin/activity/delete-inactive

**ID:** `issue-1765004057997-w6d262mkf`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminPanel.jsx`
- **Line:** 97

**Suggested Fix:**

Create a backend route for POST /admin/activity/delete-inactive or update the frontend call to use an existing route.

---

### Issue 41: Frontend call without backend route: GET /api/announcements

**ID:** `issue-1765004057997-ld3sjgwad`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AnnouncementsManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\components\AnnouncementsManager.jsx`
- **Line:** 23

**Suggested Fix:**

Create a backend route for GET /api/announcements or update the frontend call to use an existing route.

---

### Issue 42: Frontend call without backend route: PUT /api/announcements/:editingId

**ID:** `issue-1765004057997-w2lvuaalo`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AnnouncementsManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\components\AnnouncementsManager.jsx`
- **Line:** 49

**Suggested Fix:**

Create a backend route for PUT /api/announcements/:editingId or update the frontend call to use an existing route.

---

### Issue 43: Frontend call without backend route: POST /api/announcements

**ID:** `issue-1765004057997-w2p4ruqnq`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AnnouncementsManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\components\AnnouncementsManager.jsx`
- **Line:** 56

**Suggested Fix:**

Create a backend route for POST /api/announcements or update the frontend call to use an existing route.

---

### Issue 44: Frontend call without backend route: DELETE /api/announcements/:id

**ID:** `issue-1765004057997-pd0cigwls`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AnnouncementsManager" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\components\AnnouncementsManager.jsx`
- **Line:** 91

**Suggested Fix:**

Create a backend route for DELETE /api/announcements/:id or update the frontend call to use an existing route.

---

### Issue 45: Frontend call without backend route: GET /api/announcements/:id

**ID:** `issue-1765004057997-pdg76zgaw`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AnnouncementDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\pages\AnnouncementDetail.jsx`
- **Line:** 24

**Suggested Fix:**

Create a backend route for GET /api/announcements/:id or update the frontend call to use an existing route.

---

### Issue 46: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057997-3zv0pin5c`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AnnouncementDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\pages\AnnouncementDetail.jsx`
- **Line:** 37

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

### Issue 47: Frontend call without backend route: GET /api/announcements

**ID:** `issue-1765004057997-vvm0jyxzt`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Announcements" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\pages\Announcements.jsx`
- **Line:** 22

**Suggested Fix:**

Create a backend route for GET /api/announcements or update the frontend call to use an existing route.

---

### Issue 48: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057997-1t1z2xqn9`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Announcements" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\pages\Announcements.jsx`
- **Line:** 37

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

### Issue 49: Frontend call without backend route: GET /maintenance/status

**ID:** `issue-1765004057997-deea2kdfj`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Login" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\auth\pages\Login.jsx`
- **Line:** 32

**Suggested Fix:**

Create a backend route for GET /maintenance/status or update the frontend call to use an existing route.

---

### Issue 50: Frontend call without backend route: GET /changelog/admin/version-names?type=minor&unused_only=true

**ID:** `issue-1765004057997-rhpmsx8iv`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 43

**Suggested Fix:**

Create a backend route for GET /changelog/admin/version-names?type=minor&unused_only=true or update the frontend call to use an existing route.

---

### Issue 51: Frontend call without backend route: GET /changelog/admin/version-names?type=major&unused_only=true

**ID:** `issue-1765004057997-mb9xdffja`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 44

**Suggested Fix:**

Create a backend route for GET /changelog/admin/version-names?type=major&unused_only=true or update the frontend call to use an existing route.

---

### Issue 52: Frontend call without backend route: GET /changelog/admin/versions

**ID:** `issue-1765004057997-1wp7vtyim`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 74

**Suggested Fix:**

Create a backend route for GET /changelog/admin/versions or update the frontend call to use an existing route.

---

### Issue 53: Frontend call without backend route: GET /changelog/admin/versions/:versionId

**ID:** `issue-1765004057997-gu110zxft`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 95

**Suggested Fix:**

Create a backend route for GET /changelog/admin/versions/:versionId or update the frontend call to use an existing route.

---

### Issue 54: Frontend call without backend route: PUT /changelog/admin/versions/:editingVersionId

**ID:** `issue-1765004057997-43o9qn3tv`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 106

**Suggested Fix:**

Create a backend route for PUT /changelog/admin/versions/:editingVersionId or update the frontend call to use an existing route.

---

### Issue 55: Frontend call without backend route: POST /changelog/admin/versions

**ID:** `issue-1765004057997-ngp9vufdf`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 108

**Suggested Fix:**

Create a backend route for POST /changelog/admin/versions or update the frontend call to use an existing route.

---

### Issue 56: Frontend call without backend route: PATCH /changelog/admin/versions/:id/publish

**ID:** `issue-1765004057997-agvt38qps`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 121

**Suggested Fix:**

Create a backend route for PATCH /changelog/admin/versions/:id/publish or update the frontend call to use an existing route.

---

### Issue 57: Frontend call without backend route: DELETE /changelog/admin/versions/:id

**ID:** `issue-1765004057997-ddvlwxw6w`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 137

**Suggested Fix:**

Create a backend route for DELETE /changelog/admin/versions/:id or update the frontend call to use an existing route.

---

### Issue 58: Frontend call without backend route: PUT /changelog/admin/items/:param

**ID:** `issue-1765004057997-98jcjnd8z`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 154

**Suggested Fix:**

Create a backend route for PUT /changelog/admin/items/:param or update the frontend call to use an existing route.

---

### Issue 59: Frontend call without backend route: POST /changelog/admin/versions/:param/items

**ID:** `issue-1765004057997-xphzsn4bb`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 156

**Suggested Fix:**

Create a backend route for POST /changelog/admin/versions/:param/items or update the frontend call to use an existing route.

---

### Issue 60: Frontend call without backend route: DELETE /changelog/admin/items/:itemId

**ID:** `issue-1765004057997-n4ueh75bw`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 178

**Suggested Fix:**

Create a backend route for DELETE /changelog/admin/items/:itemId or update the frontend call to use an existing route.

---

### Issue 61: Frontend call without backend route: POST /changelog/admin/versions

**ID:** `issue-1765004057997-ti7dxbrc1`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 243

**Suggested Fix:**

Create a backend route for POST /changelog/admin/versions or update the frontend call to use an existing route.

---

### Issue 62: Frontend call without backend route: POST /changelog/admin/versions/:newVersionId/items

**ID:** `issue-1765004057997-6l6fk8rs7`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 262

**Suggested Fix:**

Create a backend route for POST /changelog/admin/versions/:newVersionId/items or update the frontend call to use an existing route.

---

### Issue 63: Frontend call without backend route: POST /changelog/admin/mark-commits-processed

**ID:** `issue-1765004057997-21lvds9oe`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ChangelogEditor" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx`
- **Line:** 270

**Suggested Fix:**

Create a backend route for POST /changelog/admin/mark-commits-processed or update the frontend call to use an existing route.

---

### Issue 64: Frontend call without backend route: GET /projects?client_id=:id

**ID:** `issue-1765004057997-lv5zyx7mq`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ClientDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\clients\pages\ClientDetail.jsx`
- **Line:** 26

**Suggested Fix:**

Create a backend route for GET /projects?client_id=:id or update the frontend call to use an existing route.

---

### Issue 65: Frontend call without backend route: GET /tasks?client_id=:id

**ID:** `issue-1765004057997-c282gudx8`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ClientDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\clients\pages\ClientDetail.jsx`
- **Line:** 27

**Suggested Fix:**

Create a backend route for GET /tasks?client_id=:id or update the frontend call to use an existing route.

---

### Issue 66: Frontend call without backend route: GET /clients/:id

**ID:** `issue-1765004057997-t5jtyjy8d`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "clientApi" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\clients\services\clientApi.js`
- **Line:** 27

**Suggested Fix:**

Create a backend route for GET /clients/:id or update the frontend call to use an existing route.

---

### Issue 67: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057997-xv6ym1wm8`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Home" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\home\pages\Home.jsx`
- **Line:** 24

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

### Issue 68: Frontend call without backend route: GET /invoices/:param/items

**ID:** `issue-1765004057997-lwb6f9oo4`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "InvoiceForm" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\invoices\components\InvoiceForm.jsx`
- **Line:** 146

**Suggested Fix:**

Create a backend route for GET /invoices/:param/items or update the frontend call to use an existing route.

---

### Issue 69: Frontend call without backend route: POST /invoices/:invoiceId/items

**ID:** `issue-1765004057997-f8r9jfghe`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "InvoiceForm" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\invoices\components\InvoiceForm.jsx`
- **Line:** 289

**Suggested Fix:**

Create a backend route for POST /invoices/:invoiceId/items or update the frontend call to use an existing route.

---

### Issue 70: Frontend call without backend route: GET /invoices/:id/pdf

**ID:** `issue-1765004057997-8pklijr6c`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "invoiceApi" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\invoices\services\invoiceApi.js`
- **Line:** 76

**Suggested Fix:**

Create a backend route for GET /invoices/:id/pdf or update the frontend call to use an existing route.

---

### Issue 71: Frontend call without backend route: GET /legal/privacy

**ID:** `issue-1765004057997-dxd9wk7j7`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Privacy" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\legal\pages\Privacy.jsx`
- **Line:** 16

**Suggested Fix:**

Create a backend route for GET /legal/privacy or update the frontend call to use an existing route.

---

### Issue 72: Frontend call without backend route: GET /api/legal/terms

**ID:** `issue-1765004057997-2j6dxq1q7`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Terms" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\legal\pages\Terms.jsx`
- **Line:** 16

**Suggested Fix:**

Create a backend route for GET /api/legal/terms or update the frontend call to use an existing route.

---

### Issue 73: Frontend call without backend route: POST /profile/upload-picture

**ID:** `issue-1765004057997-280b1siew`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AvatarPicker" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\AvatarPicker.jsx`
- **Line:** 78

**Suggested Fix:**

Create a backend route for POST /profile/upload-picture or update the frontend call to use an existing route.

---

### Issue 74: Frontend call without backend route: POST /api/gdpr/export

**ID:** `issue-1765004057997-tk50n88mb`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "DataPrivacy" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\DataPrivacy.jsx`
- **Line:** 23

**Suggested Fix:**

Create a backend route for POST /api/gdpr/export or update the frontend call to use an existing route.

---

### Issue 75: Frontend call without backend route: POST /api/gdpr/delete-account

**ID:** `issue-1765004057997-b7qdv1bme`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "DataPrivacy" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\DataPrivacy.jsx`
- **Line:** 52

**Suggested Fix:**

Create a backend route for POST /api/gdpr/delete-account or update the frontend call to use an existing route.

---

### Issue 76: Frontend call without backend route: GET /api/preferences/email

**ID:** `issue-1765004057997-fga2imxm3`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "EmailPreferences" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\EmailPreferences.jsx`
- **Line:** 23

**Suggested Fix:**

Create a backend route for GET /api/preferences/email or update the frontend call to use an existing route.

---

### Issue 77: Frontend call without backend route: PUT /api/preferences/email

**ID:** `issue-1765004057997-01itgaco6`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "EmailPreferences" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\EmailPreferences.jsx`
- **Line:** 47

**Suggested Fix:**

Create a backend route for PUT /api/preferences/email or update the frontend call to use an existing route.

---

### Issue 78: Frontend call without backend route: PUT /profile

**ID:** `issue-1765004057997-m50m7l1fm`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Profile" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\pages\Profile.jsx`
- **Line:** 64

**Suggested Fix:**

Create a backend route for PUT /profile or update the frontend call to use an existing route.

---

### Issue 79: Frontend call without backend route: DELETE /projects/:id

**ID:** `issue-1765004057997-9qrj3b152`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "projectApi" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\projects\services\projectApi.js`
- **Line:** 65

**Suggested Fix:**

Create a backend route for DELETE /projects/:id or update the frontend call to use an existing route.

---

### Issue 80: Frontend call without backend route: GET /api/status

**ID:** `issue-1765004057997-gi5yfzied`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "PublicStatus" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\status\pages\PublicStatus.jsx`
- **Line:** 16

**Suggested Fix:**

Create a backend route for GET /api/status or update the frontend call to use an existing route.

---

### Issue 81: Frontend call without backend route: GET /api/status

**ID:** `issue-1765004057997-1spzuqdu7`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Status" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\status\pages\Status.jsx`
- **Line:** 47

**Suggested Fix:**

Create a backend route for GET /api/status or update the frontend call to use an existing route.

---

### Issue 82: Frontend call without backend route: GET /api/status/history

**ID:** `issue-1765004057997-ua83ckgu8`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Status" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\status\pages\Status.jsx`
- **Line:** 60

**Suggested Fix:**

Create a backend route for GET /api/status/history or update the frontend call to use an existing route.

---

### Issue 83: Frontend call without backend route: GET /tasks

**ID:** `issue-1765004057997-nqxndesdj`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "TaskCalendar" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\tasks\components\TaskCalendar.jsx`
- **Line:** 32

**Suggested Fix:**

Create a backend route for GET /tasks or update the frontend call to use an existing route.

---

### Issue 84: Frontend call without backend route: DELETE /tasks/:id

**ID:** `issue-1765004057997-ls7lhdlaq`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "taskApi" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\tasks\services\taskApi.js`
- **Line:** 66

**Suggested Fix:**

Create a backend route for DELETE /tasks/:id or update the frontend call to use an existing route.

---

### Issue 85: Frontend call without backend route: GET /time-tracking

**ID:** `issue-1765004057997-oyamrlerl`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "TimerWidget" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx`
- **Line:** 55

**Suggested Fix:**

Create a backend route for GET /time-tracking or update the frontend call to use an existing route.

---

### Issue 86: Frontend call without backend route: GET /tasks

**ID:** `issue-1765004057997-3ooi6jrk1`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "TimerWidget" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx`
- **Line:** 66

**Suggested Fix:**

Create a backend route for GET /tasks or update the frontend call to use an existing route.

---

### Issue 87: Frontend call without backend route: GET /projects

**ID:** `issue-1765004057997-yqsv7dby5`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "TimerWidget" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx`
- **Line:** 76

**Suggested Fix:**

Create a backend route for GET /projects or update the frontend call to use an existing route.

---

### Issue 88: Frontend call without backend route: POST /time-tracking/start

**ID:** `issue-1765004057997-7pikfa5z3`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "TimerWidget" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx`
- **Line:** 90

**Suggested Fix:**

Create a backend route for POST /time-tracking/start or update the frontend call to use an existing route.

---

### Issue 89: Frontend call without backend route: POST /time-tracking/stop/:param

**ID:** `issue-1765004057997-qsp00qvqu`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "TimerWidget" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx`
- **Line:** 103

**Suggested Fix:**

Create a backend route for POST /time-tracking/stop/:param or update the frontend call to use an existing route.

---

### Issue 90: Frontend call without backend route: POST /time-tracking/start

**ID:** `issue-1765004057997-auz4nkg0y`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "timeTrackingApi" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\services\timeTrackingApi.js`
- **Line:** 43

**Suggested Fix:**

Create a backend route for POST /time-tracking/start or update the frontend call to use an existing route.

---

### Issue 91: Frontend call without backend route: POST /time-tracking/stop/:id

**ID:** `issue-1765004057997-usbgoxwsp`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "timeTrackingApi" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\services\timeTrackingApi.js`
- **Line:** 53

**Suggested Fix:**

Create a backend route for POST /time-tracking/stop/:id or update the frontend call to use an existing route.

---

### Issue 92: Frontend call without backend route: GET /api/admin/gdpr/export-requests

**ID:** `issue-1765004057997-9ehlqu2kb`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx`
- **Line:** 38

**Suggested Fix:**

Create a backend route for GET /api/admin/gdpr/export-requests or update the frontend call to use an existing route.

---

### Issue 93: Frontend call without backend route: GET /api/admin/gdpr/deleted-accounts

**ID:** `issue-1765004057997-0ilfi3otp`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx`
- **Line:** 42

**Suggested Fix:**

Create a backend route for GET /api/admin/gdpr/deleted-accounts or update the frontend call to use an existing route.

---

### Issue 94: Frontend call without backend route: GET /api/admin/gdpr/email-preferences-stats

**ID:** `issue-1765004057997-dq13yq4om`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx`
- **Line:** 46

**Suggested Fix:**

Create a backend route for GET /api/admin/gdpr/email-preferences-stats or update the frontend call to use an existing route.

---

### Issue 95: Frontend call without backend route: GET /api/admin/gdpr/deletion-reasons

**ID:** `issue-1765004057997-uwl71q39p`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx`
- **Line:** 49

**Suggested Fix:**

Create a backend route for GET /api/admin/gdpr/deletion-reasons or update the frontend call to use an existing route.

---

### Issue 96: Frontend call without backend route: POST /api/admin/gdpr/restore-account

**ID:** `issue-1765004057997-r7m5mmhg2`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminGDPR" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx`
- **Line:** 69

**Suggested Fix:**

Create a backend route for POST /api/admin/gdpr/restore-account or update the frontend call to use an existing route.

---

### Issue 97: Frontend call without backend route: GET /status

**ID:** `issue-1765004057997-xw5f41sj8`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 41

**Suggested Fix:**

Create a backend route for GET /status or update the frontend call to use an existing route.

---

### Issue 98: Frontend call without backend route: GET /admin/users

**ID:** `issue-1765004057997-kwg7em6c2`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 50

**Suggested Fix:**

Create a backend route for GET /admin/users or update the frontend call to use an existing route.

---

### Issue 99: Frontend call without backend route: GET /admin/activity/inactive-users?days=:inactiveDays

**ID:** `issue-1765004057997-x2x13xqu4`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 59

**Suggested Fix:**

Create a backend route for GET /admin/activity/inactive-users?days=:inactiveDays or update the frontend call to use an existing route.

---

### Issue 100: Frontend call without backend route: GET /admin/activity/stats

**ID:** `issue-1765004057997-54eqfeu8u`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 68

**Suggested Fix:**

Create a backend route for GET /admin/activity/stats or update the frontend call to use an existing route.

---

### Issue 101: Frontend call without backend route: POST /admin/activity/delete-inactive

**ID:** `issue-1765004057997-qyks7iepy`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 81

**Suggested Fix:**

Create a backend route for POST /admin/activity/delete-inactive or update the frontend call to use an existing route.

---

### Issue 102: Frontend call without backend route: POST /admin/activity/delete-inactive

**ID:** `issue-1765004057997-6lhfh8pds`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 98

**Suggested Fix:**

Create a backend route for POST /admin/activity/delete-inactive or update the frontend call to use an existing route.

---

### Issue 103: Frontend call without backend route: GET /admin/reports

**ID:** `issue-1765004057997-6cmy5ifto`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 111

**Suggested Fix:**

Create a backend route for GET /admin/reports or update the frontend call to use an existing route.

---

### Issue 104: Frontend call without backend route: PUT /admin/users/:userId/role

**ID:** `issue-1765004057997-xhfqt2ydh`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 120

**Suggested Fix:**

Create a backend route for PUT /admin/users/:userId/role or update the frontend call to use an existing route.

---

### Issue 105: Frontend call without backend route: DELETE /admin/users/:userId

**ID:** `issue-1765004057997-rob0qgsft`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 132

**Suggested Fix:**

Create a backend route for DELETE /admin/users/:userId or update the frontend call to use an existing route.

---

### Issue 106: Frontend call without backend route: PUT /admin/users/:userId/verification

**ID:** `issue-1765004057997-ib5wg7ycz`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AdminPanel" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx`
- **Line:** 149

**Suggested Fix:**

Create a backend route for PUT /admin/users/:userId/verification or update the frontend call to use an existing route.

---

### Issue 107: Frontend call without backend route: GET /announcements/:id

**ID:** `issue-1765004057997-yu0ws6mwh`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AnnouncementDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AnnouncementDetail.jsx`
- **Line:** 27

**Suggested Fix:**

Create a backend route for GET /announcements/:id or update the frontend call to use an existing route.

---

### Issue 108: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057997-bds90u48r`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AnnouncementDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AnnouncementDetail.jsx`
- **Line:** 40

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

### Issue 109: Frontend call without backend route: GET /announcements

**ID:** `issue-1765004057997-lrgpgjv7i`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Announcements" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Announcements.jsx`
- **Line:** 25

**Suggested Fix:**

Create a backend route for GET /announcements or update the frontend call to use an existing route.

---

### Issue 110: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057997-jhro1n178`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Announcements" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Announcements.jsx`
- **Line:** 40

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

### Issue 111: Frontend call without backend route: GET /api/changelog/public

**ID:** `issue-1765004057997-eapr2dqf1`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Changelog" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Changelog.jsx`
- **Line:** 16

**Suggested Fix:**

Create a backend route for GET /api/changelog/public or update the frontend call to use an existing route.

---

### Issue 112: Frontend call without backend route: GET /clients/:id

**ID:** `issue-1765004057997-oka1fd5bt`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ClientDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx`
- **Line:** 28

**Suggested Fix:**

Create a backend route for GET /clients/:id or update the frontend call to use an existing route.

---

### Issue 113: Frontend call without backend route: GET /projects?client_id=:id

**ID:** `issue-1765004057997-y8fzqqqc9`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ClientDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx`
- **Line:** 29

**Suggested Fix:**

Create a backend route for GET /projects?client_id=:id or update the frontend call to use an existing route.

---

### Issue 114: Frontend call without backend route: GET /tasks?client_id=:id

**ID:** `issue-1765004057997-rwoj3cgd7`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ClientDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx`
- **Line:** 30

**Suggested Fix:**

Create a backend route for GET /tasks?client_id=:id or update the frontend call to use an existing route.

---

### Issue 115: Frontend call without backend route: DELETE /projects/:param

**ID:** `issue-1765004057997-4pgcwudns`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ClientDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx`
- **Line:** 46

**Suggested Fix:**

Create a backend route for DELETE /projects/:param or update the frontend call to use an existing route.

---

### Issue 116: Frontend call without backend route: DELETE /tasks/:param

**ID:** `issue-1765004057997-pdzl9nu2i`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ClientDetail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx`
- **Line:** 58

**Suggested Fix:**

Create a backend route for DELETE /tasks/:param or update the frontend call to use an existing route.

---

### Issue 117: Frontend call without backend route: GET /maintenance

**ID:** `issue-1765004057997-xz3xj5cg4`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ComingSoon" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ComingSoon.jsx`
- **Line:** 22

**Suggested Fix:**

Create a backend route for GET /maintenance or update the frontend call to use an existing route.

---

### Issue 118: Frontend call without backend route: GET /dashboard/stats

**ID:** `issue-1765004057997-0phspruq3`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Dashboard" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Dashboard.jsx`
- **Line:** 35

**Suggested Fix:**

Create a backend route for GET /dashboard/stats or update the frontend call to use an existing route.

---

### Issue 119: Frontend call without backend route: GET /dashboard/recent-tasks?limit=5

**ID:** `issue-1765004057997-q277gd6hf`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Dashboard" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Dashboard.jsx`
- **Line:** 44

**Suggested Fix:**

Create a backend route for GET /dashboard/recent-tasks?limit=5 or update the frontend call to use an existing route.

---

### Issue 120: Frontend call without backend route: GET /dashboard/charts

**ID:** `issue-1765004057997-vahj3fedl`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Dashboard" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Dashboard.jsx`
- **Line:** 58

**Suggested Fix:**

Create a backend route for GET /dashboard/charts or update the frontend call to use an existing route.

---

### Issue 121: Frontend call without backend route: POST /auth/forgot-password

**ID:** `issue-1765004057997-kz6jns3i9`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ForgotPassword" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ForgotPassword.jsx`
- **Line:** 19

**Suggested Fix:**

Create a backend route for POST /auth/forgot-password or update the frontend call to use an existing route.

---

### Issue 122: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057997-hi0skbwz4`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Home" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Home.jsx`
- **Line:** 25

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

### Issue 123: Frontend call without backend route: GET /maintenance/status

**ID:** `issue-1765004057997-e0wtr38dh`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Login" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Login.jsx`
- **Line:** 36

**Suggested Fix:**

Create a backend route for GET /maintenance/status or update the frontend call to use an existing route.

---

### Issue 124: Frontend call without backend route: GET /quotes/daily

**ID:** `issue-1765004057997-hlwq7s9pj`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Login" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Login.jsx`
- **Line:** 45

**Suggested Fix:**

Create a backend route for GET /quotes/daily or update the frontend call to use an existing route.

---

### Issue 125: Frontend call without backend route: GET /legal/privacy

**ID:** `issue-1765004057997-e3xaorkjr`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Privacy" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Privacy.jsx`
- **Line:** 19

**Suggested Fix:**

Create a backend route for GET /legal/privacy or update the frontend call to use an existing route.

---

### Issue 126: Frontend call without backend route: GET /profile

**ID:** `issue-1765004057997-3don9r6ll`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Profile" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Profile.jsx`
- **Line:** 47

**Suggested Fix:**

Create a backend route for GET /profile or update the frontend call to use an existing route.

---

### Issue 127: Frontend call without backend route: PUT /profile

**ID:** `issue-1765004057997-wfz56ntbd`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Profile" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Profile.jsx`
- **Line:** 66

**Suggested Fix:**

Create a backend route for PUT /profile or update the frontend call to use an existing route.

---

### Issue 128: Frontend call without backend route: GET /api/status

**ID:** `issue-1765004057997-j6a1w66eq`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "PublicStatus" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\PublicStatus.jsx`
- **Line:** 18

**Suggested Fix:**

Create a backend route for GET /api/status or update the frontend call to use an existing route.

---

### Issue 129: Frontend call without backend route: GET /api/status/history

**ID:** `issue-1765004057997-z20emwjgk`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "PublicStatus" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\PublicStatus.jsx`
- **Line:** 24

**Suggested Fix:**

Create a backend route for GET /api/status/history or update the frontend call to use an existing route.

---

### Issue 130: Frontend call without backend route: GET /reports/financial

**ID:** `issue-1765004057997-w6zmg0uw3`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Reports" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx`
- **Line:** 21

**Suggested Fix:**

Create a backend route for GET /reports/financial or update the frontend call to use an existing route.

---

### Issue 131: Frontend call without backend route: GET /reports/projects

**ID:** `issue-1765004057997-z5jd1u4a0`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Reports" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx`
- **Line:** 22

**Suggested Fix:**

Create a backend route for GET /reports/projects or update the frontend call to use an existing route.

---

### Issue 132: Frontend call without backend route: GET /reports/clients

**ID:** `issue-1765004057997-2o0qd914g`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Reports" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx`
- **Line:** 23

**Suggested Fix:**

Create a backend route for GET /reports/clients or update the frontend call to use an existing route.

---

### Issue 133: Frontend call without backend route: GET /reports/time-tracking/tasks

**ID:** `issue-1765004057997-1d48dgb8e`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Reports" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx`
- **Line:** 24

**Suggested Fix:**

Create a backend route for GET /reports/time-tracking/tasks or update the frontend call to use an existing route.

---

### Issue 134: Frontend call without backend route: GET /reports/time-tracking/projects

**ID:** `issue-1765004057997-s72pbv3aw`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Reports" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx`
- **Line:** 25

**Suggested Fix:**

Create a backend route for GET /reports/time-tracking/projects or update the frontend call to use an existing route.

---

### Issue 135: Frontend call without backend route: GET /reports/time-tracking/clients

**ID:** `issue-1765004057997-zahzde0d4`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Reports" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx`
- **Line:** 26

**Suggested Fix:**

Create a backend route for GET /reports/time-tracking/clients or update the frontend call to use an existing route.

---

### Issue 136: Frontend call without backend route: POST /auth/resend-verification

**ID:** `issue-1765004057997-m2d7a94th`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ResendVerification" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ResendVerification.jsx`
- **Line:** 20

**Suggested Fix:**

Create a backend route for POST /auth/resend-verification or update the frontend call to use an existing route.

---

### Issue 137: Frontend call without backend route: POST /auth/reset-password

**ID:** `issue-1765004057997-x4uqqm2jn`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ResetPassword" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ResetPassword.jsx`
- **Line:** 40

**Suggested Fix:**

Create a backend route for POST /auth/reset-password or update the frontend call to use an existing route.

---

### Issue 138: Frontend call without backend route: GET /api/status

**ID:** `issue-1765004057997-4s5obbeii`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Status" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Status.jsx`
- **Line:** 47

**Suggested Fix:**

Create a backend route for GET /api/status or update the frontend call to use an existing route.

---

### Issue 139: Frontend call without backend route: GET /api/status/history

**ID:** `issue-1765004057997-2jo6dcbjf`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Status" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Status.jsx`
- **Line:** 60

**Suggested Fix:**

Create a backend route for GET /api/status/history or update the frontend call to use an existing route.

---

### Issue 140: Frontend call without backend route: GET /legal/terms

**ID:** `issue-1765004057997-urj7hvsg7`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Terms" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Terms.jsx`
- **Line:** 18

**Suggested Fix:**

Create a backend route for GET /legal/terms or update the frontend call to use an existing route.

---

### Issue 141: Frontend call without backend route: GET /auth/verify-email/:token

**ID:** `issue-1765004057997-xkx6579jg`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VerifyEmail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\VerifyEmail.jsx`
- **Line:** 40

**Suggested Fix:**

Create a backend route for GET /auth/verify-email/:token or update the frontend call to use an existing route.

---

### Issue 142: Frontend call without backend route: POST /auth/verify-code

**ID:** `issue-1765004057997-k8hr7f13b`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "VerifyEmail" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\VerifyEmail.jsx`
- **Line:** 111

**Suggested Fix:**

Create a backend route for POST /auth/verify-code or update the frontend call to use an existing route.

---

### Issue 143: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057997-oa00b7s5o`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "AppFooter" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\components\AppFooter.jsx`
- **Line:** 17

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

### Issue 144: Frontend call without backend route: POST /feedback

**ID:** `issue-1765004057997-l3ez79a5h`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "FeedbackWidget" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\components\FeedbackWidget.jsx`
- **Line:** 59

**Suggested Fix:**

Create a backend route for POST /feedback or update the frontend call to use an existing route.

---

### Issue 145: Frontend call without backend route: GET /notifications

**ID:** `issue-1765004057997-54kq0uhvh`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "NotificationBell" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\components\NotificationBell.jsx`
- **Line:** 33

**Suggested Fix:**

Create a backend route for GET /notifications or update the frontend call to use an existing route.

---

### Issue 146: Frontend call without backend route: GET /maintenance/status

**ID:** `issue-1765004057997-9c40hoonb`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "MaintenanceContext" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\context\MaintenanceContext.jsx`
- **Line:** 26

**Suggested Fix:**

Create a backend route for GET /maintenance/status or update the frontend call to use an existing route.

---

### Issue 147: Frontend call without backend route: GET /user/preferences

**ID:** `issue-1765004057997-lwshzwrrv`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ThemeContext" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\context\ThemeContext.jsx`
- **Line:** 40

**Suggested Fix:**

Create a backend route for GET /user/preferences or update the frontend call to use an existing route.

---

### Issue 148: Frontend call without backend route: PUT /user/preferences

**ID:** `issue-1765004057997-hfgzbirlo`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "ThemeContext" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\context\ThemeContext.jsx`
- **Line:** 80

**Suggested Fix:**

Create a backend route for PUT /user/preferences or update the frontend call to use an existing route.

---

### Issue 149: Frontend call without backend route: GET /api/changelog/current-version

**ID:** `issue-1765004057997-zpgof69bn`
**Type:** ROUTE_MISMATCH
**Severity:** 🟠 HIGH

**Description:**

Frontend component "Layout" makes an API call that has no corresponding backend route.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\layouts\Layout.jsx`
- **Line:** 45

**Suggested Fix:**

Create a backend route for GET /api/changelog/current-version or update the frontend call to use an existing route.

---

---

## 🟡 Medium Priority Issues

**Count:** 51

### Issue 1: Backend route without frontend call: GET /api/admin-activity/inactive-users

**ID:** `issue-1765004057997-g6s9gqjdx`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-activity.js`

**Related Routes:**

- `GET /api/admin-activity/inactive-users` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 2: Backend route without frontend call: GET /api/admin-activity/user-activity

**ID:** `issue-1765004057997-rk1bqy5qr`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-activity.js`

**Related Routes:**

- `GET /api/admin-activity/user-activity` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 3: Backend route without frontend call: POST /api/admin-activity/delete-inactive

**ID:** `issue-1765004057997-sw7ilmoq2`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-activity.js`

**Related Routes:**

- `POST /api/admin-activity/delete-inactive` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 4: Backend route without frontend call: GET /api/admin-activity/stats

**ID:** `issue-1765004057997-7efe38txa`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-activity.js`

**Related Routes:**

- `GET /api/admin-activity/stats` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 5: Backend route without frontend call: GET /api/admin-gdpr/export-requests

**ID:** `issue-1765004057997-o58ouxk6i`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js`

**Related Routes:**

- `GET /api/admin-gdpr/export-requests` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 6: Backend route without frontend call: GET /api/admin-gdpr/deleted-accounts

**ID:** `issue-1765004057997-vlxin97yk`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js`

**Related Routes:**

- `GET /api/admin-gdpr/deleted-accounts` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 7: Backend route without frontend call: POST /api/admin-gdpr/restore-account

**ID:** `issue-1765004057997-pqr298j7w`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js`

**Related Routes:**

- `POST /api/admin-gdpr/restore-account` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 8: Backend route without frontend call: GET /api/admin-gdpr/email-preferences-stats

**ID:** `issue-1765004057997-3p2kz3z2a`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js`

**Related Routes:**

- `GET /api/admin-gdpr/email-preferences-stats` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 9: Backend route without frontend call: GET /api/admin-gdpr/deletion-reasons

**ID:** `issue-1765004057997-7zqybs6rq`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js`

**Related Routes:**

- `GET /api/admin-gdpr/deletion-reasons` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 10: Backend route without frontend call: GET /api/feedback/

**ID:** `issue-1765004057997-novddhvr8`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\feedback.js`

**Related Routes:**

- `GET /api/feedback/` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 11: Backend route without frontend call: GET /api/files/

**ID:** `issue-1765004057997-1v4nujm21`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\files.js`

**Related Routes:**

- `GET /api/files/` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 12: Backend route without frontend call: POST /api/files/

**ID:** `issue-1765004057997-upbvlasvr`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\files.js`

**Related Routes:**

- `POST /api/files/` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 13: Backend route without frontend call: POST /api/files/connect

**ID:** `issue-1765004057997-4ptofh25g`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\files.js`

**Related Routes:**

- `POST /api/files/connect` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 14: Backend route without frontend call: GET /api/gdpr/export/status

**ID:** `issue-1765004057997-cyxenicmz`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\gdpr.js`

**Related Routes:**

- `GET /api/gdpr/export/status` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 15: Backend route without frontend call: GET /api/gdpr/download/:filename

**ID:** `issue-1765004057997-ysu7f2tzc`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\gdpr.js`

**Related Routes:**

- `GET /api/gdpr/download/:filename` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 16: Backend route without frontend call: GET /api/health/health

**ID:** `issue-1765004057997-vyk6gof8b`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\health.js`

**Related Routes:**

- `GET /api/health/health` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 17: Backend route without frontend call: GET /api/health/ping

**ID:** `issue-1765004057997-bop908rax`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\health.js`

**Related Routes:**

- `GET /api/health/ping` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 18: Backend route without frontend call: GET /api/legal/:type/versions

**ID:** `issue-1765004057997-snma8repi`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\legal.js`

**Related Routes:**

- `GET /api/legal/:type/versions` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 19: Backend route without frontend call: POST /api/preferences/unsubscribe

**ID:** `issue-1765004057997-42l8z80ho`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\preferences.js`

**Related Routes:**

- `POST /api/preferences/unsubscribe` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 20: Backend route without frontend call: PUT /api/profile/me

**ID:** `issue-1765004057997-0rmt5nm5i`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js`

**Related Routes:**

- `PUT /api/profile/me` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 21: Backend route without frontend call: GET /api/profile/check-username/:username

**ID:** `issue-1765004057997-155eyq1az`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js`

**Related Routes:**

- `GET /api/profile/check-username/:username` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 22: Backend route without frontend call: DELETE /api/profile/delete-picture

**ID:** `issue-1765004057997-zrpn2prd1`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js`

**Related Routes:**

- `DELETE /api/profile/delete-picture` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 23: Backend route without frontend call: GET /api/status/detailed

**ID:** `issue-1765004057997-7nyxce3si`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\status.js`

**Related Routes:**

- `GET /api/status/detailed` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 24: Backend route without frontend call: GET /api/userPreferences/preferences

**ID:** `issue-1765004057997-0upsuzxpf`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\userPreferences.js`

**Related Routes:**

- `GET /api/userPreferences/preferences` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 25: Backend route without frontend call: PUT /api/userPreferences/preferences

**ID:** `issue-1765004057997-l8jevo235`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\userPreferences.js`

**Related Routes:**

- `PUT /api/userPreferences/preferences` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 26: Backend route without frontend call: GET /api/version/

**ID:** `issue-1765004057997-34y1sv8kb`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\version.js`

**Related Routes:**

- `GET /api/version/` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 27: Backend route without frontend call: GET /api/version/changelog

**ID:** `issue-1765004057997-2xtpekbrt`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\version.js`

**Related Routes:**

- `GET /api/version/changelog` (legacy)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 28: Backend route without frontend call: GET /api/admin/users/:id

**ID:** `issue-1765004057997-t5iy2zyr6`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/admin/users/:id` (admin)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 29: Backend route without frontend call: GET /api/admin/stats

**ID:** `issue-1765004057997-ipc03rikt`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/admin/stats` (admin)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 30: Backend route without frontend call: POST /api/auth/refresh

**ID:** `issue-1765004057997-vdx2cmexx`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `POST /api/auth/refresh` (auth)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 31: Backend route without frontend call: GET /api/auth/me

**ID:** `issue-1765004057997-rfyzv6zif`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/auth/me` (auth)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 32: Backend route without frontend call: POST /api/auth/change-password

**ID:** `issue-1765004057997-zqvffof4c`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `POST /api/auth/change-password` (auth)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 33: Backend route without frontend call: POST /api/auth/logout

**ID:** `issue-1765004057997-7sfapod6j`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `POST /api/auth/logout` (auth)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 34: Backend route without frontend call: GET /api/invoices/

**ID:** `issue-1765004057997-f78bmrr71`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/invoices/` (invoices)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 35: Backend route without frontend call: GET /api/invoices/stats

**ID:** `issue-1765004057997-5j9tkvbc4`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/invoices/stats` (invoices)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 36: Backend route without frontend call: GET /api/invoices/search

**ID:** `issue-1765004057997-m3gfpisej`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/invoices/search` (invoices)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 37: Backend route without frontend call: GET /api/invoices/:id

**ID:** `issue-1765004057997-w7u0fphvt`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/invoices/:id` (invoices)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 38: Backend route without frontend call: GET /api/notifications/count

**ID:** `issue-1765004057997-6aimz1jyx`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/notifications/count` (notifications)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 39: Backend route without frontend call: GET /api/projects/search

**ID:** `issue-1765004057997-9kg0gjrip`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/projects/search` (projects)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 40: Backend route without frontend call: GET /api/projects/stats

**ID:** `issue-1765004057997-wt2eob70r`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/projects/stats` (projects)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 41: Backend route without frontend call: GET /api/projects/:id

**ID:** `issue-1765004057997-gti51wzpa`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/projects/:id` (projects)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 42: Backend route without frontend call: GET /api/tasks/due-soon

**ID:** `issue-1765004057997-2lxymnnny`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/tasks/due-soon` (tasks)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 43: Backend route without frontend call: GET /api/tasks/search

**ID:** `issue-1765004057997-xprlwm6n6`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/tasks/search` (tasks)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 44: Backend route without frontend call: GET /api/tasks/stats/status

**ID:** `issue-1765004057997-utyoht3is`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/tasks/stats/status` (tasks)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 45: Backend route without frontend call: GET /api/tasks/stats/priority

**ID:** `issue-1765004057997-xczwav1n7`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/tasks/stats/priority` (tasks)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 46: Backend route without frontend call: GET /api/tasks/:id

**ID:** `issue-1765004057997-4uk8dlqp8`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/tasks/:id` (tasks)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 47: Backend route without frontend call: GET /api/time-tracking/summary

**ID:** `issue-1765004057997-9l597vcwr`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/time-tracking/summary` (time-tracking)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 48: Backend route without frontend call: GET /api/time-tracking/duration/total

**ID:** `issue-1765004057997-xxb6qqsz9`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/time-tracking/duration/total` (time-tracking)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 49: Backend route without frontend call: GET /api/time-tracking/duration/by-date

**ID:** `issue-1765004057997-ojh80z0w3`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/time-tracking/duration/by-date` (time-tracking)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 50: Backend route without frontend call: GET /api/time-tracking/duration/task/:taskId

**ID:** `issue-1765004057997-08hvw61go`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/time-tracking/duration/task/:taskId` (time-tracking)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

### Issue 51: Backend route without frontend call: GET /api/time-tracking/duration/project/:projectId

**ID:** `issue-1765004057997-gqzb5veld`
**Type:** MISSING_ROUTE
**Severity:** 🟡 MEDIUM

**Description:**

Backend route exists but is not called by any frontend component. This may be unused code.

**Location:**

- **File:** `unknown`

**Related Routes:**

- `GET /api/time-tracking/duration/project/:projectId` (time-tracking)

**Suggested Fix:**

Either add frontend integration for this route or remove it if it's no longer needed.

---

---

