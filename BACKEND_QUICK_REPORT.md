# 🚨 Quick Report: Backend Performance Issue

**TL;DR:** Backend endpoints butuh 4+ detik untuk respond → 499 errors di production. Need optimization ASAP.

---

## Problem

```
❌ GET /api/dashboard/stats/{userId}       - 4000ms (target: <1000ms)
❌ GET /api/users/{userId}/badges          - 4000ms (target: <2000ms)
❌ GET /api/dashboard/leaderboard          - 4000ms (target: <2000ms)
⚠️  GET /api/setor-sampah/user/{userId}    - 3000ms (target: <2000ms)
```

---

## Quick Fixes Needed

### 1. Add Database Indexes (5 menit)
```sql
ALTER TABLE badges ADD INDEX idx_user_id (user_id);
ALTER TABLE tabung_sampah ADD INDEX idx_user_id (user_id);
ALTER TABLE penukaran_produk ADD INDEX idx_user_id (user_id);
ALTER TABLE penarikan_tunai ADD INDEX idx_user_id (user_id);
ALTER TABLE users ADD INDEX idx_total_poin (total_poin DESC);
```

### 2. Fix N+1 Queries (15 menit)
```php
// ❌ BAD
$users = User::all();
foreach ($users as $user) {
    $badges = $user->badges; // N queries!
}

// ✅ GOOD
$users = User::with('badges')->get(); // 2 queries only
```

### 3. Add Caching (30 menit)
```php
// Cache leaderboard 10 menit
Cache::remember('leaderboard', 600, function () {
    return User::orderBy('total_poin', 'desc')->limit(100)->get();
});

// Cache user stats 2 menit
Cache::remember("user:$id:stats", 120, function () use ($id) {
    return User::with('badges')->find($id);
});
```

---

## How to Check

```bash
# Enable query logging
DB::listen(function ($query) {
    if ($query->time > 1000) { // >1 second
        Log::warning("Slow Query: {$query->sql} ({$query->time}ms)");
    }
});

# Test response time
time curl -H "Authorization: Bearer TOKEN" \
  https://mendaur.up.railway.app/api/dashboard/stats/7
```

---

## Timeline

**Need by:** End of week (Jan 3, 2025)

**Priority:**
1. Database indexes (today)
2. Fix N+1 queries (tomorrow)
3. Add caching (this week)

---

## Impact

**Current (BAD):**
- 🐌 4-second page load
- ❌ 499 timeout errors
- 😞 Poor user experience

**After Fix (GOOD):**
- ⚡ <2-second page load
- ✅ No errors
- 😊 Happy users

---

## Questions?

**Full details:** See `BACKEND_PERFORMANCE_ISSUE.md`

**Need help?** Frontend team dapat bantu debug queries if needed.

**ETA?** When can you start working on this?

---

**Status:** ⏳ Waiting for backend team response
