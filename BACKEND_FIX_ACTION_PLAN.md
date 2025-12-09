# 🎯 BACKEND FIX ACTION PLAN

**Date:** December 10, 2025  
**Status:** 🔴 CRITICAL - Backend API Issues  
**Action Required:** Backend code updates needed to fix 500 errors

---

## Quick Summary

**Problem:** Backend API endpoints returning 500 errors due to "Column not found"

**Root Cause:** Backend code queries use old column names (`id`, `id_user`) but database has new names (`user_id`, `artikel_id`, etc.)

**Solution:** Update all Laravel controller queries to use new primary key names

**Estimated Time:** 2-3 hours

---

## Files Needing Backend Updates

### Priority 1 - CRITICAL (Update First)

#### 1. **DashboardController.php** 🔴
**Location:** `app/Http/Controllers/DashboardController.php`

**Methods to Fix:**
- `stats($userId)` - Called by homeContent.jsx line 61
  - Update: Use `user_id` instead of `id` in WHERE clauses
  - Test: `GET /api/dashboard/stats/{user_id}`

- `leaderboard()` - Called by homeContent.jsx line 77
  - Update: Use `user_id` instead of `id` in SELECT/WHERE
  - Test: `GET /api/dashboard/leaderboard`

**Error:** 
```
GET http://127.0.0.1:8000/api/dashboard/stats/3 500
SQLSTATE[42S22]: Column not found
```

**Fix Strategy:**
```php
// Find all instances of:
->where('id', $id)
->where('users.id', $id)
->where('id')

// Replace with:
->where('user_id', $userId)
->where('users.user_id', $userId)
```

---

#### 2. **UserController.php** 🔴
**Location:** `app/Http/Controllers/UserController.php`

**Methods to Fix:**
- `show($userId)` - Get user details
- `getBadges($userId)` - Get user badges (called by homeContent.jsx line 88)
- `getActivity($userId)` - Get user activities (called by homeContent.jsx line 99)

**Error:**
```
GET http://127.0.0.1:8000/api/users/3/badges 500
GET http://127.0.0.1:8000/api/users/3/aktivitas 500
```

**Fix Pattern:**
```php
// OLD (BROKEN):
$user = User::find($id);
$badges = Badge::where('user_id', $user->id)->get();

// NEW (FIXED):
$user = User::find($userId);  // Uses primary key
$badges = Badge::where('user_id', $userId)->get();
```

---

#### 3. **Models with Incorrect Primary Keys** 🔴
**Location:** `app/Models/` directory

**Models to Update:**
```
User.php
├─ protected $primaryKey = 'user_id';      // ADD THIS
├─ Fix relationships with other models
└─ Update foreign key references

Badge.php
├─ protected $primaryKey = 'badge_id';     // ADD THIS
└─ Update user relationship

BadgeProgress.php
├─ protected $primaryKey = 'badge_progress_id';
└─ Update user/badge relationships

TabungSampah.php (or similar)
├─ protected $primaryKey = 'tabung_sampah_id';
└─ Update user relationship

LogAktivitas.php (or similar)
├─ protected $primaryKey = 'log_user_activity_id';
└─ Update user relationship
```

---

### Priority 2 - HIGH (Update Second)

#### 4. **Leaderboard/Stats Related** 🟠
Check these files for hardcoded column references:
- `app/Models/User.php` - Check scope definitions
- `app/Services/LeaderboardService.php` (if exists)
- `app/Repositories/StatsRepository.php` (if exists)

**Look for:**
```php
// Search for these patterns:
->select('id')
->select('users.id')
->groupBy('id')
->orderBy('id')
```

---

#### 5. **Badge & Achievement System** 🟠
**Location:** Badge-related controllers/models

**Methods to Check:**
- `getBadges()` - Should return `badge_id` not `id`
- `getUserBadges()` - Should filter by `badge_id`
- Badge progress tracking

---

#### 6. **Activity/Logging System** 🟠
**Location:** Activity/Log related files

**Methods to Check:**
- `getActivity()` or `getUserActivities()`
- `getActivities()` queries
- Log filtering by `user_id`

---

### Priority 3 - MEDIUM (Update Third)

#### 7. **Profile-Related Endpoints** 🟡
- `ProfileController.php` - Update user profile queries
- Transaction history endpoints
- Point/reward endpoints

---

## Specific Search & Replace Pattern

### Search Pattern 1: Find old column references
```bash
# In VS Code or terminal:
grep -r "->where('id'" app/Http/Controllers/
grep -r "->select('id'" app/Http/Controllers/
grep -r "WHERE id " app/
```

### Search Pattern 2: Find Model primary key issues
```bash
grep -r "->find(" app/Http/Controllers/
grep -r "::find(" app/Http/Controllers/
```

---

## Required Changes Checklist

### Controllers
- [ ] DashboardController - All methods updated
- [ ] UserController - All methods updated
- [ ] BadgeController - All methods updated
- [ ] ActivityController - All methods updated
- [ ] ProfileController - All methods updated
- [ ] (Any other controllers using user/badge/article queries)

### Models
- [ ] User.php - Set `$primaryKey = 'user_id'`
- [ ] Badge.php - Set `$primaryKey = 'badge_id'`
- [ ] Article.php - Set `$primaryKey = 'artikel_id'`
- [ ] TabungSampah.php - Set `$primaryKey = 'tabung_sampah_id'`
- [ ] LogAktivitas.php - Set `$primaryKey = 'log_user_activity_id'`
- [ ] All relationships updated to use new keys

### Queries
- [ ] All `->where('id',` → `->where('user_id',`
- [ ] All `::find()` updated if using non-standard primary key
- [ ] All SELECT statements reference new field names
- [ ] All JOIN statements use new foreign key names

### Testing
- [ ] `GET /api/dashboard/stats/3` returns 200
- [ ] `GET /api/dashboard/leaderboard` returns 200
- [ ] `GET /api/users/3/badges` returns 200
- [ ] `GET /api/users/3/aktivitas` returns 200
- [ ] All responses have correct field names
- [ ] No SQL errors in laravel.log

---

## Step-by-Step Execution Plan

### Step 1: Update User Model (5 minutes)
```php
// app/Models/User.php
<?php

namespace App\Models;

class User extends Model {
    protected $primaryKey = 'user_id';  // ← ADD THIS
    public $incrementing = true;
    protected $keyType = 'int';
    
    public function badges() {
        return $this->hasMany(Badge::class, 'user_id', 'user_id');
    }
    
    public function deposits() {
        return $this->hasMany(TabungSampah::class, 'user_id', 'user_id');
    }
    
    public function activities() {
        return $this->hasMany(LogAktivitas::class, 'user_id', 'user_id');
    }
}
```

### Step 2: Update Other Models (10 minutes)
```php
// app/Models/Badge.php
class Badge extends Model {
    protected $primaryKey = 'badge_id';  // ← ADD THIS
}

// app/Models/Article.php
class Article extends Model {
    protected $primaryKey = 'artikel_id';  // ← ADD THIS
}

// ... etc for other models
```

### Step 3: Fix DashboardController (15 minutes)
```php
// app/Http/Controllers/DashboardController.php
class DashboardController extends Controller {
    public function stats($userId) {
        // Change all queries to use user_id instead of id
        $user = User::where('user_id', $userId)->first();
        // ...rest of method
    }
    
    public function leaderboard() {
        // Change SELECT to use user_id
        $users = User::select('user_id', 'nama_lengkap', 'total_poin')
                     ->orderBy('total_poin', 'DESC')
                     ->get();
        // ...rest of method
    }
}
```

### Step 4: Fix UserController (15 minutes)
```php
// app/Http/Controllers/UserController.php
class UserController extends Controller {
    public function show($userId) {
        $user = User::where('user_id', $userId)->first();
        // ...
    }
    
    public function getBadges($userId) {
        $badges = Badge::where('user_id', $userId)->get();
        // ...
    }
    
    public function getActivity($userId) {
        $activities = LogAktivitas::where('user_id', $userId)
                                   ->orderBy('created_at', 'DESC')
                                   ->get();
        // ...
    }
}
```

### Step 5: Test All Endpoints (10 minutes)
```bash
# Test each endpoint:
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/dashboard/stats/3

curl http://127.0.0.1:8000/api/dashboard/leaderboard

curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/users/3/badges

curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/users/3/aktivitas
```

### Step 6: Verify Laravel Logs (5 minutes)
```bash
# Check for any remaining SQL errors:
tail -f storage/logs/laravel.log
```

---

## Expected Results After Fixes

✅ All endpoints return HTTP 200 OK  
✅ No "Column not found" errors  
✅ Response data includes correct field names (user_id, badge_id, artikel_id, etc.)  
✅ All frontend pages load without errors  
✅ Dashboard stats display correctly  
✅ Leaderboard shows users ranked  
✅ Profile page loads with badges and activities  
✅ All transaction pages work  

---

## Frontend Status After Backend Fixes

Once backend is fixed, these pages will automatically work:

- ✅ Home page (dashboard) - homeContent.jsx
- ✅ Leaderboard page - leaderboardTable.jsx
- ✅ Profile page - userData.jsx
- ✅ All transaction pages
- ✅ Riwayat penyetoran (deposit history)
- ✅ Jadwal penyetoran (pickup schedule)

**No frontend changes needed!** The frontend is already correct.

---

## Summary

| Task | File | Time | Priority |
|------|------|------|----------|
| Update User model | User.php | 5 min | 🔴 |
| Update other models | *.php in Models/ | 10 min | 🔴 |
| Fix DashboardController | DashboardController.php | 15 min | 🔴 |
| Fix UserController | UserController.php | 15 min | 🔴 |
| Test endpoints | Terminal | 10 min | 🔴 |
| Verify logs | laravel.log | 5 min | 🔴 |

**Total Time Estimate:** 2-3 hours  
**Difficulty:** Medium  
**Impact:** Fixes 5+ pages and all API endpoints  

---

## Important Notes

1. **Database Schema is Correct** ✅ - No database changes needed
2. **Frontend is Correct** ✅ - No frontend changes needed
3. **Only Backend Code Needs Updates** - Update PHP/Laravel code only
4. **Test as You Go** - Test each fix immediately
5. **Check Logs** - Always check `storage/logs/laravel.log` for errors

---

**Next Step:** Start with Step 1 - Update User model in app/Models/User.php
