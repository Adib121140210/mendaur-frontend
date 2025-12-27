# 🔧 Backend Auth 401 Fix Guide

## Problem Summary

**Frontend Status:** ✅ **WORKING CORRECTLY**
- Token is being found in localStorage
- Token format is valid (`14|5p3y8NMdhZinZdCLX...`)
- Token is being sent in Authorization header: `Authorization: Bearer {token}`
- Request headers are correct

**Backend Status:** 🔴 **RETURNING 401 UNAUTHORIZED**
- Despite valid token being sent, API returns 401
- This indicates a **backend authentication configuration issue**

---

## Root Causes (Likely)

### Issue #1: Missing Auth Middleware (Most Likely)
The admin dashboard routes may not have the `auth:sanctum` middleware applied.

**Fix:**
Check `routes/api.php`:

```php
// ❌ WRONG - No auth middleware
Route::get('/admin/dashboard/overview', [AdminDashboardController::class, 'getOverview']);

// ✅ CORRECT - With auth:sanctum middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
});
```

**Steps:**
1. Open `routes/api.php`
2. Look for admin dashboard routes
3. Ensure they are wrapped in: `Route::middleware('auth:sanctum')->group(function () { ... })`
4. If missing, add the middleware wrapper
5. Restart Laravel: `php artisan serve`

---

### Issue #2: Incorrect Route Registration
The routes might be registered with a different path prefix.

**Check:**
```php
// Look for this in routes/api.php:
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
});
```

This should match frontend's API call: `/api/admin/dashboard/overview`

---

### Issue #3: CORS Configuration Blocking Authorization Header
Even if backend is correct, CORS might not allow custom headers.

**Check `config/cors.php`:**
```php
'allowed_headers' => ['*'],  // ✅ Should allow all headers
// OR specifically:
'allowed_headers' => ['Content-Type', 'Authorization', 'Accept'],
```

If CORS is blocking the Authorization header, the request will fail with 401 or 403.

**Fix:**
1. Open `config/cors.php`
2. Ensure `allowed_headers` includes `'Authorization'`
3. Ensure `supports_credentials` is `true`
4. Clear cache: `php artisan cache:clear`
5. Restart server

---

### Issue #4: Token Not in personal_access_tokens Table
The token might not exist in the database even though it's being sent.

**Check:**
```bash
php artisan tinker

# List all tokens
DB::table('personal_access_tokens')->get();

# Check if token with this ID exists (14 in the example)
DB::table('personal_access_tokens')->where('id', 14)->first();
```

If no tokens exist, user needs to **re-login** to generate a new token.

---

### Issue #5: Token Expired or Revoked
Tokens might have an expiration time set.

**Check:**
```php
// In config/sanctum.php
'expiration' => null,  // null = never expires (recommended)
```

If expiration is set, tokens might be expiring too quickly.

---

## Step-by-Step Backend Fix

### Step 1: Verify Route Configuration
```bash
# List all routes to see if admin routes are protected
php artisan route:list | grep admin
```

Look for routes like:
```
GET  /api/admin/dashboard/overview  ... middleware: api,auth:sanctum
```

The `auth:sanctum` middleware **MUST** be present.

---

### Step 2: Check Middleware Registration
Open `routes/api.php` and ensure:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminDashboardController;

// ✅ This is the correct pattern
Route::middleware('auth:sanctum')->group(function () {
    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
        Route::get('/dashboard/users', [AdminDashboardController::class, 'getUsers']);
        // ... other admin routes
    });
});
```

---

### Step 3: Verify CORS Configuration
Edit `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => ['http://localhost:5173', 'localhost:3000'],  // Frontend URL
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],  // ✅ Must be * or include Authorization
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,  // ✅ Important for Authorization header
];
```

---

### Step 4: Clear All Caches
```bash
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

---

### Step 5: Test with curl
```bash
# Replace TOKEN with actual token from localStorage
TOKEN="14|5p3y8NMdhZinZdCLX..."

curl -X GET 'http://127.0.0.1:8000/api/admin/dashboard/overview' \
  -H 'Authorization: Bearer '$TOKEN \
  -H 'Accept: application/json' \
  -v
```

Expected response:
```json
{
  "success": true,
  "data": {
    "users": {...},
    "waste": {...},
    ...
  }
}
```

If still 401, check `storage/logs/laravel.log` for error details.

---

### Step 6: Restart Laravel Server
```bash
# Kill current server
Ctrl+C

# Restart with fresh state
php artisan serve
```

---

## Verification Checklist

- [ ] Routes have `auth:sanctum` middleware
- [ ] Routes are under correct prefix `/api/admin/...`
- [ ] CORS config allows Authorization header
- [ ] CORS supports credentials
- [ ] Token exists in personal_access_tokens table
- [ ] Caches cleared
- [ ] Server restarted
- [ ] curl test returns 200 OK
- [ ] Frontend now shows real data (not mock)

---

## If Still Getting 401 After All Steps

Check the **Laravel log** for detailed error:
```bash
# View logs
tail -f storage/logs/laravel.log

# Or from tinker
\Log::info(json_encode(DB::table('personal_access_tokens')->where('id', 14)->first()));
```

The log should show what the auth middleware is checking and why it's failing.

---

## Frontend is Ready

The frontend code is **already correct**:
- ✅ Token is being found
- ✅ Token is in correct format
- ✅ Authorization header is being sent
- ✅ Mock data fallback is working (current behavior)
- ✅ Error handling is in place

**Once backend is fixed, frontend will automatically use real data.**

No frontend changes needed. This is 100% a backend configuration issue.

---

## Quick Summary for Backend Team

```
CHANGE: Add auth:sanctum middleware to admin routes

LOCATION: routes/api.php

CURRENT (Wrong):
  Route::get('/api/admin/dashboard/overview', ...);

FIXED (Correct):
  Route::middleware('auth:sanctum')->group(function () {
    Route::get('/api/admin/dashboard/overview', ...);
  });

TEST: curl -H "Authorization: Bearer {token}" {url}
EXPECT: HTTP 200 with JSON data
```

---
