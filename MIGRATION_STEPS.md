# Migration Steps - Practical Guide

## Phase 1: Preparation ✅ (DONE)

- ✅ Create new branch `restructure`
- ✅ Create new folder structures
- ✅ Create example implementations
- ✅ Write documentation

## Phase 2: Backend Migration (Current Phase)

### Step 1: Copy Shared Infrastructure

```bash
# Copy existing utilities to shared
cp backend/src/utils/* backend/src-new/shared/utils/
cp backend/src/middleware/* backend/src-new/shared/middleware/
cp backend/src/config/* backend/src-new/shared/config/
```

### Step 2: Migrate Modules One by One

#### Priority Order:
1. ✅ Auth (DONE - Example)
2. ✅ Clients (DONE - Example)
3. ✅ Projects (DONE - Example)
4. ⏳ Tasks
5. ⏳ Invoices
6. ⏳ Time Tracking
7. ⏳ Reports
8. ⏳ Dashboard
9. ⏳ Admin
10. ⏳ Announcements
11. ⏳ Changelog
12. ⏳ Feedback
13. ⏳ Notifications
14. ⏳ Status

#### For Each Module:

1. **Create Controller**
   - Extract route handlers from `backend/src/routes/[module].js`
   - Move to `backend/src-new/modules/[module]/controllers/[module].controller.js`
   - Keep only HTTP handling logic

2. **Create Service**
   - Extract business logic from controllers
   - Move to `backend/src-new/modules/[module]/services/[module].service.js`
   - Add validation and orchestration

3. **Create Repository**
   - Extract database queries
   - Move to `backend/src-new/modules/[module]/repositories/[module].repository.js`
   - Use parameterized queries

4. **Create Validators**
   - Add input validation with Joi
   - Move to `backend/src-new/modules/[module]/validators/[module].validator.js`

5. **Update Module Index**
   - Define routes in `backend/src-new/modules/[module]/index.js`
   - Export router

6. **Update app.js**
   - Import module
   - Add route: `app.use('/api/[module]', [module]Module)`

### Step 3: Test Each Module

```bash
# Start new backend
cd backend
node src-new/server.js

# Test endpoints
curl http://localhost:5000/api/auth/login
curl http://localhost:5000/api/clients
```

## Phase 3: Frontend Migration

### Step 1: Migrate Features One by One

#### Priority Order:
1. ✅ Auth (DONE - Example)
2. ✅ Clients (DONE - Example)
3. ✅ Projects (DONE - Example)
4. ⏳ Tasks
5. ⏳ Invoices
6. ⏳ Time Tracking
7. ⏳ Reports
8. ⏳ Dashboard
9. ⏳ Admin
10. ⏳ Announcements
11. ⏳ Changelog
12. ⏳ Profile
13. ⏳ Home

#### For Each Feature:

1. **Create Service**
   - Extract API calls from components
   - Move to `frontend/src-new/features/[feature]/services/[feature].service.js`

2. **Create Hooks**
   - Extract state management logic
   - Move to `frontend/src-new/features/[feature]/hooks/use[Feature].js`

3. **Move Pages**
   - Copy from `frontend/src/pages/`
   - Move to `frontend/src-new/features/[feature]/pages/`
   - Update imports

4. **Move Components**
   - Identify feature-specific components
   - Move to `frontend/src-new/features/[feature]/components/`
   - Keep shared components in `shared/components/`

5. **Update Feature Index**
   - Export public API in `frontend/src-new/features/[feature]/index.js`

6. **Update App.jsx**
   - Import feature pages
   - Add routes

### Step 2: Move Shared Resources

```bash
# Move shared components
# Identify truly reusable components
# Move to frontend/src-new/shared/components/

# Move contexts
cp frontend/src/context/* frontend/src-new/shared/context/

# Move utilities
cp frontend/src/utils/* frontend/src-new/shared/utils/
```

### Step 3: Test Each Feature

```bash
# Start new frontend
cd frontend
npm run dev

# Test in browser
# Navigate to each feature
# Test CRUD operations
```

## Phase 4: Switch to New Structure

### Backend

1. **Backup old structure**
   ```bash
   mv backend/src backend/src-old
   ```

2. **Rename new structure**
   ```bash
   mv backend/src-new backend/src
   ```

3. **Update package.json**
   ```json
   {
     "scripts": {
       "dev": "nodemon src/server.js",
       "start": "node src/server.js"
     }
   }
   ```

4. **Test thoroughly**
   ```bash
   npm run dev
   # Test all endpoints
   ```

### Frontend

1. **Backup old structure**
   ```bash
   mv frontend/src frontend/src-old
   ```

2. **Rename new structure**
   ```bash
   mv frontend/src-new frontend/src
   ```

3. **Update imports if needed**

4. **Test thoroughly**
   ```bash
   npm run dev
   # Test all features
   ```

## Phase 5: Cleanup

1. **Remove old code**
   ```bash
   rm -rf backend/src-old
   rm -rf frontend/src-old
   ```

2. **Update documentation**
   - Update README.md
   - Update API documentation
   - Update deployment guides

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: Complete migration to new architecture"
   ```

## Quick Commands

### Run Migration Scripts

```bash
# Backend
node scripts/migrate-backend.js

# Frontend
node scripts/migrate-frontend.js
```

### Test Both Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Check Structure

```bash
# Backend modules
ls -la backend/src-new/modules/

# Frontend features
ls -la frontend/src-new/features/
```

## Rollback Plan

If something goes wrong:

```bash
# Backend
mv backend/src backend/src-failed
mv backend/src-old backend/src

# Frontend
mv frontend/src frontend/src-failed
mv frontend/src-old frontend/src
```

## Progress Tracking

### Backend Modules
- [x] Auth
- [x] Clients
- [x] Projects
- [ ] Tasks
- [ ] Invoices
- [ ] Quotes
- [ ] Time Tracking
- [ ] Reports
- [ ] Admin
- [ ] Announcements
- [ ] Changelog
- [ ] Feedback
- [ ] Notifications
- [ ] Status

### Frontend Features
- [x] Auth
- [x] Clients
- [x] Projects
- [ ] Tasks
- [ ] Invoices
- [ ] Quotes
- [ ] Time Tracking
- [ ] Reports
- [ ] Dashboard
- [ ] Admin
- [ ] Announcements
- [ ] Changelog
- [ ] Profile
- [ ] Home

## Tips

1. **Migrate incrementally** - One module/feature at a time
2. **Test after each migration** - Don't move to next until current works
3. **Keep old code** - Don't delete until everything works
4. **Document issues** - Note any problems for future reference
5. **Ask for help** - If stuck, review documentation or ask team

## Next Action

Start with migrating the **Tasks** module:

```bash
# 1. Create tasks module structure
# 2. Copy code from backend/src/routes/tasks.js
# 3. Split into controller, service, repository
# 4. Test endpoints
# 5. Move to next module
```
