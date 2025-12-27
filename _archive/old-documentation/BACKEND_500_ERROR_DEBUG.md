# 🔍 500 Error Debugging Guide

**Issue:** Backend `/api/admin/dashboard/overview` returns 500 Internal Server Error  
**Frontend:** Using mock data as fallback  
**Objective:** Fix backend API endpoint

---

## 🚨 Error Diagnosis

### Step 1: Check Backend Logs

```bash
cd backend-folder
tail -f storage/logs/laravel.log
```

Look for error stack trace that shows:
- Which controller method failed
- Which database query failed
- Which model method failed

### Step 2: Common 500 Error Causes

#### ❌ Cause 1: Missing Controller or Method
```
Error: Class App\Http\Controllers\Admin\AdminDashboardController not found
```

**Fix:**
```bash
# Create controller
php artisan make:controller Admin/AdminDashboardController

# Add method
```

#### ❌ Cause 2: Missing Model or Table
```
Error: SQLSTATE[42S02]: Table 'mendaur_db.waste_transactions' doesn't exist
```

**Fix:**
```bash
# Check if migrations ran
php artisan migrate

# Or create migration
php artisan make:migration create_waste_transactions_table
```

#### ❌ Cause 3: Authorization Issue
```
Error: User is not authorized to access this resource
```

**Fix:**
```php
// In controller, check authorization
public function getOverview()
{
    $this->authorize('isAdmin'); // Add this
    // ... rest of code
}
```

#### ❌ Cause 4: Database Connection Error
```
Error: SQLSTATE[HY000]: General error: 2006 MySQL server has gone away
```

**Fix:**
```bash
# Check .env file
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mendaur_db
DB_USERNAME=root
DB_PASSWORD=

# Restart MySQL
# Or verify credentials
```

#### ❌ Cause 5: Query Syntax Error
```
Error: SQLSTATE[42000]: Syntax error or access violation
```

**Fix:** Review SQL queries in controller

---

## ✅ Correct Implementation

### Step 1: Create Controller

File: `app/Http/Controllers/Admin/AdminDashboardController.php`

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WasteTransaction;
use App\Models\PointTransaction;
use App\Models\PointRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard overview stats
     * GET /api/admin/dashboard/overview
     */
    public function getOverview()
    {
        try {
            // 1. Users Stats
            $totalUsers = User::count();
            $activeUsers = User::where('last_login', '>=', now()->subDays(30))->count();
            $newThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();

            // 2. Waste Stats
            $yearlyWaste = WasteTransaction::whereYear('created_at', now()->year)->sum('weight_kg') ?? 0;
            $yearlyWasteCount = WasteTransaction::whereYear('created_at', now()->year)->count() ?? 0;
            $monthlyWaste = WasteTransaction::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->sum('weight_kg') ?? 0;
            $monthlyWasteCount = WasteTransaction::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count() ?? 0;

            // 3. Points Stats
            $yearlyPoints = PointTransaction::whereYear('created_at', now()->year)->sum('points') ?? 0;
            $monthlyPoints = PointTransaction::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->sum('points') ?? 0;
            $todayPoints = PointTransaction::whereDate('created_at', now()->toDateString())->sum('points') ?? 0;

            // 4. Redemption Stats
            $yearlyRedeemed = PointRedemption::whereYear('created_at', now()->year)->sum('points_redeemed') ?? 0;
            $yearlyRedeemedValue = PointRedemption::whereYear('created_at', now()->year)->sum('value') ?? 0;
            $monthlyRedeemed = PointRedemption::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->sum('points_redeemed') ?? 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => [
                        'total' => $totalUsers,
                        'active_30days' => $activeUsers,
                        'new_this_month' => $newThisMonth
                    ],
                    'waste' => [
                        'yearly_total_kg' => round($yearlyWaste, 2),
                        'yearly_total_count' => $yearlyWasteCount,
                        'monthly_total_kg' => round($monthlyWaste, 2),
                        'monthly_total_count' => $monthlyWasteCount
                    ],
                    'points' => [
                        'yearly_total' => $yearlyPoints,
                        'monthly_total' => $monthlyPoints,
                        'distributed_today' => $todayPoints
                    ],
                    'redemptions' => [
                        'yearly_total_points_redeemed' => $yearlyRedeemed,
                        'yearly_total_value' => round($yearlyRedeemedValue, 2),
                        'monthly_total_redeemed' => $monthlyRedeemed
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error('AdminDashboard::getOverview Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching overview stats',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
}
```

### Step 2: Register Route

File: `routes/api.php`

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminDashboardController;

// Admin routes (protected)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
});
```

### Step 3: Ensure Models Exist

Check apakah model-model ini sudah ada:

```bash
# Check files
ls app/Models/

# Should have:
# - User.php
# - WasteTransaction.php
# - PointTransaction.php
# - PointRedemption.php
```

If missing, create:
```bash
php artisan make:model WasteTransaction
php artisan make:model PointTransaction
php artisan make:model PointRedemption
```

### Step 4: Run Migrations

```bash
php artisan migrate
```

---

## 🧪 Testing Steps

### Test 1: Direct Database Query

```bash
php artisan tinker

# Test User count
User::count()

# Test Waste transactions
WasteTransaction::count()

# Test Points
PointTransaction::count()

# Exit
exit
```

### Test 2: Direct Controller Test

```bash
php artisan tinker

# Load controller
$controller = new App\Http\Controllers\Admin\AdminDashboardController();

# Call method
$response = $controller->getOverview();

# Check response
$response->getData()
```

### Test 3: API Test with Postman

```
POST http://localhost:8000/api/login
{
  "email": "admin@mendaur.id",
  "password": "password"
}

Response: Get token

---

GET http://localhost:8000/api/admin/dashboard/overview
Headers: Authorization: Bearer {token}

Expected: 200 with data
```

### Test 4: Check Laravel Log

```bash
tail -f storage/logs/laravel.log

# Should NOT show any errors when calling endpoint
```

---

## 📋 Verification Checklist

Before declaring success:

- [ ] Controller file exists and has correct namespace
- [ ] Route registered in `routes/api.php`
- [ ] Models exist: `User`, `WasteTransaction`, `PointTransaction`, `PointRedemption`
- [ ] Tables exist in database
- [ ] Authentication middleware working (`auth:sanctum`)
- [ ] Database connection working
- [ ] Query returns data without errors
- [ ] Response format matches specification
- [ ] Postman test returns 200 OK
- [ ] Frontend receives data without "Using mock data" message

---

## 🎯 Success Indicators

✅ **When Backend is Fixed:**
```
Browser Console:
- No "Using mock data" message
- No 500 error in Network tab
- GET /api/admin/dashboard/overview returns 200 with real data

Admin Dashboard:
- Shows actual user count from database
- Shows actual waste total from database
- Shows actual points distributed
- All stats are real, not mock
```

---

## 📞 Quick Reference

| Problem | Solution |
|---------|----------|
| 500 error | Check Laravel logs |
| Table not found | Run migrations |
| Unauthorized | Check auth middleware |
| No data | Check database has records |
| Wrong data format | Check response structure |

---

**Next:** Once backend returns 200, frontend will automatically use real data! ✅

