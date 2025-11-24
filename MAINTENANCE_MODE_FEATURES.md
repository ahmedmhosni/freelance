# Maintenance Mode Features

## Implemented Features

### 1. **Consistent Fonts**
- All pages use the same font family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`
- Minimal, clean text sizing throughout

### 2. **Coffee Bean Icon**
- Custom SVG coffee bean icon with gradient colors
- Subtle pulse animation
- Adapts colors for dark/light themes

### 3. **Centralized Maintenance Mode**
- **MaintenanceContext** handles all maintenance logic globally
- Automatically applies to ALL pages (existing and future)
- No need to modify individual page components
- When maintenance mode is active:
  - **Non-admin users**: Automatically redirected to `/coming-soon` from any protected route
  - **Admin users**: Full access with warning banner
  - **Public pages**: Login and Coming Soon remain accessible

### 4. **Admin Maintenance Banner**
- Admins see a warning banner at the top when maintenance is active
- Banner features:
  - Orange/red gradient background
  - Warning icon
  - Message: "Maintenance Mode Active - Only admins can access the application"
  - Fixed position, adjusts layout automatically

### 5. **Improved Dark Theme**
- Better text contrast in dark mode
- Proper color visibility for all text elements
- Gradient colors optimized for both themes

## Technical Implementation

### Architecture - Context-Based (Scalable)

**Key Benefit**: New pages automatically inherit maintenance mode behavior without any code changes!

### New Files Created
1. **`frontend/src/context/MaintenanceContext.jsx`**
   - Centralized maintenance mode state management
   - Polls API every 30 seconds
   - Automatically redirects non-admins when maintenance is active
   - Monitors route changes and user authentication

2. **`frontend/src/components/MaintenanceBanner.jsx`**
   - Banner component shown to admins during maintenance mode

### Modified Files
1. **`frontend/src/App.jsx`**
   - Wrapped app with `MaintenanceProvider`
   - Simplified `PrivateRoute` (no maintenance logic needed)

2. **`frontend/src/components/Layout.jsx`**
   - Uses `useMaintenanceMode()` from context
   - Shows banner for admins
   - Adjusts spacing automatically

3. **`frontend/src/pages/Login.jsx`**
   - Simplified - no maintenance checks needed
   - Context handles redirects automatically

4. **`frontend/src/pages/Register.jsx`**
   - Simplified - no maintenance checks needed
   - Context handles redirects automatically

5. **`frontend/src/pages/ComingSoon.jsx`**
   - Minimal, clean text sizing
   - Custom SVG coffee bean icon
   - Better dark theme support

## API Endpoints Used
- `GET /api/maintenance/status` - Check if maintenance mode is active (public)
- `GET /api/maintenance` - Get maintenance page content (public)
- `PUT /api/maintenance` - Update maintenance settings (admin only)

## How to Use

### Enable Maintenance Mode
1. Login as admin
2. Go to Admin Panel
3. Navigate to "Maintenance Page Editor"
4. Check "Enable Maintenance Mode"
5. Click "Save Changes"

### Disable Maintenance Mode
1. Login as admin (you can still access the app)
2. Go to Admin Panel → Maintenance Page Editor
3. Uncheck "Enable Maintenance Mode"
4. Click "Save Changes"

## User Experience

### For Non-Admin Users
- Automatically redirected to Coming Soon page when maintenance is active
- Cannot access any protected routes
- Clean, minimal Coming Soon page with custom branding
- Can see maintenance message and expected launch date

### For Admin Users
- Full access to all features during maintenance
- See warning banner at top of all pages
- Can toggle maintenance mode on/off
- Can edit maintenance page content
- Can preview the Coming Soon page

## Adding New Pages

**No code changes needed!** The MaintenanceContext automatically:
1. Monitors all route changes
2. Checks user authentication
3. Redirects non-admins to `/coming-soon` if maintenance is active
4. Shows banner to admins

Simply create your new page and add it to the routes - maintenance mode will work automatically.

## Notes
- Maintenance status checked every 30 seconds automatically
- No page refresh needed when toggling maintenance mode
- All users redirected within 30 seconds of mode change
- Context-based architecture ensures consistency across all pages
