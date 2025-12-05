# Testing Instructions

## Quick Start - Run Everything

### Option 1: Automatic (Recommended)
Run this script to start both servers automatically:
```powershell
.\start-all-servers.ps1
```

This will:
- Open a new terminal for the backend
- Open a new terminal for the frontend
- Start both servers automatically

### Option 2: Manual
**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Check if Servers are Running

Run this test script:
```powershell
.\test-servers.ps1
```

This will check:
- ✅ Backend is running on port 5000
- ✅ Frontend is running on port 5173
- ✅ API endpoints are responding

## Testing the Application

### 1. Open Browser
Navigate to: **http://localhost:5173**

### 2. Open DevTools
Press **F12** to open Developer Tools

### 3. Check Network Tab
- Go to **Network** tab
- Reload the page
- Look for API calls

### 4. What to Look For

#### ✅ SUCCESS - API Paths Fixed
```
GET http://localhost:5000/api/projects 200 OK
GET http://localhost:5000/api/tasks 200 OK
GET http://localhost:5000/api/clients 200 OK
```

#### ✅ ALSO OK - Authentication Required
```
GET http://localhost:5000/api/projects 401 Unauthorized
```
This means the API path is correct, you just need to log in.

#### ❌ PROBLEM - Still Duplicate Paths
```
GET http://localhost:5000/api/api/projects 404 Not Found
```
This means browser cache wasn't cleared. Do a hard refresh (Ctrl+Shift+R).

### 5. Test Key Features

Once logged in, test these pages:
- **Dashboard** - Should load without errors
- **Projects** - Should show projects or empty state
- **Tasks** - Should show tasks or empty state
- **Clients** - Should show clients or empty state
- **Time Tracking** - Should load without errors

## Troubleshooting

### Problem: "Page keeps loading"

**Check 1: Are servers running?**
```powershell
.\test-servers.ps1
```

**Check 2: Backend logs**
Look at the backend terminal for errors

**Check 3: Network tab**
- F12 → Network
- Are requests "pending" forever?
- Are there 401 errors? (Need to log in)
- Are there 500 errors? (Backend issue)

### Problem: "Cannot connect to backend"

**Solution:**
```bash
cd backend
npm start
```

Wait for: `Server running on port 5000`

### Problem: "Frontend won't start"

**Solution:**
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173`

### Problem: "Still seeing /api/api/ errors"

**Solution:**
1. Stop frontend (Ctrl+C)
2. Clear Vite cache:
   ```bash
   Remove-Item -Recurse -Force frontend/node_modules/.vite
   ```
3. Restart frontend:
   ```bash
   cd frontend
   npm run dev
   ```
4. Hard refresh browser (Ctrl+Shift+R)

## Expected Behavior

### After API Path Fix:
1. ✅ No 404 errors with `/api/api/`
2. ✅ API calls go to `/api/projects`, `/api/tasks`, etc.
3. ✅ Either get data (200) or need to log in (401)
4. ✅ Pages load (even if empty)

### What "Page keeps loading" usually means:
- Backend not running → Start backend
- Need to log in → Go to login page
- Waiting for data → Actually working, just no data yet

## Quick Commands Reference

```powershell
# Start everything
.\start-all-servers.ps1

# Test servers
.\test-servers.ps1

# Verify API paths are fixed
.\verify-api-paths.ps1

# Start backend only
cd backend
npm start

# Start frontend only
cd frontend
npm run dev

# Clear frontend cache
Remove-Item -Recurse -Force frontend/node_modules/.vite
```

## What I Cannot Do

I'm an AI assistant and cannot:
- ❌ Start servers for you
- ❌ Open browsers
- ❌ Click buttons in the UI
- ❌ See what's on your screen
- ❌ Check your browser's DevTools

But I can:
- ✅ Create scripts to help you
- ✅ Fix code issues
- ✅ Analyze error messages you share
- ✅ Guide you through testing

## Share Results

After testing, please share:
1. **Server status:** Are both servers running?
2. **Network tab:** What status codes do you see?
3. **Console errors:** Any red errors?
4. **Which page:** What page are you testing?

This will help me identify any remaining issues!
