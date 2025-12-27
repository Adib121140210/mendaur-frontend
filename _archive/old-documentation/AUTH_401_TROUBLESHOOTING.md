# 🔐 Authentication Troubleshooting Guide

## Problem: HTTP 401 Unauthorized

**Issue:** Admin Dashboard API returning 401 (Unauthorized)  
**Root Cause:** Token not being sent or token is expired/invalid

---

## 🔍 How to Debug

### Step 1: Check if Token Exists

Open browser DevTools Console and run:
```javascript
// Check if token is in localStorage
const token = localStorage.getItem('token')
console.log('Token exists:', !!token)
console.log('Token value:', token)
console.log('Token length:', token?.length)
```

**Expected Output:**
```
Token exists: true
Token value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Token length: 200+
```

**If shows `undefined` or `null`:**
- ❌ Token not saved to localStorage
- ❌ Need to login again

---

### Step 2: Verify Token Format

```javascript
// Check token format
const token = localStorage.getItem('token')
const parts = token?.split('.')
console.log('Token parts:', parts?.length) // Should be 3 (JWT format)
console.log('Token starts with:', token?.substring(0, 20))
```

**Expected:**
- 3 parts separated by dots (JWT format)
- First part starts with "eyJ"

---

### Step 3: Check Network Request

1. Open DevTools → Network tab
2. Navigate to Admin Dashboard
3. Look for request to `http://127.0.0.1:8000/api/admin/dashboard/overview`
4. Click on the request
5. Check "Request Headers"

**Should have:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
```

**If missing Authorization header:**
- ❌ Token not being sent
- ❌ Check if `getAuthHeader()` is called

---

### Step 4: Test Login Flow

```bash
# In terminal, test login endpoint
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mendaur.id","password":"password"}'

# Should return:
{
  "status": "success",
  "data": {
    "user": {...},
    "token": "eyJ..."
  }
}
```

If login fails, backend may have an issue.

---

## ✅ Solutions

### Solution 1: Login Again

```javascript
// In browser console
localStorage.removeItem('token')
// Then reload page and login
```

Then:
1. Reload page
2. Login with admin credentials
3. Go back to Admin Dashboard
4. Should now show real data instead of mock

### Solution 2: Check Token Expiration

```javascript
// Decode JWT to check expiration
const token = localStorage.getItem('token')
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Token expires at:', new Date(payload.exp * 1000))
console.log('Current time:', new Date())
console.log('Expired:', new Date(payload.exp * 1000) < new Date())
```

If expired:
- ❌ Token is old
- ✅ Login again to get new token

### Solution 3: Verify Backend Middleware

Backend needs to check if route is protected:

```php
// routes/api.php
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
});
```

**Must have `auth:sanctum` middleware!**

---

## 🧪 Complete Test Flow

### 1. Start Backend
```bash
cd backend
php artisan serve
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Open Browser
```
http://localhost:5173
```

### 4. Login
- Email: admin@mendaur.id
- Password: password

### 5. Check Console
```javascript
// In DevTools Console
localStorage.getItem('token')
// Should show token value
```

### 6. Navigate to Admin Dashboard
- Should show real data
- Should NOT show "Using mock data" message

### 7. Check Network
- GET request to `/api/admin/dashboard/overview`
- Status: **200 OK** (not 401)
- Request headers include Authorization

---

## 🚨 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No token | Login again |
| Token is null | Login failed | Check backend login endpoint |
| Token sent but still 401 | Token expired | Login again |
| Wrong format | Token format corrupted | Clear localStorage & login |

---

## 📝 Console Debugging Messages

### Good (Real Data)
```
✅ Real data loaded from backend
Token found: eyJhbGciOi...
Response status: 200
```

### Bad (Mock Data - Debug)
```
⚠️ Using mock data as fallback
⚠️ No token found in localStorage
⚠️ Authentication failed (401). Token may be expired.
⚠️ Unauthorized (401).
```

---

## 🔧 If Still Not Working

### Step 1: Check Backend Auth Config

```bash
# In backend directory
php artisan config:cache
php artisan config:clear
```

### Step 2: Verify Sanctum Installation

```bash
# Check if sanctum is installed
composer show | grep sanctum

# Publish sanctum config if needed
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Step 3: Check Personal Access Tokens Table

```bash
# In backend directory
php artisan tinker

# Check if tokens exist
DB::table('personal_access_tokens')->get()

# Should show tokens created during login
```

### Step 4: Verify CORS if Needed

Backend should allow frontend origin:

```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173'],
```

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Can login successfully
- [ ] Token appears in localStorage
- [ ] Token is valid JWT (3 parts)
- [ ] Network request shows Authorization header
- [ ] API returns 200 OK
- [ ] Admin Dashboard shows real data

---

**Once all verified, Admin Dashboard will work perfectly!** ✅

