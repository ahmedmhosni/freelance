# Detailed Route Inventory Report

**Generated:** 12/6/2025, 8:54:17 AM

**Total Routes:** 150
**Modular Routes:** 65
**Legacy Routes:** 85

---

## Table of Contents

- [Modular Routes](#modular-routes)
- [Legacy Routes](#legacy-routes)
- [Frontend-Backend Matches](#frontend-backend-matches)
- [Unmatched Backend Routes](#unmatched-backend-routes)
- [Unmatched Frontend Calls](#unmatched-frontend-calls)

---

## Modular Routes

### Module: admin

**Routes:** 7

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| GET | `/api/admin/reports` | bound getSystemReports | 🔓 | bound getSystemReports |
| GET | `/api/admin/stats` | bound getSystemStats | 🔓 | bound getSystemStats |
| GET | `/api/admin/users` | bound getAllUsers | 🔓 | bound getAllUsers |
| GET | `/api/admin/users/:id` | bound getUserWithStats | 🔓 | bound getUserWithStats |
| DELETE | `/api/admin/users/:id` | bound deleteUser | 🔓 | bound deleteUser |
| PUT | `/api/admin/users/:id/role` | bound updateUserRole | 🔓 | bound updateUserRole |
| PUT | `/api/admin/users/:id/verification` | bound updateUserVerification | 🔓 | bound updateUserVerification |

### Module: auth

**Routes:** 6

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| POST | `/api/auth/change-password` | bound changePassword | 🔒 | authenticateToken, bound changePassword |
| POST | `/api/auth/login` | bound login | 🔓 | bound login |
| POST | `/api/auth/logout` | bound logout | 🔒 | authenticateToken, bound logout |
| GET | `/api/auth/me` | bound getCurrentUser | 🔒 | authenticateToken, bound getCurrentUser |
| POST | `/api/auth/refresh` | bound refreshToken | 🔓 | bound refreshToken |
| POST | `/api/auth/register` | bound register | 🔓 | bound register |

### Module: clients

**Routes:** 5

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| GET | `/api/clients/` | bound getAll | 🔓 | middleware, middleware, middleware, handleValidationErrors, bound getAll |
| POST | `/api/clients/` | bound create | 🔓 | middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound create |
| GET | `/api/clients/:id` | bound getById | 🔓 | middleware, handleValidationErrors, bound getById |
| PUT | `/api/clients/:id` | bound update | 🔓 | middleware, handleValidationErrors, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound update |
| DELETE | `/api/clients/:id` | bound delete | 🔓 | middleware, handleValidationErrors, bound delete |

### Module: invoices

**Routes:** 8

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| GET | `/api/invoices/` | bound getAll | 🔓 | middleware, middleware, middleware, middleware, bound getAll |
| POST | `/api/invoices/` | bound create | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, middleware, middleware, bound create |
| GET | `/api/invoices/:id` | bound getById | 🔓 | middleware, bound getById |
| PUT | `/api/invoices/:id` | bound update | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, middleware, middleware, middleware, middleware, middleware, bound update |
| DELETE | `/api/invoices/:id` | bound delete | 🔓 | middleware, bound delete |
| GET | `/api/invoices/overdue` | bound getOverdue | 🔓 | bound getOverdue |
| GET | `/api/invoices/search` | bound search | 🔓 | middleware, middleware, middleware, middleware, bound search |
| GET | `/api/invoices/stats` | bound getStats | 🔓 | bound getStats |

### Module: notifications

**Routes:** 2

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| GET | `/api/notifications/` | bound getUserNotifications | 🔓 | bound getUserNotifications |
| GET | `/api/notifications/count` | bound getNotificationCount | 🔓 | bound getNotificationCount |

### Module: projects

**Routes:** 8

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| GET | `/api/projects/` | bound getAll | 🔓 | middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound getAll |
| POST | `/api/projects/` | bound create | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound create |
| GET | `/api/projects/:id` | bound getById | 🔓 | middleware, handleValidationErrors, bound getById |
| PUT | `/api/projects/:id` | bound update | 🔓 | middleware, handleValidationErrors, middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound update |
| DELETE | `/api/projects/:id` | bound delete | 🔓 | middleware, handleValidationErrors, bound delete |
| GET | `/api/projects/overdue` | bound getOverdue | 🔓 | bound getOverdue |
| GET | `/api/projects/search` | bound search | 🔓 | middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound search |
| GET | `/api/projects/stats` | bound getStats | 🔓 | bound getStats |

### Module: reports

**Routes:** 6

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| GET | `/api/reports/clients` | bound getClientReport | 🔓 | bound getClientReport |
| GET | `/api/reports/financial` | bound getFinancialReport | 🔓 | bound getFinancialReport |
| GET | `/api/reports/projects` | bound getProjectReport | 🔓 | bound getProjectReport |
| GET | `/api/reports/time-tracking/clients` | bound getTimeTrackingByClients | 🔓 | bound getTimeTrackingByClients |
| GET | `/api/reports/time-tracking/projects` | bound getTimeTrackingByProjects | 🔓 | bound getTimeTrackingByProjects |
| GET | `/api/reports/time-tracking/tasks` | bound getTimeTrackingByTasks | 🔓 | bound getTimeTrackingByTasks |

### Module: tasks

**Routes:** 10

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| GET | `/api/tasks/` | bound getAll | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound getAll |
| POST | `/api/tasks/` | bound create | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound create |
| GET | `/api/tasks/:id` | bound getById | 🔓 | middleware, handleValidationErrors, bound getById |
| PUT | `/api/tasks/:id` | bound update | 🔓 | middleware, handleValidationErrors, middleware, middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound update |
| DELETE | `/api/tasks/:id` | bound delete | 🔓 | middleware, handleValidationErrors, bound delete |
| GET | `/api/tasks/due-soon` | bound getDueSoon | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound getDueSoon |
| GET | `/api/tasks/overdue` | bound getOverdue | 🔓 | bound getOverdue |
| GET | `/api/tasks/search` | bound search | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound search |
| GET | `/api/tasks/stats/priority` | bound getPriorityStats | 🔓 | bound getPriorityStats |
| GET | `/api/tasks/stats/status` | bound getStatusStats | 🔓 | bound getStatusStats |

### Module: time-tracking

**Routes:** 13

| Method | Path | Handler | Auth | Middleware |
|--------|------|---------|------|------------|
| GET | `/api/time-tracking/` | bound getAll | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound getAll |
| POST | `/api/time-tracking/` | bound create | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound create |
| GET | `/api/time-tracking/:id` | bound getById | 🔓 | middleware, handleValidationErrors, bound getById |
| PUT | `/api/time-tracking/:id` | bound update | 🔓 | middleware, handleValidationErrors, middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound update |
| DELETE | `/api/time-tracking/:id` | bound delete | 🔓 | middleware, handleValidationErrors, bound delete |
| POST | `/api/time-tracking/:id/stop` | bound stopTimer | 🔓 | middleware, handleValidationErrors, bound stopTimer |
| GET | `/api/time-tracking/duration/by-date` | bound getDurationByDate | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound getDurationByDate |
| GET | `/api/time-tracking/duration/project/:projectId` | bound getDurationByProject | 🔓 | bound getDurationByProject |
| GET | `/api/time-tracking/duration/task/:taskId` | bound getDurationByTask | 🔓 | bound getDurationByTask |
| GET | `/api/time-tracking/duration/total` | bound getTotalDuration | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound getTotalDuration |
| GET | `/api/time-tracking/running` | bound getRunningTimers | 🔓 | bound getRunningTimers |
| POST | `/api/time-tracking/start` | bound startTimer | 🔓 | middleware, middleware, middleware, middleware, handleValidationErrors, bound startTimer |
| GET | `/api/time-tracking/summary` | bound getSummary | 🔓 | middleware, middleware, middleware, middleware, middleware, middleware, handleValidationErrors, bound getSummary |

---

## Legacy Routes

**Total Legacy Routes:** 85

| Method | Path | Handler | Auth | File |
|--------|------|---------|------|------|
| GET | `/api/admin-activity/inactive-users` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-activity.js |
| GET | `/api/admin-activity/user-activity` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-activity.js |
| POST | `/api/admin-activity/delete-inactive` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-activity.js |
| GET | `/api/admin-activity/stats` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-activity.js |
| GET | `/api/admin-gdpr/export-requests` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js |
| GET | `/api/admin-gdpr/deleted-accounts` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js |
| POST | `/api/admin-gdpr/restore-account` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js |
| GET | `/api/admin-gdpr/email-preferences-stats` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js |
| GET | `/api/admin-gdpr/deletion-reasons` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\admin-gdpr.js |
| GET | `/api/announcements/` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\announcements.js |
| GET | `/api/announcements/featured` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\announcements.js |
| GET | `/api/announcements/:id` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\announcements.js |
| POST | `/api/announcements/` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\announcements.js |
| PUT | `/api/announcements/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\announcements.js |
| DELETE | `/api/announcements/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\announcements.js |
| POST | `/api/auth/register` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\auth.js |
| POST | `/api/auth/login` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\auth.js |
| GET | `/api/auth/verify-email/:token` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\auth.js |
| POST | `/api/auth/verify-code` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\auth.js |
| POST | `/api/auth/resend-verification` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\auth.js |
| POST | `/api/auth/forgot-password` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\auth.js |
| POST | `/api/auth/reset-password` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\auth.js |
| GET | `/api/changelog/current-version` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| GET | `/api/changelog/public` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| GET | `/api/changelog/admin/versions` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| GET | `/api/changelog/admin/versions/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| POST | `/api/changelog/admin/versions` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| PUT | `/api/changelog/admin/versions/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| DELETE | `/api/changelog/admin/versions/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| PATCH | `/api/changelog/admin/versions/:id/publish` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| POST | `/api/changelog/admin/versions/:id/items` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| PUT | `/api/changelog/admin/items/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| DELETE | `/api/changelog/admin/items/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| POST | `/api/changelog/admin/sync-commits` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| GET | `/api/changelog/admin/pending-commits` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| POST | `/api/changelog/admin/mark-commits-processed` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| GET | `/api/changelog/admin/version-names` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| POST | `/api/changelog/admin/version-names` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| PUT | `/api/changelog/admin/version-names/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| DELETE | `/api/changelog/admin/version-names/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\changelog.js |
| GET | `/api/dashboard/stats` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\dashboard.js |
| GET | `/api/dashboard/recent-tasks` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\dashboard.js |
| GET | `/api/dashboard/charts` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\dashboard.js |
| POST | `/api/feedback/` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\feedback.js |
| GET | `/api/feedback/` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\feedback.js |
| PUT | `/api/feedback/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\feedback.js |
| DELETE | `/api/feedback/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\feedback.js |
| GET | `/api/files/` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\files.js |
| POST | `/api/files/` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\files.js |
| POST | `/api/files/connect` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\files.js |
| POST | `/api/gdpr/export` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\gdpr.js |
| GET | `/api/gdpr/export/status` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\gdpr.js |
| POST | `/api/gdpr/delete-account` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\gdpr.js |
| GET | `/api/gdpr/download/:filename` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\gdpr.js |
| GET | `/api/health/health` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\health.js |
| GET | `/api/health/ping` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\health.js |
| GET | `/api/legal/terms` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\legal.js |
| GET | `/api/legal/privacy` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\legal.js |
| PUT | `/api/legal/:type` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\legal.js |
| GET | `/api/legal/:type/versions` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\legal.js |
| GET | `/api/maintenance/` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\maintenance.js |
| PUT | `/api/maintenance/` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\maintenance.js |
| GET | `/api/maintenance/status` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\maintenance.js |
| GET | `/api/preferences/email` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\preferences.js |
| PUT | `/api/preferences/email` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\preferences.js |
| POST | `/api/preferences/unsubscribe` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\preferences.js |
| GET | `/api/profile/` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js |
| GET | `/api/profile/me` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js |
| PUT | `/api/profile/me` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js |
| GET | `/api/profile/:username` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js |
| GET | `/api/profile/check-username/:username` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js |
| POST | `/api/profile/upload-picture` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js |
| DELETE | `/api/profile/delete-picture` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\profile.js |
| GET | `/api/quotes/daily` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\quotes.js |
| GET | `/api/quotes/` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\quotes.js |
| POST | `/api/quotes/` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\quotes.js |
| PUT | `/api/quotes/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\quotes.js |
| DELETE | `/api/quotes/:id` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\quotes.js |
| GET | `/api/status/` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\status.js |
| GET | `/api/status/history` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\status.js |
| GET | `/api/status/detailed` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\status.js |
| GET | `/api/userPreferences/preferences` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\userPreferences.js |
| PUT | `/api/userPreferences/preferences` | <anonymous> | 🔒 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\userPreferences.js |
| GET | `/api/version/` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\version.js |
| GET | `/api/version/changelog` | <anonymous> | 🔓 | C:\Users\ahmed\Downloads\freelancemanagment\backend\src\routes\version.js |

---

## Frontend-Backend Matches

**Total Matches:** 99

| Frontend Component | Method | Path | Backend Module | Backend Handler |
|--------------------|--------|------|----------------|------------------|
| AnnouncementBanner | GET | `/announcements/featured` | legacy | <anonymous> |
| AnnouncementsManager | GET | `/announcements` | legacy | <anonymous> |
| AnnouncementsManager | PUT | `/announcements/:editingId` | legacy | <anonymous> |
| AnnouncementsManager | POST | `/announcements` | legacy | <anonymous> |
| AnnouncementsManager | DELETE | `/announcements/:id` | legacy | <anonymous> |
| AppFooter | GET | `/api/changelog/current-version` | legacy | <anonymous> |
| AvatarPicker | POST | `/profile/upload-picture` | legacy | <anonymous> |
| ChangelogEditor | GET | `/changelog/admin/version-names?type=minor&unused_only=true` | legacy | <anonymous> |
| ChangelogEditor | GET | `/changelog/admin/versions` | legacy | <anonymous> |
| ChangelogEditor | GET | `/changelog/admin/versions/:versionId` | legacy | <anonymous> |
| ChangelogEditor | PUT | `/changelog/admin/versions/:editingVersionId` | legacy | <anonymous> |
| ChangelogEditor | POST | `/changelog/admin/versions` | legacy | <anonymous> |
| ChangelogEditor | PATCH | `/changelog/admin/versions/:id/publish` | legacy | <anonymous> |
| ChangelogEditor | DELETE | `/changelog/admin/versions/:id` | legacy | <anonymous> |
| ChangelogEditor | PUT | `/changelog/admin/items/:param` | legacy | <anonymous> |
| ChangelogEditor | POST | `/changelog/admin/versions/:param/items` | legacy | <anonymous> |
| ChangelogEditor | DELETE | `/changelog/admin/items/:itemId` | legacy | <anonymous> |
| ChangelogEditor | POST | `/changelog/admin/mark-commits-processed` | legacy | <anonymous> |
| DataPrivacy | POST | `/api/gdpr/export` | legacy | <anonymous> |
| DataPrivacy | POST | `/api/gdpr/delete-account` | legacy | <anonymous> |
| EmailPreferences | GET | `/api/preferences/email` | legacy | <anonymous> |
| EmailPreferences | PUT | `/api/preferences/email` | legacy | <anonymous> |
| FeedbackManager | PUT | `/feedback/:id` | legacy | <anonymous> |
| FeedbackManager | DELETE | `/feedback/:id` | legacy | <anonymous> |
| FeedbackWidget | POST | `/feedback` | legacy | <anonymous> |
| LegalEditor | GET | `/legal/:activeType` | legacy | <anonymous> |
| LegalEditor | PUT | `/legal/:activeType` | legacy | <anonymous> |
| MaintenanceEditor | GET | `/maintenance` | legacy | <anonymous> |
| MaintenanceEditor | PUT | `/maintenance` | legacy | <anonymous> |
| NotificationBell | GET | `/notifications` | notifications | bound getUserNotifications |
| PendingCommits | GET | `/changelog/admin/pending-commits` | legacy | <anonymous> |
| PendingCommits | POST | `/changelog/admin/sync-commits` | legacy | <anonymous> |
| QuotesManager | GET | `/quotes?page=:currentPage&limit=:itemsPerPage` | legacy | <anonymous> |
| QuotesManager | PUT | `/quotes/:param` | legacy | <anonymous> |
| QuotesManager | POST | `/quotes` | legacy | <anonymous> |
| QuotesManager | DELETE | `/quotes/:id` | legacy | <anonymous> |
| TaskCalendar | GET | `/tasks` | tasks | bound getAll |
| TimerWidget | GET | `/time-tracking` | time-tracking | bound getAll |
| TimerWidget | GET | `/projects` | projects | bound getAll |
| TimerWidget | POST | `/time-tracking/start` | time-tracking | bound startTimer |
| TimerWidget | POST | `/time-tracking/stop/:param` | time-tracking | bound stopTimer |
| VersionNamesManager | POST | `/changelog/admin/version-names` | legacy | <anonymous> |
| VersionNamesManager | PUT | `/changelog/admin/version-names/:id` | legacy | <anonymous> |
| VersionNamesManager | DELETE | `/changelog/admin/version-names/:id` | legacy | <anonymous> |
| AuthContext | POST | `/auth/login` | legacy | <anonymous> |
| MaintenanceContext | GET | `/maintenance/status` | legacy | <anonymous> |
| LegalEditor | GET | `/legal/:activeType` | legacy | <anonymous> |
| AdminPanel | GET | `/status` | legacy | <anonymous> |
| AdminPanel | GET | `/admin/users` | admin | bound getAllUsers |
| AdminPanel | GET | `/admin/reports` | admin | bound getSystemReports |
| AdminPanel | PUT | `/admin/users/:userId/role` | admin | bound updateUserRole |
| AdminPanel | DELETE | `/admin/users/:userId` | admin | bound deleteUser |
| AdminPanel | PUT | `/admin/users/:userId/verification` | admin | bound updateUserVerification |
| AnnouncementBanner | GET | `/announcements/featured` | legacy | <anonymous> |
| ForgotPassword | POST | `/auth/forgot-password` | legacy | <anonymous> |
| Login | GET | `/quotes/daily` | legacy | <anonymous> |
| Register | POST | `/auth/register` | legacy | <anonymous> |
| ResendVerification | POST | `/auth/resend-verification` | legacy | <anonymous> |
| ResetPassword | POST | `/auth/reset-password` | legacy | <anonymous> |
| VerifyEmail | GET | `/auth/verify-email/:token` | legacy | <anonymous> |
| VerifyEmail | POST | `/auth/verify-code` | legacy | <anonymous> |
| Changelog | GET | `/api/changelog/public` | legacy | <anonymous> |
| ClientDetail | GET | `/clients/:id` | clients | bound getById |
| ClientDetail | DELETE | `/projects/:param` | projects | bound delete |
| ClientDetail | DELETE | `/tasks/:param` | tasks | bound delete |
| clientApi | GET | `/clients?page=:page&limit=:limit&search=:search` | clients | bound getAll |
| clientApi | POST | `/clients` | clients | bound create |
| clientApi | PUT | `/clients/:id` | clients | bound update |
| clientApi | DELETE | `/clients/:id` | clients | bound delete |
| Dashboard | GET | `/dashboard/stats` | legacy | <anonymous> |
| Dashboard | GET | `/dashboard/recent-tasks?limit=5` | legacy | <anonymous> |
| Dashboard | GET | `/dashboard/charts` | legacy | <anonymous> |
| invoiceApi | GET | `/invoices/:id` | invoices | bound getOverdue |
| invoiceApi | POST | `/invoices` | invoices | bound create |
| invoiceApi | PUT | `/invoices/:id` | invoices | bound update |
| invoiceApi | DELETE | `/invoices/:id` | invoices | bound delete |
| Profile | GET | `/profile` | legacy | <anonymous> |
| PublicProfile | GET | `/profile/:username` | legacy | <anonymous> |
| projectApi | GET | `/projects/:id` | projects | bound getOverdue |
| projectApi | POST | `/projects` | projects | bound create |
| projectApi | PUT | `/projects/:id` | projects | bound update |
| Reports | GET | `/reports/financial` | reports | bound getFinancialReport |
| Reports | GET | `/reports/projects` | reports | bound getProjectReport |
| Reports | GET | `/reports/clients` | reports | bound getClientReport |
| Reports | GET | `/reports/time-tracking/tasks` | reports | bound getTimeTrackingByTasks |
| Reports | GET | `/reports/time-tracking/projects` | reports | bound getTimeTrackingByProjects |
| Reports | GET | `/reports/time-tracking/clients` | reports | bound getTimeTrackingByClients |
| PublicStatus | GET | `/api/status/history` | legacy | <anonymous> |
| taskApi | GET | `/tasks/:id` | tasks | bound getOverdue |
| taskApi | POST | `/tasks` | tasks | bound create |
| taskApi | PUT | `/tasks/:id` | tasks | bound update |
| timeTrackingApi | GET | `/time-tracking/:id` | time-tracking | bound getRunningTimers |
| timeTrackingApi | POST | `/time-tracking` | time-tracking | bound create |
| timeTrackingApi | PUT | `/time-tracking/:id` | time-tracking | bound update |
| timeTrackingApi | DELETE | `/time-tracking/:id` | time-tracking | bound delete |
| timeTrackingApi | GET | `/time-tracking/grouped?:queryParams` | time-tracking | bound getById |
| PublicProfile | GET | `/profile/:username` | legacy | <anonymous> |
| Register | POST | `/auth/register` | auth | bound register |
| AuthContext | POST | `/auth/login` | auth | bound login |

---

## Unmatched Backend Routes

⚠️ **51 backend route(s) without frontend calls**

*These routes may be unused or missing frontend integration.*

| Method | Path | Module | Handler |
|--------|------|--------|----------|
| GET | `/api/admin-activity/inactive-users` | legacy | <anonymous> |
| GET | `/api/admin-activity/user-activity` | legacy | <anonymous> |
| POST | `/api/admin-activity/delete-inactive` | legacy | <anonymous> |
| GET | `/api/admin-activity/stats` | legacy | <anonymous> |
| GET | `/api/admin-gdpr/export-requests` | legacy | <anonymous> |
| GET | `/api/admin-gdpr/deleted-accounts` | legacy | <anonymous> |
| POST | `/api/admin-gdpr/restore-account` | legacy | <anonymous> |
| GET | `/api/admin-gdpr/email-preferences-stats` | legacy | <anonymous> |
| GET | `/api/admin-gdpr/deletion-reasons` | legacy | <anonymous> |
| GET | `/api/feedback/` | legacy | <anonymous> |
| GET | `/api/files/` | legacy | <anonymous> |
| POST | `/api/files/` | legacy | <anonymous> |
| POST | `/api/files/connect` | legacy | <anonymous> |
| GET | `/api/gdpr/export/status` | legacy | <anonymous> |
| GET | `/api/gdpr/download/:filename` | legacy | <anonymous> |
| GET | `/api/health/health` | legacy | <anonymous> |
| GET | `/api/health/ping` | legacy | <anonymous> |
| GET | `/api/legal/:type/versions` | legacy | <anonymous> |
| POST | `/api/preferences/unsubscribe` | legacy | <anonymous> |
| PUT | `/api/profile/me` | legacy | <anonymous> |
| GET | `/api/profile/check-username/:username` | legacy | <anonymous> |
| DELETE | `/api/profile/delete-picture` | legacy | <anonymous> |
| GET | `/api/status/detailed` | legacy | <anonymous> |
| GET | `/api/userPreferences/preferences` | legacy | <anonymous> |
| PUT | `/api/userPreferences/preferences` | legacy | <anonymous> |
| GET | `/api/version/` | legacy | <anonymous> |
| GET | `/api/version/changelog` | legacy | <anonymous> |
| GET | `/api/admin/users/:id` | admin | bound getUserWithStats |
| GET | `/api/admin/stats` | admin | bound getSystemStats |
| POST | `/api/auth/refresh` | auth | bound refreshToken |
| GET | `/api/auth/me` | auth | bound getCurrentUser |
| POST | `/api/auth/change-password` | auth | bound changePassword |
| POST | `/api/auth/logout` | auth | bound logout |
| GET | `/api/invoices/` | invoices | bound getAll |
| GET | `/api/invoices/stats` | invoices | bound getStats |
| GET | `/api/invoices/search` | invoices | bound search |
| GET | `/api/invoices/:id` | invoices | bound getById |
| GET | `/api/notifications/count` | notifications | bound getNotificationCount |
| GET | `/api/projects/search` | projects | bound search |
| GET | `/api/projects/stats` | projects | bound getStats |
| GET | `/api/projects/:id` | projects | bound getById |
| GET | `/api/tasks/due-soon` | tasks | bound getDueSoon |
| GET | `/api/tasks/search` | tasks | bound search |
| GET | `/api/tasks/stats/status` | tasks | bound getStatusStats |
| GET | `/api/tasks/stats/priority` | tasks | bound getPriorityStats |
| GET | `/api/tasks/:id` | tasks | bound getById |
| GET | `/api/time-tracking/summary` | time-tracking | bound getSummary |
| GET | `/api/time-tracking/duration/total` | time-tracking | bound getTotalDuration |
| GET | `/api/time-tracking/duration/by-date` | time-tracking | bound getDurationByDate |
| GET | `/api/time-tracking/duration/task/:taskId` | time-tracking | bound getDurationByTask |
| GET | `/api/time-tracking/duration/project/:projectId` | time-tracking | bound getDurationByProject |

---

## Unmatched Frontend Calls

⚠️ **149 frontend call(s) without backend routes**

*These calls may fail at runtime.*

| Component | Method | Path | File | Line |
|-----------|--------|------|------|------|
| ChangelogEditor | GET | `/changelog/admin/version-names?type=major&unused_only=true` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\ChangelogEditor.jsx | 46 |
| ChangelogEditor | POST | `/changelog/admin/versions` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\ChangelogEditor.jsx | 245 |
| ChangelogEditor | POST | `/changelog/admin/versions/:newVersionId/items` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\ChangelogEditor.jsx | 264 |
| FeedbackManager | PUT | `/feedback/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\FeedbackManager.jsx | 50 |
| InvoiceForm | GET | `/invoices/:param/items` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\InvoiceForm.jsx | 147 |
| InvoiceForm | POST | `/invoices/:invoiceId/items` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\InvoiceForm.jsx | 290 |
| Layout | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\Layout.jsx | 45 |
| QuotesManager | PUT | `/quotes/:param` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\QuotesManager.jsx | 86 |
| TimerWidget | GET | `/tasks` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\TimerWidget.jsx | 68 |
| VersionNamesManager | GET | `/changelog/admin/version-names?type=minor` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\VersionNamesManager.jsx | 25 |
| VersionNamesManager | GET | `/changelog/admin/version-names?type=major` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\components\VersionNamesManager.jsx | 26 |
| ThemeContext | GET | `/user/preferences` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\context\ThemeContext.jsx | 40 |
| ThemeContext | PUT | `/user/preferences` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\context\ThemeContext.jsx | 80 |
| FeedbackManager | PUT | `/feedback/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\FeedbackManager.jsx | 36 |
| FeedbackManager | PUT | `/feedback/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\FeedbackManager.jsx | 50 |
| FeedbackManager | DELETE | `/feedback/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\FeedbackManager.jsx | 66 |
| LegalEditor | PUT | `/legal/:activeType` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\LegalEditor.jsx | 39 |
| MaintenanceEditor | GET | `/maintenance` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\MaintenanceEditor.jsx | 21 |
| MaintenanceEditor | PUT | `/maintenance` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\MaintenanceEditor.jsx | 37 |
| PendingCommits | GET | `/changelog/admin/pending-commits` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\PendingCommits.jsx | 22 |
| PendingCommits | POST | `/changelog/admin/sync-commits` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\PendingCommits.jsx | 74 |
| QuotesManager | GET | `/quotes?page=:currentPage&limit=:itemsPerPage` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx | 23 |
| QuotesManager | PUT | `/quotes/:param` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx | 36 |
| QuotesManager | POST | `/quotes` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx | 39 |
| QuotesManager | DELETE | `/quotes/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx | 66 |
| QuotesManager | PUT | `/quotes/:param` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\QuotesManager.jsx | 84 |
| VersionNamesManager | GET | `/changelog/admin/version-names?type=minor` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx | 23 |
| VersionNamesManager | GET | `/changelog/admin/version-names?type=major` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx | 24 |
| VersionNamesManager | POST | `/changelog/admin/version-names` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx | 38 |
| VersionNamesManager | PUT | `/changelog/admin/version-names/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx | 55 |
| VersionNamesManager | DELETE | `/changelog/admin/version-names/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\components\VersionNamesManager.jsx | 70 |
| AdminGDPR | GET | `/api/admin/gdpr/export-requests` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx | 38 |
| AdminGDPR | GET | `/api/admin/gdpr/deleted-accounts` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx | 42 |
| AdminGDPR | GET | `/api/admin/gdpr/email-preferences-stats` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx | 46 |
| AdminGDPR | GET | `/api/admin/gdpr/deletion-reasons` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx | 49 |
| AdminGDPR | POST | `/api/admin/gdpr/restore-account` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminGDPR.jsx | 69 |
| AdminPanel | GET | `/admin/activity/inactive-users?days=:inactiveDays` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminPanel.jsx | 58 |
| AdminPanel | GET | `/admin/activity/stats` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminPanel.jsx | 67 |
| AdminPanel | POST | `/admin/activity/delete-inactive` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminPanel.jsx | 80 |
| AdminPanel | POST | `/admin/activity/delete-inactive` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\admin\pages\AdminPanel.jsx | 97 |
| AnnouncementsManager | GET | `/api/announcements` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\components\AnnouncementsManager.jsx | 23 |
| AnnouncementsManager | PUT | `/api/announcements/:editingId` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\components\AnnouncementsManager.jsx | 49 |
| AnnouncementsManager | POST | `/api/announcements` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\components\AnnouncementsManager.jsx | 56 |
| AnnouncementsManager | DELETE | `/api/announcements/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\components\AnnouncementsManager.jsx | 91 |
| AnnouncementDetail | GET | `/api/announcements/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\pages\AnnouncementDetail.jsx | 24 |
| AnnouncementDetail | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\pages\AnnouncementDetail.jsx | 37 |
| Announcements | GET | `/api/announcements` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\pages\Announcements.jsx | 22 |
| Announcements | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\announcements\pages\Announcements.jsx | 37 |
| Login | GET | `/maintenance/status` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\auth\pages\Login.jsx | 32 |
| ChangelogEditor | GET | `/changelog/admin/version-names?type=minor&unused_only=true` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 43 |
| ChangelogEditor | GET | `/changelog/admin/version-names?type=major&unused_only=true` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 44 |
| ChangelogEditor | GET | `/changelog/admin/versions` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 74 |
| ChangelogEditor | GET | `/changelog/admin/versions/:versionId` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 95 |
| ChangelogEditor | PUT | `/changelog/admin/versions/:editingVersionId` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 106 |
| ChangelogEditor | POST | `/changelog/admin/versions` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 108 |
| ChangelogEditor | PATCH | `/changelog/admin/versions/:id/publish` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 121 |
| ChangelogEditor | DELETE | `/changelog/admin/versions/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 137 |
| ChangelogEditor | PUT | `/changelog/admin/items/:param` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 154 |
| ChangelogEditor | POST | `/changelog/admin/versions/:param/items` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 156 |
| ChangelogEditor | DELETE | `/changelog/admin/items/:itemId` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 178 |
| ChangelogEditor | POST | `/changelog/admin/versions` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 243 |
| ChangelogEditor | POST | `/changelog/admin/versions/:newVersionId/items` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 262 |
| ChangelogEditor | POST | `/changelog/admin/mark-commits-processed` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\changelog\components\ChangelogEditor.jsx | 270 |
| ClientDetail | GET | `/projects?client_id=:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\clients\pages\ClientDetail.jsx | 26 |
| ClientDetail | GET | `/tasks?client_id=:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\clients\pages\ClientDetail.jsx | 27 |
| clientApi | GET | `/clients/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\clients\services\clientApi.js | 27 |
| Home | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\home\pages\Home.jsx | 24 |
| InvoiceForm | GET | `/invoices/:param/items` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\invoices\components\InvoiceForm.jsx | 146 |
| InvoiceForm | POST | `/invoices/:invoiceId/items` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\invoices\components\InvoiceForm.jsx | 289 |
| invoiceApi | GET | `/invoices/:id/pdf` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\invoices\services\invoiceApi.js | 76 |
| Privacy | GET | `/legal/privacy` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\legal\pages\Privacy.jsx | 16 |
| Terms | GET | `/api/legal/terms` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\legal\pages\Terms.jsx | 16 |
| AvatarPicker | POST | `/profile/upload-picture` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\AvatarPicker.jsx | 78 |
| DataPrivacy | POST | `/api/gdpr/export` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\DataPrivacy.jsx | 23 |
| DataPrivacy | POST | `/api/gdpr/delete-account` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\DataPrivacy.jsx | 52 |
| EmailPreferences | GET | `/api/preferences/email` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\EmailPreferences.jsx | 23 |
| EmailPreferences | PUT | `/api/preferences/email` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\components\EmailPreferences.jsx | 47 |
| Profile | PUT | `/profile` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\profile\pages\Profile.jsx | 64 |
| projectApi | DELETE | `/projects/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\projects\services\projectApi.js | 65 |
| PublicStatus | GET | `/api/status` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\status\pages\PublicStatus.jsx | 16 |
| Status | GET | `/api/status` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\status\pages\Status.jsx | 47 |
| Status | GET | `/api/status/history` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\status\pages\Status.jsx | 60 |
| TaskCalendar | GET | `/tasks` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\tasks\components\TaskCalendar.jsx | 32 |
| taskApi | DELETE | `/tasks/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\tasks\services\taskApi.js | 66 |
| TimerWidget | GET | `/time-tracking` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx | 55 |
| TimerWidget | GET | `/tasks` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx | 66 |
| TimerWidget | GET | `/projects` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx | 76 |
| TimerWidget | POST | `/time-tracking/start` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx | 90 |
| TimerWidget | POST | `/time-tracking/stop/:param` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\components\TimerWidget.jsx | 103 |
| timeTrackingApi | POST | `/time-tracking/start` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\services\timeTrackingApi.js | 43 |
| timeTrackingApi | POST | `/time-tracking/stop/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\features\time-tracking\services\timeTrackingApi.js | 53 |
| AdminGDPR | GET | `/api/admin/gdpr/export-requests` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx | 38 |
| AdminGDPR | GET | `/api/admin/gdpr/deleted-accounts` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx | 42 |
| AdminGDPR | GET | `/api/admin/gdpr/email-preferences-stats` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx | 46 |
| AdminGDPR | GET | `/api/admin/gdpr/deletion-reasons` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx | 49 |
| AdminGDPR | POST | `/api/admin/gdpr/restore-account` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminGDPR.jsx | 69 |
| AdminPanel | GET | `/status` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 41 |
| AdminPanel | GET | `/admin/users` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 50 |
| AdminPanel | GET | `/admin/activity/inactive-users?days=:inactiveDays` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 59 |
| AdminPanel | GET | `/admin/activity/stats` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 68 |
| AdminPanel | POST | `/admin/activity/delete-inactive` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 81 |
| AdminPanel | POST | `/admin/activity/delete-inactive` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 98 |
| AdminPanel | GET | `/admin/reports` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 111 |
| AdminPanel | PUT | `/admin/users/:userId/role` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 120 |
| AdminPanel | DELETE | `/admin/users/:userId` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 132 |
| AdminPanel | PUT | `/admin/users/:userId/verification` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AdminPanel.jsx | 149 |
| AnnouncementDetail | GET | `/announcements/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AnnouncementDetail.jsx | 27 |
| AnnouncementDetail | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\AnnouncementDetail.jsx | 40 |
| Announcements | GET | `/announcements` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Announcements.jsx | 25 |
| Announcements | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Announcements.jsx | 40 |
| Changelog | GET | `/api/changelog/public` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Changelog.jsx | 16 |
| ClientDetail | GET | `/clients/:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx | 28 |
| ClientDetail | GET | `/projects?client_id=:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx | 29 |
| ClientDetail | GET | `/tasks?client_id=:id` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx | 30 |
| ClientDetail | DELETE | `/projects/:param` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx | 46 |
| ClientDetail | DELETE | `/tasks/:param` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ClientDetail.jsx | 58 |
| ComingSoon | GET | `/maintenance` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ComingSoon.jsx | 22 |
| Dashboard | GET | `/dashboard/stats` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Dashboard.jsx | 35 |
| Dashboard | GET | `/dashboard/recent-tasks?limit=5` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Dashboard.jsx | 44 |
| Dashboard | GET | `/dashboard/charts` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Dashboard.jsx | 58 |
| ForgotPassword | POST | `/auth/forgot-password` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ForgotPassword.jsx | 19 |
| Home | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Home.jsx | 25 |
| Login | GET | `/maintenance/status` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Login.jsx | 36 |
| Login | GET | `/quotes/daily` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Login.jsx | 45 |
| Privacy | GET | `/legal/privacy` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Privacy.jsx | 19 |
| Profile | GET | `/profile` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Profile.jsx | 47 |
| Profile | PUT | `/profile` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Profile.jsx | 66 |
| PublicStatus | GET | `/api/status` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\PublicStatus.jsx | 18 |
| PublicStatus | GET | `/api/status/history` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\PublicStatus.jsx | 24 |
| Reports | GET | `/reports/financial` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx | 21 |
| Reports | GET | `/reports/projects` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx | 22 |
| Reports | GET | `/reports/clients` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx | 23 |
| Reports | GET | `/reports/time-tracking/tasks` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx | 24 |
| Reports | GET | `/reports/time-tracking/projects` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx | 25 |
| Reports | GET | `/reports/time-tracking/clients` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Reports.jsx | 26 |
| ResendVerification | POST | `/auth/resend-verification` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ResendVerification.jsx | 20 |
| ResetPassword | POST | `/auth/reset-password` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\ResetPassword.jsx | 40 |
| Status | GET | `/api/status` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Status.jsx | 47 |
| Status | GET | `/api/status/history` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Status.jsx | 60 |
| Terms | GET | `/legal/terms` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\Terms.jsx | 18 |
| VerifyEmail | GET | `/auth/verify-email/:token` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\VerifyEmail.jsx | 40 |
| VerifyEmail | POST | `/auth/verify-code` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\pages\VerifyEmail.jsx | 111 |
| AppFooter | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\components\AppFooter.jsx | 17 |
| FeedbackWidget | POST | `/feedback` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\components\FeedbackWidget.jsx | 59 |
| NotificationBell | GET | `/notifications` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\components\NotificationBell.jsx | 33 |
| MaintenanceContext | GET | `/maintenance/status` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\context\MaintenanceContext.jsx | 26 |
| ThemeContext | GET | `/user/preferences` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\context\ThemeContext.jsx | 40 |
| ThemeContext | PUT | `/user/preferences` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\context\ThemeContext.jsx | 80 |
| Layout | GET | `/api/changelog/current-version` | C:\Users\ahmed\Downloads\freelancemanagment\frontend\src\shared\layouts\Layout.jsx | 45 |

