# 🚨 QUICK ERROR REFERENCE GUIDE

**Status:** Frontend ✅ OK | Backend 🔴 ERROR

---

## Error Summary

```
Feature              Status    API Endpoint                    Error
─────────────────────────────────────────────────────────────────────────
Dashboard Stats      🔴 FAIL   GET /api/dashboard/stats/{id}   500 Error
Leaderboard          🔴 FAIL   GET /api/dashboard/leaderboard  500 Error
User Badges          🔴 FAIL   GET /api/users/{id}/badges      500 Error
User Activities      🔴 FAIL   GET /api/users/{id}/aktivitas   500 Error
Profile Page         🔴 FAIL   (Multiple endpoints)            500 Error
Artikel Key Warning  🟡 WARN   (Frontend warning)              Fixed ✅
```

---

## Error Messages You're Seeing

### Error 1: Dashboard Stats
```
GET http://127.0.0.1:8000/api/dashboard/stats/3 500 (Internal Server Error)

Response: SQLSTATE[42S22]: Column not found...
Location: homeContent.jsx:61
```

**Cause:** DashboardController queries using `id` instead of `user_id`  
**Fix:** Update DashboardController.php `stats()` method

---

### Error 2: Leaderboard
```
GET http://127.0.0.1:8000/api/dashboard/leaderboard 500 (Internal Server Error)

Response: SQLSTATE[42S22]: Column not found...
Location: homeContent.jsx:77
```

**Cause:** DashboardController queries using `id` instead of `user_id`  
**Fix:** Update DashboardController.php `leaderboard()` method

---

### Error 3: User Badges
```
GET http://127.0.0.1:8000/api/users/3/badges 500 (Internal Server Error)

Response: SQLSTATE[42S22]: Column not found...
Location: homeContent.jsx:88
```

**Cause:** UserController or Badge model using wrong column names  
**Fix:** Update UserController `getBadges()` method

---

### Error 4: User Activities
```
GET http://127.0.0.1:8000/api/users/3/aktivitas 500 (Internal Server Error)

Response: SQLSTATE[42S22]: Column not found...
Location: homeContent.jsx:99
```

**Cause:** UserController or LogAktivitas model using wrong column names  
**Fix:** Update UserController `getActivity()` method

---

### Warning 5: React Key (FIXED ✅)
```
Each child in a list should have a unique "key" prop
Location: artikel.jsx:110
```

**Cause:** Using `item.id` instead of `item.artikel_id`  
**Status:** ✅ FIXED in commit 1b8bbb3

---

## Root Cause Tree

```
500 Errors in API
    ↓
SQLSTATE[42S22]: Column not found
    ↓
Backend SELECT/WHERE queries using old column names
    ├─ Uses: "id"
    ├─ Uses: "users.id"
    ├─ Database has: "user_id"
    └─ Mismatch!
    
Solution:
    ↓
Update all queries to use new column names
    ├─ "id" → "user_id"
    ├─ "user.id" → "user.user_id"
    ├─ "badge.id" → "badge.badge_id"
    └─ etc.
```

---

## Which Backend Files Have Issues

### 🔴 CRITICAL - Must Fix
```
app/Http/Controllers/DashboardController.php
├─ stats() method
└─ leaderboard() method

app/Http/Controllers/UserController.php
├─ getBadges() method
├─ getActivity() method
└─ show() method
```

### 🟠 HIGH PRIORITY - Should Fix
```
app/Models/User.php
├─ Set protected $primaryKey = 'user_id'
└─ Update relationships

app/Models/Badge.php
├─ Set protected $primaryKey = 'badge_id'
└─ Update relationships

Other Models:
├─ Article.php
├─ TabungSampah.php
├─ LogAktivitas.php
└─ (All should have correct $primaryKey)
```

---

## Quick Fix Checklist

Priority Order:

```
STEP 1: Update Models (10 minutes)
[ ] User.php - Add $primaryKey = 'user_id'
[ ] Badge.php - Add $primaryKey = 'badge_id'
[ ] Article.php - Add $primaryKey = 'artikel_id'
[ ] Other models - Add correct $primaryKey

STEP 2: Update Controllers (20 minutes)
[ ] DashboardController::stats()
[ ] DashboardController::leaderboard()
[ ] UserController::show()
[ ] UserController::getBadges()
[ ] UserController::getActivity()

STEP 3: Test (10 minutes)
[ ] Test /api/dashboard/stats/3
[ ] Test /api/dashboard/leaderboard
[ ] Test /api/users/3/badges
[ ] Test /api/users/3/aktivitas
[ ] Check laravel.log for errors
```

---

## Code Pattern to Replace

### Pattern 1: Finding Users
```php
// ❌ WRONG
$user = User::find($id);
// Check if User has non-standard primary key!

// ✅ RIGHT
class User {
    protected $primaryKey = 'user_id';
}
$user = User::find($userId);  // Now works correctly
```

### Pattern 2: WHERE Clauses
```php
// ❌ WRONG
->where('id', $id)
->where('users.id', $id)

// ✅ RIGHT
->where('user_id', $userId)
->where('users.user_id', $userId)
```

### Pattern 3: Relationships
```php
// ❌ WRONG
public function badges() {
    return $this->hasMany(Badge::class);  // Assumes 'id' primary key
}

// ✅ RIGHT
public function badges() {
    return $this->hasMany(Badge::class, 'user_id', 'user_id');
}
```

---

## All Affected Pages

Once you fix the backend, these pages will work:

| Page | Component | API Used | Status |
|------|-----------|----------|--------|
| Home/Dashboard | homeContent.jsx | /api/dashboard/stats | 🔴 |
| Leaderboard | leaderboardHeader.jsx | /api/dashboard/leaderboard | 🔴 |
| Profile - Main | userData.jsx | /api/users/{id}/... | 🔴 |
| Profile - Badges | userData.jsx | /api/users/{id}/badges | 🔴 |
| Profile - Activities | userData.jsx | /api/users/{id}/aktivitas | 🔴 |
| Profile - Header | profilHeader.jsx | /api/users/{id}/badges | 🔴 |

**Total Pages Blocked:** 5-6  
**Will be Fixed When:** Backend is updated

---

## Testing After Fix

### Test 1: Dashboard Stats
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://127.0.0.1:8000/api/dashboard/stats/3"

Expected Response: 200 OK with user stats data
```

### Test 2: Leaderboard
```bash
curl "http://127.0.0.1:8000/api/dashboard/leaderboard"

Expected Response: 200 OK with ranked user list
```

### Test 3: User Badges
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://127.0.0.1:8000/api/users/3/badges"

Expected Response: 200 OK with user badges array
```

### Test 4: User Activities
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://127.0.0.1:8000/api/users/3/aktivitas"

Expected Response: 200 OK with activities array
```

---

## Frontend Verification

After backend fixes, verify frontend:

```javascript
// Open browser DevTools → Network tab
// Load each page and verify:

✅ /api/dashboard/stats/3 → 200 OK
✅ /api/dashboard/leaderboard → 200 OK
✅ /api/users/3/badges → 200 OK
✅ /api/users/3/aktivitas → 200 OK

// Check Console tab:
✅ No "Column not found" errors
✅ No undefined API responses
✅ No 500 errors
```

---

## Timeline

| Task | Time | Status |
|------|------|--------|
| Understand issue | 5 min | ✅ |
| Update models | 10 min | ⏳ PENDING |
| Update controllers | 20 min | ⏳ PENDING |
| Test endpoints | 10 min | ⏳ PENDING |
| Verify in frontend | 5 min | ⏳ PENDING |
| **TOTAL** | **50 min** | **Start Now!** |

---

## Summary

**Frontend Status:** ✅ OK (Article key warning fixed)  
**Backend Status:** 🔴 BROKEN (500 errors in API)  
**Root Cause:** Column name mismatch in queries  
**Solution:** Update backend code to use new column names  
**Time to Fix:** 45-60 minutes  
**Difficulty:** Medium (Straightforward pattern matching and replacement)

---

**Next Action:** Open the backend Laravel project and start with Step 1!
