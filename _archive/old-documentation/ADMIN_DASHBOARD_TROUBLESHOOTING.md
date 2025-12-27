# 🔍 Admin Dashboard Troubleshooting Guide

## If Stat Cards Are NOT Showing

### Quick Checklist

- [ ] Page reloaded (Ctrl+R or Cmd+R)?
- [ ] Browser DevTools opened (F12)?
- [ ] Looking at Console tab?
- [ ] Backend running (http://127.0.0.1:8000)?
- [ ] Frontend still running (http://localhost:5173)?

---

## Issue 1: Nothing Shows (Blank Page)

### Symptoms:
- Admin Dashboard header visible
- Tabs visible
- But no stat cards appear
- Console might show errors

### Solutions:

**Solution 1A: Check if OverviewCards component is rendering**
1. Open DevTools → Console
2. Look for ANY logs mentioning "Overview" or "Loading"
3. If you see: `Loading overview...` → Component is rendering but stuck
4. If you see NOTHING → Component might not be mounted

**Solution 1B: Force reload**
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```
This clears the cache and reloads completely.

**Solution 1C: Check browser storage**
1. DevTools → Application tab
2. Local Storage → http://localhost:5173
3. Verify `token` key exists and has value

---

## Issue 2: Console Shows "No data available"

### Symptoms:
- You see message: "No data available"
- This means `stats` is null even after loading completes

### Causes & Solutions:

**Cause A: API call failed silently**
- Check console for error logs
- Look for: `Error fetching overview stats`
- Look for: `⚠️ Using mock data as fallback`

**Cause B: Response format mismatch**
- Look for: `📦 Backend response data:`
- Check if it matches: `{ status: 'success', data: {...} }`
- If different structure: Share response with me

**Cause C: Data transformation failed**
- Should see: `✅ Real data loaded from backend (format: status + data...)`
- If NOT seeing this, transformation logic needs fixing

---

## Issue 3: "Invalid response format" Error

### Symptoms:
- Console shows: `⚠️ Response format not recognized`
- Console shows: `Error fetching overview stats: Invalid response format`

### Solution:
1. Look at console log: `📦 Backend response data: {...}`
2. Copy the exact response
3. Share response format with me
4. I'll add support for that format

---

## Issue 4: HTTP 401 Unauthorized (Still Getting This?)

### Symptoms:
- Console shows: `401 (Unauthorized)`
- Cards don't load

### Solutions:

**Solution A: Token is expired**
1. Log out (clear localStorage)
2. Re-login
3. Reload Admin Dashboard

**Solution B: Token not being sent**
1. DevTools → Network tab
2. Click the `/api/admin/dashboard/overview` request
3. Go to Headers tab
4. Check if `Authorization: Bearer {token}` is present
5. If missing: Backend auth issue

**Solution C: Backend middleware issue (If still occurring)**
1. Backend needs `auth:sanctum` middleware on admin routes
2. See: BACKEND_AUTH_401_FIX_GUIDE.md

---

## Issue 5: HTTP 500 Internal Server Error

### Symptoms:
- Console shows: `500 (Internal Server Error)`
- Backend error

### Solutions:
1. Check backend logs: `tail -f storage/logs/laravel.log`
2. Look for error details
3. Common causes:
   - Database connection issue
   - Query error in controller
   - Missing database migration

---

## Issue 6: Network Request Shows 200 But Page Shows Mock Data

### Symptoms:
- Network tab shows `/api/admin/dashboard/overview` returns 200
- But cards show mock data (numbers like 1250, 840, etc)
- Console shows: `⚠️ Using mock data as fallback`

### Solution:
1. Response is 200 but not parsing correctly
2. Check console: `📦 Backend response data:`
3. Verify it shows real data (like `totalUsers: 8`)
4. If format is different: Need to add new format handler

---

## Issue 7: Icons Not Showing (Blank Circles)

### Symptoms:
- Stat cards show but icons are missing
- Just see empty colored circles

### Causes & Solutions:

**Cause A: lucide-react not installed**
```bash
npm install lucide-react
```
Then restart frontend: `npm run dev`

**Cause B: Icon component not imported**
Check OverviewCards.jsx line 1:
```javascript
import { Users, Trash2, Coins, TrendingUp, Loader } from 'lucide-react'
```
Should have these exact imports.

**Cause C: CSS issue**
Check CSS for `.card-icon`:
- Should have `display: flex`
- Should have `align-items: center`
- Should have `justify-content: center`

---

## Debug Mode: Manual Testing

### Test 1: Check Token
```javascript
// In DevTools Console:
console.log(localStorage.getItem('token'))

// Should show: 15|e2RIG2LvHEGq4uRLY...
// If shows: null → Need to login again
```

### Test 2: Manual API Call
```javascript
// In DevTools Console:
fetch('http://127.0.0.1:8000/api/admin/dashboard/overview', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log(d))

// Should show the response object
```

### Test 3: Check Component State
```javascript
// In DevTools Console (after opening Admin Dashboard):
// React DevTools (extension) can show component state

// Or manually trigger refresh:
// Click the ↻ refresh button on a stat card
// Watch console for logs
```

---

## Complete Console Log Flow (What Should Appear)

### When Opening Admin Dashboard:

```
✓ client connected to Vite
✓ Token found: 15|e2RIG2LvHEGq4uRLY...
✓ Response status: 200
✓ 📦 Backend response data: {"status":"success","data":{"totalUsers":8,...}}
✓ ✅ Real data loaded from backend (format: status + data with transformation)
✓ 📊 Transformed data: {users: {total: 8, active_30days: 8, ...}, ...}
✓ 📊 Stats object ready for rendering: {...}
```

### If You See This Instead:

```
⚠️ Unauthorized (401). Token may be expired...
⚠️ Using mock data as fallback
```

→ Backend auth still not fixed. See Issue 4 above.

```
⚠️ Response format not recognized...
Error: Invalid response format
```

→ Response structure doesn't match. Need to check response format.

---

## How to Share Error for Help

When sharing error, provide:

1. **Browser Console Screenshot** - Show all logs
2. **Network Tab Screenshot** - Show `/api/admin/dashboard/overview` request
   - Response tab should show actual response JSON
3. **Exact Response Format** - Copy the `📦 Backend response data:` log
4. **What You're Seeing** - Describe what displays on page

---

## Escalation Path

### If Nothing Works:

1. ✅ Verify backend is running: `php artisan serve`
2. ✅ Test backend directly: `curl http://127.0.0.1:8000/api/admin/dashboard/overview`
3. ✅ Check if endpoint exists and returns data
4. ✅ Re-login to get fresh token
5. ✅ Hard refresh browser: `Ctrl+Shift+R`
6. ✅ Check browser console for errors
7. ✅ Check backend logs: `tail -f storage/logs/laravel.log`

If still not working after all above:
- Share complete console output
- Share network response
- Share exact response format from backend

---

## Quick Reference: File Locations

| Issue | File to Check |
|-------|--------------|
| UI Not Showing | `AdminDashboard.jsx` |
| Cards Not Rendering | `OverviewCards.jsx` |
| Styling Wrong | `adminDashboard.css` |
| Icons Missing | Check lucide-react imports |
| Data Not Loading | Check `/api/admin/dashboard/overview` response |
| Navigation Tabs Broken | Check `AdminDashboard.jsx` tab setup |

---

## Success Criteria ✅

You'll know everything is working when:

1. ✅ Admin Dashboard page loads
2. ✅ 4 stat cards visible (Users, Waste, Points, Redemptions)
3. ✅ Cards show real numbers (not all zeros or mock data)
4. ✅ Cards have icons and colors
5. ✅ Clicking tabs navigates correctly
6. ✅ Console shows success logs (no errors)
7. ✅ Refresh button works
8. ✅ Data updates every 30 seconds

---
