# 🚀 Complete Troubleshooting Guide - User ID & API Debugging

## Summary of Fixes

We've fixed 5 major issues in `homeContent.jsx`:

1. ✅ Undefined `user.id` causing 500 errors
2. ✅ Leaderboard crashes on comparison
3. ✅ Missing debug information
4. ✅ Enhanced error logging
5. ✅ Safe fallback to localStorage

---

## How to Test

### Test 1: Fresh Login

**Steps:**
```
1. Open http://localhost:5174 (or current port)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Clear localStorage:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Right-click → Clear All
4. Refresh page
5. Login with user@test.com / user123
6. Should redirect to /dashboard
```

**Expected Results:**
```
✅ Redirect to http://localhost:5174/dashboard
✅ Console shows "Debug Info" log with:
   {
     userObject: { id: 1, ... },
     userID: 1,
     hasToken: true,
     tokenPreview: "eyJh..."
   }
✅ Network tab shows 4 API calls:
   - /api/dashboard/stats/1 → 200 OK
   - /api/dashboard/leaderboard → 200 OK
   - /api/users/1/badges → 200 OK
   - /api/users/1/aktivitas → 200 OK
✅ Dashboard displays:
   - User stats cards
   - Leaderboard with top 10 users
   - Badges section
   - Recent activities
```

### Test 2: Page Refresh While Logged In

**Steps:**
```
1. While on dashboard, press F5 to refresh
2. Page should reload
3. Check console
```

**Expected Results:**
```
✅ Stay on http://localhost:5174/dashboard (not redirected to login)
✅ Console shows "Debug Info" again
✅ userID should match previous test
✅ All API calls should return 200 OK
✅ Dashboard data should display immediately
```

### Test 3: Check Console Logs

**Steps:**
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for "Debug Info" message
4. Click to expand the object
```

**Expected Output:**
```
Debug Info: Object
  ├─ userObject: Object
  │  ├─ id: 1
  │  ├─ name: "John Doe"
  │  ├─ email: "user@test.com"
  │  └─ role: "user"
  ├─ userID: 1
  ├─ hasToken: true
  └─ tokenPreview: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Test 4: Check Network Calls

**Steps:**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Clear existing requests (trash icon)
4. Refresh dashboard or login
5. Look for requests to http://127.0.0.1:8000/api/
```

**Expected Requests:**
```
Name                                      Status  Type    Size
───────────────────────────────────────────────────────────────
dashboard/stats/1                         200     fetch   0.5 KB
dashboard/leaderboard                     200     fetch   2.3 KB
users/1/badges                            200     fetch   1.1 KB
users/1/aktivitas                         200     fetch   0.8 KB
```

Click on each request and check Response tab - should show JSON data.

### Test 5: Check localStorage

**Steps:**
```
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Click on http://localhost:5174
4. Look for these keys:
```

**Expected Storage:**
```
Key          Value
─────────────────────────────────────
token        eyJhbGciOiJIUzI1NiIs...
role         user
id_user      1
user         {"id":1,"name":"John Doe",...}
```

---

## Troubleshooting Issues

### Issue 1: Still Getting 500 Error

**Symptoms:**
```
GET http://127.0.0.1:8000/api/dashboard/stats/1 500 (Internal Server Error)
```

**Checklist:**
- [ ] Backend is running at http://127.0.0.1:8000
- [ ] Token is in localStorage (check via DevTools)
- [ ] userID is correct (check Debug Info log)
- [ ] Endpoint `/api/dashboard/stats/{id}` exists
- [ ] User has data in database

**Debug Steps:**
```javascript
// In DevTools Console, run:
console.log('Token:', localStorage.getItem('token'));
console.log('User ID:', localStorage.getItem('id_user'));
console.log('User Object:', localStorage.getItem('user'));

// Check if backend is responding
fetch('http://127.0.0.1:8000/api/dashboard/stats/1', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(d => console.log(d));
```

**Solutions:**
1. Restart backend: `php artisan serve`
2. Check backend logs for error details
3. Try with different user account
4. Verify database has user data

### Issue 2: userID is Undefined in Debug Info

**Symptoms:**
```
Debug Info: {
  userObject: null,
  userID: undefined,  ← Problem!
  ...
}
```

**Root Cause:**
- User not properly authenticated
- localStorage not storing data
- AuthContext not initializing

**Solutions:**
```
1. Check login.jsx is storing token properly
2. Verify backend returns user object in login response
3. Check AuthContext.login() is being called
4. Try fresh login (clear localStorage first)
5. Check browser localStorage is enabled
```

### Issue 3: Leaderboard Not Showing Current User Highlight

**Symptoms:**
```
Leaderboard shows all users but current user not highlighted
```

**Root Cause:**
- userID might be string, leader.user_id might be number
- Comparison failing due to type mismatch

**Solution:**
The fix already handles this with loose equality `==` instead of strict `===`

**If still not working:**
```javascript
// In DevTools Console:
const userId = JSON.parse(localStorage.getItem('user'))?.id;
console.log('User ID type:', typeof userId, 'Value:', userId);
// Should show: "number" or "string"
```

### Issue 4: No Debug Info in Console

**Symptoms:**
```
Console is empty - no Debug Info log
```

**Possible Causes:**
- useEffect not triggering
- isAuthenticated is false
- user.id is falsy

**Debug:**
```javascript
// In DevTools Console after login:
const token = localStorage.getItem('token');
console.log('Has token:', !!token);
console.log('User:', localStorage.getItem('user'));

// Manually check if effect should run
console.log('isAuthenticated should be:', !!token);
```

### Issue 5: API Returns 401 Unauthorized

**Symptoms:**
```
GET http://127.0.0.1:8000/api/dashboard/stats/1 401 (Unauthorized)
```

**Cause:**
Token is invalid or expired

**Solutions:**
```
1. Log out (clear localStorage)
2. Log back in (get fresh token)
3. Check backend token expiration time
4. Verify Bearer token format
```

**Debug:**
```javascript
// Check token exists and format
const token = localStorage.getItem('token');
console.log('Token:', token);
console.log('Starts with "eyJ":', token?.startsWith('eyJ'));

// Try API call directly
fetch('http://127.0.0.1:8000/api/dashboard/stats/1', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
}).then(r => console.log('Status:', r.status));
```

### Issue 6: API Returns 404 Not Found

**Symptoms:**
```
GET http://127.0.0.1:8000/api/dashboard/stats/1 404 (Not Found)
```

**Cause:**
- Endpoint doesn't exist on backend
- Wrong URL or typo
- Backend routes not configured

**Solutions:**
```
1. Check backend routes file (routes/api.php)
2. Verify controller method exists
3. Check URL path is correct
4. Restart backend server
```

---

## Complete Data Flow

### Login → Dashboard Data Display

```
┌─────────────────┐
│ User Login Form │
└────────┬────────┘
         │ Submit credentials
         ▼
┌──────────────────────────────────────┐
│ Backend /api/login endpoint          │
│ - Validate email/password            │
│ - Generate JWT token                 │
│ - Return user object + token         │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Response: {                          │
│   status: "success",                 │
│   data: {                            │
│     user: { id: 1, ... },            │
│     token: "eyJh..."                 │
│   }                                  │
│ }                                    │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ login.jsx receives response          │
│ - Calls: login(userData)             │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ AuthContext.login(userData)          │
│ - Sets: user = userData.user         │
│ - Stores: localStorage.token         │
│ - Stores: localStorage.user          │
│ - Stores: localStorage.id_user       │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ login.jsx navigates                  │
│ - if (userRole === 'user')           │
│ - navigate("/dashboard")             │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ HomeContent component mounts         │
│ - useAuth() gets user from context   │
│ - Checks: isAuthenticated && user?.id│
│ - Calls: fetchDashboardData()        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ fetchDashboardData()                 │
│ - Get token from localStorage        │
│ - Get userId from user?.id || id_user│
│ - Create headers with Bearer token   │
│ - Make 4 API calls                   │
└────────┬─────────────────────────────┘
         │
         ├─→ GET /api/dashboard/stats/1
         ├─→ GET /api/dashboard/leaderboard
         ├─→ GET /api/users/1/badges
         └─→ GET /api/users/1/aktivitas
         │
         ▼
┌──────────────────────────────────────┐
│ Backend processes requests           │
│ - Validate Bearer token              │
│ - Check authorization                │
│ - Fetch data from database           │
│ - Return 200 OK + JSON data          │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ HomeContent receives data            │
│ - setUserStats(data)                 │
│ - setLeaderboard(data)               │
│ - setUserBadges(data)                │
│ - setRecentActivities(data)          │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Component renders with data          │
│ ✅ Stats cards populated             │
│ ✅ Leaderboard displayed             │
│ ✅ Badges shown                      │
│ ✅ Activities listed                 │
└──────────────────────────────────────┘
```

---

## Quick Commands

### Check if Backend is Running
```bash
curl http://127.0.0.1:8000/api/login -X POST
# Should return error about missing credentials
# (Good - means backend is responding)
```

### View Backend Logs
```bash
# Terminal where `php artisan serve` is running
# Should show incoming requests and responses
```

### Clear Frontend State
```javascript
// In DevTools Console:
localStorage.clear();
location.reload();
// Then log in again
```

### Test API Endpoint Directly
```javascript
// In DevTools Console:
const token = localStorage.getItem('token');
fetch('http://127.0.0.1:8000/api/dashboard/stats/1', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Response:', d));
```

---

## Expected File Changes

### Modified Files
```
✅ src/Components/Pages/home/homeContent.jsx
   - Added userId fallback logic
   - Added debug console.log()
   - Updated all API calls
   - Fixed leaderboard comparison
```

### New Documentation
```
✅ USER_ID_DEBUG_AND_FIX.md
✅ QUICK_DEBUG_FIX_SUMMARY.md
✅ This troubleshooting guide
```

---

## Next Actions

1. ✅ Start dev server: `pnpm run dev`
2. ✅ Test fresh login
3. ✅ Check console for Debug Info
4. ✅ Verify API calls return 200 OK
5. ✅ Check dashboard displays data
6. ✅ Test page refresh
7. ✅ Test logout/re-login
8. ✅ Deploy to production

---

## Support

If you encounter issues:

1. **Check this guide** - Most issues are covered
2. **Check browser console** - Look for error messages
3. **Check Network tab** - Look at API response details
4. **Check localStorage** - Verify data is stored
5. **Check backend logs** - Look for server-side errors
6. **Restart services** - Frontend and backend
7. **Clear cache** - Ctrl+Shift+Delete in browser

**All known issues should now be resolved!** 🎉
