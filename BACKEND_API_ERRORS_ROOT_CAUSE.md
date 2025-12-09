# 🚨 BACKEND API ERRORS - ROOT CAUSE ANALYSIS

**Date:** December 10, 2025  
**Status:** 🔴 CRITICAL - Backend Database Schema Mismatch  
**Issue Type:** Backend API returning 500 errors due to column name mismatch

---

## Summary of Issues

Multiple API endpoints are returning **500 Internal Server Error** with message:
```
SQLSTATE[42S22]: Column not found...
```

This indicates that the **backend code is querying for column names that don't exist** in the database.

### Affected Endpoints:
1. `GET /api/dashboard/stats/{user_id}` - Returns 500
2. `GET /api/dashboard/leaderboard` - Returns 500
3. `GET /api/users/{user_id}/badges` - Returns 500
4. `GET /api/users/{user_id}/aktivitas` - Returns 500
5. Other profile-related endpoints - Likely returning 500

---

## Root Cause

**The Problem:**
- ✅ Frontend has been updated to send `user_id` (correct)
- ✅ Database schema has been updated to use `user_id` (correct)
- ❌ **Backend Laravel code is still querying for old column names** (PROBLEM)

**Example:**
```php
// OLD CODE (BROKEN):
SELECT * FROM users WHERE id = ?;  // ← This column doesn't exist anymore!

// NEW CODE (NEEDED):
SELECT * FROM users WHERE user_id = ?;  // ← This is the correct column name
```

---

## Errors Reported

### 1. Dashboard Stats Error
```
GET http://127.0.0.1:8000/api/dashboard/stats/3 500 (Internal Server Error)
Error: SQLSTATE[42S22]: Column not found...
```
**Likely Cause:** DashboardController@stats is querying `SELECT ... WHERE id = ?`

### 2. Leaderboard Error
```
GET http://127.0.0.1:8000/api/dashboard/leaderboard 500 (Internal Server Error)
```
**Likely Cause:** Leaderboard query still using old column names

### 3. User Badges Error
```
GET http://127.0.0.1:8000/api/users/3/badges 500 (Internal Server Error)
```
**Likely Cause:** Badge-related queries using old column names

### 4. User Activities Error
```
GET http://127.0.0.1:8000/api/users/3/aktivitas 500 (Internal Server Error)
```
**Likely Cause:** Activity query using old column names

### 5. React Key Warning (Minor)
```
Each child in a list should have a unique "key" prop - artikel.jsx:110
```
**Cause:** artikel.jsx is using index instead of unique ID as key

---

## Files That Need Backend Updates

These are the **backend controllers and queries** that need to be fixed:

### 1. DashboardController
**File Location:** `app/Http/Controllers/DashboardController.php`

**Methods to Fix:**
- `stats($userId)` - Update all queries to use new column names
- `leaderboard()` - Update leaderboard query
- Any other methods that query users table

**Example Fix:**
```php
// BEFORE (BROKEN):
$user = User::find($id);  // Uses 'id' column
$deposits = $user->deposits()->where('status', 'approved')->get();

// AFTER (FIXED):
$user = User::find($userId);  // Uses primary key correctly
$deposits = DB::table('tabung_sampah')
    ->where('user_id', $userId)  // ← Use user_id, not id
    ->where('status', 'approved')
    ->get();
```

### 2. UserController
**File Location:** `app/Http/Controllers/UserController.php`

**Methods to Check:**
- `show($id)` - User details
- `getBadges($id)` - Get user badges
- `getActivity($id)` - Get user activities

### 3. Badge-related Queries
**File Location:** Likely in `app/Models/Badge.php` or BadgeController

**Methods to Check:**
- Any query that joins with `badge_progress` table
- Any query that filters by `badge_id` (old `id`)

### 4. Activity/Log Queries
**File Location:** Likely in `app/Models/LogAktivitas.php` or similar

**Methods to Check:**
- Any query that selects from `log_aktivitas` table
- Column references for `id` vs `log_user_activity_id`

---

## What Needs to Be Fixed in Backend

### Priority 1 - CRITICAL (Blocking multiple pages)
```
DashboardController:
├─ stats() method - Uses id instead of user_id
├─ leaderboard() method - Uses old column references
└─ Any JOIN statements with users table

UserController:
├─ show($userId) - Uses id instead of user_id
└─ Profile-related methods
```

### Priority 2 - HIGH (Blocking specific pages)
```
Badge Operations:
├─ getBadges() - Uses badge.id instead of badge.badge_id
├─ getUserBadges() - Foreign key reference
└─ Badge progress queries

Activity/Log Queries:
├─ getActivity() - Uses log_aktivitas.id instead of log_user_activity_id
└─ Activity filtering by user_id
```

### Priority 3 - MEDIUM (Blocking features)
```
Transaction Queries:
├─ tabung_sampah queries - Uses tabung_sampah.id instead of tabung_sampah.tabung_sampah_id
├─ penukaran_produk queries
└─ penarikan_tunai queries
```

---

## How to Fix - Step-by-Step

### Step 1: Identify All Affected Queries
Run these commands to find problematic code:

```bash
# Search for old column references in Laravel code
grep -r "->where('id'" app/
grep -r "->find(" app/
grep -r "WHERE id" app/

# Find all SELECT * statements (risky)
grep -r "SELECT \*" app/
```

### Step 2: Update Query Syntax

**For Eloquent ORM:**
```php
// WRONG:
User::where('id', $userId)->first();
// RIGHT:
User::where('user_id', $userId)->first();

// WRONG:
Badge::find($badgeId);  // Assumes 'id' primary key
// RIGHT:
Badge::where('badge_id', $badgeId)->first();
```

**For Raw Queries:**
```php
// WRONG:
SELECT * FROM users WHERE id = ?

// RIGHT:
SELECT * FROM users WHERE user_id = ?
```

### Step 3: Update Model Relationships

In Laravel Models, specify the correct foreign keys:

```php
// User.php
class User extends Model {
    protected $primaryKey = 'user_id';  // ← Add this!
    
    public function badges() {
        return $this->hasMany(Badge::class, 'user_id', 'user_id');  // ← Specify keys
    }
    
    public function deposits() {
        return $this->hasMany(TabungSampah::class, 'user_id', 'user_id');
    }
}

// Badge.php
class Badge extends Model {
    protected $primaryKey = 'badge_id';  // ← Add this!
}
```

### Step 4: Test All Endpoints

After fixing, test each endpoint:

```bash
# Test dashboard stats
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/dashboard/stats/3

# Test leaderboard
curl http://127.0.0.1:8000/api/dashboard/leaderboard

# Test user badges
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/users/3/badges

# Test user activities
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/users/3/aktivitas
```

---

## Frontend Issue to Fix

### artikel.jsx - Missing Key Prop
**File:** `src/Components/lib/artikel.jsx` (Line 110)

**Problem:**
```jsx
// WRONG - Using index as key:
{articles.map((article, index) => (
    <ArtikelCard key={index} article={article} />  // ← Bad practice!
))}
```

**Fix:**
```jsx
// RIGHT - Using unique article ID as key:
{articles.map((article) => (
    <ArtikelCard key={article.artikel_id} article={article} />  // ← Good practice!
))}
```

---

## Verification Checklist

After fixing backend:

- [ ] `GET /api/dashboard/stats/3` returns 200 (not 500)
- [ ] `GET /api/dashboard/leaderboard` returns 200 (not 500)
- [ ] `GET /api/users/3/badges` returns 200 (not 500)
- [ ] `GET /api/users/3/aktivitas` returns 200 (not 500)
- [ ] All responses contain correct field names (user_id, badge_id, etc.)
- [ ] No "Column not found" errors in logs
- [ ] Frontend pages load without errors:
  - [ ] Home page (dashboard stats)
  - [ ] Leaderboard page
  - [ ] Profile page (badges, activities)
  - [ ] All transaction pages

---

## Database Schema Reference

**Users Table:**
- Primary Key: `user_id` (NOT `id`)
- Foreign Key references: Use `user_id`

**Badges Table:**
- Primary Key: `badge_id` (NOT `id`)
- Foreign Key: `user_id` (NOT `id`)

**Badge Progress Table:**
- Primary Key: `badge_progress_id`
- Foreign Keys: `user_id`, `badge_id`

**Tabung Sampah (Deposits):**
- Primary Key: `tabung_sampah_id`
- Foreign Key: `user_id`

**Other Tables:** All follow pattern `[table_name]_id`

---

## Example Fixes for Common Controllers

### DashboardController.php
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\TabungSampah;
use App\Models\PenukraranProduk;
use DB;

class DashboardController extends Controller {
    
    // FIX: Get user dashboard stats
    public function stats($userId) {
        try {
            // Make sure $userId is the actual user_id value
            $user = User::where('user_id', $userId)->first();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found'
                ], 404);
            }
            
            $deposits = TabungSampah::where('user_id', $userId)->get();
            $totalPoints = $user->total_poin ?? 0;
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'user_id' => $user->user_id,
                    'total_deposits' => $deposits->count(),
                    'total_points' => $totalPoints,
                    'user_waste' => $deposits->sum('weight') ?? 0
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    // FIX: Get leaderboard
    public function leaderboard() {
        try {
            $leaderboard = User::select(
                'user_id',  // ← Use user_id, not id
                'nama_lengkap as nama',
                'foto_profil',
                DB::raw('COALESCE(total_poin, 0) as total_poin')
            )
            ->orderBy('total_poin', 'DESC')
            ->limit(100)
            ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $leaderboard
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
```

---

## Next Steps

1. **Identify** which backend files have the issues (DashboardController, UserController, etc.)
2. **Fix** all queries to use new column names
3. **Update** Model relationships with correct foreign keys
4. **Test** all endpoints return 200 OK
5. **Verify** response data matches frontend expectations
6. **Fix** the artikel.jsx key warning

---

## Summary

| Issue | Status | Fix Location | Priority |
|-------|--------|--------------|----------|
| Dashboard stats 500 error | 🔴 BLOCKING | DashboardController | CRITICAL |
| Leaderboard 500 error | 🔴 BLOCKING | DashboardController | CRITICAL |
| User badges 500 error | 🔴 BLOCKING | UserController | CRITICAL |
| User activities 500 error | 🔴 BLOCKING | UserController | CRITICAL |
| Profile page errors | 🔴 BLOCKING | Multiple | CRITICAL |
| artikel.jsx key warning | 🟡 MINOR | artikel.jsx | LOW |

**Timeline:** Once backend is fixed, all pages should work immediately.

---

**Note:** The frontend code is correct. The issue is 100% on the backend side - the database schema was updated but the Laravel controller code wasn't updated to match.
