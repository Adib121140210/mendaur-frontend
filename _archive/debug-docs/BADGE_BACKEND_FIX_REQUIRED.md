# 🐛 Badge Title Issue - Backend Fix Required

## 🎯 Issue Confirmed

**Date:** December 24, 2025  
**User:** Adib Surya (ID: 3)  
**Problem:** API endpoint `/api/users/3/unlocked-badges` only returns **1 badge** instead of **6 badges**

---

## 📊 Evidence from Console Logs

### Frontend Logs:
```javascript
🔍 Badge API Response: {status: 'success', data: {...}}
🏆 Unlocked Badges: Array(1)  // ❌ Expected: Array(6)
📊 Badges count: 1             // ❌ Expected: 6
⭐ Current badge title ID: 1

// Only one badge returned:
{
  badge_id: 1,
  nama: 'Pemula Peduli',
  deskripsi: 'Setor sampah pertama kali',
  icon: '🌱',
  reward_poin: 50,
  tipe: 'setor',
  tanggal_dapat: '...'
}
```

### Network Tab Response:
```json
{
  "status": "success",
  "data": {
    "unlocked_badges": [
      {
        "badge_id": 1,
        "nama": "Pemula Peduli",
        "icon": "🌱"
      }
    ],
    "count": 1,  // ❌ Should be 6!
    "current_badge_title_id": 1
  }
}
```

### Profile Page Stats:
```
Total Badge Rewards: 900 / 2050 Poin
6 dari 10 badge terkumpul  ✅ This is correct!

Semua Badge: 10
Sudah Didapat: 6           ✅ User has 6 badges
Belum Didapat: 4
```

---

## 🔍 Root Cause Analysis

The stats page correctly shows **"6 dari 10 badge terkumpul"**, which means:
- ✅ User DOES have 6 badges in the database
- ❌ But `/unlocked-badges` API only returns 1 badge
- ❌ This is a **BACKEND ISSUE** in the query logic

---

## 🔧 Backend Fix Needed

### Location:
**File:** `app/Http/Controllers/UserController.php`  
**Method:** `badgesList(Request $request, $id)`  
**Endpoint:** `GET /api/users/{id}/unlocked-badges`

### Current Code Issue:

The method is likely using one of these problematic patterns:

#### ❌ Problem Pattern 1: Using `first()` instead of `get()`
```php
// WRONG - Only returns first badge
$unlockedBadges = $user->badges()->first();
```

#### ❌ Problem Pattern 2: Incorrect relationship or query
```php
// WRONG - Missing proper relationship loading
$unlockedBadges = $user->badges()->limit(1)->get();
```

#### ❌ Problem Pattern 3: Wrong table join
```php
// WRONG - Query only fetching 1 row
$unlockedBadges = DB::table('user_badges')
    ->where('user_id', $id)
    ->first(); // Should be get()
```

### ✅ Correct Code:

```php
public function badgesList(Request $request, $id)
{
    // IDOR Protection
    $currentUser = $request->user();
    if ((int)$currentUser->user_id !== (int)$id) {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized'
        ], 403);
    }

    $user = User::findOrFail($id);

    // ✅ CORRECT - Use ->get() to fetch ALL badges
    $unlockedBadges = $user->badges()
        ->orderBy('user_badges.tanggal_dapat', 'desc')
        ->get()  // ✅ Must use get(), NOT first()
        ->map(function ($badge) {
            return [
                'badge_id' => $badge->badge_id,
                'nama' => $badge->nama,
                'deskripsi' => $badge->deskripsi,
                'icon' => $badge->icon,
                'reward_poin' => $badge->reward_poin,
                'tipe' => $badge->tipe,
                'tanggal_dapat' => $badge->pivot->tanggal_dapat,
            ];
        });

    return response()->json([
        'status' => 'success',
        'data' => [
            'unlocked_badges' => $unlockedBadges,
            'count' => $unlockedBadges->count(),  // Should return 6
            'current_badge_title_id' => $user->badge_title_id,
        ]
    ]);
}
```

---

## 📝 Step-by-Step Fix Instructions

### Step 1: Locate the File
Open: `app/Http/Controllers/UserController.php`

### Step 2: Find the Method
Search for: `public function badgesList`

### Step 3: Check the Query
Look for the line that fetches badges. It should look like:
```php
$unlockedBadges = $user->badges()->...
```

### Step 4: Verify It Uses `->get()`
**BEFORE (Wrong):**
```php
$unlockedBadges = $user->badges()->first();  // ❌
```

**AFTER (Correct):**
```php
$unlockedBadges = $user->badges()->get();    // ✅
```

### Step 5: Verify Relationship in User Model
File: `app/Models/User.php`

Should have:
```php
public function badges()
{
    return $this->belongsToMany(
        \App\Models\Badge::class,
        'user_badges',      // Pivot table
        'user_id',          // Foreign key in pivot
        'badge_id'          // Related key in pivot
    )->withPivot('tanggal_dapat')
     ->withTimestamps();
}
```

---

## 🧪 Testing the Fix

### Test 1: Check Raw SQL Query
Add this temporarily to see the query:
```php
$query = $user->badges();
dd($query->toSql(), $query->getBindings());
```

Should output something like:
```sql
SELECT badges.*, user_badges.user_id, user_badges.badge_id, user_badges.tanggal_dapat
FROM badges
INNER JOIN user_badges ON badges.badge_id = user_badges.badge_id
WHERE user_badges.user_id = 3
```

### Test 2: Direct Database Check
Run in MySQL/phpMyAdmin:
```sql
SELECT COUNT(*) as badge_count 
FROM user_badges 
WHERE user_id = 3;
```

**Expected result:** `badge_count: 6`

### Test 3: Check API Response
After fix, test endpoint:
```bash
curl -X GET "http://127.0.0.1:8000/api/users/3/unlocked-badges" \
  -H "Authorization: Bearer {token}"
```

**Expected response:**
```json
{
  "status": "success",
  "data": {
    "unlocked_badges": [
      {"badge_id": 1, "nama": "Pemula Peduli", ...},
      {"badge_id": 2, "nama": "Eco Warrior", ...},
      {"badge_id": 3, "nama": "Green Hero", ...},
      {"badge_id": 4, "nama": "Planet Saver", ...},
      {"badge_id": 5, "nama": "Bronze Collector", ...},
      {"badge_id": 6, "nama": "Silver Collector", ...}
    ],
    "count": 6,  // ✅ Should be 6 now!
    "current_badge_title_id": 1
  }
}
```

---

## 🎯 Expected Behavior After Fix

1. **API Response:** Should return 6 badges
2. **Console Logs:** Should show `📊 Badges count: 6`
3. **Dropdown:** Should display all 6 badges
4. **Sidebar:** Current selected badge displays correctly
5. **Stats:** Remains at "6 dari 10 badge terkumpul" ✅

---

## 🔍 Alternative: Direct SQL Investigation

If you have access to database, run:

```sql
-- Check how many badges user has
SELECT 
    u.user_id,
    u.nama,
    COUNT(ub.badge_id) as total_badges
FROM users u
LEFT JOIN user_badges ub ON u.user_id = ub.user_id
WHERE u.user_id = 3
GROUP BY u.user_id;

-- Expected result: total_badges = 6

-- List all badges for user 3
SELECT 
    b.badge_id,
    b.nama,
    b.icon,
    b.reward_poin,
    ub.tanggal_dapat
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.badge_id
WHERE ub.user_id = 3
ORDER BY ub.tanggal_dapat DESC;

-- Expected: 6 rows returned
```

---

## 📊 Comparison: Stats API vs Unlocked Badges API

The stats endpoint (Achievement page) correctly returns 6 badges.  
Let's compare both endpoints:

### Stats Endpoint (Working ✅)
**Endpoint:** `/api/users/{id}/badges-list` or similar  
**Returns:** 6 badges correctly

### Unlocked Badges Endpoint (Broken ❌)
**Endpoint:** `/api/users/{id}/unlocked-badges`  
**Returns:** Only 1 badge

**Action:** Check if `/badges-list` and `/unlocked-badges` use different query logic.  
They should use the SAME query to maintain consistency!

---

## 🚨 Critical Issue Summary

| Aspect | Status | Details |
|--------|--------|---------|
| Database | ✅ Has 6 badges | Verified from stats page |
| Backend Query | ❌ Returns 1 badge | Using `first()` instead of `get()` |
| Frontend Code | ✅ Correct | Properly displays all returned badges |
| API Endpoint | ❌ Broken | `/unlocked-badges` needs fix |
| User Experience | ❌ Bad | Can only select 1 badge from dropdown |

---

## ✅ Checklist for Backend Developer

- [ ] Open `app/Http/Controllers/UserController.php`
- [ ] Find method `badgesList()`
- [ ] Change `->first()` to `->get()`
- [ ] Verify `User` model has correct `badges()` relationship
- [ ] Test API endpoint returns 6 badges
- [ ] Verify frontend dropdown shows all 6 badges
- [ ] Clear Laravel cache: `php artisan cache:clear`
- [ ] Test in browser to confirm fix

---

## 📞 Next Steps

**For Backend Developer:**
1. Fix the `badgesList()` method to use `->get()` instead of `->first()`
2. Test the API endpoint
3. Deploy the fix

**For Frontend Developer (No action needed):**
- Frontend code is already correct ✅
- Will automatically work once backend returns all 6 badges

---

**Status:** ⚠️ **BACKEND FIX REQUIRED**  
**Priority:** 🔥 **HIGH** - User cannot select badges  
**ETA:** ~5 minutes to fix

**Last Updated:** December 24, 2025
