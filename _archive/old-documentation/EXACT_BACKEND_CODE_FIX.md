# 🔧 EXACT CODE FIX FOR routes/api.php

## The Problem
The admin dashboard routes in `routes/api.php` don't have the `auth:sanctum` middleware, so they reject all requests with HTTP 401.

## The Solution
Add ONE middleware wrapper around the admin routes.

---

## BEFORE (Current - Broken ❌)

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminAnalyticsController;

// ... other routes ...

// ❌ These routes don't require authentication - they reject all requests with 401
Route::prefix('admin')->group(function () {
    Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
    Route::get('/dashboard/users', [AdminUserController::class, 'getAllUsers']);
    Route::get('/analytics/waste', [AdminAnalyticsController::class, 'getWasteAnalytics']);
    // ... more admin routes ...
});
```

---

## AFTER (Fixed - Working ✅)

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminAnalyticsController;

// ... other routes ...

// ✅ FIXED: Routes now require authentication with auth:sanctum middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
        Route::get('/dashboard/users', [AdminUserController::class, 'getAllUsers']);
        Route::get('/analytics/waste', [AdminAnalyticsController::class, 'getWasteAnalytics']);
        // ... more admin routes ...
    });
});
```

---

## What Changed

**Line 10 (ADDED):**
```php
Route::middleware('auth:sanctum')->group(function () {
```

**Line 11 (unchanged):**
```php
    Route::prefix('admin')->group(function () {
```

**Last line (ADDED):**
```php
});  // ← This closes the middleware group
```

---

## Complete Example

If your `routes/api.php` looks like this:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminDashboardController;

Route::middleware('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::prefix('admin')->group(function () {
    Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
});
```

Change it to:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminDashboardController;

Route::middleware('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ← ADD THIS MIDDLEWARE WRAPPER
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
    });
});
```

---

## After Making This Change

### Step 1: Clear Caches (Linux/Mac/PowerShell)
```bash
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

### Step 2: Restart Server
```bash
# If running: Ctrl+C to stop
# Then restart:
php artisan serve
```

### Step 3: Test with curl (PowerShell)
```powershell
# Get token from localStorage in browser (admin@test.com login)
$token = "14|5p3y8NMdhZinZdCLX..."  # Replace with actual token

# Test the endpoint
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
}

Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/admin/dashboard/overview" `
    -Headers $headers -Method GET | ConvertTo-Json
```

### Expected Response
```json
HTTP/1.1 200 OK
{
  "success": true,
  "data": {
    "users": { "total": 1250, ... },
    "waste": { "yearly_total_kg": 15420, ... },
    ...
  }
}
```

### Step 4: Reload Frontend
- Don't re-login (token is fine)
- Just reload the admin dashboard page in browser
- Should now show real data instead of mock data
- Console should show: `✅ Real data loaded from backend`

---

## Troubleshooting

**If still getting 401:**

1. **Did you restart the server?** (Very common mistake)
   ```bash
   Ctrl+C
   php artisan serve
   ```

2. **Did you clear caches?**
   ```bash
   php artisan cache:clear
   php artisan config:cache
   php artisan route:cache
   ```

3. **Check the token format:** Should be `NUMBER|STRING` like `14|5p3y8NMdhZinZdCLX...`

4. **Check the logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

5. **Verify token exists in database:**
   ```bash
   php artisan tinker
   > DB::table('personal_access_tokens')->where('id', 14)->first()
   ```

---

## That's It!

This single change (adding `Route::middleware('auth:sanctum')->group(function () {`) will:
- ✅ Enable authentication on admin routes
- ✅ Accept valid tokens
- ✅ Return HTTP 200 with real data
- ✅ Make admin dashboard work perfectly

---

## Files to Check

If you're unsure where your admin routes are, search for:
- `Route::prefix('admin')`
- `AdminDashboardController`
- `AdminUserController`

These will show you where the admin routes are defined in `routes/api.php`.

---
