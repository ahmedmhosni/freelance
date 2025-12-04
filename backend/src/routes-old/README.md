# Archived Old Routes

This directory contains the old route files that have been replaced by the new modular architecture.

## Archived Routes

These routes have been migrated to the new architecture and are no longer used:

### Migrated to New Architecture

1. **clients.js** → `backend/src/modules/clients/`
   - Now uses ClientController, ClientService, ClientRepository
   - Route: `/api/clients`

2. **projects.js** → `backend/src/modules/projects/`
   - Now uses ProjectController, ProjectService, ProjectRepository
   - Route: `/api/projects`

3. **tasks.js** → `backend/src/modules/tasks/`
   - Now uses TaskController, TaskService, TaskRepository
   - Route: `/api/tasks`

4. **invoices.js** → `backend/src/modules/invoices/`
   - Now uses InvoiceController, InvoiceService, InvoiceRepository
   - Route: `/api/invoices`

5. **invoiceItems.js** → Integrated into invoices module
   - Invoice items functionality now part of InvoiceController
   - Route: `/api/invoices` (items handled within invoice endpoints)

6. **timeTracking.js** → `backend/src/modules/time-tracking/`
   - Now uses TimeEntryController, TimeEntryService, TimeEntryRepository
   - Route: `/api/time-tracking`

7. **reports.js** → `backend/src/modules/reports/`
   - Now uses ReportsController, ReportsService
   - Route: `/api/reports`

8. **notifications.js** → `backend/src/modules/notifications/`
   - Now uses NotificationController, NotificationService, NotificationRepository
   - Route: `/api/notifications`

9. **auth-pg.js** → `backend/src/modules/auth/`
   - Now uses AuthController, AuthService
   - Route: `/api/auth`

10. **admin.js** → `backend/src/modules/admin/`
    - Now uses AdminController, AdminService
    - Route: `/api/admin`

## Why These Files Are Archived

These files are kept for reference purposes only. They represent the old architecture where:
- Routes directly accessed database queries
- Business logic was mixed with route handlers
- No separation of concerns
- Difficult to test and maintain

## New Architecture Benefits

The new modular architecture provides:
- ✅ Dependency Injection for better testability
- ✅ Repository Pattern for data access abstraction
- ✅ Service Layer for business logic separation
- ✅ Controller Layer for HTTP handling
- ✅ Clear separation of concerns
- ✅ Easy to mock and unit test
- ✅ Scalable and maintainable

## Removal Timeline

These files can be permanently deleted after:
1. ✅ All tests pass with new architecture
2. ✅ Production deployment is successful
3. ✅ No rollback needed for 30 days
4. ✅ Team confirms no reference needed

## Date Archived

**December 4, 2025**

## Related Documentation

- See `backend/ARCHITECTURE_DEFAULT_COMPLETE.md` for migration details
- See `backend/TASK_56_COMPLETE.md` for architecture switch completion
- See `backend/docs/ARCHITECTURE.md` for new architecture documentation
